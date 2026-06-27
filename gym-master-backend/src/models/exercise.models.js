// Desc: Exercise model for the gym master app
// This file defines the schema for the Exercise model using Mongoose :)

const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exerciseType: {
    type: String,
    required: true,
    enum: ['pushups', 'squats']
  },
  reps: {
    type: Number,
    required: true,
    min: 1
  },
//   formScore: { -> FUTURE!!!!!
//     type: Number,
//     min: 0,
//     max: 1,
//     default: 0.7
//   },
  xpEarned: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Exercise', ExerciseSchema);