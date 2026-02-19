import { Link } from 'react-router-dom';
import '../styles/InfoPage.css';

const About = () => (
  <div className="info-page">
    <div className="info-container">
      <h1>About MannPasandMovies</h1>

      <section className="info-section">
        <h2>What We Do</h2>
        <p>
          MannPasandMovies is a movie discovery platform built for film lovers who want
          a personal, curated experience. Search for movies, build a watchlist, write
          reviews, and get recommendations tailored to your taste — all in one place.
        </p>
      </section>

      <section className="info-section">
        <h2>How It Works</h2>
        <ul>
          <li><strong>Discover</strong> — Browse trending, top-rated, and upcoming movies powered by the TMDB database.</li>
          <li><strong>Save</strong> — Add movies to your personal watchlist so you never forget what to watch next.</li>
          <li><strong>Review</strong> — Rate and review movies you've watched to help the community.</li>
          <li><strong>Get Recommendations</strong> — Receive personalized suggestions based on movies you've liked.</li>
        </ul>
      </section>

      <section className="info-section">
        <h2>Built With</h2>
        <p>
          This project is a full-stack MERN application — MongoDB, Express, React, and
          Node.js — using the TMDB API for movie data. Designed and coded with care.
        </p>
      </section>

      <Link to="/" className="info-back-link">← Back to Home</Link>
    </div>
  </div>
);

export default About;
