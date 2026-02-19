import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext();

// Export AuthContext for testing
export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      let parsedUser = null;
      if (savedUser) {
        try {
          parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error('Error parsing saved user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }

      // Refresh user data (to ensure createdAt and latest fields)
      if (token) {
        try {
          const me = await authService.getCurrentUser();
          const payload = me.user || me;
          const merged = { ...(parsedUser || {}), ...payload };
          setUser(merged);
          localStorage.setItem('user', JSON.stringify(merged));
        } catch (error) {
          console.error('Error fetching current user:', error);
        }
      }

      // Check for Google OAuth token in URL
      const urlParams = new URLSearchParams(window.location.search);
      const urlToken = urlParams.get('token');
      
      if (urlToken) {
        try {
          // Save token
          localStorage.setItem('token', urlToken);
          
          // Fetch user data
          const me = await authService.getCurrentUser();
          const payload = me.user || me;
          setUser(payload);
          localStorage.setItem('user', JSON.stringify(payload));
          
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (error) {
          console.error('Error processing Google OAuth:', error);
        }
      }

      // Check for auth failure
      const authFailed = urlParams.get('auth');
      if (authFailed === 'failed') {
        console.error('Google authentication failed');
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      setLoading(false);
    };

    init();
  }, []);

  const register = async (userData) => {
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const login = async (credentials) => {
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const googleLogin = () => {
    // Redirect to backend Google OAuth route
    // Remove /api from the URL since the OAuth route is at /api/auth/google
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const BASE_URL = API_URL.replace('/api', '');
    const returnTo = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const params = new URLSearchParams({ returnTo });
    window.location.href = `${BASE_URL}/api/auth/google?${params.toString()}`;
  };

  const updateUser = async (userData) => {
    try {
      const updated = await authService.updateProfile(userData);
      const payload = updated.user || updated;
      const userPayload = { ...(user || {}), ...payload };
      setUser(userPayload);
      localStorage.setItem('user', JSON.stringify(userPayload));
      return { success: true, user: userPayload };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Update failed' 
      };
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    googleLogin,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
