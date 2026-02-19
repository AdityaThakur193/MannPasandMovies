import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, BarChart3, Heart, Bookmark, MessageSquareText, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getUserStats } from '../services/authService';
import '../styles/StatsModal.css';

const StatsModal = ({ onClose }) => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    
    // Apply saved theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
    } else {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const loadStats = async () => {
    try {
      const data = await getUserStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={onClose} 
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
      role="dialog"
      aria-modal="true"
      aria-labelledby="stats-modal-title"
      style={{ display: 'flex' }}
    >
      <div 
        className="stats-modal" 
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <button className="close-modal-btn" onClick={onClose} aria-label="Close statistics modal">
          <X size={18} strokeWidth={2.4} aria-hidden="true" />
        </button>
        
        <h2 id="stats-modal-title" className="modal-title">
          <BarChart3 size={20} strokeWidth={2.4} aria-hidden="true" />
          <span>Your Movie Stats</span>
        </h2>
        
        {loading ? (
          <div className="loading">Loading stats...</div>
        ) : stats ? (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon"><Heart size={18} strokeWidth={2.4} aria-hidden="true" /></div>
                <div className="stat-value">{stats.totalLikes || 0}</div>
                <div className="stat-label">Movies Liked</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon"><Bookmark size={18} strokeWidth={2.4} aria-hidden="true" /></div>
                <div className="stat-value">{stats.totalWatchlist || 0}</div>
                <div className="stat-label">In Watchlist</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon"><MessageSquareText size={18} strokeWidth={2.4} aria-hidden="true" /></div>
                <div className="stat-value">{stats.totalReviews || 0}</div>
                <div className="stat-label">Reviews Written</div>
              </div>
              
              <div className="stat-card">
                <div className="stat-icon"><Star size={18} strokeWidth={2.4} aria-hidden="true" /></div>
                <div className="stat-value">
                  {stats.averageRating ? stats.averageRating.toFixed(1) : '0.0'}
                </div>
                <div className="stat-label">Avg Rating</div>
              </div>
            </div>

            {stats.favoriteGenres && stats.favoriteGenres.length > 0 && (
              <div className="favorite-genres">
                <h3 className="section-title">Your Favorite Genres</h3>
                <div className="genre-list">
                  {stats.favoriteGenres.map((genre) => (
                    <span key={genre} className="genre-tag">{genre}</span>
                  ))}
                </div>
              </div>
            )}

            <div className="account-info">
              <h3 className="section-title">Account Info</h3>
              <p><strong>Name:</strong> <span>{user?.name || '-'}</span></p>
              <p><strong>Email:</strong> <span>{user?.email || '-'}</span></p>
              <p><strong>Member Since:</strong> <span>{formatDate(user?.createdAt)}</span></p>
            </div>
          </>
        ) : (
          <div className="error">Failed to load statistics</div>
        )}
      </div>
    </div>
  );
};

StatsModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default StatsModal;
