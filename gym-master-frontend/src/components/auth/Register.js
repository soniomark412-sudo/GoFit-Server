// This file contains the registration form component. 
// It allows users to register for an account by providing a username, email address, and password. 
// The form also includes a link to the login page for users who already have an account.

import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: ''
  });
  const [formError, setFormError] = useState('');
  const { register, error } = useContext(AuthContext);
  const navigate = useNavigate();

  const { username, email, password, password2 } = formData;

  const onChange = e => { 
    setFormData({ ...formData, [e.target.name]: e.target.value }); //...formData is used to copy the existing form data, 
    // and [e.target.name]: e.target.value is used to update the specific field that the user is typing in.
  };

  const onSubmit = async e => { // The onSubmit function is called when the user submits the form.
    e.preventDefault();
    
    // Form validation
    if (!username || !email || !password) {
      setFormError('Please fill in all fields');
      return;
    }
    
    if (password !== password2) {
      setFormError('Passwords do not match');
      return;
    }
    
    // Submit the registration
    console.log('Submitting registration with:', { username, email, password });
    const success = await register({
      username,
      email,
      password
    });
    
    console.log('Registration result:', success);
    
    if (success) {
      console.log('Registration successful, navigating to dashboard');
      navigate('/dashboard');
    } else {
      console.log('Registration failed, staying on registration page');
    }
  };

  return (
    <div className="container register">
      <div className="row justify-content-center">
      <h2 className="text-center display-4 fw-bold pb-2">REGISTER</h2>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              {(formError || error) && (
                <div className="alert alert-danger">{formError || error}</div>
              )}
              <form onSubmit={onSubmit}>
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username</label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    value={username}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    id="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    minLength="6"
                    required
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password2" className="form-label">Confirm Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password2"
                    name="password2"
                    value={password2}
                    onChange={onChange}
                    minLength="6"
                    required
                  />
                </div>
                <button type="submit" className="btn btn-danger w-100">Register</button>
              </form>
              <div className="mt-3 text-center">
                Already have an account? <Link to="/login">Login</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; // This line tells the file what to export. In this case, we're exporting the Register component.