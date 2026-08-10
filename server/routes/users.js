const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const userController = require('../controllers/userController');

// @route   GET /api/users/profile
router.get('/profile', auth, userController.getProfile);

// @route   PUT /api/users/profile
router.put('/profile', auth, userController.updateProfile);

// @route   DELETE /api/users/avatar
router.delete('/avatar', auth, userController.deleteAvatar);

// @route   GET /api/users/stats
router.get('/stats', auth, userController.getUserStats);

// @route   GET /api/users/search-history
router.get('/search-history', auth, userController.getSearchHistory);

// @route   POST /api/users/search-history
router.post('/search-history', auth, userController.addSearchHistory);

// @route   DELETE /api/users/search-history
router.delete('/search-history', auth, userController.clearSearchHistory);

module.exports = router;
