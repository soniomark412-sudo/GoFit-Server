// Desc: Exercise controller for the gym master app
// This file contains the logic for handling exercise-related requests
// and responses, including recording exercises, fetching history, and user progress

const Exercise = require('../models/exercise.models');
const User = require('../models/user.models');

// Calculate XP and level based on total XP
const calculateLevel = (totalXp) => {
  // Example level progression: each level requires 100*level XP
  let level = 1;
  let xpForNextLevel = 100;
  let remainingXp = totalXp;
  
  while (remainingXp >= xpForNextLevel) {
    remainingXp -= xpForNextLevel;
    level++;
    xpForNextLevel = 100 * level; // Increase XP needed for each level
  }
  
  const progress = remainingXp / xpForNextLevel;
  
  return {
    level,
    currentXp: remainingXp,
    nextLevelXp: xpForNextLevel,
    progress,
    totalXp
  };
};

// Record a new exercise session
exports.recordExercise = async (req, res) => {
  try {
    const { exerciseType, reps, formScore } = req.body;
    const userId = req.user._id; // From auth middleware
    
    // Validate input
    if (!exerciseType || !reps) {
      return res.status(400).json({
        success: false,
        message: 'Please provide exercise type and reps'
      });
    }
    
    // Calculate XP earned
    const baseXpPerRep = 20;

    // FUTURE IMPLEMENTATION: formScore will be used to adjust XP based on form
    // const formMultiplier = (0.5 + (formScore || 0.7) / 2);  FUTURE IMPLEMENTATION -> (Ex: ok (.5), good(1), great(1.5), etc...)

    const xpEarned = Math.round(reps * baseXpPerRep * formMultiplier);
    
    // Create exercise record
    const exercise = await Exercise.create({
      user: userId,
      exerciseType,
      reps,
    //   formScore: formScore || 0.7, FUTURE IMPLEMENTATION
      xpEarned
    });
    
    // Update user's total XP
    const user = await User.findById(userId);
    user.totalXp = (user.totalXp || 0) + xpEarned;
    
    // Calculate new level
    const levelInfo = calculateLevel(user.totalXp);
    user.level = levelInfo.level;
    
    await user.save();
    
    res.status(201).json({
      success: true,
      data: {
        exercise,
        levelInfo,
        xpEarned
      },
      message: `Recorded ${reps} ${exerciseType}s earning ${xpEarned} XP!`
    });
  } catch (error) {
    console.error('Exercise recording error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user's exercise history
exports.getExerciseHistory = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware
    
    // Fetch exercise history, newest first
    const exercises = await Exercise.find({ user: userId })
      .sort({ date: -1 });
    
    // Calculate stats
    const stats = {};
    
    // Total reps by exercise type
    stats.totalReps = {};
    stats.totalXpEarned = 0;
    
    exercises.forEach(ex => {
      stats.totalReps[ex.exerciseType] = (stats.totalReps[ex.exerciseType] || 0) + ex.reps;
      stats.totalXpEarned += ex.xpEarned;
    });
    
    res.json({
      success: true,
      count: exercises.length,
      data: exercises,
      stats
    });
  } catch (error) {
    console.error('Error fetching exercise history:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get user's progress and stats
exports.getUserProgress = async (req, res) => {
  try {
    const userId = req.user._id; // From auth middleware
    
    // Fetch user data
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Calculate level info
    const levelInfo = calculateLevel(user.totalXp || 0);
    
    // Get exercise summary
    const exercises = await Exercise.find({ user: userId });
    
    // Calculate total reps for each exercise type
    const exerciseCounts = {};
    let totalWorkouts = exercises.length;
    
    exercises.forEach(ex => {
      exerciseCounts[ex.exerciseType] = (exerciseCounts[ex.exerciseType] || 0) + ex.reps;
    });
    
    // Get daily streak
    // To be implemented: check for exercises on consecutive days
    
    res.json({
      success: true,
      data: {
        progress: levelInfo,
        exerciseStats: {
          totalWorkouts,
          exerciseCounts
        },
        user: {
          _id: user._id,
          username: user.username,
          level: levelInfo.level,
          totalXp: user.totalXp || 0
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user progress:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};