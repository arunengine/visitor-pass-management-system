/**
 * Authentication Context Provider
 * Purpose: Manages global user authentication state (user info, loading status)
 * and provides login/logout API methods connected to Express backend.
 * Persists login state across page refreshes by validating session on mount via /api/v1/auth/me.
 */

import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // True initially while checking session

  // Fetch current user session on application load (Persists login on refresh)
  useEffect(() => {
    let isMounted = true;

    // Safety fallback: Ensure isLoading is set to false within 4 seconds max
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setIsLoading(false);
      }
    }, 4000);

    const checkAuthStatus = async () => {
      try {
        const response = await api.get('/v1/auth/me');
        if (isMounted && response.data?.success) {
          setUser(response.data.data.user);
        }
      } catch (error) {
        // Token missing, expired, or network unavailable - user is unauthenticated
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
        clearTimeout(safetyTimer);
      }
    };

    checkAuthStatus();

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
    };
  }, []);

  // Login Method: Sends credentials to POST /api/v1/auth/login
  const login = async (email, password) => {
    try {
      const response = await api.post('/v1/auth/login', { email, password });
      if (response.data?.success) {
        const authenticatedUser = response.data.data.user;
        setUser(authenticatedUser);
        return { success: true, user: authenticatedUser };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || 'Login failed. Please check your credentials.';
      return { success: false, error: errorMessage };
    }
  };

  // Logout Method: Sends request to POST /api/v1/auth/logout and clears user state
  const logout = async () => {
    try {
      await api.post('/v1/auth/logout');
    } catch (error) {
      console.error('[Logout Error]:', error.message);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
