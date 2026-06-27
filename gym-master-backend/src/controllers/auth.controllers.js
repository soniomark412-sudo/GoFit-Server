// src/controllers/auth.controller.js
const User = require('../models/user.models');
const generateToken = require('../utils/generateToken');

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    console.log('Register endpoint hit');
    console.log('Request body:', req.body);
    
    const { username, email, password } = req.body;
    
    // Validate input
    if (!username || !email || !password) {
      console.log('Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide username, email and password'
      });
    }

    console.log('Checking if user exists with email:', email);
    
    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      console.log('User already exists');
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    console.log('Creating new user with username:', username);
    
    // Create user
    const user = await User.create({
      username,
      email,
      password
    });

    if (user) {
      console.log('User created successfully:', user._id);
      const token = generateToken(user._id);
      console.log('Generated token');
      
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          email: user.email,
          token: token
        }
      });
    } else {
      console.log('Failed to create user');
      res.status(400).json({
        success: false,
        message: 'Invalid user data'
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    console.log('Login endpoint hit');
    console.log('Request body:', req.body);
    
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    console.log('Finding user with email:', email);
    
    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('User not found');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('User found, checking password');
    
    // Check password
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      console.log('Password does not match');
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    console.log('Password matches, generating token');
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      data: {
        _id: user._id,
        username: user.username,
        email: user.email,
        token: token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = { register, login };