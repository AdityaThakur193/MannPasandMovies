import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { MovieProvider } from './context/MovieContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import AuthModal from './components/AuthModal';
import StatsModal from './components/StatsModal';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import Watchlist from './pages/Watchlist';
import Recommendations from './pages/Recommendations';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import About from './pages/About';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import FAQ from './pages/FAQ';
import ScrollToTop from './components/ScrollToTop';

import { UIProvider, useUI } from './context/UIContext';

function AppContent() {
  const {
    showAuthModal,
    closeAuthModal,
    authMode,
    setAuthMode,
    showStats,
    setShowStats,
    showScrollTop,
    scrollToTop,
    openAuthModal,
  } = useUI();

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ScrollToTop />
      <div className="app">
        <Navbar 
          onShowAuthModal={openAuthModal}
          onShowStats={() => setShowStats(true)}
        />
        
        <main className="main-content">
          <ErrorBoundary>
          <Routes>
            <Route 
              path="/" 
              element={<Home onShowAuthModal={openAuthModal} />} 
            />
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route 
              path="/watchlist" 
              element={
                <ProtectedRoute>
                  <Watchlist />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/recommendations" 
              element={
                <ProtectedRoute>
                  <Recommendations />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          </ErrorBoundary>
        </main>

        {/* Scroll to Top Button */}
        <button 
          id="scroll-top-btn" 
          className={`scroll-top-btn ${showScrollTop ? 'visible' : ''}`}
          onClick={scrollToTop}
          aria-label="Scroll to top"
          title="Scroll to top"
        >
          ⬆ 
        </button>

        {showAuthModal && (
          <AuthModal
            mode={authMode}
            onClose={closeAuthModal}
            onSwitchMode={setAuthMode}
          />
        )}

        {showStats && (
          <StatsModal onClose={() => setShowStats(false)} />
        )}

        <Footer />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <MovieProvider>
        <UIProvider>
          <AppContent />
        </UIProvider>
      </MovieProvider>
    </AuthProvider>
  );
}

export default App;
