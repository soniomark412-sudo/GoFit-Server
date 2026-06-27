// src/routes/rewards.routes.js

const express = require('express');
const router = express.Router();

// Placeholder implementation

// Get all rewards
router.get('/', (req, res) => {
  // Return a few sample rewards
  res.json({
    success: true,
    message: 'Rewards retrieved',
    data: [
      {
        _id: 'reward1',
        name: 'Fitness Beginner',
        description: 'Complete your first workout',
        type: 'badge',
        requirements: {
          exerciseType: 'any',
          totalCount: 1
        },
        pointsValue: 10
      },
      {
        _id: 'reward2',
        name: 'Push-up Pro',
        description: 'Complete 100 push-ups total',
        type: 'achievement',
        requirements: {
          exerciseType: 'pushup',
          totalCount: 100
        },
        pointsValue: 50
      },
      {
        _id: 'reward3',
        name: 'Consistency King',
        description: 'Work out 7 days in a row',
        type: 'milestone',
        requirements: {
          streak: 7
        },
        pointsValue: 75
      }
    ]
  });
});

// Get user rewards
router.get('/user', (req, res) => {
  // Return an empty array for now
  res.json({
    success: true,
    message: 'User rewards retrieved',
    data: []
  });
});

// Check for new rewards
router.post('/check', (req, res) => {
  console.log('Checking for rewards...');
  
  // Return no new rewards for now
  res.json({
    success: true,
    message: 'Checked for new rewards',
    data: []
  });
});

module.exports = router;