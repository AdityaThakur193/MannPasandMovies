import { createContext, useContext, useState, useEffect } from 'react';

const UIContext = createContext();

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    return {
      darkMode: true,
      toggleTheme: () => {},
      showAuthModal: false,
      openAuthModal: () => {},
      closeAuthModal: () => {},
      authMode: 'login',
      setAuthMode: () => {},
      showStats: false,
      setShowStats: () => {},
      showScrollTop: false,
      scrollToTop: () => {},
    };
  }
  return context;
};

export const UIProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showStats, setShowStats] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Monitor scroll height for scroll-to-top button visibility
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > window.innerHeight / 2) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle body element class management for dark/light themes
  useEffect(() => {
    if (darkMode) {
      document.body.classList.remove('light-mode');
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      document.body.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => {
    setDarkMode((prev) => !prev);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAuthModal = (mode = 'login') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  const value = {
    darkMode,
    toggleTheme,
    showAuthModal,
    openAuthModal,
    closeAuthModal,
    authMode,
    setAuthMode,
    showStats,
    setShowStats,
    showScrollTop,
    scrollToTop,
  };

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
};
