import { createContext, useContext, useState, useEffect } from 'react';
import * as movieService from '../services/movieService';
import { useAuth } from './AuthContext';

const MovieContext = createContext();

export const useMovie = () => {
  const context = useContext(MovieContext);
  if (!context) {
    throw new Error('useMovie must be used within MovieProvider');
  }
  return context;
};

export const MovieProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [likedMovies, setLikedMovies] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load user's liked movies and watchlist
  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    } else {
      setLikedMovies([]);
      setWatchlist([]);
    }
  }, [isAuthenticated]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      const [liked, watch] = await Promise.all([
        movieService.getLikedMovies(),
        movieService.getWatchlist(),
      ]);
      setLikedMovies(Array.isArray(liked) ? liked : []);
      setWatchlist(Array.isArray(watch) ? watch : []);
    } catch (error) {
      console.error('Error loading user data:', error);
      setLikedMovies([]);
      setWatchlist([]);
    } finally {
      setLoading(false);
    }
  };

  const isMovieLiked = (movieId) => {
    return Array.isArray(likedMovies) && likedMovies.some(movie => movie.movieId === movieId);
  };

  const isInWatchlist = (movieId) => {
    return Array.isArray(watchlist) && watchlist.some(movie => movie.movieId === movieId);
  };

  const toggleLike = async (movieData) => {
    if (!isAuthenticated) {
      return { success: false, error: 'Please login to like movies' };
    }

    try {
      const isLiked = isMovieLiked(movieData.movieId);
      
      if (isLiked) {
        await movieService.unlikeMovie(movieData.movieId);
        setLikedMovies(prev => prev.filter(m => m.movieId !== movieData.movieId));
      } else {
        const response = await movieService.likeMovie(movieData);
        // Handle both response formats: direct data or wrapped in a property
        const newLikeData = response.movie || response.data || response || movieData;
        setLikedMovies(prev => [...prev, { ...movieData, ...newLikeData }]);
      }
      return { success: true };
    } catch (error) {
      console.error('Error toggling like:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Action failed' 
      };
    }
  };

  const toggleWatchlist = async (movieData) => {
    if (!isAuthenticated) {
      return { success: false, error: 'Please login to add to watchlist' };
    }

    try {
      const isInWatch = isInWatchlist(movieData.movieId);
      
      if (isInWatch) {
        await movieService.removeFromWatchlist(movieData.movieId);
        setWatchlist(prev => prev.filter(m => m.movieId !== movieData.movieId));
      } else {
        const response = await movieService.addToWatchlist(movieData);
        // Handle both response formats: direct data or wrapped in a property
        const newWatchData = response.movie || response.data || response || movieData;
        setWatchlist(prev => [...prev, { ...movieData, ...newWatchData }]);
      }
      return { success: true };
    } catch (error) {
      console.error('Error toggling watchlist:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Action failed' 
      };
    }
  };

  const value = {
    likedMovies,
    watchlist,
    loading,
    isMovieLiked,
    isInWatchlist,
    toggleLike,
    toggleWatchlist,
    refreshData: loadUserData,
  };

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>;
};
