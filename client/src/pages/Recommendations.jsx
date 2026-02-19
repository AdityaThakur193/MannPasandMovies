import { useEffect, useState } from 'react';
import { Target, Search } from 'lucide-react';
import { useMovie } from '../context/MovieContext';
import { useNavigate } from 'react-router-dom';
import { getMovieDetails, getSimilarMovies, TMDB_IMAGE_BASE } from '../services/tmdbService';
import MovieCard from '../components/MovieCard';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/Recommendations.css';

const Recommendations = () => {
  const navigate = useNavigate();
  const { likedMovies } = useMovie();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [likedMovies]);

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

  const loadRecommendations = async () => {
    if (likedMovies.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Get similar movies for each liked movie
      const similarPromises = likedMovies
        .slice(0, 5) // Limit to 5 liked movies for performance
        .map(movie => getSimilarMovies(movie.movieId).catch(() => ({ results: [] })));
      
      const similarResults = await Promise.all(similarPromises);
      
      // Combine and deduplicate recommendations
      const allRecommendations = similarResults.flatMap(result => result.results);
      const uniqueRecommendations = Array.from(
        new Map(allRecommendations.map(movie => [movie.id, movie])).values()
      );
      
      // Filter out already liked movies
      const likedIds = new Set(likedMovies.map(m => m.movieId));
      const filtered = uniqueRecommendations.filter(movie => !likedIds.has(movie.id));
      
      // Sort by popularity and take top 20
      const sorted = filtered
        .sort((a, b) => b.vote_average - a.vote_average)
        .slice(0, 20);
      
      setRecommendations(sorted);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading recommendations..." fullScreen />;
  }

  return (
    <div className="recommendations-page">
      <div className="page-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={22} strokeWidth={2.4} aria-hidden="true" /> Recommended For You
        </h1>
        <p>Based on your liked movies</p>
      </div>

      {likedMovies.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Target size={34} strokeWidth={2.4} aria-hidden="true" /></div>
          <h2>No recommendations yet</h2>
          <p>Start liking movies to get personalized recommendations!</p>
          <button onClick={() => navigate('/')} className="browse-btn">
            Browse Movies
          </button>
        </div>
      ) : recommendations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Search size={34} strokeWidth={2.4} aria-hidden="true" /></div>
          <h2>Loading recommendations...</h2>
          <p>We're finding the best movies for you!</p>
        </div>
      ) : (
        <div className="recommendations-grid">
          {recommendations.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onMovieClick={(id) => navigate(`/movie/${id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
