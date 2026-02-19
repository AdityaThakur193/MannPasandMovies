const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Review = require('../models/Review');
const { body, validationResult } = require('express-validator');

// @route   GET /api/reviews/movie/:movieId
// @desc    Get all reviews for a movie
// @access  Public
router.get('/movie/:movieId', async (req, res) => {
  try {
    const { movieId } = req.params;
    
    const reviews = await Review.find({ movieId: parseInt(movieId) })
      .populate('user', 'name avatar')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/reviews/user
// @desc    Get all reviews by current user
// @access  Private
router.get('/user', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      reviews
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/reviews
// @desc    Create a review
// @access  Private
router.post('/', [
  auth,
  body('movieId').isNumeric().withMessage('Movie ID is required'),
  body('movieTitle').notEmpty().withMessage('Movie title is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], async (req, res) => {
  try {
    // Validation
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
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/reviews/:id
// @desc    Update a review
// @access  Private
router.put('/:id', [
  auth,
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], async (req, res) => {
  try {
    // Validation
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
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/reviews/:id
// @desc    Delete a review
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
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
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
