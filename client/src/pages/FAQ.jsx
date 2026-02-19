import { Link } from 'react-router-dom';
import '../styles/InfoPage.css';

const FAQ = () => (
  <div className="info-page">
    <div className="info-container">
      <h1>Frequently Asked Questions</h1>

      <section className="info-section">
        <h2>Do I need an account to browse movies?</h2>
        <p>
          You can browse and search movies without an account. However, features like
          watchlist, reviews, likes, and personalized recommendations require you to
          sign in.
        </p>
      </section>

      <section className="info-section">
        <h2>How are recommendations generated?</h2>
        <p>
          Recommendations are based on movies you've liked and added to your watchlist.
          The more you interact, the better the suggestions become.
        </p>
      </section>

      <section className="info-section">
        <h2>Can I edit or delete my reviews?</h2>
        <p>
          Yes. Navigate to the movie page or your profile to edit or remove any review
          you've written.
        </p>
      </section>

      <section className="info-section">
        <h2>Where does the movie data come from?</h2>
        <p>
          All movie information is sourced from{' '}
          <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">The Movie Database (TMDB)</a>,
          a community-maintained movie and TV database.
        </p>
      </section>

      <section className="info-section">
        <h2>Is MannPasandMovies free?</h2>
        <p>
          Yes, completely free. No subscriptions, no hidden fees.
        </p>
      </section>

      <section className="info-section">
        <h2>How do I delete my account?</h2>
        <p>
          Go to your <Link to="/profile">Profile</Link> page and use the account
          settings to delete your account and all associated data.
        </p>
      </section>

      <Link to="/" className="info-back-link">← Back to Home</Link>
    </div>
  </div>
);

export default FAQ;
