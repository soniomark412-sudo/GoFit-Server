// This component displays a list of rewards that the user has earned and can earn.
// The component fetches the user's earned rewards and all available rewards from the API.
// It also provides a button to check for new rewards and displays any newly earned rewards.

import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import mockUsers from '../../data/mockUsers';


// Define all achievements
const achievements = [
  { label: '10 Push-ups', value: 10, points: 10, type: 'pushup', series: 'pushup' },
  { label: '50 Push-ups', value: 50, points: 30, type: 'pushup', series: 'pushup' },
  { label: '100 Push-ups', value: 100, points: 60, type: 'pushup', series: 'pushup' },
  { label: '200 Push-ups', value: 200, points: 120, type: 'pushup', series: 'pushup' },
  { label: '500 Push-ups', value: 500, points: 300, type: 'pushup', series: 'pushup' },
  { label: '1000 Push-ups', value: 1000, points: 700, type: 'pushup', series: 'pushup' },
  { label: 'Push-up every week (4 weeks streak)', value: 'weekly', points: 200, type: 'streak', series: 'weekly' },
  { label: 'Push-up every week (12 weeks streak)', value: 'weekly12', points: 600, type: 'streak', series: 'weekly' },
  { label: 'First Workout', value: 'first', points: 5, type: 'misc' },
  { label: '30 Day Streak', value: 'streak30', points: 500, type: 'streak' },
  { label: 'Push-up Master', value: 2000, points: 1000, type: 'pushup' },
];

const user = mockUsers.find(u => u.id === 1);
const totalPushups = user.totalPushups || 0;
const pushupWeeklyStreak = user.pushupWeeklyStreak || 0;
const userAchievements = user.achievements || [];

// Helper to determine if an achievement is achieved
const isAchieved = (ach) => {
  if (ach.type === 'pushup' && typeof ach.value === 'number') {
    return totalPushups >= ach.value;
  }
  if (ach.type === 'streak' && ach.value === 'weekly') {
    return pushupWeeklyStreak >= 4;
  }
  if (ach.type === 'streak' && ach.value === 'weekly12') {
    return pushupWeeklyStreak >= 12;
  }
  // Misc achievements by name
  return userAchievements.includes(ach.label);
};

// Helper to determine if an achievement is locked (for series)
const isLocked = (ach, achievedMap) => {
  if (!ach.series) return false;
  // Find previous achievement in the series
  const seriesAchievements = achievements.filter(a => a.series === ach.series && a.type === ach.type && typeof a.value === typeof ach.value)
    .sort((a, b) => (typeof a.value === 'number' ? a.value - b.value : 0));
  const idx = seriesAchievements.findIndex(a => a.label === ach.label);
  if (idx <= 0) return false; // First in series is never locked
  const prevAch = seriesAchievements[idx - 1];
  return !achievedMap[prevAch.label];
};

const RewardsList = () => {
  const [rewards, setRewards] = useState([]);
  const [userRewards, setUserRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checkingRewards, setCheckingRewards] = useState(false);
  const [newRewards, setNewRewards] = useState([]);

  // Build a map of achieved achievements for quick lookup
  const achievedMap = {};
  achievements.forEach(ach => {
    achievedMap[ach.label] = isAchieved(ach);
  });

  const accomplished = achievements.filter(ach => achievedMap[ach.label]);

  useEffect(() => {
    fetchRewards();
  }, []);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      
      // Get all available rewards
      const allRewardsRes = await api.get('/rewards');
      console.log('All rewards response:', allRewardsRes.data);
      
      // Handle different response formats
      let rewardsData = [];
      if (Array.isArray(allRewardsRes.data)) {
        rewardsData = allRewardsRes.data;
      } else if (allRewardsRes.data.data && Array.isArray(allRewardsRes.data.data)) {
        rewardsData = allRewardsRes.data.data;
      } else {
        console.warn('Rewards data not in expected format:', allRewardsRes.data);
        rewardsData = [];
      }
      setRewards(rewardsData);
      
      // Get user's earned rewards
      const userRewardsRes = await api.get('/rewards/user');
      console.log('User rewards response:', userRewardsRes.data);
      
      // Handle different response formats
      let userRewardsData = [];
      if (Array.isArray(userRewardsRes.data)) {
        userRewardsData = userRewardsRes.data;
      } else if (userRewardsRes.data.data && Array.isArray(userRewardsRes.data.data)) {
        userRewardsData = userRewardsRes.data.data;
      } else {
        console.warn('User rewards data not in expected format:', userRewardsRes.data);
        userRewardsData = [];
      }
      setUserRewards(userRewardsData);
      
      setError('');
    } catch (err) {
      console.error('Error fetching rewards:', err);
      setError(err.response?.data?.message || 'Failed to fetch rewards');
      // Initialize with empty arrays on error
      setRewards([]);
      setUserRewards([]);
    } finally {
      setLoading(false);
    }
  };

  const checkForNewRewards = async () => { // Function to check for new rewardsz
    try {
      setCheckingRewards(true);
      setNewRewards([]);
      
      const res = await api.post('/rewards/check');
      console.log('Check rewards response:', res.data);
      
      // Handle different response formats
      let newEarnedRewards = [];
      if (Array.isArray(res.data)) {
        newEarnedRewards = res.data;
      } else if (res.data.data && Array.isArray(res.data.data)) {
        newEarnedRewards = res.data.data;
      } else {
        console.warn('New rewards data not in expected format:', res.data);
        newEarnedRewards = [];
      }
      
      setNewRewards(newEarnedRewards);
      
      if (newEarnedRewards.length > 0) {
        // Refresh the user's rewards
        await fetchRewards();
      }
    } catch (err) {
      console.error('Error checking for rewards:', err);
      setError(err.response?.data?.message || 'Failed to check for new rewards');
    } finally {
      setCheckingRewards(false);
    }
  };

  // Helper to check if user has earned a reward
  const hasEarnedReward = (rewardId) => {
    if (!Array.isArray(userRewards)) return false;
    
    return userRewards.some(ur => 
      (ur.reward && ur.reward._id === rewardId) || 
      (ur.reward && ur.reward.id === rewardId) ||
      (ur._id === rewardId) || 
      (ur.id === rewardId)
    );
  };

  // Render reward badge ( earned or not )
  const renderRewardBadge = (reward, earned) => {
    if (!reward) return null;
    
    return (
      <div 
        className={`card h-100 ${earned ? 'border-success' : 'border-secondary text-muted'}`} 
        key={reward._id || reward.id || `reward-${Math.random()}`}
      >
        <div className="card-body text-center">
          <div className="display-1 mb-3">
            {getRewardIcon(reward.type)}
          </div>
          <h5 className="card-title">
            {reward.name || 'Unnamed Reward'}
            {earned && <span className="badge bg-success ms-2">Earned</span>}
          </h5>
          <p className="card-text">{reward.description || 'No description available'}</p>
          {reward.pointsValue > 0 && (
            <div className="mt-2">
              <span className="badge bg-danger">{reward.pointsValue} points</span>
            </div>
          )}
        </div>
        <div className="card-footer bg-transparent">
          <small className="text-muted">
            {getRequirementText(reward.requirements)}
          </small>
        </div>
      </div>
    );
  };

  // Get icon based on reward type ( COULD MAKE OUR OWN ICONS IN FUTURE ? )
  const getRewardIcon = (type) => {
    switch (type) {
      case 'badge':
        return '🏅';
      case 'achievement':
        return '🏆';
      case 'milestone':
        return '🎯';
      case 'level':
        return '⭐';
      default:
        return '🎁';
    }
  };

  // Get readable text for requirements
  const getRequirementText = (requirements) => {
    if (!requirements) return 'Special achievement';
    
    let text = '';
    
    if (requirements.exerciseType) {
      const exerciseType = requirements.exerciseType.charAt(0).toUpperCase() + requirements.exerciseType.slice(1);
      text += exerciseType + ' - ';
    }
    
    if (requirements.totalCount) {
      text += `Complete ${requirements.totalCount} total`;
    } else if (requirements.streak) {
      text += `${requirements.streak} day streak`;
    } else if (requirements.count) {
      text += `${requirements.count} in one session`;
    }
    
    return text || 'Special achievement';
  };

  if (loading) {
    return <div className="d-flex justify-content-center mt-5"><div className="spinner-border"></div></div>;
  }

  return (
    <section className="rewards-section py-4">
      <div className="container">
        <h2 className="display-4 fw-bold mb-4">Rewards Gallery</h2>
        {accomplished.length > 0 && (
          <>
            <h4 className="mb-3">Accomplished Achievements</h4>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 mb-4">
              {accomplished.map((ach) => (
                <div className="col" key={ach.label}>
                  <div className="card h-100 text-center border-success bg-light" style={{ boxShadow: '0 0 12px #a3e635' }}>
                    <div className="card-body d-flex flex-column justify-content-center align-items-center">
                      <div className="display-4 mb-2">{ach.type === 'pushup' ? '💪' : ach.type === 'streak' ? '🔥' : '🏅'}</div>
                      <h5 className="card-title mb-2">{ach.label}</h5>
                      <div className="mb-2">{ach.points} <span className="badge bg-warning text-dark">points</span></div>
                      <span className="badge bg-success">Achieved</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
        <h4 className="mb-3">All Achievements</h4>
        <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
          {achievements.map((ach) => {
            const achieved = achievedMap[ach.label];
            const locked = isLocked(ach, achievedMap);
            return (
              <div className="col" key={ach.label}>
                <div className={`card h-100 text-center ${achieved ? 'border-success bg-light' : locked ? 'border-dark bg-secondary bg-opacity-10 text-muted' : 'border-secondary bg-white text-muted'}`} style={{ boxShadow: achieved ? '0 0 12px #a3e635' : locked ? '0 0 8px #8882' : 'none' }}>
                  <div className="card-body d-flex flex-column justify-content-center align-items-center">
                    <div className="display-4 mb-2">{ach.type === 'pushup' ? '💪' : ach.type === 'streak' ? '🔥' : '🏅'}</div>
                    <h5 className="card-title mb-2">{ach.label}</h5>
                    <div className="mb-2">{ach.points} <span className="badge bg-warning text-dark">points</span></div>
                    {achieved ? (
                      <span className="badge bg-success">Achieved</span>
                    ) : locked ? (
                      <span className="badge bg-dark">Locked</span>
                    ) : (
                      <span className="badge bg-secondary">Available</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default RewardsList;