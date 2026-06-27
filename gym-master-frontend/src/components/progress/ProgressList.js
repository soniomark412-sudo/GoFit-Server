// This component fetches and displays the user's workout history.
// It fetches the user's progress data from the API and displays it in a table.
// The progress data includes the date, exercise name, metrics, form score, and notes for each workout.

import React, { useState, useEffect } from 'react';
import api from '../../utils/api';

const ProgressList = () => { // The ProgressList component fetches and displays the user's workout history.
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProgress(); // The loadProgress function is called when the component is added to the Dashboard page.
  }, []);

  const loadProgress = async () => {
    try {
      setLoading(true);
      const res = await api.get('/progress');
      console.log('Progress response:', res.data);
      
      // Handle different response formats
      let data = [];
      if (Array.isArray(res.data)) {
        data = res.data;
      } else if (res.data.data && Array.isArray(res.data.data)) { // The response data is checked to see if it is an array.
        data = res.data.data;
      } else if (res.data.success && res.data.data && Array.isArray(res.data.data)) {
        data = res.data.data;
      } else {
        // If no valid array found, use empty array
        console.warn('Progress data not in expected format:', res.data);
        data = [];
      }
      
      setProgressData(data);
      setError('');
    } catch (err) {
      console.error('Error fetching progress:', err);
      setError(err.response?.data?.message || 'Failed to fetch workout history');
      // Initialize with empty array on error
      setProgressData([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Helper function to display metrics based on exercise type ( FUTURE IMPLEMENTATION IS IN NEED)
  const renderMetrics = (progress) => {
    const { metrics } = progress;
    if (!metrics) return 'No metrics recorded';

    const metricItems = [];
    
    if (metrics.reps) metricItems.push(`${metrics.reps} reps`);
    if (metrics.sets) metricItems.push(`${metrics.sets} sets`);
    if (metrics.weight) metricItems.push(`${metrics.weight} kg`);
    if (metrics.duration) {
      const minutes = Math.floor(metrics.duration / 60);
      const seconds = metrics.duration % 60;
      metricItems.push(`${minutes}m ${seconds}s`);
    }
    if (metrics.distance) metricItems.push(`${metrics.distance} meters`);
    if (metrics.caloriesBurned) metricItems.push(`${metrics.caloriesBurned} calories`);

    return metricItems.join(', ');
  };

  if (loading) {
    return <div className="d-flex justify-content-center mt-5"><div className="spinner-border"></div></div>;
  }

  if (error) {
    return <div className="alert alert-danger mt-3">{error}</div>;
  }

  if (progressData.length === 0) {
    return <div className="alert alert-info mt-3">No workout history found. Start tracking your progress!</div>;
  }

  return (
    <div className="card">
      <h4 className="display-6 fw-bold pb-2">Workout History</h4>
      <div className="card-body">
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Date</th>
                <th>Exercise</th>
                <th>Metrics</th>
                <th>Form Score</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {progressData.map((progress) => (
                <tr key={progress._id || `progress-${Math.random()}`}>
                  <td>{formatDate(progress.date || progress.createdAt)}</td>
                  <td>
                    <strong>{progress.exerciseName || 'Unknown'}</strong>
                    <br />
                    <small className="text-muted">{progress.exerciseType || 'N/A'}</small>
                  </td>
                  <td>{renderMetrics(progress)}</td>
                  <td>
                    {progress.formScore ? (
                      <div className="progress" style={{ height: '20px' }}>
                        <div
                          className={`progress-bar ${
                            progress.formScore >= 80 ? 'bg-success' : 
                            progress.formScore >= 60 ? 'bg-info' : 
                            progress.formScore >= 40 ? 'bg-warning' : 'bg-danger'
                          }`}
                          role="progressbar"
                          style={{ width: `${progress.formScore}%` }}
                          aria-valuenow={progress.formScore}
                          aria-valuemin="0"
                          aria-valuemax="100"
                        >{progress.formScore}%</div>
                      </div>
                    ) : (
                      <span className="text-muted">N/A</span>
                    )}
                  </td>
                  <td>{progress.notes || <span className="text-muted">No notes</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProgressList;