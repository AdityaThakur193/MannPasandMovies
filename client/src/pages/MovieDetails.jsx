import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getMovieDetails, 
  getMovieVideos, 
  getMovieCredits,
  getSimilarMovies,
  getMovieProviders,
  TMDB_IMAGE_BASE 
} from '../services/tmdbService';
import { 
  getMovieReviews, 
  createReview, 
  updateReview, 
  deleteReview 
} from '../services/movieService';
import { Star, Heart, BookmarkPlus, BookmarkCheck, PlayCircle, Tv2, PenLine } from 'lucide-react';
import { useMovie } from '../context/MovieContext';
import { useAuth } from '../context/AuthContext';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import '../styles/MovieDetails.css';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isMovieLiked, isInWatchlist, toggleLike, toggleWatchlist } = useMovie();
  
  const [movie, setMovie] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [cast, setCast] = useState([]);
  const [similar, setSimilar] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [providers, setProviders] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [reviewForm, setReviewForm] = useState({ rating: 5, review: '' });
  const [editingReview, setEditingReview] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);

  // Retrieve current user ID safely from localStorage
  const getCurrentUserId = () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr)?._id : null;
    } catch {
      return null;
    }
  };

  const currentUserId = getCurrentUserId();

  useEffect(() => {
    loadMovieData();
  }, [id]);

  const loadMovieData = async () => {
    setLoading(true);
    try {
      const [movieData, videos, credits, similarMovies, movieReviews, watchProviders] = await Promise.all([
        getMovieDetails(id),
        getMovieVideos(id),
        getMovieCredits(id),
        getSimilarMovies(id),
        getMovieReviews(id),
        getMovieProviders(id),
      ]);

      setMovie(movieData);
      setCast(credits.cast.slice(0, 10));
      setSimilar(similarMovies.results.slice(0, 6));
      setReviews(Array.isArray(movieReviews) ? movieReviews : []);
      
      setProviders(watchProviders.results?.US || null);

      const youtubeTrailer = videos.results.find(
        (video) => video.type === 'Trailer' && video.site === 'YouTube'
      );
      setTrailer(youtubeTrailer);
    } catch (error) {
      console.error('Error loading movie data:', error);
    } finally {
      setLoading(false);
    }
  };

  const movieData = {
    movieId: parseInt(id),
    title: movie?.title,
    posterPath: movie?.poster_path,
  };

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('Please login to like movies');
      return;
    }
    await toggleLike(movieData);
  };

  const handleWatchlist = async () => {
    if (!isAuthenticated) {
      alert('Please login to add to watchlist');
      return;
    }
    await toggleWatchlist(movieData);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Please login to write a review');
      return;
    }

    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      alert('Rating must be between 1 and 5 stars');
      return;
    }

    if (!reviewForm.review || reviewForm.review.trim().length === 0) {
      alert('Please write a review');
      return;
    }

    try {
      if (editingReview) {
        const response = await updateReview(editingReview._id, reviewForm);
        const updatedReview = response.review || response.data?.review || response;
        setReviews(prev => prev.map(r => 
          r._id === editingReview._id 
            ? { ...r, ...reviewForm, ...updatedReview, updatedAt: new Date().toISOString() }
            : r
        ));
      } else {
        const response = await createReview({
          movieId: parseInt(id),
          movieTitle: movie.title,
          rating: parseInt(reviewForm.rating),
          review: reviewForm.review,
        });
        const newReview = response.review || response.data?.review || response;
        const reviewToAdd = {
          _id: newReview._id || Date.now().toString(),
          user: { 
            _id: currentUserId,
            name: JSON.parse(localStorage.getItem('user'))?.name 
          },
          rating: parseInt(reviewForm.rating),
          review: reviewForm.review,
          createdAt: new Date().toISOString(),
          ...newReview
        };
        setReviews(prev => [reviewToAdd, ...prev]);
      }
      setReviewForm({ rating: 5, review: '' });
      setEditingReview(null);
      setShowReviewForm(false);
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.response?.data?.message || 'Failed to submit review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Are you sure you want to delete this review?')) return;

    try {
      await deleteReview(reviewId);
      setReviews(prev => prev.filter(r => r._id !== reviewId));
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };

  const handleEditClick = (review) => {
    setEditingReview(review);
    setReviewForm({ rating: review.rating, review: review.review });
    setShowReviewForm(true);
  };

  if (loading) {
    return <div className="loading-screen">Loading movie details...</div>;
  }

  if (!movie) {
    return <div className="error-screen">Movie not found</div>;
  }

  return (
    <div className="movie-details">
      <div 
        className="movie-backdrop"
        style={{
          backgroundImage: movie.backdrop_path 
            ? `url(https://image.tmdb.org/t/p/original${movie.backdrop_path})`
            : 'none'
        }}
      >
        <div className="backdrop-overlay"></div>
      </div>

      <div className="movie-content">
        <div className="movie-header">
          <img
            src={movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : '/placeholder.jpg'}
            alt={`${movie.title} poster`}
            className="movie-poster-large"
            loading="lazy"
          />

          <div className="movie-info-main">
            <h1>{movie.title}</h1>
            <p className="tagline">{movie.tagline}</p>

            <div className="movie-meta-large">
              <span className="rating">
                <Star size={18} strokeWidth={2.4} aria-hidden="true" /> {movie.vote_average?.toFixed(1)}
              </span>
              <span>{movie.release_date?.split('-')[0]}</span>
              <span>{movie.runtime} min</span>
            </div>

            <div className="movie-genres">
              {movie.genres?.map((genre) => (
                <span key={genre.id} className="genre-tag">{genre.name}</span>
              ))}
            </div>

            <div className="movie-actions">
              <button 
                className={`action-button ${isMovieLiked(parseInt(id)) ? 'active' : ''}`}
                onClick={handleLike}
              >
                <Heart size={18} strokeWidth={2.4} aria-hidden="true" /> {isMovieLiked(parseInt(id)) ? 'Liked' : 'Like'}
              </button>
              <button 
                className={`action-button ${isInWatchlist(parseInt(id)) ? 'active' : ''}`}
                onClick={handleWatchlist}
              >
                {isInWatchlist(parseInt(id)) ? (
                  <>
                    <BookmarkCheck size={18} strokeWidth={2.4} aria-hidden="true" /> Remove from Watchlist
                  </>
                ) : (
                  <>
                    <BookmarkPlus size={18} strokeWidth={2.4} aria-hidden="true" /> Add to Watchlist
                  </>
                )}
              </button>
            </div>

            <div className="overview">
              <h3>Overview</h3>
              <p>{movie.overview}</p>
            </div>
          </div>
        </div>

        {trailer && (
          <div className="trailer-section">
            <h2>Trailer</h2>
            <div className="trailer-container">
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?enablejsapi=1&origin=${window.location.origin}&playsinline=1`}
                title="Movie Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                frameBorder="0"
              ></iframe>
            </div>
            <a 
              href={`https://www.youtube.com/watch?v=${trailer.key}`}
              target="_blank"
              rel="noopener noreferrer"
              className="watch-on-youtube"
            >
              <PlayCircle size={18} strokeWidth={2.4} aria-hidden="true" /> Watch on YouTube
            </a>
          </div>
        )}

        {cast.length > 0 && (
          <div className="cast-section">
            <h2>Cast</h2>
            <div className="cast-grid">
              {cast.map((actor) => (
                <div key={actor.id} className="cast-card">
                  <img
                    src={
                      actor.profile_path
                        ? `${TMDB_IMAGE_BASE}${actor.profile_path}`
                        : '/placeholder-person.jpg'
                    }
                    alt={`Photo of ${actor.name}`}
                    loading="lazy"
                  />
                  <div className="cast-info">
                    <strong>{actor.name}</strong>
                    <small>{actor.character}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="providers-section">
          <h2>Where to Watch</h2>
          {providers && (providers.flatrate || providers.rent || providers.buy) ? (
            <div className="providers-container">
              {providers.flatrate && providers.flatrate.length > 0 && (
                <div className="provider-category">
                  <h3>Stream</h3>
                  <div className="provider-grid">
                    {providers.flatrate.map((provider) => (
                      <div key={provider.provider_id} className="provider-card">
                        <img
                          src={`${TMDB_IMAGE_BASE}${provider.logo_path}`}
                          alt={provider.provider_name}
                          title={provider.provider_name}
                          loading="lazy"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {providers.rent && providers.rent.length > 0 && (
                <div className="provider-category">
                  <h3>Rent</h3>
                  <div className="provider-grid">
                    {providers.rent.map((provider) => (
                      <div key={provider.provider_id} className="provider-card">
                        <img
                          src={`${TMDB_IMAGE_BASE}${provider.logo_path}`}
                          alt={provider.provider_name}
                          title={provider.provider_name}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {providers.buy && providers.buy.length > 0 && (
                <div className="provider-category">
                  <h3>Buy</h3>
                  <div className="provider-grid">
                    {providers.buy.map((provider) => (
                      <div key={provider.provider_id} className="provider-card">
                        <img
                          src={`${TMDB_IMAGE_BASE}${provider.logo_path}`}
                          alt={provider.provider_name}
                          title={provider.provider_name}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="no-providers">
              <p><Tv2 size={18} strokeWidth={2.4} aria-hidden="true" /> Not currently available on streaming platforms</p>
              <small>Check back later or search for theatrical releases</small>
            </div>
          )}
        </div>

        <div className="reviews-section">
          <div className="reviews-header">
            <h2>Reviews ({reviews.length})</h2>
            {isAuthenticated && (
              <button 
                className="write-review-btn"
                onClick={() => setShowReviewForm(!showReviewForm)}
              >
                <PenLine size={18} strokeWidth={2.4} aria-hidden="true" /> Write a Review
              </button>
            )}
          </div>

          {showReviewForm && (
            <ReviewForm
              reviewForm={reviewForm}
              setReviewForm={setReviewForm}
              onSubmit={handleReviewSubmit}
              onCancel={() => {
                setShowReviewForm(false);
                setEditingReview(null);
                setReviewForm({ rating: 5, review: '' });
              }}
              isEditing={!!editingReview}
            />
          )}

          <ReviewList
            reviews={reviews}
            isAuthenticated={isAuthenticated}
            currentUserId={currentUserId}
            onEdit={handleEditClick}
            onDelete={handleDeleteReview}
          />
        </div>

        {similar.length > 0 && (
          <div className="similar-section">
            <h2>Similar Movies</h2>
            <div className="similar-grid">
              {similar.map((movie) => (
                <div 
                  key={movie.id} 
                  className="similar-card"
                  onClick={() => navigate(`/movie/${movie.id}`)}
                >
                  <img
                    src={movie.poster_path ? `${TMDB_IMAGE_BASE}${movie.poster_path}` : '/placeholder.jpg'}
                    alt={movie.title}
                  />
                  <p>{movie.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieDetails;
