import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Lock, Film } from 'lucide-react';
import { getPopularMovies, getTopRatedMovies, getGenres, discoverMovies } from '../services/tmdbService';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import Pagination from '../components/Pagination';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import { useMovieSearch } from '../hooks/useMovieSearch';
import '../styles/Home.css';

const Home = ({ onShowAuthModal }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { openAuthModal } = useUI();

  // Movie data states
  const [allMovies, setAllMovies] = useState([]); // Currently displayed movies
  const [editorsChoiceMovies, setEditorsChoiceMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false); // Track if we're in search mode

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
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [filterBarOpacity, setFilterBarOpacity] = useState(1);

  // Track if component has mounted to prevent double-loading
  const isInitialMount = useRef(true);

  const triggerAuthModal = onShowAuthModal || openAuthModal;

  // Search hook usage
  const handleSearchTriggered = async (trimmedQuery) => {
    // Clear filters when searching
    if (filterGenre || filterYear || filterRating || sortOption !== 'default') {
      setFilterGenre('');
      setFilterYear('');
      setFilterRating('');
      setSortOption('default');
    }
    setIsSearchMode(true);
    
    setLoading(true);
    try {
      // Load multiple pages of search results
      const searchPages = await Promise.all([
        searchMovies(trimmedQuery, 1),
        searchMovies(trimmedQuery, 2),
        searchMovies(trimmedQuery, 3),
        searchMovies(trimmedQuery, 4),
        searchMovies(trimmedQuery, 5),
      ]);
      
      const searchResults = searchPages.flatMap(page => page.results || []);
      setAllMovies(searchResults);
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

  const {
    searchQuery,
    setSearchQuery,
    searchHistory,
    showSearchHistory,
    setShowSearchHistory,
    movieSuggestions,
    loadingSuggestions,
    performSearch,
  } = useMovieSearch(handleSearchTriggered);

  // Initialize app on mount
  useEffect(() => {
    loadMoviesForPage(1);
    
    return () => {
      setFilterGenre('');
      setFilterYear('');
      setFilterRating('');
      setSortOption('default');
      setSearchQuery('');
    };
  }, []);

  // Handle auto-searching on query change (with debounce)
  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim()) {
        setIsSearchMode(true);
        performSearch(searchQuery);
      } else if (isSearchMode) {
        setIsSearchMode(false);
        const hasFilters = filterGenre || filterYear || filterRating || sortOption !== 'default';
        if (hasFilters) {
          loadMoviesWithFilters(currentPage);
        } else {
          loadMoviesForPage(currentPage);
        }
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery]);

  // Load movies when page changes (only when not in search/filter mode)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    const hasFilters = filterGenre || filterYear || filterRating || sortOption !== 'default';
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (isSearchMode) return;
    
    if (hasFilters) {
      loadMoviesWithFilters(currentPage);
    } else {
      loadMoviesForPage(currentPage);
    }
  }, [currentPage, isSearchMode, filterGenre, filterYear, filterRating, sortOption]);

  // Reset to page 1 when filters or sort changes
  useEffect(() => {
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [filterGenre, filterYear, filterRating, sortOption]);

  // Smooth scroll handler for filter bar opacity
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
        const opacity = 1 - ((scrollY - fadeStart) / (fadeEnd - fadeStart));
        setFilterBarOpacity(opacity);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      setTotalAvailablePages(MAX_PAGES);
    } catch (error) {
      console.error('Error loading movies:', error);
      setAllMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMoviesWithFilters = async (pageNum = 1) => {
    setLoading(true);
    try {
      const filters = {};
      if (filterGenre) filters.genre = filterGenre;
      if (filterYear) filters.year = filterYear;
      if (filterRating) filters.rating = filterRating;
      
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
      
      const data = await discoverMovies(filters, pageNum);
      setAllMovies(data.results || []);
      setTotalAvailablePages(Math.min(data.total_pages || 1, MAX_PAGES));
    } catch (error) {
      console.error('Error loading movies with filters:', error);
      setAllMovies([]);
      setTotalAvailablePages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const handleMovieClick = (movieId) => {
    navigate(`/movie/${movieId}`);
  };

  const handleShowLoginPrompt = () => {
    setShowLoginPrompt(true);
  };

  const getFilteredAndPaginatedMovies = () => {
    let filtered = [...allMovies];
    const hasFilters = filterGenre || filterYear || filterRating || sortOption !== 'default';
    
    if (hasFilters || isSearchMode) {
      return {
        paginatedMovies: isAuthenticated ? filtered : filtered.slice(0, 6),
        totalCount: totalAvailablePages * MOVIES_PER_PAGE,
        totalPages: totalAvailablePages
      };
    }

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
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i).map(String);

  return (
    <div className="home-page">
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
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <button className="login-prompt-btn" onClick={() => {
                setShowLoginPrompt(false);
                triggerAuthModal('login');
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
        <SearchBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showSearchHistory={showSearchHistory}
          setShowSearchHistory={setShowSearchHistory}
          movieSuggestions={movieSuggestions}
          searchHistory={searchHistory}
          loadingSuggestions={loadingSuggestions}
          onSearchSubmit={handleSearch}
          onNavigateToMovie={handleMovieClick}
          onSearchQueryTrigger={performSearch}
          isAuthenticated={isAuthenticated}
        />
      </div>

      <FilterPanel
        filterGenre={filterGenre}
        setFilterGenre={setFilterGenre}
        filterYear={filterYear}
        setFilterYear={setFilterYear}
        filterRating={filterRating}
        setFilterRating={setFilterRating}
        sortOption={sortOption}
        setSortOption={setSortOption}
        genres={genres}
        years={years}
        filterBarOpacity={filterBarOpacity}
        isAuthenticated={isAuthenticated}
        onClearFilters={() => {
          setFilterGenre('');
          setFilterYear('');
          setFilterRating('');
          setSortOption('default');
        }}
      />

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

            {!isAuthenticated && filteredMovies.length > 0 && (
              <div className="login-required-notice">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Lock size={18} strokeWidth={2.4} aria-hidden="true" /> Want to see more?
                </h3>
                <p>Login to unlock unlimited movies, search, filters, and more features!</p>
                <button className="unlock-btn" onClick={() => triggerAuthModal('login')}>
                  Login to Unlock
                </button>
              </div>
            )}

            <Pagination
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              totalPages={totalPages}
            />
            
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
  onShowAuthModal: PropTypes.func,
};

export default Home;
