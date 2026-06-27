// Desc: Login component
// This page allows users to login to their account

import React, { useState, useContext } from 'react'; // Import the useState and useContext hooks
import { Link, useNavigate } from 'react-router-dom'; // Import the Link and useNavigate components
import { AuthContext } from '../../context/AuthContext'; // Import the AuthContext

const Login = () => { 
  const [formData, setFormData] = useState({ // Create a state variable called formData and a function to update it called setFormData
    email: '', 
    password: ''
  });
  const { login, error } = useContext(AuthContext); 
  const navigate = useNavigate(); 

  const { email, password } = formData; 

  const onChange = e => { // The onChange function updates the formData state variable when the user types in the form fields.
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async e => { // The onSubmit function is called when the user submits the form.
    e.preventDefault();
    
    const success = await login({
      email,
      password
    });
    
    if (success) { // If the login is successful, the user is redirected to the dashboard page.
      navigate('/dashboard');
    }
  };

  return ( // The return statement contains the JSX code for the login form.
    <div className="container login">
      <div className="row justify-content-center">
        <div className="col-md-6">
        <h2 className="text-center display-4 fw-bold pb-2">LOGIN</h2>
          <div className="card">
            <div className="card-body">
              {error && (
                <div className="alert alert-danger">{error}</div>
              )}
              <form onSubmit={onSubmit}>
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
                    required
                  />
                </div>
                <button type="submit" className="btn btn-danger w-100">Login</button>
              </form>
              <div className="mt-3 text-center">
                Don't have an account? <Link to="/register">Register</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login; // Export the Login component for use in other parts of the application