const express = require("express");
const router = express.Router({ mergeParams : true});
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const List = require("../models/listing");
const { validateReview, isLoggedIn, isAuthor } = require("../middleware.js");
const { showRoute } = require("../controllers/listing.js");
const { renderPostReview, destroyReview } = require("../controllers/review.js");




// show route
// Read  /listings/:id  --all data
router.get("/:reviewId", wrapAsync(showRoute));

// create Reviews
// submitting the form
// post /listings/:id/reviews
// post review Route

router.post("/", isLoggedIn, validateReview, wrapAsync(renderPostReview));

router.delete("/:reviewId", isLoggedIn, isAuthor, wrapAsync(destroyReview));




module.exports = router;

