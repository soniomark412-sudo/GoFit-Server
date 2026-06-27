const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 20
  },
  totalXp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  // streak: { type: Number, default: 0 }, # Future feature
  // lastWorkout: { type: Date },         # Future feature
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false
  },
  profile: {
    name: String,
    age: Number,
    height: Number, // in cm
    weight: Number, // in kg
    // PROFILE PICTURES IMPLEMNTATION LATER
    // profilePicture: {
    //   type: String,
    //   default: 'default.jpg'
    // },
    fitnessLevel: {
      type: String,
      enum: ['Noobie', 'Rookie', 'Grinder', 'Flex Warrior', 'Beast', 'Absolute Unit', 'Limitless', 'One Punch Man'],
      default: 'Noobie'
    },
    profilePicture: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// LEADBOARD STUFF
UserSchema.index({ totalXp: -1 }); // Sort by totalXp in descending order

module.exports = mongoose.model('User', UserSchema);

// The password is hashed before saving it to the database. 
// The matchPassword method is used to compare the entered password with the hashed password. 
// This ensures that the password is securely stored and verified. 
// The User model is exported for use in other parts of the application.