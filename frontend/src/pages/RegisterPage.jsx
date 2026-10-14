import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../api/api';

function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      setError('Name, email and password are required.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await registerUser(formData);
      setSuccess('Registration successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Registration failed. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="logo-icon">🅿️</span>
          <h1>Create Account</h1>
          <p>Join Smart Parking Management System</p>
        </div>

        {error && <div className="alert alert-error">⚠️ {error}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input type="text" name="name" className="form-input" placeholder="Enter your full name" value={formData.name} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input type="email" name="email" className="form-input" placeholder="Enter your email" value={formData.email} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input type="tel" name="phone" className="form-input" placeholder="Enter phone (optional)" value={formData.phone} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
            <input type="password" name="password" className="form-input" placeholder="Min 6 characters" value={formData.password} onChange={handleChange} />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? '⏳ Registering...' : '✅ Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          <p>Already have an account? <Link to="/login">Sign in</Link></p>
          <p style={{ marginTop: '8px' }}><Link to="/">← Back to Home</Link></p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
