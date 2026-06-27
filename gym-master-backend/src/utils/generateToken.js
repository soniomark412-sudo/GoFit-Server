// Export a function that generates a JWT token

const jwt = require('jsonwebtoken');

// Generate token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'your_jwt_secret_key', { // Use the secret key from the environment or a default string of ur choice
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

module.exports = generateToken;