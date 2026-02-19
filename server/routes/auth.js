const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const auth = require('../middleware/auth');
const passport = require('../config/passport');

// Rate limiter for auth routes (prevent brute force) - disabled in test mode
const authLimiter = process.env.NODE_ENV === 'test' 
  ? (req, res, next) => next()  // No-op middleware for tests
  : rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // 5 attempts per window
      message: 'Too many attempts, please try again later',
      standardHeaders: true,
      legacyHeaders: false,
    });

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', authLimiter, [
  body('name').trim().notEmpty().escape().withMessage('Name is required'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and numbers')
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

    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
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

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
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
        watchlist: user.watchlist
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

// @route   GET /api/auth/google
// @desc    Initiate Google OAuth
// @access  Public
router.get('/google', (req, res, next) => {
  const rawReturnTo = req.query.returnTo;
  let returnTo = '/';

  if (typeof rawReturnTo === 'string' && rawReturnTo.startsWith('/') && !rawReturnTo.startsWith('//')) {
    returnTo = rawReturnTo;
  }

  const state = encodeURIComponent(returnTo);
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    state
  })(req, res, next);
});

// @route   GET /api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err, user) => {
    const rawState = typeof req.query.state === 'string' ? req.query.state : '/';
    let returnTo = '/';

    try {
      const decoded = decodeURIComponent(rawState);
      if (decoded.startsWith('/') && !decoded.startsWith('//')) {
        returnTo = decoded;
      }
    } catch (decodeError) {
      console.warn('Failed to decode OAuth state:', decodeError);
    }

    const redirectBase = `${process.env.CLIENT_URL}${returnTo}`;
    const separator = returnTo.includes('?') ? '&' : '?';

    if (err) {
      console.error('Google callback error:', err);
      const reason = encodeURIComponent(err.message || 'oauth_error');
      return res.redirect(`${redirectBase}${separator}auth=failed&reason=${reason}`);
    }

    if (!user) {
      return res.redirect(`${redirectBase}${separator}auth=failed&reason=no_user`);
    }

    try {
      // Generate JWT token
      const token = generateToken(user._id);

      // Redirect to frontend with token
      return res.redirect(`${redirectBase}${separator}token=${token}`);
    } catch (error) {
      console.error('Google callback error:', error);
      const reason = encodeURIComponent(error.message || 'token_error');
      return res.redirect(`${redirectBase}${separator}auth=failed&reason=${reason}`);
    }
  })(req, res, next);
});

module.exports = router;
