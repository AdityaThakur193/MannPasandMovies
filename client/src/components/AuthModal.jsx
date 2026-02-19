import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { X, Clapperboard, Hand } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../styles/AuthModal.css';

const AuthModal = ({ mode, onClose, onSwitchMode }) => {
  const { login, register, googleLogin } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleGoogleLogin = () => {
    googleLogin();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (mode === 'register') {
      if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
        setError('Please fill in all fields.');
        setLoading(false);
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters long.');
        setLoading(false);
        return;
      }
      const hasUpperCase = /[A-Z]/.test(formData.password);
      const hasLowerCase = /[a-z]/.test(formData.password);
      const hasNumber = /\d/.test(formData.password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(formData.password);
      if (!hasUpperCase || !hasLowerCase || !hasNumber || !hasSpecialChar) {
        setError('Password must contain uppercase, lowercase, number, and special character (!@#$%^&*)');
        setLoading(false);
        return;
      }
    }

    try {
      let result;
      if (mode === 'login') {
        result = await login({
          email: formData.email,
          password: formData.password,
        });
      } else {
        result = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
      }

      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'An error occurred');
      }
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ display: 'flex' }}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
        <button className="close-modal-btn" onClick={onClose} aria-label="Close">
          <X size={18} strokeWidth={2.4} aria-hidden="true" />
        </button>
        
        {mode === 'login' ? (
          <div className="auth-form">
            <h2 id="auth-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Hand size={22} strokeWidth={2.4} aria-hidden="true" /> Welcome Back!
            </h2>
            <p className="auth-subtitle">Sign in to sync your data across devices</p>
            
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="login-email">Email</label>
                <input
                  type="email"
                  id="login-email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <input
                  type="password"
                  id="login-password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
              </div>
              
              <button type="submit" className="auth-submit-btn" disabled={loading}>
                {loading ? 'Please wait...' : 'Login'}
              </button>
            </form>

            <div className="auth-divider">
              <span>or</span>
            </div>

            <button className="google-auth-btn" onClick={handleGoogleLogin} type="button">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            
            <p className="auth-switch">
              Don't have an account?{' '}
              <button className="link-btn" onClick={() => onSwitchMode('register')}>Sign up</button>
            </p>
          </div>
        ) : (
          <div className="auth-form">
            <h2 id="auth-modal-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clapperboard size={22} strokeWidth={2.4} aria-hidden="true" /> Create Account
            </h2>
            <p className="auth-subtitle">Join MannPasandMovies community</p>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="auth-grid">
              <div className="auth-panel form-panel">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="register-name">Full Name</label>
                    <input
                      type="text"
                      id="register-name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="register-email">Email</label>
                    <input
                      type="email"
                      id="register-email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Your email address"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="register-password">Password</label>
                    <input
                      type="password"
                      id="register-password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 8 chars, uppercase, number, special char"
                      required
                      minLength="8"
                    />
                    <small style={{color: '#999', fontSize: '0.75rem', marginTop: '0.25rem', display: 'block'}}>
                      Must contain: A-Z, a-z, 0-9, and special character (!@#$%^&*)
                    </small>
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="register-confirm-password">Confirm Password</label>
                    <input
                      type="password"
                      id="register-confirm-password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required
                    />
                  </div>
                  
                  <button type="submit" className="auth-submit-btn" disabled={loading}>
                    {loading ? 'Please wait...' : 'Create Account'}
                  </button>
                </form>
              </div>

              <div className="auth-panel social-panel">
                <h4 className="social-title">Skip the form</h4>
                <button className="google-auth-btn google-wide" onClick={handleGoogleLogin} type="button">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>
              </div>
            </div>
            
            <p className="auth-switch">
              Already have an account?{' '}
              <button className="link-btn" onClick={() => onSwitchMode('login')}>Sign in</button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

AuthModal.propTypes = {
  mode: PropTypes.oneOf(['login', 'register']).isRequired,
  onClose: PropTypes.func.isRequired,
  onSwitchMode: PropTypes.func.isRequired,
};

export default AuthModal;
