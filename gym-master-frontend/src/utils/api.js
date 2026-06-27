// Desc: API client with request/response interceptors for debugging
// This file contains an Axios instance that is used to make API requests. 
// It includes request and response interceptors that log information 
// about the request and response to the console for debugging purposes.

import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5001/api',
  headers: {
    'Content-Type': 'application/json' 
  }
});

// Add request interceptor with debugging
api.interceptors.request.use(
  (config) => { 
    console.log('Making request to:', config.url);
    console.log('Request method:', config.method); 
    console.log('Request data:', config.data);
    console.log('Request headers:', config.headers);
    
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor is used to log response information!!
// Add response interceptor with debugging
api.interceptors.response.use(
  (response) => {
    console.log('Response from:', response.config.url);
    console.log('Response status:', response.status);
    console.log('Response data:', response.data);
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    console.error('Error response:', error.response?.data);
    
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;