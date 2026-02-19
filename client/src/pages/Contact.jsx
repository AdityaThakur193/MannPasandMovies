import { Link } from 'react-router-dom';
import { Mail, Github } from 'lucide-react';
import '../styles/InfoPage.css';

const Contact = () => (
  <div className="info-page">
    <div className="info-container">
      <h1>Contact Us</h1>

      <section className="info-section">
        <p>
          Have a question, found a bug, or just want to say hello? Reach out through
          any of the channels below.
        </p>
      </section>

      <section className="info-section">
        <h2>Get in Touch</h2>
        <div className="contact-methods">
          <a href="mailto:contact@mannpasandmovies.com" className="contact-card">
            <Mail size={24} />
            <div>
              <strong>Email</strong>
              <span>contact@mannpasandmovies.com</span>
            </div>
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="contact-card">
            <Github size={24} />
            <div>
              <strong>GitHub</strong>
              <span>Report issues or contribute</span>
            </div>
          </a>
        </div>
      </section>

      <Link to="/" className="info-back-link">← Back to Home</Link>
    </div>
  </div>
);

export default Contact;
