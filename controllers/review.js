const List = require("../models/listing");
const Review = require("../models/review");

module.exports.renderPostReview = async (req, res) => {
  const id = req.params.id;
  //  console.log(req.params,"id");
  let listing = await List.findById(id);
  const { review } = req.body;
  const newReview = new Review(review);
  newReview.author = req.user._id;
  listing.reviews.push(newReview);
  await newReview.save();
  await listing.save();
  // console.log(review);
  req.flash("success", "New Review Added!");
  res.redirect(`/listings/${id}`);
};


// Delete Review Route
// Mongo $pull operator 
// The $pull operator removes from an existing array all instances 
// of a value or values that match a specified condition.
module.exports.destroyReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await List.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review Deleted!");
  res.redirect(`/listings/${id}`);
};

// Handling deletion means that if the listing is delted then review
// is not delted associated with the reviews

// Above that if we delete the reviews than in the review 
// delete and also the reviewId in the list but the problem is above statement that we write.

// so we used handling deletion