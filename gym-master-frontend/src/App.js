import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Import Exercise Components
import PushupDetector from './components/exercise/PushupDetector';
import Leaderboard from './components/rewards/Leaderboard';

// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css';

// Layout Components
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';

// User Components
import Profile from './components/profile/Profile';
import AddProgress from './components/progress/AddProgress';
import ProgressList from './components/progress/ProgressList';
import RewardsList from './components/rewards/RewardsList';

import './App.css';

// Dashboard Component
import Dashboard from './components/dashboard/Dashboard';

// Protected Route Component
const ProtectedRoute = ({ children }) => { // This component will be used to protect routes that require authentication 
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />; // If the user is not authenticated, they will be redirected to the login page
  }
  
  return children;
};

// Home Component
const Home = () => {
  return (
    <div className="container mx-0 bg-danger home">
      <div className="row align-items-center">
        <div className="col-md-7">
          <h1 className="display-1 text-white fw-bold">Track Your Fitness Journey</h1>
          <p className="lead display-6 text-white">
            Welcome to Gym Master, your personal AI-powered fitness companion.
          </p>
          <div className="d-grid gap-2 d-md-flex pt-4 justify-content-md-end px-3">
            <Link to="/register" className="btn btn-light btn-outline-danger btn-lg me-md-2">Get Started</Link>
            <Link to="/login" className="btn btn-light btn-outline-danger btn-lg">Login</Link>
          </div>
        </div>
        
        <div className="col-md-4 text-center">
          <div className="display-1" style={{ fontSize: '180px' }}>🏋️</div>
        </div>
        <div className="col-md-1"></div>
      </div>
    </div>
  );
};

function App() { // The App component contains the main layout of the application
  return (
    <AuthProvider>
      <Router>
        <div className="d-flex flex-column min-vh-100">
          <Header />
          <main className="flex-grow-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } />
              <Route path="/progress" element={
                <ProtectedRoute>
                  <div className="container mt-4">
                    <AddProgress />
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/progress/history" element={
                <ProtectedRoute>
                  <div className="container mt-4">
                    <ProgressList />
                  </div>
                </ProtectedRoute>
              } />
              <Route path="/rewards" element={
                <ProtectedRoute>
                  <RewardsList />
                </ProtectedRoute>
              } />
              <Route path="/exercise/pushups" element={
                <ProtectedRoute>
                  <PushupDetector />
                </ProtectedRoute>
              } />
              <Route path="/leaderboard" element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
                } />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;