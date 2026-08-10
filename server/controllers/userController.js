const User = require('../models/User');
const Review = require('../models/Review');
const catchAsync = require('../middleware/catchAsync');

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
exports.getProfile = catchAsync(async (req, res) => {
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
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
exports.updateProfile = catchAsync(async (req, res) => {
  const { name, email, avatar, currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  // Update basic fields
  if (name) user.name = name;
  if (email && email !== user.email) {
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
});

// @desc    Delete user avatar
// @route   DELETE /api/users/avatar
// @access  Private
exports.deleteAvatar = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

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
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private
exports.getUserStats = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

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
});

// @desc    Get user search history
// @route   GET /api/users/search-history
// @access  Private
exports.getSearchHistory = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    searchHistory: user.searchHistory || []
  });
});

// @desc    Add a search term to user search history
// @route   POST /api/users/search-history
// @access  Private
exports.addSearchHistory = catchAsync(async (req, res) => {
  const { searchTerm } = req.body;
  if (!searchTerm) {
    return res.status(400).json({
      success: false,
      message: 'Search term is required'
    });
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

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
});

// @desc    Clear user search history
// @route   DELETE /api/users/search-history
// @access  Private
exports.clearSearchHistory = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  user.searchHistory = [];
  await user.save();

  res.json({
    success: true,
    message: 'Search history cleared successfully'
  });
});
