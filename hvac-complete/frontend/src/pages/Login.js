import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login(email, password);
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/app');
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-grid" />
      </div>

      <div className="auth-container fade-in">
        <div className="auth-brand">
          <div className="auth-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="var(--accent)" fillOpacity="0.15"/>
              <path d="M8 20 C8 14 14 10 16 10 C18 10 24 14 24 20" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 24 L12 18 M20 24 L20 18" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10 18 L22 18" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="16" cy="10" r="2" fill="var(--accent)"/>
            </svg>
          </div>
          <span className="auth-brand-name">HVAC<span>Ops</span></span>
        </div>

        <div className="auth-card">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your workspace</p>

          {error && (
            <div className="auth-error fade-in-fast">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="var(--red)" strokeWidth="1.5"/>
                <path d="M8 5v3.5M8 11v.5" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="auth-form">
            <div className="field-group">
              <label className="field-label">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                autoFocus
              />
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>

            <button type="submit" className="btn-primary btn-full" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  <span className="spinner-sm" />
                  Signing in…
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p className="auth-footer">
            Don't have an account?{' '}
            <Link to="/register" className="auth-link">Register here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
