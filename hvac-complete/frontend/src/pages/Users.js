import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import './Users.css';

const ROLE_COLOR = {
  admin: { bg: 'var(--purple-dim)', color: 'var(--purple)' },
  technician: { bg: 'var(--amber-dim)', color: 'var(--amber)' },
  client: { bg: 'var(--green-dim)', color: 'var(--green)' },
};

export default function Users() {
  const [user] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('All');
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'client', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user.role !== 'admin') navigate('/app');
  }, [user, navigate]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getAllUsers();
      setUsers(data || []);
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleCreate = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createUser({ ...form, role: form.role });
      showToast(`User created successfully!`);
      setShowForm(false);
      setForm({ name: '', email: '', password: '', role: 'client', phone: '' });
      loadUsers();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async id => {
    try {
      await api.deleteUser(id);
      setConfirmDelete(null);
      showToast('User deleted.');
      loadUsers();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const filtered = users.filter(u => {
    const matchRole = filterRole === 'All' || u.role === filterRole;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.registration_code?.toLowerCase().includes(q);
    return matchRole && matchSearch;
  });

  const counts = { admin: 0, technician: 0, client: 0 };
  users.forEach(u => { if (counts[u.role] !== undefined) counts[u.role]++; });

  return (
    <div className="users-page fade-in">
      {toast && (
        <div className={`toast toast-${toast.type} fade-in-fast`}>
          {toast.type === 'success'
            ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="var(--green)" strokeWidth="1.5"/><path d="M5 8l2.5 2.5L11 5.5" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="var(--red)" strokeWidth="1.5"/><path d="M8 5v3.5M8 11v.5" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round"/></svg>
          }
          {toast.msg}
        </div>
      )}

      {confirmDelete && (
        <div className="modal-overlay fade-in-fast" onClick={() => setConfirmDelete(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Delete this user?</h3>
            <p className="modal-body">This will permanently remove the user and cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDelete(confirmDelete)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">{users.length} total users</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(v => !v)}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          {showForm ? 'Cancel' : 'Add User'}
        </button>
      </div>

      {/* Summary row */}
      <div className="role-summary">
        {Object.entries(counts).map(([role, count]) => {
          const rc = ROLE_COLOR[role];
          return (
            <div key={role} className="role-pill" style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.color}33` }}>
              <span className="status-dot" style={{ background: rc.color }} />
              {count} {role}{count !== 1 ? 's' : ''}
            </div>
          );
        })}
      </div>

      {/* Create user form */}
      {showForm && (
        <div className="project-form-card fade-in">
          <h2 className="form-title">Register New User</h2>
          <form onSubmit={handleCreate} className="project-form">
            <div className="form-grid">
              <div className="field-group">
                <label className="field-label">Full Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John Smith" required />
              </div>
              <div className="field-group">
                <label className="field-label">Email *</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="john@company.com" required />
              </div>
              <div className="field-group">
                <label className="field-label">Role *</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="client">Client</option>
                  <option value="technician">Technician</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Phone</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+91 98765 43210" />
              </div>
              <div className="field-group">
                <label className="field-label">Password *</label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" required minLength={6} />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? <span className="btn-loading"><span className="spinner-sm" />Creating…</span> : 'Create User'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" className="search-icon">
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M10 10l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input className="search-input" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-tabs">
          {['All', 'admin', 'technician', 'client'].map(r => (
            <button
              key={r}
              className={`filter-tab ${filterRole === r ? 'filter-tab-active' : ''}`}
              onClick={() => setFilterRole(r)}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      {loading ? (
        <div className="page-loading"><div className="spinner-lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <circle cx="18" cy="14" r="7" stroke="var(--text-dim)" strokeWidth="1.5"/>
            <path d="M4 36c0-7.732 6.268-12 14-12s14 4.268 14 12" stroke="var(--text-dim)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <p>No users found</p>
        </div>
      ) : (
        <div className="users-table-wrap">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Registration Code</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Joined</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const rc = ROLE_COLOR[u.role] || ROLE_COLOR.client;
                return (
                  <tr key={u.id} className="fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                    <td>
                      <div className="user-cell">
                        <div className="table-avatar" style={{ background: rc.bg, color: rc.color }}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="user-cell-name">{u.name}</div>
                          <div className="user-cell-email">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="code-badge">{u.registration_code}</span>
                    </td>
                    <td>
                      <span className="status-badge" style={{ background: rc.bg, color: rc.color }}>
                        <span className="status-dot" style={{ background: rc.color }} />
                        {u.role}
                      </span>
                    </td>
                    <td className="phone-cell">{u.phone || <span style={{ color: 'var(--text-dim)' }}>—</span>}</td>
                    <td className="date-cell">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td>
                      {u.id !== user.id && (
                        <button className="btn-danger" onClick={() => setConfirmDelete(u.id)}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            <path d="M2 3h8M5 3V2h2v1M3.5 3l.5 7h4l.5-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
