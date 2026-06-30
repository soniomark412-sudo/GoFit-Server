// This file is responsible for the authentication context.
// It provides the context to the children components and contains the logic
// for registering, logging in, logging out, and updating the user profile.

import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { setAuthToken, getAuthToken, removeAuthToken } from '../utils/authToken';

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in (on app load)
  useEffect(() => {
    const loadUser = async () => {
      const token = getAuthToken();

      if (!token) {
        setLoading(false);
        return;
      }

      setAuthToken(token);

      try {
        const res = await api.get('/users/profile');

        if (res.data.success !== false) {
          setUser(res.data.data || res.data);
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Error loading user:', err);
        removeAuthToken();
      }

      setLoading(false);
    };

    loadUser();
  }, []);

  // Register user
  const register = async (formData) => {
    try {
      setError(null);
      console.log('Starting registration process for:', formData);

      const res = await api.post('/auth/register', formData);
      console.log('Registration response received:', res.data);

      if (res.data.success === false) {
        console.log('Server indicated registration failed:', res.data.message);
        setError(res.data.message);
        return false;
      }

      // Check for token in different possible response formats
      if (res.data.data && res.data.data.token) {
        console.log('Token found in res.data.data');
        setAuthToken(res.data.data.token);
        setUser(res.data.data);
        setIsAuthenticated(true);
        return true;
      } else if (res.data.token) {
        console.log('Token found directly in res.data');
        setAuthToken(res.data.token);
        setUser(res.data);
        setIsAuthenticated(true);
        return true;
      }

      console.log('No token found in response - this is a problem');
      return false;
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  // Login user - FIXED
  const login = async (formData) => {
    try {
      setError(null);
      console.log('Login form data:', formData);

      const res = await api.post('/auth/login', formData);
      console.log('Login response:', res.data);

      // Check for error
      if (res.data.success === false) {
        setError(res.data.message);
        return false;
      }

      // IMPORTANT: Your backend returns "access_token" (not "token")
      const token = res.data.access_token;
      const userData = res.data.user;

      if (token) {
        console.log('Token found:', token.substring(0, 20) + '...');
        setAuthToken(token);
        setUser(userData);
        setIsAuthenticated(true);
        return true;
      }

      console.log('No token found in response');
      return false;
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Login failed');
      return false;
    }
  };

  // Logout user
  const logout = () => {
    removeAuthToken();
    setUser(null);
    setIsAuthenticated(false);
  };

  // Update user profile
  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const res = await api.put('/users/profile', profileData);

      if (res.data.success === false) {
        setError(res.data.message);
        return false;
      }

      setUser(prev => ({
        ...prev,
        ...res.data.data || res.data
      }));

      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        error,
        register,
        login,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};