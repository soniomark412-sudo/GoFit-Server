import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import mockUsers from '../../data/mockUsers';

const Dashboard = () => {
  // Always use the mock user with id 1
  const user = mockUsers.find(u => u.id === 1);
  const [rewards, setRewards] = useState([]);
  const [userRewards, setUserRewards] = useState([]);
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch rewards
      const allRewardsRes = await api.get('/rewards');
      let rewardsData = Array.isArray(allRewardsRes.data) ? allRewardsRes.data : allRewardsRes.data.data || [];
      setRewards(rewardsData);
      // Fetch user rewards
      const userRewardsRes = await api.get('/rewards/user');
      let userRewardsData = Array.isArray(userRewardsRes.data) ? userRewardsRes.data : userRewardsRes.data.data || [];
      setUserRewards(userRewardsData);
      // Fetch progress
      const progressRes = await api.get('/progress');
      let progress = Array.isArray(progressRes.data) ? progressRes.data : progressRes.data.data || [];
      setProgressData(progress);
    } catch (err) {
      setRewards([]);
      setUserRewards([]);
      setProgressData([]);
    } finally {
      setLoading(false);
    }
  };

  const renderRewardCard = (reward, earned) => (
    <div className={`card h-100 ${earned ? 'border-success' : 'border-secondary text-muted'}`} key={reward._id || reward.id}>
      <div className="card-body text-center">
        <div className="display-6 mb-2">{getRewardIcon(reward.type)}</div>
        <h5 className="card-title">{reward.name || 'Unnamed Reward'}</h5>
        <p className="card-text">{reward.description || 'No description available'}</p>
      </div>
    </div>
  );

  const getRewardIcon = (type) => {
    switch (type) {
      case 'badge': return '🏅';
      case 'achievement': return '🏆';
      case 'milestone': return '🎯';
      case 'level': return '⭐';
      default: return '🎁';
    }
  };

  const renderProgressCard = (progress) => (
    <div className="card h-100" key={progress._id || progress.id}>
      <div className="card-body">
        <h6 className="card-title">{progress.exerciseName || 'Unknown'}</h6>
        <p className="card-text">{progress.notes || 'No notes'}</p>
        <div className="text-muted small">{formatDate(progress.date || progress.createdAt)}</div>
      </div>
    </div>
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container dashboard-page py-4">
      <div className="row align-items-center mb-4">
        <div className="col-md-4 text-center">
          <img src={user.profilePicture} alt={user.username} className="profile-img-placeholder mb-3" />
        </div>
        <div className="col-md-8">
          <h1 className="display-3 fw-bold">{user.username}</h1>
          <div className="text-muted mb-2">{user.bio}</div>
          <div className="small text-muted">Age: {user.age}</div>
          <div className="small text-muted">Email: {user.email}</div>
          <div className="small text-muted">Fitness Level: {user.fitnessLevel.charAt(0).toUpperCase() + user.fitnessLevel.slice(1)}</div>
          <div className="small text-muted">Gender: {user.gender}</div>
          <div className="small text-muted">Level: {user.level} | Total Workouts: {user.totalWorkouts}</div>
        </div>
      </div>
      <h4 className="mb-3">Achievements</h4>
      <div className="row g-3 mb-4">
        {(userRewards.length === 0 ? rewards.slice(0,3) : userRewards.slice(0,3)).map((ur, idx) => {
          const reward = ur.reward || ur;
          return (
            <div className="col-md-4" key={reward._id || reward.id || idx}>
              {renderRewardCard(reward, true)}
            </div>
          );
        })}
      </div>
      <h4 className="mb-3">Previous Records</h4>
      <div className="row g-3 mb-4">
        {progressData.slice(0,4).map((progress, idx) => (
          <div className="col-md-3" key={progress._id || idx}>
            {renderProgressCard(progress)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard; 
