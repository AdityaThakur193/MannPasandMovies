import api from './api';

// Get liked movies
export const getLikedMovies = async () => {
  const response = await api.get('/movies/liked');
  return response.data.likedMovies || response.data || [];
};

// Like a movie
export const likeMovie = async (movieData) => {
  const response = await api.post('/movies/like', movieData);
  return response.data;
};

// Unlike a movie
export const unlikeMovie = async (movieId) => {
  const response = await api.delete(`/movies/like/${movieId}`);
  return response.data;
};

// Get watchlist
export const getWatchlist = async () => {
  const response = await api.get('/movies/watchlist');
  return response.data.watchlist || response.data || [];
};

// Add to watchlist
export const addToWatchlist = async (movieData) => {
  const response = await api.post('/movies/watchlist', movieData);
  return response.data;
};

// Remove from watchlist
export const removeFromWatchlist = async (movieId) => {
  const response = await api.delete(`/movies/watchlist/${movieId}`);
  return response.data;
};

// Get movie reviews
export const getMovieReviews = async (movieId) => {
  const response = await api.get(`/reviews/movie/${movieId}`);
  return response.data.reviews || response.data;
};

// Get user reviews
export const getUserReviews = async () => {
  const response = await api.get('/reviews/user');
  return response.data.reviews || response.data;
};

// Create review
export const createReview = async (reviewData) => {
  const response = await api.post('/reviews', reviewData);
  return response.data;
};

// Update review
export const updateReview = async (reviewId, reviewData) => {
  const response = await api.put(`/reviews/${reviewId}`, reviewData);
  return response.data;
};

// Delete review
export const deleteReview = async (reviewId) => {
  const response = await api.delete(`/reviews/${reviewId}`);
  return response.data;
};
