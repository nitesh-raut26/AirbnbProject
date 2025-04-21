const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const {
  index,
  showRoute,
  rendernewRoute,
  renderPostRoute,
  renderEditRoute,
  editRoute,
  deleteRoute,
  searchQuery,
} = require("../controllers/listing");
const { isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const multer = require("multer");
// const upload = multer({ dest: "public/uploads/" });
const { storage } = require("../cloudinary/cloudinary.js");

const upload = multer({ storage });

// Get route /listing
router.get("/listing", wrapAsync(index));


router
  .route("/listings/:id")
  .get(wrapAsync(showRoute))
  .put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,
    wrapAsync(editRoute)
  )
  .delete(isLoggedIn, isOwner, wrapAsync(deleteRoute));

 
// show route
// Read  /listings/:id  --all data
// router.get("/listings/:id", wrapAsync(showRoute));

// create : New & Create Route
// GET /listings/new -->form --->submit--->post /lisitng
router.get("/listing/new", isLoggedIn, wrapAsync(rendernewRoute));


router.get("/search", wrapAsync(searchQuery));

router.post(
  "/listings/",
  isLoggedIn,
  upload.single("listing[image]"),
  validateListing,
  wrapAsync(renderPostRoute)
  // (req, res) => {
  //   console.log(req.file);
  //   res.status(200).send(req.file);
  // }
);


// update : Edit & update Route
//  GET /listings/:id/edit
// PUT /listings/:id 
router.get(
  "/listings/:id/edit",
  isLoggedIn,
  isOwner,
  wrapAsync(renderEditRoute)
);



module.exports = router;