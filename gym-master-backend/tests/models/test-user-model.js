// MIGHT NOT NEED THIS ANYMORE BUT JUST GOING TO KEEP IT FOR NOW

// /*
// This test script will:

// 1. Connect to a test database

// 2. Test user creation:
//     Create a user with random credentials to avoid duplicates
//     Verify that password hashing works
//     Test the password matching functionality


// 3. Test validation:
//     Try creating users with missing required fields
//     Test email validation
//     Test password length validation


// 4. Test updating a user:
//     Update the user profile
//     Verify the changes were saved
// */

// // Import required modules
// require('dotenv').config();
// const mongoose = require('mongoose');
// const User = require('../../src/models/user.models.js');

// // Connect to MongoDB
// mongoose.connect(process.env.MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
// .then(() => console.log('MongoDB connected for testing'))
// .catch(err => {
//   console.error('MongoDB connection error:', err);
//   process.exit(1);
// });

// // Function to test user creation
// async function testUserCreation() {
//   try {    console.log('\n--- Testing User Creation ---');
    
//     // Create a test user
//     const testUser = {
//       username: 'testuser_' + Date.now(),
//       email: `test${Date.now()}@example.com`,
//       password: 'password123',
//       profile: {
//         name: 'Test User',
//         age: 30,
//         height: 175,
//         weight: 70,
//         fitnessLevel: 'intermediate'
//       }
//     };
    
//     console.log('Creating user with data:', testUser);
    
//     const user = await User.create(testUser);
//     console.log('\nUser created successfully:');
//     console.log({
//       id: user._id,
//       username: user.username,
//       email: user.email,
//       profile: user.profile,
//       createdAt: user.createdAt
//     });
    
//     // Verify password is hashed (not stored in plaintext)
//     const retrievedUser = await User.findById(user._id).select('+password');
//     console.log('\nVerifying password was hashed:');
//     console.log('Original password:', testUser.password);
//     console.log('Stored password hash:', retrievedUser.password);
    
//     // Test password matching
//     const isMatch = await retrievedUser.matchPassword(testUser.password);
//     console.log('\nTesting password matching functionality:');
//     console.log('Password matches:', isMatch);
    
//     // Test incorrect password
//     const wrongMatch = await retrievedUser.matchPassword('wrongpassword');
//     console.log('Wrong password matches:', wrongMatch);
    
//     return user._id;
//   } catch (error) {
//     console.error('Error testing user creation:', error.message);
//   }
// }

// // Function to test validation
// async function testValidation() {
//   try {
//     console.log('\n--- Testing Validation ---');
    
//     // Test missing required field
//     try {
//       console.log('\nTesting missing username:');
//       await User.create({
//         email: 'missingusername@example.com',
//         password: 'password123'
//       });
//     } catch (error) {
//       console.log('Validation error correctly thrown:', error.message);
//     }
    
//     // Test invalid email
//     try {
//       console.log('\nTesting invalid email:');
//       await User.create({
//         username: 'invalidemail',
//         email: 'notanemail',
//         password: 'password123'
//       });
//     } catch (error) {
//       console.log('Validation error correctly thrown:', error.message);
//     }
    
//     // Test password too short
//     try {
//       console.log('\nTesting password too short:');
//       await User.create({
//         username: 'shortpass',
//         email: 'shortpass@example.com',
//         password: '12345'
//       });
//     } catch (error) {
//       console.log('Validation error correctly thrown:', error.message);
//     }
//   } catch (error) {
//     console.error('Error testing validation:', error.message);
//   }
// }

// // Function to test user update
// async function testUserUpdate(userId) {
//   try {
//     console.log('\n--- Testing User Update ---');
    
//     // Find user and update profile
//     const updatedData = {
//       profile: {
//         name: 'Updated User',
//         age: 31,
//         fitnessLevel: 'advanced'
//       }
//     };
    
//     console.log('\nUpdating user profile:', updatedData);
    
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { $set: updatedData },
//       { new: true, runValidators: true }
//     );
    
//     console.log('User updated successfully:');
//     console.log({
//       id: updatedUser._id,
//       username: updatedUser.username,
//       profile: updatedUser.profile
//     });
//   } catch (error) {
//     console.error('Error testing user update:', error.message);
//   }
// }

// // Run all tests
// async function runTests() {
//   try {
//     const userId = await testUserCreation();
//     await testValidation();
    
//     await testUserUpdate(userId); // Pass the userId to update the correct user
    
//     console.log('\nTests completed.');
//   } catch (error) {
//     console.error('Error running tests:', error);
//   } finally {
//     // Close the connection
//     mongoose.connection.close();
//     console.log('MongoDB connection closed');
//   }
// }

// // Run the tests
// runTests();