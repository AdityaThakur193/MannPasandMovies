import { Link } from 'react-router-dom';
import '../styles/InfoPage.css';

const Terms = () => (
  <div className="info-page">
    <div className="info-container">
      <h1>Terms of Service</h1>
      <p className="info-date">Last updated: February 2026</p>

      <section className="info-section">
        <h2>Acceptance of Terms</h2>
        <p>
          By using MannPasandMovies, you agree to these terms. If you do not agree,
          please do not use the service.
        </p>
      </section>

      <section className="info-section">
        <h2>User Accounts</h2>
        <ul>
          <li>You must provide accurate information when creating an account.</li>
          <li>You are responsible for maintaining the security of your account.</li>
          <li>One account per person — duplicate accounts may be removed.</li>
        </ul>
      </section>

      <section className="info-section">
        <h2>User Content</h2>
        <p>
          Reviews and ratings you submit are your own. By posting a review, you grant
          MannPasandMovies a non-exclusive license to display it on the platform. We
          reserve the right to remove reviews that are abusive, spam, or violate
          community guidelines.
        </p>
      </section>

      <section className="info-section">
        <h2>Movie Data</h2>
        <p>
          All movie information — titles, posters, synopses, cast details — is sourced
          from <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDB</a> and
          belongs to their respective owners. MannPasandMovies does not claim ownership
          of any movie data.
        </p>
      </section>

      <section className="info-section">
        <h2>Limitation of Liability</h2>
        <p>
          MannPasandMovies is provided "as is" without warranties. We are not liable
          for any damages arising from the use of this service.
        </p>
      </section>

      <Link to="/" className="info-back-link">← Back to Home</Link>
    </div>
  </div>
);

export default Terms;
