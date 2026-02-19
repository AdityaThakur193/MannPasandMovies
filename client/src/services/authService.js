import api from './api';

// Register user
export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

// Login user
export const login = async (credentials) => {
  const response = await api.post('/auth/login', credentials);
  if (response.data.token) {
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user', JSON.stringify(response.data.user));
  }
  return response.data;
};

// Get current user
export const getCurrentUser = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// Logout
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Get user profile
export const getProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

// Update user profile
export const updateProfile = async (userData) => {
  const response = await api.put('/users/profile', userData);
  const userPayload = response.data.user || response.data;
  localStorage.setItem('user', JSON.stringify(userPayload));
  return response.data;
};

// Delete user avatar
export const deleteAvatar = async () => {
  const response = await api.delete('/users/avatar');
  const userPayload = response.data.user || response.data;
  localStorage.setItem('user', JSON.stringify(userPayload));
  return response.data;
};

// Get user stats
export const getUserStats = async () => {
  const response = await api.get('/users/stats');
  return response.data;
};
