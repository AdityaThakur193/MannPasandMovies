import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import FancySelect from './FancySelect';

const FilterPanel = ({
  filterGenre,
  setFilterGenre,
  filterYear,
  setFilterYear,
  filterRating,
  setFilterRating,
  sortOption,
  setSortOption,
  genres,
  years,
  filterBarOpacity,
  isAuthenticated,
  onClearFilters,
}) => {
  return (
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
          onClick={onClearFilters}
          aria-label="Clear all filters"
        >
          <X size={16} strokeWidth={2.4} aria-hidden="true" /> Clear
        </button>
      )}
    </section>
  );
};

FilterPanel.propTypes = {
  filterGenre: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  setFilterGenre: PropTypes.func.isRequired,
  filterYear: PropTypes.string.isRequired,
  setFilterYear: PropTypes.func.isRequired,
  filterRating: PropTypes.string.isRequired,
  setFilterRating: PropTypes.func.isRequired,
  sortOption: PropTypes.string.isRequired,
  setSortOption: PropTypes.func.isRequired,
  genres: PropTypes.array.isRequired,
  years: PropTypes.array.isRequired,
  filterBarOpacity: PropTypes.number.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  onClearFilters: PropTypes.func.isRequired,
};

export default FilterPanel;
