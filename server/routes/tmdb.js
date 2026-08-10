const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const tmdbController = require('../controllers/tmdbController');

const TMDB_API_KEY = process.env.TMDB_API_KEY;

if (!TMDB_API_KEY) {
  // eslint-disable-next-line no-console
  console.warn('⚠️ TMDB_API_KEY is not set. /api/tmdb routes will fail until configured.');
}

// Rate limiters
const generalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 300, // 300 requests per 5 min per IP for general TMDB proxy
  standardHeaders: true,
  legacyHeaders: false,
});

const searchLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // 50 searches per 5 min per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many searches. Please try again later.' }
});

// Apply general limiter to all TMDB routes
router.use(generalLimiter);

// Apply stricter limiter to search endpoints only
router.use('/search/movie', searchLimiter);

// Proxy routes matching any path
router.get('/*', tmdbController.proxyTMDB);

module.exports = router;
