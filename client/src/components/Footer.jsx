import { Mail, Github, Linkedin, Twitter, Instagram } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../styles/Footer.css';

const Footer = ({ socialLinks = {} }) => {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  // Handles link clicks — navigates and always scrolls to top
  const handleLinkClick = (e, path) => {
    e.preventDefault();
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Default social links - can be overridden
  const defaultSocialLinks = {
    github: 'https://github.com/AdityaThakur193',
    linkedin: 'https://www.linkedin.com/in/aditya-thakur193',
    email: 'adityath2305@gmail.com'
  };

  const links = { ...defaultSocialLinks, ...socialLinks };

  const socialIcons = [
    {
      name: 'GitHub',
      url: links.github,
      icon: Github,
      ariaLabel: 'Visit our GitHub'
    },
    {
      name: 'LinkedIn',
      url: links.linkedin,
      icon: Linkedin,
      ariaLabel: 'Visit our LinkedIn'
    },
    {
      name: 'Email',
      url: `mailto:${links.email}`,
      icon: Mail,
      ariaLabel: 'Send us an email'
    }
  ];

  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Column 1: About */}
        <div className="footer-column">
          <div className="footer-logo">
            <img src="/logo.png" alt="MannPasandMovies Logo" className="footer-logo-image" />
            <span className="footer-logo-text">MannPasandMovies</span>
          </div>
          <p className="footer-tagline">Discover Your Next Favorite Movie</p>
          <p className="footer-description">
            Your ultimate cinematic companion for discovering, reviewing, and sharing movies. Find your next favorite film with personalized recommendations.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div className="footer-column">
          <h3 className="footer-column-title">Quick Links</h3>
          <ul className="footer-links">
            <li><Link to="/" onClick={(e) => handleLinkClick(e, '/')}>Home</Link></li>
            <li><Link to="/" onClick={(e) => handleLinkClick(e, '/')}>Popular Movies</Link></li>
            <li><Link to="/watchlist" onClick={(e) => handleLinkClick(e, '/watchlist')}>Watchlist</Link></li>
            <li><Link to="/recommendations" onClick={(e) => handleLinkClick(e, '/recommendations')}>For You</Link></li>
            <li><Link to="/about" onClick={(e) => handleLinkClick(e, '/about')}>About</Link></li>
          </ul>
        </div>

        {/* Column 3: Legal & Support */}
        <div className="footer-column">
          <h3 className="footer-column-title">Legal & Support</h3>
          <ul className="footer-links">
            <li><Link to="/contact" onClick={(e) => handleLinkClick(e, '/contact')}>Contact Us</Link></li>
            <li><Link to="/privacy" onClick={(e) => handleLinkClick(e, '/privacy')}>Privacy Policy</Link></li>
            <li><Link to="/terms" onClick={(e) => handleLinkClick(e, '/terms')}>Terms of Service</Link></li>
            <li><Link to="/faq" onClick={(e) => handleLinkClick(e, '/faq')}>FAQ</Link></li>
          </ul>
        </div>

        {/* Column 4: Connect */}
        <div className="footer-column">
          <h3 className="footer-column-title">Connect</h3>
          <p className="footer-social-text">Follow us on social media</p>
          <div className="footer-social-icons">
            {socialIcons.map((social) => {
              const IconComponent = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-icon"
                  aria-label={social.ariaLabel}
                  title={social.name}
                >
                  <IconComponent size={24} />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="footer-divider"></div>

      {/* Footer Bottom Bar */}
      <div className="footer-bottom">
        <div className="footer-bottom-left">
          <p className="footer-copyright">
            © {currentYear} MannPasandMovies. All rights reserved.
          </p>
          <p className="footer-made-with">
            Made with <span className="heart">❤️</span> in India
          </p>
        </div>
        <div className="footer-bottom-right">
          <p className="footer-powered">
            Powered by <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer">TMDB API</a>
          </p>
        </div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  socialLinks: PropTypes.shape({
    github: PropTypes.string,
    linkedin: PropTypes.string,
    twitter: PropTypes.string,
    instagram: PropTypes.string,
    email: PropTypes.string
  })
};

export default Footer;
