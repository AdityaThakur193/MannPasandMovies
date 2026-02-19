const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// @route   GET /api/movies/liked
// @desc    Get user's liked movies
// @access  Private
router.get('/liked', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      likedMovies: user.likedMovies
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/movies/like
// @desc    Like a movie
// @access  Private
router.post('/like', auth, async (req, res) => {
  try {
    const { movieId, title, poster } = req.body;
    
    // Use atomic operation to add movie to likedMovies array
    // $addToSet prevents duplicates automatically
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $addToSet: { 
          likedMovies: { movieId, title, poster } 
        } 
      },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Movie liked successfully',
      likedMovies: user.likedMovies
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/movies/like/:movieId
// @desc    Unlike a movie
// @access  Private
router.delete('/like/:movieId', auth, async (req, res) => {
  try {
    const { movieId } = req.params;
    
    // Use atomic operation to remove movie from likedMovies array
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $pull: { 
          likedMovies: { movieId: parseInt(movieId) } 
        } 
      },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Movie unliked successfully',
      likedMovies: user.likedMovies
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/movies/watchlist
// @desc    Get user's watchlist
// @access  Private
router.get('/watchlist', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      watchlist: user.watchlist
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/movies/watchlist
// @desc    Add movie to watchlist
// @access  Private
router.post('/watchlist', auth, async (req, res) => {
  try {
    const { movieId, title, poster } = req.body;
    
    // Use atomic operation to add movie to watchlist array
    // $addToSet prevents duplicates automatically
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $addToSet: { 
          watchlist: { movieId, title, poster } 
        } 
      },
      { new: true, runValidators: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Movie added to watchlist',
      watchlist: user.watchlist
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/movies/watchlist/:movieId
// @desc    Remove movie from watchlist
// @access  Private
router.delete('/watchlist/:movieId', auth, async (req, res) => {
  try {
    const { movieId } = req.params;
    
    // Use atomic operation to remove movie from watchlist array
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $pull: { 
          watchlist: { movieId: parseInt(movieId) } 
        } 
      },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Movie removed from watchlist',
      watchlist: user.watchlist
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
