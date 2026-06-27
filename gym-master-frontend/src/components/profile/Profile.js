// This component allows users to view and update their profile information.

import React, { useState } from 'react';
import mockUsers from '../../data/mockUsers';

const Settings = () => {
  // Always use the mock user with id 1
  const userIndex = mockUsers.findIndex(u => u.id === 1);
  const [formData, setFormData] = useState({ ...mockUsers[userIndex] });
  const [success, setSuccess] = useState(false);
  const [photoMode, setPhotoMode] = useState('url'); // 'url' or 'upload'
  const [preview, setPreview] = useState(formData.profilePicture);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'profilePicture' && photoMode === 'url') {
      setPreview(value);
    }
  };

  const handlePhotoModeChange = (mode) => {
    setPhotoMode(mode);
    if (mode === 'url') {
      setPreview(formData.profilePicture);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        setFormData(prev => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Update the mock data in place (for demo only)
    mockUsers[userIndex] = { ...formData };
    setSuccess(true);
    setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-12">
          <h4 className="display-6 fw-bold pb-2">Settings</h4>
          <div className="card">
            <div className="card-body">
              <div className="row">
                {/* Left column: profile picture and bio */}
                <div className="col-md-4 d-flex flex-column align-items-center mb-3 mb-md-0">
                  <img src={preview} alt={formData.username} style={{ width: 140, height: 140, borderRadius: 16, objectFit: 'cover' }} />
                  <div className="mt-2 w-100">
                    <div className="btn-group w-100 mb-2" role="group">
                      <button type="button" className={`btn btn-outline-secondary${photoMode === 'url' ? ' active' : ''}`} onClick={() => handlePhotoModeChange('url')}>Link</button>
                      <button type="button" className={`btn btn-outline-secondary${photoMode === 'upload' ? ' active' : ''}`} onClick={() => handlePhotoModeChange('upload')}>Upload</button>
                    </div>
                    {photoMode === 'url' ? (
                      <input
                        type="text"
                        className="form-control"
                        name="profilePicture"
                        value={formData.profilePicture}
                        onChange={handleChange}
                        placeholder="Profile Picture URL"
                      />
                    ) : (
                      <input
                        type="file"
                        className="form-control"
                        accept="image/*"
                        onChange={handleFileChange}
                      />
                    )}
                  </div>
                  <div className="mt-3 w-100">
                    <label className="form-label">Bio</label>
                    <textarea
                      className="form-control"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      rows={3}
                    />
                  </div>
                </div>
                {/* Right column: form fields */}
                <div className="col-md-8">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-md-6 mb-2">
                        <label className="form-label">Username</label>
                        <input type="text" className="form-control" name="username" value={formData.username} onChange={handleChange} />
                      </div>
                      <div className="col-md-6 mb-2">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-control" name="email" value={formData.email} onChange={handleChange} />
                      </div>
                      <div className="col-md-4 mb-2">
                        <label className="form-label">Age</label>
                        <input type="number" className="form-control" name="age" value={formData.age} onChange={handleChange} />
                      </div>
                      <div className="col-md-4 mb-2">
                        <label className="form-label">Gender</label>
                        <select className="form-select" name="gender" value={formData.gender} onChange={handleChange}>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="col-md-4 mb-2">
                        <label className="form-label">Fitness Level</label>
                        <select className="form-select" name="fitnessLevel" value={formData.fitnessLevel} onChange={handleChange}>
                          <option value="beginner">Beginner</option>
                          <option value="intermediate">Intermediate</option>
                          <option value="advanced">Advanced</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-2">
                        <label className="form-label">Height (cm)</label>
                        <input type="number" className="form-control" name="height" value={formData.height} onChange={handleChange} />
                      </div>
                      <div className="col-md-6 mb-2">
                        <label className="form-label">Weight (kg)</label>
                        <input type="number" className="form-control" name="weight" value={formData.weight} onChange={handleChange} />
                      </div>
                    </div>
                    <button type="submit" className="btn btn-danger mt-2">Save</button>
                    {success && <div className="alert alert-success mt-2">Profile updated!</div>}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;