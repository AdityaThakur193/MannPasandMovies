import { Bookmark, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useMovie } from '../context/MovieContext';
import { useNavigate } from 'react-router-dom';
import { getMovieDetails, TMDB_IMAGE_BASE } from '../services/tmdbService';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/Watchlist.css';

const Watchlist = () => {
  const navigate = useNavigate();
  const { watchlist, loading, toggleWatchlist } = useMovie();
  const [moviesWithDetails, setMoviesWithDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(true);

  useEffect(() => {
    loadMovieDetails();
  }, [watchlist]);

  useEffect(() => {
    // Apply saved theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
    }
  }, []);

  const loadMovieDetails = async () => {
    if (watchlist.length === 0) {
      setLoadingDetails(false);
      return;
    }

    setLoadingDetails(true);
    try {
      const detailsPromises = watchlist.map(movie =>
        getMovieDetails(movie.movieId).catch(() => null)
      );
      const details = await Promise.all(detailsPromises);
      setMoviesWithDetails(details.filter(d => d !== null));
    } catch (error) {
      console.error('Error loading movie details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleRemove = async (movieId, movieTitle, posterPath) => {
    await toggleWatchlist({ movieId, title: movieTitle, posterPath });
  };

  if (loading || loadingDetails) {
    return <LoadingSpinner message="Loading watchlist..." fullScreen />;
  }

  return (
    <div className="watchlist-page">
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bookmark size={22} strokeWidth={2.4} aria-hidden="true" /> My Watchlist
        </h1>
        <p>{watchlist.length} {watchlist.length === 1 ? 'movie' : 'movies'} in your watchlist</p>
      </div>

      {watchlist.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Bookmark size={34} strokeWidth={2.4} aria-hidden="true" /></div>
          <h2>Your watchlist is empty</h2>
          <p>Start adding movies you want to watch!</p>
          <button onClick={() => navigate('/')} className="browse-btn">
            Browse Movies
          </button>
        </div>
      ) : (
        <div className="watchlist-grid">
          {moviesWithDetails.map((movie) => (
            <div key={movie.id} className="watchlist-card">
              <div 
                className="watchlist-poster"
                onClick={() => navigate(`/movie/${movie.id}`)}
              >
                <img
                  src={movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : '/placeholder.jpg'}
                  alt={movie.title}
                />
                <div className="watchlist-overlay">
                  <button className="view-btn">View Details</button>
                </div>
              </div>
              <div className="watchlist-info">
                <h3>{movie.title}</h3>
                <div className="watchlist-meta">
                  <span className="rating">
                    <Star size={16} strokeWidth={2.4} aria-hidden="true" /> {movie.vote_average?.toFixed(1)}
                  </span>
                  <span className="year">{movie.release_date?.split('-')[0]}</span>
                </div>
                <p className="overview">{movie.overview?.substring(0, 150)}...</p>
                <button 
                  className="remove-btn"
                  onClick={() => handleRemove(movie.id, movie.title, movie.poster_path)}
                >
                  Remove from Watchlist
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Watchlist;
