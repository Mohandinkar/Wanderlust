const express = require("express");
const router = express.Router({mergeParams:true});

const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn,validateReview,isReviewAuthor} = require("../middleware.js");
const reviewController = require("../controllers/review.js")



//reviews -> POST
router.post("/",isLoggedIn,validateReview, wrapAsync(reviewController.createReview));

//review -> DELETE route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor,wrapAsync(reviewController.destroyReview))


module.exports = router