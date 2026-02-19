import { Heart, Star } from 'lucide-react';
import PropTypes from 'prop-types';
import { useMovie } from '../context/MovieContext';
import { useAuth } from '../context/AuthContext';
import { TMDB_IMAGE_BASE } from '../services/tmdbService';
import '../styles/MovieCard.css';

const MovieCard = ({ movie, onMovieClick, onShowLoginPrompt, genres = [], index = 0, isEditorsChoice = false }) => {
  const { isAuthenticated } = useAuth();
  const { isMovieLiked, toggleLike } = useMovie();
  
  const movieData = {
    movieId: movie.id,
    title: movie.title,
    posterPath: movie.poster_path,
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      if (onShowLoginPrompt) {
        onShowLoginPrompt();
      } else {
        alert('Please login to like movies');
      }
      return;
    }
    await toggleLike(movieData);
  };

  // Convert genre IDs to genre names
  const getGenreNames = () => {
    if (movie.genres) {
      // If movie already has genre objects (from movie details API)
      return movie.genres.slice(0, 2).map(g => g.name).join(', ');
    } else if (movie.genre_ids && genres.length > 0) {
      // Convert genre IDs to names using the genres list
      return movie.genre_ids
        .slice(0, 2)
        .map(id => {
          const genre = genres.find(g => g.id === id);
          return genre ? genre.name : null;
        })
        .filter(Boolean)
        .join(', ');
    }
    return 'Unknown';
  };

  const year = movie.release_date?.split('-')[0] || 'N/A';
  const genreNames = getGenreNames();
  const rating = movie.vote_average ? Number.parseFloat(movie.vote_average.toFixed(1)) : 0;

  return (
    <article 
      className="movie-card" 
      style={{ animationDelay: `${index * 40}ms` }}
      aria-label={`${movie.title} (${year}). Rating: ${rating}`}
      role="listitem"
      tabIndex={-1}
    >
      <button
        className="movie-poster-btn"
        type="button"
        onClick={() => onMovieClick(movie.id)}
        aria-label={`View details for ${movie.title}`}
      >
        <img
          className="movie-poster"
          src={movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'}
          alt={`Movie poster: ${movie.title}${year !== 'N/A' ? ` (${year})` : ''}`}
          loading="lazy"
        />
      </button>

      <div className="movie-info">
        <h2 className="movie-title">{movie.title}</h2>
        <div className="movie-meta">
          <span>{year}</span>
          {!isEditorsChoice && genreNames && genreNames !== 'Unknown' && (
            genreNames.split(',').map((genre) => {
              const name = genre.trim();
              return name ? <span key={name} className="genre">{name}</span> : null;
            })
          )}
        </div>

        <button
          className="movie-description-btn"
          type="button"
          onClick={() => onMovieClick(movie.id)}
          aria-label={`Read full description of ${movie.title}`}
        >
          <p className="movie-description">
            {movie.overview || 'No description available.'}
          </p>
        </button>

        <div className="like-container">
          <div className="rating-chip">
            <Star size={16} strokeWidth={2.4} aria-hidden="true" />
            <span>{rating}</span>
          </div>
          <button
            className={`like-button ${isMovieLiked(movie.id) ? 'liked' : ''}`}
            onClick={handleLike}
            type="button"
            aria-pressed={isMovieLiked(movie.id)}
            aria-label={isMovieLiked(movie.id) ? `Unlike ${movie.title}` : `Like ${movie.title}`}
          >
            <Heart size={18} strokeWidth={2.4} aria-hidden="true" />
            <span className="like-count">{isMovieLiked(movie.id) ? 'Liked' : 'Like'}</span>
          </button>
        </div>
      </div>
    </article>
  );
};

MovieCard.propTypes = {
  movie: PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    poster_path: PropTypes.string,
    overview: PropTypes.string,
    release_date: PropTypes.string,
    vote_average: PropTypes.number,
    genre_ids: PropTypes.arrayOf(PropTypes.number),
    genres: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
    })),
  }).isRequired,
  onMovieClick: PropTypes.func.isRequired,
  onShowLoginPrompt: PropTypes.func,
  genres: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
  })),
  index: PropTypes.number,
  isEditorsChoice: PropTypes.bool,
};

export default MovieCard;
