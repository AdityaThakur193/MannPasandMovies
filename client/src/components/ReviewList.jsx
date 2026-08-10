import PropTypes from 'prop-types';
import { Star } from 'lucide-react';

const ReviewList = ({ reviews, isAuthenticated, currentUserId, onEdit, onDelete }) => {
  return (
    <div className="reviews-list">
      {reviews.map((review) => (
        <div key={review._id} className="review-card">
          <div className="review-header">
            <div className="review-author">
              <strong>{review.user?.name}</strong>
              <div className="review-rating">
                {Array.from({ length: review.rating }).map((_, idx) => (
                  <Star key={idx} size={16} strokeWidth={2.4} aria-hidden="true" />
                ))}
              </div>
            </div>
            <small>{new Date(review.createdAt).toLocaleDateString()}</small>
          </div>
          <p className="review-text">{review.review}</p>
          {isAuthenticated && review.user?._id === currentUserId && (
            <div className="review-actions">
              <button onClick={() => onEdit(review)}>
                Edit
              </button>
              <button onClick={() => onDelete(review._id)}>
                Delete
              </button>
            </div>
          )}
        </div>
      ))}
      {reviews.length === 0 && (
        <p className="no-reviews">No reviews yet. Be the first to review!</p>
      )}
    </div>
  );
};

ReviewList.propTypes = {
  reviews: PropTypes.array.isRequired,
  isAuthenticated: PropTypes.bool.isRequired,
  currentUserId: PropTypes.string,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default ReviewList;
