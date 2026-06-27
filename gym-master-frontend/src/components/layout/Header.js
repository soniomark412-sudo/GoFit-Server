// Desc: Header component for the application
// The Header component displays the header of the application.

// MAYBE WE CAN CHANGE THE DESIGN FOR MORE ATTRACTIVE LOOK (BLACK, RED, WHITE, diff font?)

import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Header = () => {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  const authLinks = (
    <ul className="navbar-nav ms-auto">
      <li className="nav-item">
        <span className="nav-link  text-danger">
          Welcome {user?.username || 'User'}
        </span>
      </li>
      <li className="nav-item">
        <Link className="nav-link text-black" to="/dashboard">Dashboard</Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link text-black" to="/exercise/pushups">Push-up Coach</Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link text-black" to="/profile">Profile</Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link text-black" to="/progress">Progress</Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link text-black" to="/rewards">Rewards</Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link text-black" to="/leaderboard">Leaderboard</Link>
      </li>
      <li className="nav-item">
        <a 
          href="#!" 
          className="nav-link text-black" 
          onClick={onLogout}
        >
          Logout
        </a>
      </li>
    </ul>
  );

  const guestLinks = (
    <ul className="navbar-nav ms-auto">
      <li className="nav-item">
        <Link className="nav-link text-black" to="/login">Login</Link>
      </li>
      <li className="nav-item">
        <Link className="nav-link text-black" to="/register">Register</Link>
      </li>
    </ul>
  );

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-white">
      <div className="container header">
        <Link className="navbar-brand text-danger fw-bold fs-4" to="/">
          <i className="fas fa-dumbbell me-2"></i>
          Gym Master
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarMain"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarMain">
          {isAuthenticated ? authLinks : guestLinks}
        </div>
      </div>
    </nav>
  );
};

export default Header;
