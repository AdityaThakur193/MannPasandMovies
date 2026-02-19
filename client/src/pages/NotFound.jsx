import { useEffect } from 'react';

const NotFound = () => {
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

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }} role="alert" aria-live="polite">
      <h1>404 - Page Not Found</h1>
      <p>The page you’re looking for doesn’t exist.</p>
      <a href="/" style={{ color: '#ff9800' }}>Back to Home</a>
    </div>
  );
};

export default NotFound;
