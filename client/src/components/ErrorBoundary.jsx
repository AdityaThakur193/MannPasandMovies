import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log to monitoring here (Sentry, etc.)
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>Something went wrong.</h2>
          <p>Try refreshing the page or going back home.</p>
          <a href="/" style={{ color: '#ff9800' }}>Go to Home</a>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
