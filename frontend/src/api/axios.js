import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add dynamic auth key and username
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    const userType = localStorage.getItem('user_type');
    let userData = localStorage.getItem('user_data');
    let username = null;

    if (userData) {
      try {
        userData = JSON.parse(userData);
        username = userData.username;
      } catch {
        username = null;
      }
    }

    if (token) {
      config.headers.Authorization = token; // No 'Bearer ' prefix!
      if (userType === 'admin' && username) {
        config.headers['X-Admin-Username'] = username;
      } else if (userType === 'user' && username) {
        config.headers['X-User-Username'] = username;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      localStorage.removeItem('user_type');
      
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
