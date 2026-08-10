import PropTypes from 'prop-types';
import { Star } from 'lucide-react';

const ReviewForm = ({ reviewForm, setReviewForm, onSubmit, onCancel, isEditing }) => {
  return (
    <form className="review-form" onSubmit={onSubmit}>
      <div className="form-group">
        <label>Rating</label>
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={20}
              strokeWidth={2.4}
              className={`star ${reviewForm.rating >= star ? 'active' : ''}`}
              onClick={() => setReviewForm({ ...reviewForm, rating: star })}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            />
          ))}
        </div>
      </div>
      <div className="form-group">
        <label>Your Review</label>
        <textarea
          value={reviewForm.review}
          onChange={(e) => setReviewForm({ ...reviewForm, review: e.target.value })}
          required
          rows="4"
          placeholder="Share your thoughts about this movie..."
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="submit-btn">
          {isEditing ? 'Update Review' : 'Submit Review'}
        </button>
        <button type="button" className="cancel-btn" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
};

ReviewForm.propTypes = {
  reviewForm: PropTypes.shape({
    rating: PropTypes.number.isRequired,
    review: PropTypes.string.isRequired,
  }).isRequired,
  setReviewForm: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  isEditing: PropTypes.bool.isRequired,
};

export default ReviewForm;
