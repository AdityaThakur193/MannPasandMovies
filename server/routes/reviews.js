const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const reviewController = require('../controllers/reviewController');
const { body } = require('express-validator');

// @route   GET /api/reviews/movie/:movieId
router.get('/movie/:movieId', reviewController.getMovieReviews);

// @route   GET /api/reviews/user
router.get('/user', auth, reviewController.getUserReviews);

// @route   POST /api/reviews
router.post('/', [
  auth,
  body('movieId').isNumeric().withMessage('Movie ID is required'),
  body('movieTitle').notEmpty().withMessage('Movie title is required'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], reviewController.createReview);

// @route   PUT /api/reviews/:id
router.put('/:id', [
  auth,
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5')
], reviewController.updateReview);

// @route   DELETE /api/reviews/:id
router.delete('/:id', auth, reviewController.deleteReview);

module.exports = router;
