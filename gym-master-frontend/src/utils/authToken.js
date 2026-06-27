// Desc: Auth token utility functions
// This file contains utility functions for working with authentication tokens.

// Set token in localStorage and axios headers
export const setAuthToken = (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  };
  
  // Get token from localStorage
  export const getAuthToken = () => {
    return localStorage.getItem('token');
  };
  
  // Remove token from localStorage
  export const removeAuthToken = () => {
    localStorage.removeItem('token');
  };

// localStorage is a built-in object that provides a way to store data in the user's browser.
// Data stored in localStorage persists even after the browser window is closed.
// In this case, the setAuthToken function is used to store the authentication token in localStorage,