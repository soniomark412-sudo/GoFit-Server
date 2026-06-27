import mockUsers from '../../data/mockUsers';

const getPodium = (users) => {
  // Sort users by rewardPoints descending
  const sorted = [...users].sort((a, b) => b.rewardPoints - a.rewardPoints);
  return {
    podium: sorted.slice(0, 3),
    others: sorted.slice(3)
  };
};

const Leaderboard = () => {
  const { podium, others } = getPodium(mockUsers);

  return (
    <div className="leaderboard py-5">
      <div className="container">
        {/* Podium */}
        <div className="row justify-content-center align-items-end mb-4 podium-row">
          {/* 2nd place */}
          <div className="col-4 text-center">
            <div className="podium podium-2">
              <img src={podium[1]?.profilePicture} alt={podium[1]?.username} className="podium-img" />
              <div className="podium-name">{podium[1]?.username}</div>
              <div className="podium-points">{podium[1]?.rewardPoints} pts</div>
            </div>
          </div>
          {/* 1st place */}
          <div className="col-4 text-center">
            <div className="podium podium-1">
              <img src={podium[0]?.profilePicture} alt={podium[0]?.username} className="podium-img" />
              <div className="podium-name">{podium[0]?.username}</div>
              <div className="podium-points">{podium[0]?.rewardPoints} pts</div>
            </div>
          </div>
          {/* 3rd place */}
          <div className="col-4 text-center">
            <div className="podium podium-3">
              <img src={podium[2]?.profilePicture} alt={podium[2]?.username} className="podium-img" />
              <div className="podium-name">{podium[2]?.username}</div>
              <div className="podium-points">{podium[2]?.rewardPoints} pts</div>
            </div>
          </div>
        </div>
        {/* Others */}
        <div className="leaderboard-list mx-auto">
          {others.map((user, idx) => (
            <div className="leaderboard-list-item d-flex align-items-center justify-content-between" key={user.id}>
              <div className="d-flex align-items-center">
                <span className="leaderboard-rank">{idx + 4}</span>
                <img src={user.profilePicture} alt={user.username} className="list-img mx-2" />
                <span className="leaderboard-username">{user.username}</span>
              </div>
              <span className="leaderboard-points">{user.rewardPoints} pts</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard; 