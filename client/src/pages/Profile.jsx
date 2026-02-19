import { Star, Edit2, Trash2, Camera, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getUserReviews, deleteReview, updateReview } from '../services/movieService';
import { deleteAvatar } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import '../styles/Profile.css';

// Helper to derive a single avatar letter from name/email
const getAvatarLetter = (nameOrEmail) => {
  if (!nameOrEmail) return 'A';
  const source = String(nameOrEmail);
  if (source.includes('@')) {
    return source.split('@')[0].slice(0, 1).toUpperCase();
  }
  return source.slice(0, 1).toUpperCase();
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [avatarToDelete, setAvatarToDelete] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [reviewSort, setReviewSort] = useState('newest');
  const fileInputRef = useRef(null);
  const reviewsRef = useRef(null);

  useEffect(() => {
    loadReviews();
  }, [user]);

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

  const loadReviews = async () => {
    try {
      const data = await getUserReviews();
      setReviews(data);
    } catch (error) {
      console.error('Error loading reviews:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Validate password change if provided
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage('New passwords do not match');
        setLoading(false);
        return;
      }
      if (!formData.currentPassword) {
        setMessage('Current password is required to change password');
        setLoading(false);
        return;
      }
    }

    const updateData = {
      name: formData.name,
      email: formData.email,
      avatar,
    };

    if (formData.newPassword) {
      updateData.currentPassword = formData.currentPassword;
      updateData.newPassword = formData.newPassword;
    }

    try {
      // If user deleted avatar, call delete endpoint
      if (avatarToDelete) {
        const deleteResult = await deleteAvatar();
        if (deleteResult.user?.avatar !== undefined) {
          setAvatar(deleteResult.user.avatar || '');
        }
        setAvatarToDelete(false);
      } else {
        const result = await updateUser(updateData);
        
        if (result.success) {
          if (result.user?.avatar !== undefined) {
            setAvatar(result.user.avatar || '');
          }
        } else {
          setMessage(result.error || 'Failed to update profile');
          setLoading(false);
          return;
        }
      }
      
      setMessage('Profile updated successfully!');
      setEditing(false);
      setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage(error.response?.data?.message || 'Failed to update profile');
    }
    
    setLoading(false);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteAvatar = () => {
    if (window.confirm('Are you sure you want to delete your profile picture?')) {
      setAvatar('');
      setAvatarToDelete(true);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    
    try {
      await deleteReview(reviewId);
      setReviews(reviews.filter(r => r._id !== reviewId));
      setMessage('Review deleted successfully');
    } catch (error) {
      setMessage('Failed to delete review');
    }
  };

  const handleEditReview = (review) => {
    setEditingReview({ ...review });
  };

  const handleSaveReview = async () => {
    try {
      await updateReview(editingReview._id, {
        review: editingReview.review,
        rating: editingReview.rating,
      });
      setReviews(reviews.map(r => r._id === editingReview._id ? editingReview : r));
      setEditingReview(null);
      setMessage('Review updated successfully');
    } catch (error) {
      setMessage('Failed to update review');
    }
  };

  const getSortedReviews = () => {
    const sorted = [...reviews];
    switch(reviewSort) {
      case 'newest':
        return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      case 'oldest':
        return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      case 'highest':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'lowest':
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted;
    }
  };

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar" aria-label="Profile avatar">
              {avatar && (avatar.startsWith('data:') || avatar.startsWith('http')) ? (
                <img src={avatar} alt={user?.name || user?.email || 'User'} />
              ) : (
                <span className="profile-avatar-letter">
                  {avatar || getAvatarLetter(user?.name || user?.email)}
                </span>
              )}
            </div>
            {editing && (
              <>
                <button
                  className="avatar-upload-btn"
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                  aria-label="Upload avatar"
                >
                  <Camera size={20} strokeWidth={2.4} />
                </button>
                {avatar && (
                  <button
                    className="avatar-delete-btn"
                    onClick={handleDeleteAvatar}
                    type="button"
                    aria-label="Delete avatar"
                    title="Delete profile picture"
                  >
                    <X size={20} strokeWidth={2.4} />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  style={{ display: 'none' }}
                />
              </>
            )}
          </div>
          <h1>{user?.name}</h1>
          <p>{user?.email}</p>
          <div className="profile-meta">
            <span className="joined">Joined {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}</span>
          </div>
        </div>

        <div className="profile-section">
          <div className="section-header">
            <h2>Account</h2>
            <button
              className="edit-btn"
              onClick={() => setEditing(!editing)}
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
            <button
              className="edit-btn"
              onClick={scrollToReviews}
              type="button"
            >
              Jump to Reviews
            </button>
          </div>

          {message && (
            <div className={`message ${message.includes('success') || message.includes('cleared') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          {editing ? (
            <form onSubmit={handleSubmit} className="profile-form form-grid">
              <div className="card">
                <h3 className="card-title">Personal Info</h3>
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <p className="muted">Your avatar appears in the navbar.</p>
              </div>

              <div className="card">
                <h3 className="card-title">Security</h3>
                <div className="password-section">
                  <div className="form-group">
                    <label>Current Password</label>
                    <input
                      type="password"
                      value={formData.currentPassword}
                      onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                      placeholder="Enter current password"
                    />
                  </div>
                  <div className="form-group">
                    <label>New Password</label>
                    <input
                      type="password"
                      value={formData.newPassword}
                      onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                      placeholder="Enter new password"
                    />
                  </div>
                  <div className="form-group">
                    <label>Confirm New Password</label>
                    <input
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="profile-grid">
              <div className="card">
                <h3 className="card-title">Personal Info</h3>
                <div className="profile-info">
                  <div className="info-item">
                    <strong>Name</strong>
                    <span>{user?.name}</span>
                  </div>
                  <div className="info-item">
                    <strong>Email</strong>
                    <span>{user?.email}</span>
                  </div>
                </div>
              </div>
              <div className="card">
                <h3 className="card-title">Security</h3>
                <p className="muted">Use Edit to change your password.</p>
              </div>
            </div>
          )}
        </div>

        <div className="profile-section" ref={reviewsRef} id="reviews-section">
          <div className="section-header">
            <h2>My Reviews ({reviews.length})</h2>
            <select
              className="review-sort-select"
              value={reviewSort}
              onChange={(e) => setReviewSort(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Rated</option>
              <option value="lowest">Lowest Rated</option>
            </select>
            <button className="edit-btn" type="button" onClick={scrollToTop}>Back to Top</button>
          </div>
          <div className="reviews-list">
            {getSortedReviews().map((review) => (
              <div key={review._id} className="review-item">
                {editingReview && editingReview._id === review._id ? (
                  <div className="review-edit-form">
                    <div className="review-header">
                      <strong>{review.movieTitle}</strong>
                      <div className="review-rating-edit">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            size={20}
                            strokeWidth={2.4}
                            className={star <= editingReview.rating ? 'filled' : ''}
                            onClick={() => setEditingReview({ ...editingReview, rating: star })}
                          />
                        ))}
                      </div>
                    </div>
                    <textarea
                      value={editingReview.review}
                      onChange={(e) => setEditingReview({ ...editingReview, review: e.target.value })}
                      className="review-textarea"
                      rows="4"
                    />
                    <div className="review-actions">
                      <button onClick={handleSaveReview} className="save-review-btn">Save</button>
                      <button onClick={() => setEditingReview(null)} className="cancel-review-btn">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className="review-content"
                      onClick={() => navigate(`/movie/${review.movieId}`)}
                    >
                      <div className="review-header">
                        <strong>{review.movieTitle}</strong>
                        <div className="review-rating">
                          {Array.from({ length: review.rating }).map((_, idx) => (
                            <Star key={idx} size={16} strokeWidth={2.4} aria-hidden="true" />
                          ))}
                        </div>
                      </div>
                      <p>{review.review}</p>
                      <small>{new Date(review.createdAt).toLocaleDateString()}</small>
                    </div>
                    <div className="review-item-actions">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditReview(review);
                        }}
                        className="icon-btn edit-btn"
                        aria-label="Edit review"
                      >
                        <Edit2 size={16} strokeWidth={2.4} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteReview(review._id);
                        }}
                        className="icon-btn delete-btn"
                        aria-label="Delete review"
                      >
                        <Trash2 size={16} strokeWidth={2.4} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {reviews.length === 0 && (
              <p className="no-reviews">You haven't written any reviews yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
