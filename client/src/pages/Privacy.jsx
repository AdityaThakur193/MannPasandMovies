import { Link } from 'react-router-dom';
import '../styles/InfoPage.css';

const Privacy = () => (
  <div className="info-page">
    <div className="info-container">
      <h1>Privacy Policy</h1>
      <p className="info-date">Last updated: February 2026</p>

      <section className="info-section">
        <h2>Information We Collect</h2>
        <p>
          When you create an account, we collect your name, email address, and an
          optional profile picture. We also store your watchlist, reviews, and movie
          preferences to provide personalized recommendations.
        </p>
      </section>

      <section className="info-section">
        <h2>How We Use Your Data</h2>
        <ul>
          <li>To authenticate and manage your account.</li>
          <li>To save your watchlist, likes, and reviews.</li>
          <li>To generate movie recommendations based on your activity.</li>
          <li>We do not sell or share your personal data with third parties.</li>
        </ul>
      </section>

      <section className="info-section">
        <h2>Third-Party Services</h2>
        <p>
          Movie data is provided by <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">The Movie Database (TMDB)</a>.
          If you sign in with Google, authentication is handled through Google OAuth.
          We do not have access to your Google password.
        </p>
      </section>

      <section className="info-section">
        <h2>Cookies</h2>
        <p>
          We use a session token stored in your browser to keep you logged in. We do
          not use tracking cookies or analytics cookies.
        </p>
      </section>

      <section className="info-section">
        <h2>Your Rights</h2>
        <p>
          You can delete your account and all associated data at any time from your
          profile settings. If you have questions, contact us at{' '}
          <a href="mailto:contact@mannpasandmovies.com">contact@mannpasandmovies.com</a>.
        </p>
      </section>

      <Link to="/" className="info-back-link">← Back to Home</Link>
    </div>
  </div>
);

export default Privacy;
