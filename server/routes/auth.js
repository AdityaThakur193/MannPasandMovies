const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const rateLimit = require('express-rate-limit');
const auth = require('../middleware/auth');
const passport = require('../config/passport');
const authController = require('../controllers/authController');

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

// @route   POST /api/auth/register
router.post('/register', authLimiter, [
  body('name').trim().notEmpty().escape().withMessage('Name is required'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and numbers')
], authController.register);

// @route   POST /api/auth/login
router.post('/login', authLimiter, [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], authController.login);

// @route   GET /api/auth/me
router.get('/me', auth, authController.getMe);

// @route   GET /api/auth/google
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
      const jwt = require('jsonwebtoken');
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
      });

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
