const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Review = require('../models/Review');

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
        likedMovies: user.likedMovies,
        watchlist: user.watchlist,
        searchHistory: user.searchHistory || []
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, email, avatar, currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id).select('+password');
    
    // Update basic fields
    if (name) user.name = name;
    if (email && email !== user.email) {
      // Check if email is already taken by someone else
      const existingUser = await User.findOne({ email });
      if (existingUser && existingUser.id !== user.id) {
        return res.status(400).json({
          success: false,
          message: 'Email already in use'
        });
      }
      user.email = email;
    }
    if (avatar !== undefined) user.avatar = avatar;
    
    // Handle password change
    if (currentPassword && newPassword) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }
      
      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'New password must be at least 6 characters'
        });
      }
      
      user.password = newPassword;
    }
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
        likedMovies: user.likedMovies,
        watchlist: user.watchlist,
        searchHistory: user.searchHistory || []
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/users/avatar
// @desc    Delete user avatar
// @access  Private
router.delete('/avatar', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    // Reset avatar to default (will use the avatar default function in schema)
    user.avatar = user.name ? user.name.charAt(0).toUpperCase() : '👤';
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Avatar deleted successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt,
        likedMovies: user.likedMovies,
        watchlist: user.watchlist,
        searchHistory: user.searchHistory || []
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/stats
// @desc    Get user statistics
// @access  Private
router.get('/stats', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const reviews = await Review.find({ user: req.user.id });
    
    // Calculate average rating
    const ratings = reviews.map(r => r.rating);
    const avgRating = ratings.length > 0
      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length)
      : 0;
    
    res.json({
      totalLikes: user.likedMovies.length,
      totalWatchlist: user.watchlist.length,
      totalReviews: reviews.length,
      averageRating: parseFloat(avgRating.toFixed(1)),
      favoriteGenres: [],
      memberSince: user.createdAt
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   GET /api/users/search-history
// @desc    Get user search history
// @access  Private
router.get('/search-history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      searchHistory: user.searchHistory || []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   POST /api/users/search-history
// @desc    Add a search term to user search history
// @access  Private
router.post('/search-history', auth, async (req, res) => {
  const { searchTerm } = req.body;
  if (!searchTerm) {
    return res.status(400).json({
      success: false,
      message: 'Search term is required'
    });
  }

  try {
    const user = await User.findById(req.user.id);
    
    // Remove duplicates and limit to last 10 searches
    user.searchHistory = user.searchHistory.filter(term => term !== searchTerm);
    user.searchHistory.unshift(searchTerm);
    if (user.searchHistory.length > 10) {
      user.searchHistory = user.searchHistory.slice(0, 10);
    }
    
    await user.save();
    
    res.json({
      success: true,
      searchHistory: user.searchHistory
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @route   DELETE /api/users/search-history
// @desc    Clear user search history
// @access  Private
router.delete('/search-history', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.searchHistory = [];
    await user.save();
    
    res.json({
      success: true,
      message: 'Search history cleared successfully'
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
