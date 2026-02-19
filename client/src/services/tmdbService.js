import api from './api';

export const TMDB_IMAGE_BASE = import.meta.env.VITE_TMDB_IMAGE_BASE || 'https://image.tmdb.org/t/p/w500';

// Get popular movies
export const getPopularMovies = async (page = 1) => {
  const response = await api.get('/tmdb/movie/popular', { params: { page } });
  return response.data;
};

// Search movies
export const searchMovies = async (query, page = 1) => {
  const response = await api.get('/tmdb/search/movie', { params: { query, page } });
  return response.data;
};

// Get movie details
export const getMovieDetails = async (movieId) => {
  const response = await api.get(`/tmdb/movie/${movieId}`);
  return response.data;
};

// Get movie videos (trailers)
export const getMovieVideos = async (movieId) => {
  const response = await api.get(`/tmdb/movie/${movieId}/videos`);
  return response.data;
};

// Get movie credits (cast & crew)
export const getMovieCredits = async (movieId) => {
  const response = await api.get(`/tmdb/movie/${movieId}/credits`);
  return response.data;
};

// Get similar movies
export const getSimilarMovies = async (movieId) => {
  const response = await api.get(`/tmdb/movie/${movieId}/similar`);
  return response.data;
};

// Get movie watch providers
export const getMovieProviders = async (movieId) => {
  const response = await api.get(`/tmdb/movie/${movieId}/watch/providers`);
  return response.data;
};

// Get movie genres
export const getGenres = async () => {
  const response = await api.get('/tmdb/genre/movie/list');
  return response.data.genres || [];
};

// Get top rated movies
export const getTopRatedMovies = async (page = 1) => {
  const response = await api.get('/tmdb/movie/top_rated', { params: { page } });
  return response.data;
};

// Discover movies with filters (server-side filtering)
export const discoverMovies = async (filters = {}, page = 1) => {
  const params = { page };
  
  // Add genre filter
  if (filters.genre) {
    params.with_genres = filters.genre;
  }
  
  // Add year filter
  if (filters.year) {
    params.primary_release_year = filters.year;
  }
  
  // Add rating filter (minimum rating)
  if (filters.rating) {
    params['vote_average.gte'] = filters.rating;
    params['vote_count.gte'] = 100; // Ensure movies have enough votes
  }
  
  // Add sort option
  if (filters.sortBy) {
    params.sort_by = filters.sortBy;
  } else {
    params.sort_by = 'popularity.desc'; // Default sort
  }
  
  const response = await api.get('/tmdb/discover/movie', { params });
  return response.data;
};
