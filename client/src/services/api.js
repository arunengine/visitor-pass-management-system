/**
 * Axios Base Instance
 * Purpose: Pre-configures Axios with base URL, headers, and credential handling.
 * Serves as the central HTTP client for all API calls to the Express backend.
 */

import axios from 'axios';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;
  if (envUrl && !envUrl.includes('onrender.com')) {
    return envUrl;
  }
  return '/api';
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Sends HTTP-only cookies with API requests automatically
});

// Response interceptor for centralized error handling placeholder
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log response errors cleanly for debugging
    console.error('[API Error]:', error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export default api;
