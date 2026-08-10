const axios = require('axios');
const catchAsync = require('../middleware/catchAsync');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3';

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

// @desc    Forward requests to TMDB API
// @route   GET /api/tmdb/*
// @access  Public
exports.proxyTMDB = catchAsync(async (req, res) => {
  const forwardPath = req.params[0] || '';
  if (!isAllowedPath(forwardPath)) {
    return res.status(400).json({ success: false, message: 'Disallowed TMDB path' });
  }

  const url = `${TMDB_BASE_URL}/${forwardPath}`;
  const params = { ...req.query, api_key: TMDB_API_KEY };

  const response = await axios.get(url, { params });
  res.json(response.data);
});
