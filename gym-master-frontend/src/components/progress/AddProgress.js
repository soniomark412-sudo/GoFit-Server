// This component allows users to add a new workout progress record.
// It includes a form with fields for exercise type, exercise name, metrics, form score, and notes.

// WE NEED TO INTEGRATE THE WEBCAM STILLLLLLLL FOR FORM SCORESSS

import React, { useState } from 'react';
import api from '../../utils/api';

const AddProgress = ({ onProgressAdded }) => { // AddProgress component receives a prop called onProgressAdded
  const [formData, setFormData] = useState({
    exerciseType: 'pushup',
    exerciseName: '',
    metrics: {
      reps: '',
      sets: '',
      weight: '',
      duration: '',
      distance: '',
      caloriesBurned: ''
    },
    formScore: '',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const { exerciseType, exerciseName, metrics, formScore, notes } = formData;

  const onChange = e => { // The onChange function updates the formData state variable when the user types in the form fields.
    if (e.target.name.startsWith('metrics.')) {
      const metricField = e.target.name.split('.')[1];
      setFormData({
        ...formData,
        metrics: {
          ...formData.metrics,
          [metricField]: e.target.value
        }
      });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value }); 
    }
  };

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      // Clean metrics data - remove empty fields
      const cleanMetrics = {};
      Object.keys(metrics).forEach(key => {
        if (metrics[key] !== '') {
          cleanMetrics[key] = Number(metrics[key]);
        }
      });

      // Prepare data for submission
      const submitData = {
        exerciseType,
        exerciseName,
        metrics: cleanMetrics,
        notes
      };

      // Only add formScore if provided
      if (formScore) {
        submitData.formScore = Number(formScore);
      }

      const res = await api.post('/progress', submitData); // The onSubmit function is called when the user submits the form.
      console.log('Progress added:', res.data); // If the progress is added successfully, the user is notified and the form is reset.
      
      setSuccess(true);
      
      // Reset form
      setFormData({
        exerciseType: 'pushup',
        exerciseName: '',
        metrics: {
          reps: '',
          sets: '',
          weight: '',
          duration: '',
          distance: '',
          caloriesBurned: ''
        },
        formScore: '',
        notes: ''
      });
      
      // Notify parent component
      if (onProgressAdded) {
        onProgressAdded(res.data.data || res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add progress');
    } finally {
      setLoading(false);
    }
  };

  // Conditionally show metric fields based on exercise type
  const renderMetricFields = () => {
    switch (exerciseType) {
      case 'pushup':
      case 'squat':
      case 'situp':
        return (
          <>
            <div className="mb-3">
              <label htmlFor="metrics.reps" className="form-label">Reps</label>
              <input
                type="number"
                className="form-control"
                id="metrics.reps"
                name="metrics.reps"
                value={metrics.reps}
                onChange={onChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="metrics.sets" className="form-label">Sets</label>
              <input
                type="number"
                className="form-control"
                id="metrics.sets"
                name="metrics.sets"
                value={metrics.sets}
                onChange={onChange}
              />
            </div>
          </>
        );
      case 'running':
        return (
          <>
            <div className="mb-3">
              <label htmlFor="metrics.duration" className="form-label">Duration (seconds)</label>
              <input
                type="number"
                className="form-control"
                id="metrics.duration"
                name="metrics.duration"
                value={metrics.duration}
                onChange={onChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="metrics.distance" className="form-label">Distance (meters)</label>
              <input
                type="number"
                className="form-control"
                id="metrics.distance"
                name="metrics.distance"
                value={metrics.distance}
                onChange={onChange}
              />
            </div>
          </>
        );
      case 'other':
      default:
        return (
          <>
            <div className="mb-3">
              <label htmlFor="metrics.reps" className="form-label">Reps</label>
              <input
                type="number"
                className="form-control"
                id="metrics.reps"
                name="metrics.reps"
                value={metrics.reps}
                onChange={onChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="metrics.sets" className="form-label">Sets</label>
              <input
                type="number"
                className="form-control"
                id="metrics.sets"
                name="metrics.sets"
                value={metrics.sets}
                onChange={onChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="metrics.weight" className="form-label">Weight (kg)</label>
              <input
                type="number"
                className="form-control"
                id="metrics.weight"
                name="metrics.weight"
                value={metrics.weight}
                onChange={onChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="metrics.duration" className="form-label">Duration (seconds)</label>
              <input
                type="number"
                className="form-control"
                id="metrics.duration"
                name="metrics.duration"
                value={metrics.duration}
                onChange={onChange}
              />
            </div>
          </>
        );
    }
  };

  return (
    <div className="card">
      <h4 className="display-6 fw-bold pb-2">Record Workout</h4>
      <div className="card-body">
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">Workout recorded successfully!</div>}
        
        <form onSubmit={onSubmit}>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="exerciseType" className="form-label">Exercise Type</label>
                <select
                  className="form-select"
                  id="exerciseType"
                  name="exerciseType"
                  value={exerciseType}
                  onChange={onChange}
                  required
                >
                  <option value="pushup">Push-up</option>
                  <option value="squat">Squat</option>
                  <option value="situp">Sit-up</option>
                  <option value="running">Running</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div className="mb-3">
                <label htmlFor="exerciseName" className="form-label">Exercise Name</label>
                <input
                  type="text"
                  className="form-control"
                  id="exerciseName"
                  name="exerciseName"
                  value={exerciseName}
                  onChange={onChange}
                  placeholder={exerciseType === 'other' ? 'Custom exercise name' : `${exerciseType.charAt(0).toUpperCase() + exerciseType.slice(1)}`}
                  required
                />
              </div>
              
              {/* Dynamic Metric Fields */}
              {renderMetricFields()}
            </div>
            
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="formScore" className="form-label">Form Score (0-100)</label>
                <input
                  type="number"
                  className="form-control"
                  id="formScore"
                  name="formScore"
                  value={formScore}
                  onChange={onChange}
                  min="0"
                  max="100"
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="metrics.caloriesBurned" className="form-label">Calories Burned</label>
                <input
                  type="number"
                  className="form-control"
                  id="metrics.caloriesBurned"
                  name="metrics.caloriesBurned"
                  value={metrics.caloriesBurned}
                  onChange={onChange}
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="notes" className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  id="notes"
                  name="notes"
                  value={notes}
                  onChange={onChange}
                  rows="3"
                ></textarea>
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            className="btn btn-danger w-100"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Workout'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProgress;
