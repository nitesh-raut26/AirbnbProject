const List = require("../models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAPBOX_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });





module.exports.index = async (req, res, next) => {
  const Data = await List.find({});
  // console.log(Data);
  // Data.forEach((l) => {
  //   if (l.price === undefined) {
  //     console.log("Listing without price:", l);
  //   }
  // });
  res.render("listings/index.ejs", { Data });
};

module.exports.showRoute = async (req, res, next) => {
    const { id } = req.params;
    const listing = await List.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("owner");
    // console.log(listing);
    if (!listing) {
        req.flash("error", "Listing you requested does not exist.");
        return res.redirect("/listing");
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.rendernewRoute = async (req, res, next) => {
  //  console.log(req.user);
  // passport allowe you to authenticate();
  res.render("listings/new.ejs");
};

module.exports.renderPostRoute = async (req, res, next) => {
  // const { title, description, image, price, location, country } = req.body;
  // another way to write
  // this logic is written in the validateListing middleware
  // let result = listingSchema.validate(req.body);
  // //  console.log(result);
  // // if (!req.body.listing) {
  // //     throw new ExpressError(400,"send valid data for listing")
  // // }
  // if (result.error) {
  //    throw new ExpressError(400, result.error);
  // }
  const listing = req.body.listing;
  // const newListing = new List({
  //     title,
  //     description,
  //     image: { url: image },
  //     price,
  //     location,
  //     country
  // });
  // listing.image = { url: listing.image }; // wrap image string into an object with 'url' key

  const location = listing.location;
  const country = listing.country;
  const fullQuery = `${location}, ${country}`;
  const geoResponse = await geocodingClient
    .forwardGeocode({
      query: fullQuery,
      limit: 1,
    })
    .send();

  const features = geoResponse.body.features[0].geometry;

  // Extract coordinates [longitude, latitude]
  // const coordinatesList = features.map((f) => ({
  //   longitude: f.center[0],
  //   latitude: f.center[1],
  // }));

  // console.log(coordinatesList);

  if (req.file) {
    listing.image = {
      // url: `/uploads/${req.file.filename}`, // This matches the path in 'public/uploads/'
      url: req.file.path, // Cloudinary hosted image URL
      filename: req.file.filename,
    };
  } else {
    listing.image = { url: "", filename: "" };
  }
  const newListing = new List(listing);
  newListing.owner = req.user._id;
  newListing.geometry = features;
  let savedListing = await newListing.save();
  // console.log(savedListing);
  req.flash("success", "New Listing Created");
  //  List.findByIdAndDelete;
  res.redirect("/listing");
};

module.exports.renderEditRoute = async (req, res) => {
  const id = req.params.id;
  const listing = await List.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested does not exist.");
    return res.redirect("/listing");
  }
  const urlImage = listing.image.url.replace(
    "/upload/",
    "/upload/w_300,h_250,e_blur:300/"
  );
  // console.log(urlImage);
  res.render("listings/update.ejs", { listing, urlImage });
};

module.exports.editRoute = async (req, res) => {
  const { id } = req.params;
  const { listing } = req.body;

  const foundListing = await List.findById(id);

  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename,
    };
  } else {
    listing.image = foundListing.image;
  }

  await List.findByIdAndUpdate(id, listing, {
    runValidators: true,
    new: true,
  });

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

module.exports.deleteRoute = async (req, res) => {
  const { id } = req.params;
  await List.findByIdAndDelete(id);
  req.flash("success", "Listing deleted");
  res.redirect("/listing");
};

module.exports.searchQuery = async (req, res) => {
  const query = req.query.q;

  const listings = await List.find({
    location: { $regex: query, $options: "i" },
  });

  // Default geometry to prevent crash in case of missing geocoding results
  let features = null;

  if (query) {
    try {
      const geoResponse = await geocodingClient
        .forwardGeocode({
          query: query,
          limit: 1,
        })
        .send();

      // console.log(geoResponse.body.features);
      if (geoResponse.body.features.length > 0) {
        features = geoResponse.body.features[0].geometry;
      }
    } catch (err) {
      console.error("Mapbox geocoding failed:", err);
    }
  }
  // console.log(features);
  res.render("listings/searchResults", { listings, query, features });
};
