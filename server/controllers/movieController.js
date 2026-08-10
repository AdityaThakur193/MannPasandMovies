const User = require('../models/User');
const catchAsync = require('../middleware/catchAsync');

// @desc    Get user's liked movies
// @route   GET /api/movies/liked
// @access  Private
exports.getLikedMovies = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    likedMovies: user.likedMovies
  });
});

// @desc    Like a movie
// @route   POST /api/movies/like
// @access  Private
exports.likeMovie = catchAsync(async (req, res) => {
  const { movieId, title, poster } = req.body;

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
});

// @desc    Unlike a movie
// @route   DELETE /api/movies/like/:movieId
// @access  Private
exports.unlikeMovie = catchAsync(async (req, res) => {
  const { movieId } = req.params;

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
});

// @desc    Get user's watchlist
// @route   GET /api/movies/watchlist
// @access  Private
exports.getWatchlist = catchAsync(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    watchlist: user.watchlist
  });
});

// @desc    Add movie to watchlist
// @route   POST /api/movies/watchlist
// @access  Private
exports.addToWatchlist = catchAsync(async (req, res) => {
  const { movieId, title, poster } = req.body;

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
});

// @desc    Remove movie from watchlist
// @route   DELETE /api/movies/watchlist/:movieId
// @access  Private
exports.removeFromWatchlist = catchAsync(async (req, res) => {
  const { movieId } = req.params;

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
});
