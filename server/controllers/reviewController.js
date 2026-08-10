const Review = require('../models/Review');
const { validationResult } = require('express-validator');
const catchAsync = require('../middleware/catchAsync');

// @desc    Get all reviews for a movie
// @route   GET /api/reviews/movie/:movieId
// @access  Public
exports.getMovieReviews = catchAsync(async (req, res) => {
  const { movieId } = req.params;

  const reviews = await Review.find({ movieId: parseInt(movieId) })
    .populate('user', 'name avatar')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    reviews
  });
});

// @desc    Get all reviews by current user
// @route   GET /api/reviews/user
// @access  Private
exports.getUserReviews = catchAsync(async (req, res) => {
  const reviews = await Review.find({ user: req.user.id })
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    reviews
  });
});

// @desc    Create a review
// @route   POST /api/reviews
// @access  Private
exports.createReview = catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg
    });
  }

  const { movieId, movieTitle, rating, review } = req.body;

  // Check if user already reviewed this movie
  const existingReview = await Review.findOne({
    user: req.user.id,
    movieId
  });

  if (existingReview) {
    return res.status(400).json({
      success: false,
      message: 'You have already reviewed this movie. Use update to modify your review.'
    });
  }

  const newReview = await Review.create({
    user: req.user.id,
    movieId,
    movieTitle,
    rating,
    review
  });

  const populatedReview = await Review.findById(newReview._id)
    .populate('user', 'name avatar');

  res.status(201).json({
    success: true,
    message: 'Review created successfully',
    review: populatedReview
  });
});

// @desc    Update a review
// @route   PUT /api/reviews/:id
// @access  Private
exports.updateReview = catchAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg
    });
  }

  const { rating, review } = req.body;
  const existingReview = await Review.findById(req.params.id);

  if (!existingReview) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  // Check ownership
  if (existingReview.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to update this review'
    });
  }

  if (rating) existingReview.rating = rating;
  if (review !== undefined) existingReview.review = review;

  await existingReview.save();

  const updatedReview = await Review.findById(existingReview._id)
    .populate('user', 'name avatar');

  res.json({
    success: true,
    message: 'Review updated successfully',
    review: updatedReview
  });
});

// @desc    Delete a review
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = catchAsync(async (req, res) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return res.status(404).json({
      success: false,
      message: 'Review not found'
    });
  }

  // Check ownership
  if (review.user.toString() !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to delete this review'
    });
  }

  await review.deleteOne();

  res.json({
    success: true,
    message: 'Review deleted successfully'
  });
});
