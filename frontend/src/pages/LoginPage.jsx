import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';
import { loginUser } from '../api/api';

function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Handle form field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user starts typing
  };

  // Auto-fill demo credentials
  const demoEnabled = import.meta.env.DEV || import.meta.env.VITE_DEMO_ENABLED === 'true';
  const fillDemoUser = () => setFormData({ email: 'demo@smartparking.com', password: 'demo123' });
  const fillAdmin = () => setFormData({ email: 'admin@smartparking.com', password: 'admin123' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      // Call the backend login API
      const response = await loginUser(formData);
      const userData = response.data;

      // Save user info using AuthContext
      login(userData);

      // Navigate based on role
      if (userData.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      // Show the error message from the backend
      const errorMessage = err.response?.data?.error || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Logo */}
        <div className="auth-logo">
          <span className="logo-icon">🅿️</span>
          <h1>Smart Parking</h1>
          <p>Management System</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            ⚠️ {error}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">Email Address</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              name="email"
              className="form-input"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="login-password" className="form-label">Password</label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              name="password"
              className="form-input"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}
          >
            {loading ? '⏳ Signing in...' : '🔐 Sign In'}
          </button>
        </form>

        {/* Quick Login Buttons */}
        {demoEnabled && <div style={{ marginTop: '20px', padding: '16px', background: '#f8fafc', borderRadius: '10px' }}>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: '600' }}>
            Quick Demo Login:
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="btn btn-secondary"
              onClick={fillDemoUser}
              style={{ flex: 1, fontSize: '0.75rem', padding: '8px' }}
            >
              👤 Demo User
            </button>
            <button
              className="btn btn-secondary"
              onClick={fillAdmin}
              style={{ flex: 1, fontSize: '0.75rem', padding: '8px' }}
            >
              🔐 Admin
            </button>
          </div>
        </div>

        }
        {/* Register Link */}
        <div className="auth-footer">
          <p>Don't have an account? <Link to="/register">Register here</Link></p>
          <p style={{ marginTop: '8px' }}><Link to="/">← Back to Home</Link></p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
