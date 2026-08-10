import { useState } from 'react';
import PropTypes from 'prop-types';
import { Link, useLocation } from 'react-router-dom';
import { Home, Bookmark, Sparkles, User, BarChart3, LogOut, LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import '../styles/Navbar.css';

// Helper function to extract first letter from username/email
const getAvatarLetter = (name) => {
  if (!name) return 'U';
  // If it's an email, get the part before @
  if (name.includes('@')) {
    return name.split('@')[0].charAt(0).toUpperCase();
  }
  // Otherwise get first character of the name
  return name.charAt(0).toUpperCase();
};

// Avatar component - displays circular badge with first letter or image
const AvatarBadge = ({ name, avatar, size = 'md' }) => {
  const letter = getAvatarLetter(name);
  const sizeClasses = {
    sm: 'w-10 h-10 text-base',
    md: 'w-12 h-12 text-lg',
    lg: 'w-12 h-12 text-xl'
  };
  
  // If avatar is an image (data URL or URL), display it
  if (avatar && (avatar.startsWith('data:') || avatar.startsWith('http'))) {
    return (
      <div className={`avatar-badge ${size} ${sizeClasses[size]}`}>
        <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
      </div>
    );
  }
  
  // Otherwise display the letter/emoji
  return (
    <div className={`avatar-badge ${size} ${sizeClasses[size]}`}>
      {avatar || letter}
    </div>
  );
};

AvatarBadge.propTypes = {
  name: PropTypes.string,
  avatar: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
};

const Navbar = ({ onShowAuthModal, onShowStats }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { openAuthModal, setShowStats } = useUI();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const location = useLocation();

  const triggerAuthModal = onShowAuthModal || openAuthModal;
  const triggerShowStats = onShowStats || (() => setShowStats(true));

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    setShowLogoutModal(true);
    setShowDropdown(false);
  };

  const confirmLogout = () => {
    logout();
    setShowLogoutModal(false);
  };

  return (
    <header>
      <div className="logo" aria-label="MannPasandMovies Cinematic Movie Discovery">
        <img src="/logo.png" alt="MannPasandMovies Logo" className="logo-image" />
        <span className="logo-text">MannPasandMovies</span>
      </div>
      
      <nav className="header-nav">
        <Link to="/">
          <button 
            className={`nav-btn ${isActive('/') ? 'active' : ''}`} 
            aria-label="Home"
          >
            <Home size={18} strokeWidth={2.4} aria-hidden="true" /> Home
          </button>
        </Link>
        {isAuthenticated && (
          <>
            <Link to="/watchlist">
              <button 
                className={`nav-btn ${isActive('/watchlist') ? 'active' : ''}`} 
                aria-label="My Watchlist"
              >
                <Bookmark size={18} strokeWidth={2.4} aria-hidden="true" /> Watchlist
              </button>
            </Link>
            <Link to="/recommendations">
              <button 
                className={`nav-btn ${isActive('/recommendations') ? 'active' : ''}`} 
                aria-label="Recommendations"
              >
                <Sparkles size={18} strokeWidth={2.4} aria-hidden="true" /> For You
              </button>
            </Link>
          </>
        )}
      </nav>

      <div className="user-section">
        {isAuthenticated ? (
          <div className="user-profile">
            <button 
              className="profile-btn"
              onClick={() => setShowDropdown(!showDropdown)}
              aria-label="User profile"
            >
              <AvatarBadge name={user?.name || user?.email} avatar={user?.avatar} size="sm" />
            </button>

            {showDropdown && (
              <div className="profile-dropdown show">
                <div className="dropdown-header">
                  <AvatarBadge name={user?.name || user?.email} avatar={user?.avatar} size="md" />
                  <div>
                    <div className="dropdown-name">{user?.name}</div>
                    <div className="dropdown-email">{user?.email}</div>
                  </div>
                </div>
                <hr style={{border: 'none', borderTop: '1px solid rgba(255,255,255,0.1)', margin: '0.5rem 0'}} />
                <button 
                  className="dropdown-item"
                  onClick={() => {
                    setShowDropdown(false);
                    triggerShowStats();
                  }}
                >
                  <BarChart3 size={18} strokeWidth={2.4} aria-hidden="true" /> My Stats
                </button>
                <Link to="/profile" onClick={() => setShowDropdown(false)}>
                  <button 
                    className="dropdown-item"
                    type="button"
                    aria-label="View profile"
                  >
                    <User size={18} strokeWidth={2.4} aria-hidden="true" /> Profile
                  </button>
                </Link>
                <button 
                  className="dropdown-item"
                  onClick={handleLogout}
                >
                  <LogOut size={18} strokeWidth={2.4} aria-hidden="true" /> Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <button 
            className="auth-btn"
            onClick={() => triggerAuthModal('login')}
            aria-label="Login"
          >
            <LogIn size={18} strokeWidth={2.4} aria-hidden="true" /> Login
          </button>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowLogoutModal(false)}
          onKeyDown={(e) => e.key === 'Escape' && setShowLogoutModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-modal-title"
        >
          <div 
            className="logout-modal" 
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="logout-modal-icon">
              <AlertCircle size={40} strokeWidth={2} />
            </div>
            <h3 id="logout-modal-title">Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="logout-modal-actions">
              <button 
                className="logout-cancel-btn" 
                onClick={() => setShowLogoutModal(false)}
              >
                Cancel
              </button>
              <button 
                className="logout-confirm-btn" 
                onClick={confirmLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

Navbar.propTypes = {
  onShowAuthModal: PropTypes.func,
  onShowStats: PropTypes.func,
};

export default Navbar;
