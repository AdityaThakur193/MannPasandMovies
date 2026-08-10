import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { searchMovies } from '../services/tmdbService';

export const useMovieSearch = (onSearchTriggered) => {
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [movieSuggestions, setMovieSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    // Load search history from localStorage
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(history);
  }, []);

  // Fetch movie suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setMovieSuggestions([]);
        return;
      }

      setLoadingSuggestions(true);
      try {
        const data = await searchMovies(searchQuery, 1);
        setMovieSuggestions(data.results.slice(0, 5));
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setMovieSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const performSearch = async (query) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    // Save to search history (both localStorage and backend if authenticated)
    const newHistory = [trimmed, ...searchHistory.filter(q => q !== trimmed)].slice(0, 5);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    // Save to backend if user is authenticated
    if (user) {
      try {
        const token = localStorage.getItem('token');
        await fetch('http://localhost:5001/api/users/search-history', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ searchTerm: trimmed })
        });
      } catch (error) {
        console.error('Error saving search to backend:', error);
      }
    }

    if (onSearchTriggered) {
      onSearchTriggered(trimmed);
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    searchHistory,
    setSearchHistory,
    showSearchHistory,
    setShowSearchHistory,
    movieSuggestions,
    loadingSuggestions,
    performSearch,
  };
};
