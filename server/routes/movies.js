const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const movieController = require('../controllers/movieController');

// @route   GET /api/movies/liked
router.get('/liked', auth, movieController.getLikedMovies);

// @route   POST /api/movies/like
router.post('/like', auth, movieController.likeMovie);

// @route   DELETE /api/movies/like/:movieId
router.delete('/like/:movieId', auth, movieController.unlikeMovie);

// @route   GET /api/movies/watchlist
router.get('/watchlist', auth, movieController.getWatchlist);

// @route   POST /api/movies/watchlist
router.post('/watchlist', auth, movieController.addToWatchlist);

// @route   DELETE /api/movies/watchlist/:movieId
router.delete('/watchlist/:movieId', auth, movieController.removeFromWatchlist);

module.exports = router;
