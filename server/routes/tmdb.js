const express = require('express');
const axios = require('axios');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

if (!TMDB_API_KEY) {
  // eslint-disable-next-line no-console
  console.warn('⚠️ TMDB_API_KEY is not set. /api/tmdb routes will fail until configured.');
}

// Basic whitelist of allowed TMDB path prefixes
const ALLOWED_PREFIXES = new Set([
  'search/movie',
  'movie/popular',
  'movie/top_rated',
  'movie', // includes /movie/:id and nested like videos, credits, similar, watch/providers
  'genre/movie/list',
  'discover/movie' // For filtered movie discovery
]);

function isAllowedPath(path) {
  // Normalize path (remove leading slash)
  const normalized = path.replace(/^\/+/, '');
  return Array.from(ALLOWED_PREFIXES).some(prefix => normalized === prefix || normalized.startsWith(prefix + '/'));
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

router.get('/*', async (req, res) => {
  try {
    const forwardPath = req.params[0] || '';
    if (!isAllowedPath(forwardPath)) {
      return res.status(400).json({ success: false, message: 'Disallowed TMDB path' });
    }

    const url = `${TMDB_BASE_URL}/${forwardPath}`;
    const params = { ...req.query, api_key: TMDB_API_KEY };

    const response = await axios.get(url, { params });
    res.json(response.data);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('TMDB proxy error:', error.response?.data || error.message || error);
    const status = error.response?.status || 500;
    res.status(status).json({ success: false, message: 'TMDB request failed', error: error.response?.data || error.message });
  }
});

module.exports = router;
