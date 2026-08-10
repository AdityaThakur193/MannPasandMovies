import PropTypes from 'prop-types';
import { Film, Search } from 'lucide-react';

const SearchBar = ({
  searchQuery,
  setSearchQuery,
  showSearchHistory,
  setShowSearchHistory,
  movieSuggestions,
  searchHistory,
  loadingSuggestions,
  onSearchSubmit,
  onNavigateToMovie,
  onSearchQueryTrigger,
  isAuthenticated,
}) => {
  return (
    <form className="search-form" onSubmit={onSearchSubmit}>
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
                      onNavigateToMovie(movie.id);
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
                        onSearchQueryTrigger(query);
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
  );
};

SearchBar.propTypes = {
  searchQuery: PropTypes.string.isRequired,
  setSearchQuery: PropTypes.func.isRequired,
  showSearchHistory: PropTypes.bool.isRequired,
  setShowSearchHistory: PropTypes.func.isRequired,
  movieSuggestions: PropTypes.array.isRequired,
  searchHistory: PropTypes.array.isRequired,
  loadingSuggestions: PropTypes.bool.isRequired,
  onSearchSubmit: PropTypes.func.isRequired,
  onNavigateToMovie: PropTypes.func.isRequired,
  onSearchQueryTrigger: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
};

export default SearchBar;
