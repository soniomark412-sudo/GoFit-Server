// This component is the sidebar that will be displayed on the dashboard page. It will display the user's quick stats and links to other pages in the dashboard.
// The sidebar will include the user's username, level, number of workouts, and rewards earned.

// MAYBE WE CAN CHANGE THE DESIGN FOR MORE ATTRACTIVE LOOK (BLACK, RED, WHITE, diff font?)

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="bg-light p-3 rounded">
      <h4>Quick Stats</h4>
      <hr />
      <div className="mb-3">
        <p className="mb-1"><strong>Username:</strong> {user?.username || 'N/A'}</p>
        <p className="mb-1"><strong>Level:</strong> Beginner</p>
        <p className="mb-1"><strong>Workouts:</strong> 0</p>
        <p className="mb-1"><strong>Rewards:</strong> 0</p>
      </div>
      <div className="list-group mb-3">
        <Link to="/dashboard" className="list-group-item list-group-item-action">
          Dashboard
        </Link>
        <Link to="/profile" className="list-group-item list-group-item-action">
          My Profile
        </Link>
        <Link to="/progress" className="list-group-item list-group-item-action">
          Track Progress
        </Link>
        <Link to="/progress/history" className="list-group-item list-group-item-action">
          Workout History
        </Link>
        <Link to="/rewards" className="list-group-item list-group-item-action">
          My Rewards
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;