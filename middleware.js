const { session } = require("passport");
const List = require("./models/listing");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const Review = require("./models/review.js");



module.exports.isLoggedIn = (req, res, next) => {
  // passport save the user if the login then showing object otherwise undefined is coming.
  // console.log(req.user);
  // passport allowe you to authenticate();

  // check the path for the user convience where the path is coming. and req.path give relative path
  // console.log(req.path, "...", req.originalUrl);
  if (!req.isAuthenticated()) {
    // redirectUrl save
    req.session.redirectUrl = req.originalUrl;
    req.flash("error", "you must be logged in to create listing!");
    return res.redirect("/login");
  }
  next();
}

module.exports.saveRedirectUrl = (req, res, next) => {
  if (req.session.redirectUrl) {
    res.locals.redirectUrl = req.session.redirectUrl;
  }
  next();
};


module.exports.isOwner = async(req, res, next) => {
    const { id } = req.params;
    const newListing = await List.findById(id);
    if (!newListing.owner._id.equals(res.locals.currUser._id)) {
      req.flash("error", "You are not owner of this listing");
      return res.redirect(`/listings/${id}`);
    }
  next();
}

module.exports.isAuthor = async (req, res, next) => {
  const {id, reviewId } = req.params;
  const newListing = await Review.findById(reviewId);
  if (!newListing.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not author of this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.validateListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errmsg);
  } else {
    next();
  }
};

// in the mergeParams we have to used in the router to come from the app.js
// if we write /listings/:id/reviews so that it can pass from the app.js to this route :id
// variable id otherwise it contains undefined is coming. 
module.exports.validateReview = (req, res, next) => {
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errmsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errmsg);
  } else {
    next();
  }
};