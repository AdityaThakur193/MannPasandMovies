import { Loader } from 'lucide-react';
import PropTypes from 'prop-types';
import '../styles/LoadingSpinner.css';

const LoadingSpinner = ({ message = 'Loading...', fullScreen = false }) => {
  return (
    <div className={`loading-spinner ${fullScreen ? 'fullscreen' : ''}`}>
      <Loader className="spinner-icon" size={48} strokeWidth={2.5} aria-hidden="true" />
      <p className="loading-message">{message}</p>
    </div>
  );
};

LoadingSpinner.propTypes = {
  message: PropTypes.string,
  fullScreen: PropTypes.bool,
};

export default LoadingSpinner;
