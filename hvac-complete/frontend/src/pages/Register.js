import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../api';
import './Login.css';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client', phone: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async e => {
    e.preventDefault();
    setError(''); setSuccess('');
    setLoading(true);
    try {
      const user = await api.createUser(form);
      setSuccess(`Account created! Your registration code is ${user.registration_code}. Redirecting…`);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      setError(err.message);
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
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join the HVAC management platform</p>

          {error && (
            <div className="auth-error fade-in-fast">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="var(--red)" strokeWidth="1.5"/>
                <path d="M8 5v3.5M8 11v.5" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className="auth-success fade-in-fast">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="8" r="7" stroke="var(--green)" strokeWidth="1.5"/>
                <path d="M5 8l2.5 2.5L11 5.5" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field-group">
              <label className="field-label">Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="John Smith" required />
            </div>
            <div className="field-group">
              <label className="field-label">Email Address</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="john@company.com" required />
            </div>
            <div className="field-row">
              <div className="field-group">
                <label className="field-label">Phone (optional)</label>
                <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
              </div>
              <div className="field-group">
                <label className="field-label">Role</label>
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="client">Client</option>
                  <option value="technician">Technician</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            <div className="field-group">
              <label className="field-label">Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="••••••••" required minLength={6} />
            </div>

            <button type="submit" className="btn-primary btn-full" disabled={loading}>
              {loading ? <span className="btn-loading"><span className="spinner-sm" />Creating account…</span> : 'Create Account'}
            </button>
          </form>

          <p className="auth-footer">
            Already have an account?{' '}
            <Link to="/" className="auth-link">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
