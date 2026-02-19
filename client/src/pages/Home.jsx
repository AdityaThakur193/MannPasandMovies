import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Lock, Film, Search, Sun, Moon, X, Check } from 'lucide-react';
import { getPopularMovies, getTopRatedMovies, searchMovies, getGenres, discoverMovies } from '../services/tmdbService';
import MovieCard from '../components/MovieCard';
import FancySelect from '../components/FancySelect';
import LoadingSpinner from '../components/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Home.css';

const Home = ({ onShowAuthModal }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  // Movie data states
  const [allMovies, setAllMovies] = useState([]); // Currently displayed movies
  const [editorsChoiceMovies, setEditorsChoiceMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false); // Track if we're in search mode
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [movieSuggestions, setMovieSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalAvailablePages, setTotalAvailablePages] = useState(500); // Actual total pages from TMDB
  const MOVIES_PER_PAGE = 20;
  const MAX_PAGES = 500; // TMDB limit
  
  // Filter states
  const [filterGenre, setFilterGenre] = useState('');
  const [filterYear, setFilterYear] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [sortOption, setSortOption] = useState('default');
  
  // UI states
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [filterBarOpacity, setFilterBarOpacity] = useState(1);
  
  // Track if component has mounted to prevent double-loading
  const isInitialMount = useRef(true);

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

  // Initialize app on mount
  useEffect(() => {
    loadMoviesForPage(1);
    
    // Cleanup: reset filters when leaving the page
    return () => {
      setFilterGenre('');
      setFilterYear('');
      setFilterRating('');
      setSortOption('default');
      setSearchQuery('');
    };
  }, []);

  // Load movies when page changes (only when not in search/filter mode)
  useEffect(() => {
    // Skip on initial mount - let the initialize useEffect handle it
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    const hasFilters = filterGenre || filterYear || filterRating || sortOption !== 'default';
    
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (isSearchMode) {
      // Don't reload on page change during search
      return;
    }
    
    if (hasFilters) {
      // Load filtered movies
      loadMoviesWithFilters(currentPage);
    } else {
      // Load regular popular movies
      loadMoviesForPage(currentPage);
    }
  }, [currentPage, isSearchMode, filterGenre, filterYear, filterRating, sortOption]);

  // Reset to page 1 when filters or sort changes (not on mount)
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterGenre, filterYear, filterRating, sortOption]);

  useEffect(() => {
    // Apply dark mode to body and save preference
    if (darkMode) {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Auto-search on query change with debounce
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim()) {
        // Clear filters when searching
        if (filterGenre || filterYear || filterRating || sortOption !== 'default') {
          setFilterGenre('');
          setFilterYear('');
          setFilterRating('');
          setSortOption('default');
        }
        setIsSearchMode(true);
        performSearch(searchQuery);
      } else if (isSearchMode) {
        // Only reload if we were previously in search mode
        setIsSearchMode(false);
        const hasFilters = filterGenre || filterYear || filterRating || sortOption !== 'default';
        if (hasFilters) {
          loadMoviesWithFilters(currentPage);
        } else {
          loadMoviesForPage(currentPage);
        }
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  // Smooth scroll handler for filter bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const fadeStart = 50;
      const fadeEnd = 200;
      
      if (scrollY <= fadeStart) {
        setFilterBarOpacity(1);
      } else if (scrollY >= fadeEnd) {
        setFilterBarOpacity(0);
      } else {
        // Calculate opacity based on scroll position
        const opacity = 1 - ((scrollY - fadeStart) / (fadeEnd - fadeStart));
        setFilterBarOpacity(opacity);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load movies for a specific page (no filters)
  const loadMoviesForPage = async (pageNum) => {
    setLoading(true);
    try {
      const [genresData, popularData, topRatedData] = await Promise.all([
        genres.length > 0 ? Promise.resolve(genres) : getGenres(),
        getPopularMovies(pageNum),
        editorsChoiceMovies.length > 0 ? Promise.resolve({ results: editorsChoiceMovies }) : getTopRatedMovies(),
      ]);
      
      if (genres.length === 0) setGenres(genresData);
      if (editorsChoiceMovies.length === 0) setEditorsChoiceMovies(topRatedData.results.slice(0, 10));
      
      setAllMovies(popularData.results || []);
      setTotalAvailablePages(MAX_PAGES); // Reset to max when not filtering
    } catch (error) {
      console.error('Error loading movies:', error);
      setAllMovies([]);
    } finally {
      setLoading(false);
    }
  };

  // Load movies with filters applied (uses TMDB discover API for server-side filtering)
  const loadMoviesWithFilters = async (pageNum = 1) => {
    setLoading(true);
    try {
      // Build filter object for discover API
      const filters = {};
      
      if (filterGenre) {
        filters.genre = filterGenre;
      }
      
      if (filterYear) {
        filters.year = filterYear;
      }
      
      if (filterRating) {
        filters.rating = filterRating;
      }
      
      // Map sort options to TMDB sort_by format
      if (sortOption !== 'default') {
        const sortMapping = {
          'title-asc': 'title.asc',
          'title-desc': 'title.desc',
          'year-desc': 'primary_release_date.desc',
          'year-asc': 'primary_release_date.asc',
          'rating-desc': 'vote_average.desc',
          'rating-asc': 'vote_average.asc'
        };
        filters.sortBy = sortMapping[sortOption] || 'popularity.desc';
      }
      
      // Use discover API with filters
      const data = await discoverMovies(filters, pageNum);
      setAllMovies(data.results || []);
      // Update total available pages based on filtered results
      setTotalAvailablePages(Math.min(data.total_pages || 1, MAX_PAGES));
    } catch (error) {
      console.error('Error loading movies with filters:', error);
      setAllMovies([]);
      setTotalAvailablePages(1);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (query) => {
    const trimmed = query.trim();
    if (!trimmed) {
      setIsSearchMode(false);
      loadMoviesForPage(currentPage);
      return;
    }

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

    setLoading(true);
    try {
      // Load multiple pages of search results
      const searchPages = await Promise.all([
        searchMovies(trimmed, 1),
        searchMovies(trimmed, 2),
        searchMovies(trimmed, 3),
        searchMovies(trimmed, 4),
        searchMovies(trimmed, 5),
      ]);
      
      const searchResults = searchPages.flatMap(page => page.results || []);
      setAllMovies(searchResults);
      // Set total available pages from search results
      if (searchPages[0]) {
        setTotalAvailablePages(Math.min(searchPages[0].total_pages || 1, MAX_PAGES));
      }
    } catch (error) {
      console.error('Error searching movies:', error);
      setAllMovies([]);
      setTotalAvailablePages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const handleMovieClick = (movieId) => {
    // Allow navigation for all users; gate actions on detail page
    navigate(`/movie/${movieId}`);
  };

  const handleShowLoginPrompt = () => {
    setShowLoginPrompt(true);
  };

  // Get filtered, sorted, and paginated movies
  const getFilteredAndPaginatedMovies = () => {
    let filtered = [...allMovies];

    // Check if filters are active
    const hasFilters = filterGenre || filterYear || filterRating || sortOption !== 'default';
    
    // When using discover API (with filters), movies are already filtered and sorted by server
    if (hasFilters || isSearchMode) {
      // Movies are already filtered/sorted by TMDB API
      // For filtered results, show all movies from current page (TMDB returns 20 per page)
      return {
        paginatedMovies: isAuthenticated ? filtered : filtered.slice(0, 6),
        totalCount: totalAvailablePages * MOVIES_PER_PAGE, // Use actual total pages from TMDB
        totalPages: totalAvailablePages
      };
    }

    // Normal browsing mode (no filters): show all 20 movies from current page
    if (!isAuthenticated) {
      return {
        paginatedMovies: filtered.slice(0, 6),
        totalCount: MAX_PAGES * MOVIES_PER_PAGE,
        totalPages: MAX_PAGES
      };
    }
    
    return {
      paginatedMovies: filtered,
      totalCount: MAX_PAGES * MOVIES_PER_PAGE,
      totalPages: MAX_PAGES
    };
  };

  const { paginatedMovies: filteredMovies, totalCount, totalPages } = getFilteredAndPaginatedMovies();

  // Generate year range (1900 to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i).map(String);

  return (
    <div className="home-page">
      {/* Login Prompt Overlay */}
      {showLoginPrompt && (
        <div 
          className="login-prompt-overlay" 
          onClick={() => setShowLoginPrompt(false)}
          onKeyDown={(e) => e.key === 'Escape' && setShowLoginPrompt(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="login-prompt-title"
        >
          <div 
            className="login-prompt-modal" 
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <button className="close-btn" onClick={() => setShowLoginPrompt(false)} aria-label="Close login prompt">×</button>
            <div className="prompt-content">
              <h2 id="login-prompt-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Lock size={20} strokeWidth={2.4} aria-hidden="true" /> Login Required
              </h2>
              <p>Please login to view full movie details and access all features:</p>
              <ul className="feature-list">
                {[ 
                  'View complete movie information',
                  'Like and save movies',
                  'Add movies to your watchlist',
                  'Write and read reviews',
                  'Get personalized recommendations'
                ].map((item) => (
                  <li key={item}>
                    <Check size={16} strokeWidth={2.4} aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button className="login-prompt-btn" onClick={() => {
                setShowLoginPrompt(false);
                onShowAuthModal('login');
              }}>
                Login
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="hero-section">
        <h1>Discover Your Next Favorite Movie</h1>
        {!isAuthenticated && (
          <p className="preview-notice">
            <Film size={18} strokeWidth={2.4} aria-hidden="true" /> Preview Mode - Login to unlock full features
          </p>
        )}
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-wrapper">
            <input
              type="text"
              placeholder="Search for movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchHistory(true)}
              onBlur={() => setTimeout(() => setShowSearchHistory(false), 250)}
              className="search-input"
            />
            {showSearchHistory && searchQuery.trim().length >= 1 && (
              <div className="search-history-dropdown">
                {/* Movie Suggestions */}
                {movieSuggestions.length > 0 && (
                  <>
                    <p className="search-history-title">Movie Suggestions</p>
                    {movieSuggestions.map((movie) => (
                      <button
                        key={movie.id}
                        type="button"
                        className="search-history-item movie-suggestion"
                        onClick={() => {
                          navigate(`/movie/${movie.id}`);
                          setShowSearchHistory(false);
                        }}
                      >
                        <Film size={14} strokeWidth={2} aria-hidden="true" />
                        <span>
                          {movie.title}
                          {movie.release_date && (
                            <span className="movie-year"> ({movie.release_date.substring(0, 4)})</span>
                          )}
                        </span>
                      </button>
                    ))}
                  </>
                )}
                
                {/* Recent Searches */}
                {searchHistory.length > 0 && isAuthenticated && (
                  <>
                    {movieSuggestions.length > 0 && <div className="suggestions-divider"></div>}
                    <p className="search-history-title">Recent Searches</p>
                    {searchHistory
                      .filter(query => query.toLowerCase().includes(searchQuery.toLowerCase()))
                      .slice(0, 3)
                      .map((query, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="search-history-item"
                          onClick={() => {
                            setSearchQuery(query);
                            performSearch(query);
                            setShowSearchHistory(false);
                          }}
                        >
                          <Search size={14} strokeWidth={2} aria-hidden="true" />
                          <span>
                            {query.substring(0, query.toLowerCase().indexOf(searchQuery.toLowerCase()))}
                            <strong>{query.substring(query.toLowerCase().indexOf(searchQuery.toLowerCase()), query.toLowerCase().indexOf(searchQuery.toLowerCase()) + searchQuery.length)}</strong>
                            {query.substring(query.toLowerCase().indexOf(searchQuery.toLowerCase()) + searchQuery.length)}
                          </span>
                        </button>
                      ))}
                  </>
                )}
                
                {loadingSuggestions && searchQuery.trim().length >= 2 && (
                  <div className="suggestions-loading">
                    <span>Loading suggestions...</span>
                  </div>
                )}
                
                {!loadingSuggestions && movieSuggestions.length === 0 && searchQuery.trim().length >= 2 && searchHistory.length === 0 && (
                  <div className="suggestions-loading">
                    <span>No suggestions found</span>
                  </div>
                )}
              </div>
            )}
          </div>
          <button type="submit" className="search-button" aria-label="Search movies">
            <Search size={18} strokeWidth={2.4} aria-hidden="true" />
          </button>
        </form>
      </div>

      {/* Filter Bar */}
      <section 
        className="filter-bar" 
        aria-label="Movie filters and sorting"
        style={{ 
          opacity: filterBarOpacity,
          transform: `translateY(${filterBarOpacity === 0 ? '-30px' : '0'})`,
          pointerEvents: filterBarOpacity === 0 ? 'none' : 'auto'
        }}
      >
        <div className="filter-group">
          <label htmlFor="filter-genre">Genre:</label>
          <FancySelect
            ariaLabel="Filter movies by genre"
            value={filterGenre}
            onChange={setFilterGenre}
            placeholder="All Genres"
            options={[{ value: '', label: 'All Genres' }, ...genres.map((genre) => ({ value: genre.id, label: genre.name }))]}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="filter-year">Year:</label>
          <FancySelect
            ariaLabel="Filter movies by release year"
            value={filterYear}
            onChange={setFilterYear}
            placeholder="All Years"
            options={[{ value: '', label: 'All Years' }, ...years.map((year) => ({ value: year, label: year }))]}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="filter-rating">Rating:</label>
          <FancySelect
            ariaLabel="Filter movies by rating"
            value={filterRating}
            onChange={setFilterRating}
            placeholder="All Ratings"
            options={[
              { value: '', label: 'All Ratings' },
              { value: '9', label: '≥ 9.0' },
              { value: '8', label: '≥ 8.0' },
              { value: '7', label: '≥ 7.0' },
              { value: '6', label: '≥ 6.0' },
            ]}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="sort-option">Sort By:</label>
          <FancySelect
            ariaLabel="Sort movies"
            value={sortOption}
            onChange={setSortOption}
            placeholder="Default"
            options={[
              { value: 'default', label: 'Default' },
              { value: 'title-asc', label: 'Title (A-Z)' },
              { value: 'title-desc', label: 'Title (Z-A)' },
              { value: 'year-desc', label: 'Year (Newest)' },
              { value: 'year-asc', label: 'Year (Oldest)' },
              { value: 'rating-desc', label: 'Rating (High to Low)' },
              { value: 'rating-asc', label: 'Rating (Low to High)' },
            ]}
          />
        </div>

        {isAuthenticated && (filterGenre || filterYear || filterRating || sortOption !== 'default') && (
          <button 
            className="clear-filters-btn"
            onClick={() => {
              setFilterGenre('');
              setFilterYear('');
              setFilterRating('');
              setSortOption('default');
            }}
            aria-label="Clear all filters"
          >
            <X size={16} strokeWidth={2.4} aria-hidden="true" /> Clear
          </button>
        )}

        <button 
          className="dark-mode-toggle"
          onClick={() => setDarkMode(!darkMode)}
          aria-pressed={darkMode}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? (
            <>
              <Sun size={18} strokeWidth={2.4} aria-hidden="true" /> Light
            </>
          ) : (
            <>
              <Moon size={18} strokeWidth={2.4} aria-hidden="true" /> Dark
            </>
          )}
        </button>
      </section>

      {/* Editor's Choice Section */}
      {!searchQuery && !filterGenre && !filterYear && !filterRating && sortOption === 'default' && editorsChoiceMovies.length > 0 && (
        <section className="editors-choice" aria-label="Editor's Choice Movies">
          <h2>Editor's Choice</h2>
            <div className="editors-choice-list" role="list" aria-label="Editor's Choice movie list">
            {(isAuthenticated ? editorsChoiceMovies : editorsChoiceMovies.slice(0, 3)).map((movie, index) => (
              <MovieCard
                key={`editors-${movie.id}-${index}`}
                movie={movie}
                onMovieClick={handleMovieClick}
                onShowLoginPrompt={handleShowLoginPrompt}
                genres={genres}
                index={index}
                isEditorsChoice={true}
              />
            ))}
          </div>
          {!isAuthenticated && (
            <div className="preview-blur-notice">
              <p><Lock size={16} strokeWidth={2.4} aria-hidden="true" /> Login to see all Editor's Choice movies</p>
            </div>
          )}
        </section>
      )}

      <div className="movies-section">
        <h2>{searchQuery ? `Search Results for "${searchQuery}"` : 'Popular Movies'}</h2>
        
        {loading ? (
          <LoadingSpinner message="Loading movies..." />
        ) : (
          <>
            <div className="movies-grid" role="list" aria-label="Movie results list">
              {filteredMovies.map((movie, index) => (
                <MovieCard
                  key={`popular-${movie.id}-${index}`}
                  movie={movie}
                  onMovieClick={handleMovieClick}
                  onShowLoginPrompt={handleShowLoginPrompt}
                  genres={genres}
                  index={index}
                />
              ))}
            </div>

            {filteredMovies.length === 0 && (
              <div className="no-results">
                <p>No movies found. Try a different search or filter.</p>
              </div>
            )}

            {/* Login prompt for non-authenticated users */}
            {!isAuthenticated && filteredMovies.length > 0 && (
              <div className="login-required-notice">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Lock size={18} strokeWidth={2.4} aria-hidden="true" /> Want to see more?
                </h3>
                <p>Login to unlock unlimited movies, search, filters, and more features!</p>
                <button className="unlock-btn" onClick={() => onShowAuthModal('login')}>
                  Login to Unlock
                </button>
              </div>
            )}

            {/* Pagination - show for authenticated users when there are multiple pages */}
            {isAuthenticated && totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  ← Previous
                </button>
                
                {/* Page numbers */}
                <div className="page-numbers">
                  {currentPage > 2 && (
                    <>
                      <button onClick={() => setCurrentPage(1)} className="page-btn">1</button>
                      {currentPage > 3 && <span className="page-dots">...</span>}
                    </>
                  )}
                  
                  {currentPage > 1 && (
                    <button onClick={() => setCurrentPage(currentPage - 1)} className="page-btn">
                      {currentPage - 1}
                    </button>
                  )}
                  
                  <button className="page-btn active">{currentPage}</button>
                  
                  {currentPage < totalPages && (
                    <button onClick={() => setCurrentPage(currentPage + 1)} className="page-btn">
                      {currentPage + 1}
                    </button>
                  )}
                  
                  {currentPage < totalPages - 1 && (
                    <>
                      {currentPage < totalPages - 2 && <span className="page-dots">...</span>}
                      <button onClick={() => setCurrentPage(totalPages)} className="page-btn">
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className="pagination-btn"
                >
                  Next →
                </button>
              </div>
            )}
            
            {/* Show results count */}
            {isAuthenticated && totalCount > 0 && (filterGenre || filterYear || filterRating || sortOption !== 'default' || searchQuery) && (
              <div className="filtered-results-info">
                <p>
                  Showing {filteredMovies.length} of {totalCount} {totalCount === 1 ? 'result' : 'results'}
                  {totalPages > 1 && ` (Page ${currentPage} of ${totalPages})`}
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

Home.propTypes = {
  onShowAuthModal: PropTypes.func.isRequired,
};

export default Home;
