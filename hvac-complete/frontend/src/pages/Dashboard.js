import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import './Dashboard.css';

const STAGES = [
  'Requirement Submitted',
  'Site Inspection',
  'Quotation Generated',
  'Technician Assigned',
  'Installation In Progress',
  'Quality Check',
  'Completed',
];

const STATUS_COLOR = {
  'Requirement Submitted': { bg: 'var(--accent-dim)', color: 'var(--accent)', dot: 'var(--accent)' },
  'Site Inspection': { bg: 'var(--purple-dim)', color: 'var(--purple)', dot: 'var(--purple)' },
  'Quotation Generated': { bg: 'var(--amber-dim)', color: 'var(--amber)', dot: 'var(--amber)' },
  'Technician Assigned': { bg: 'var(--amber-dim)', color: 'var(--amber)', dot: 'var(--amber)' },
  'Installation In Progress': { bg: 'rgba(255,184,0,0.15)', color: '#ffb800', dot: '#ffb800' },
  'Quality Check': { bg: 'var(--purple-dim)', color: 'var(--purple)', dot: 'var(--purple)' },
  'Completed': { bg: 'var(--green-dim)', color: 'var(--green)', dot: 'var(--green)' },
};

function StatCard({ label, value, sub, color, icon }) {
  return (
    <div className="stat-card fade-in">
      <div className="stat-icon" style={{ background: color + '20', color }}>{icon}</div>
      <div className="stat-body">
        <div className="stat-value" style={{ color }}>{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

function ProgressBar({ percent, color }) {
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${percent}%`, background: color || 'var(--accent)' }} />
    </div>
  );
}

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));

    async function load() {
      try {
        const [proj] = await Promise.all([api.getProjects()]);
        setProjects(proj || []);
        if (JSON.parse(stored || '{}').role === 'admin') {
          const s = await api.getStats();
          setStats(s);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const userRole = user?.role;

  // Count by status for client/tech
  const statusCounts = projects.reduce((acc, p) => {
    acc[p.status] = (acc[p.status] || 0) + 1;
    return acc;
  }, {});

  const completedPct = projects.length
    ? Math.round((statusCounts['Completed'] || 0) / projects.length * 100)
    : 0;

  const recent = [...projects].slice(0, 5);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner-lg" />
      </div>
    );
  }

  return (
    <div className="dashboard fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            {userRole === 'admin' ? 'Operations Overview' : userRole === 'technician' ? 'My Assignments' : 'My Projects'}
          </h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {userRole === 'admin' && (
          <Link to="/app/projects" className="btn-primary" style={{ textDecoration: 'none' }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            New Project
          </Link>
        )}
      </div>

      {/* Admin stats */}
      {userRole === 'admin' && stats && (
        <div className="stats-grid">
          <StatCard
            label="Total Projects"
            value={stats.total_projects}
            color="var(--accent)"
            icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 6a2 2 0 012-2h3l2 2h5a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" stroke="currentColor" strokeWidth="1.5"/></svg>}
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            sub={`${stats.total_projects ? Math.round(stats.completed/stats.total_projects*100) : 0}% of total`}
            color="var(--green)"
            icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M6.5 10l2.5 2.5L13.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          />
          <StatCard
            label="In Progress"
            value={stats.in_progress}
            color="var(--amber)"
            icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2"/><path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            color="var(--red)"
            icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M10 6v5M10 14v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
          />
          <StatCard
            label="Clients"
            value={stats.total_clients}
            color="var(--purple)"
            icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.5"/><path d="M2 18c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M15 10c1.657 0 3 .895 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>}
          />
          <StatCard
            label="Technicians"
            value={stats.total_technicians}
            color="var(--amber)"
            icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2a3 3 0 100 6 3 3 0 000-6zM4 14c0-2.21 2.686-4 6-4s6 1.79 6 4v2H4v-2z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/></svg>}
          />
        </div>
      )}

      {/* Non-admin quick stats */}
      {userRole !== 'admin' && (
        <div className="stats-grid stats-grid-sm">
          <StatCard
            label="Total Assigned"
            value={projects.length}
            color="var(--accent)"
            icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 6a2 2 0 012-2h3l2 2h5a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V6z" stroke="currentColor" strokeWidth="1.5"/></svg>}
          />
          <StatCard
            label="Completed"
            value={statusCounts['Completed'] || 0}
            color="var(--green)"
            icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5"/><path d="M6.5 10l2.5 2.5L13.5 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
          />
          <StatCard
            label="In Progress"
            value={statusCounts['Installation In Progress'] || 0}
            color="var(--amber)"
            icon={<svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 2"/></svg>}
          />
          <div className="stat-card fade-in" style={{ gridColumn: 'span 1' }}>
            <div className="stat-body" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="stat-label">Overall Completion</span>
                <span className="stat-value" style={{ color: 'var(--green)', fontSize: '1rem' }}>{completedPct}%</span>
              </div>
              <ProgressBar percent={completedPct} color="var(--green)" />
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-body">
        {/* Recent Projects */}
        <div className="dash-section">
          <div className="section-header">
            <h2 className="section-title">Recent Projects</h2>
            <Link to="/app/projects" className="section-link">View all →</Link>
          </div>

          {recent.length === 0 ? (
            <div className="empty-state">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect x="6" y="10" width="28" height="24" rx="3" stroke="var(--text-dim)" strokeWidth="1.5"/>
                <path d="M14 8V6M26 8V6M6 18h28" stroke="var(--text-dim)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <p>No projects yet</p>
              {userRole === 'admin' && <Link to="/app/projects" className="btn-primary" style={{ textDecoration: 'none', marginTop: 12 }}>Create First Project</Link>}
            </div>
          ) : (
            <div className="recent-list">
              {recent.map((p, i) => {
                const sc = STATUS_COLOR[p.status] || STATUS_COLOR['Requirement Submitted'];
                const pct = Math.round(((STAGES.indexOf(p.status) + 1) / STAGES.length) * 100);
                return (
                  <div key={p.id} className="recent-row fade-in" style={{ animationDelay: `${i * 0.05}s` }}>
                    <div className="recent-id">#{p.id}</div>
                    <div className="recent-info">
                      <div className="recent-title">
                        {p.ac_type} — {p.room_area} sq ft, {p.floor} floor
                      </div>
                      <div className="recent-meta">
                        {p.client?.name && <span>{p.client.name}</span>}
                        {p.recommended_ton && <span>· {p.recommended_ton}</span>}
                        {p.cooling_load && <span>· {p.cooling_load.toLocaleString()} BTU</span>}
                      </div>
                    </div>
                    <div className="recent-progress">
                      <ProgressBar percent={pct} color={sc.color} />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>{pct}%</span>
                    </div>
                    <div className="status-badge" style={{ background: sc.bg, color: sc.color }}>
                      <span className="status-dot" style={{ background: sc.dot }} />
                      {p.status}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Status breakdown */}
        {(userRole === 'admin' || projects.length > 0) && (
          <div className="dash-section dash-section-sm">
            <div className="section-header">
              <h2 className="section-title">By Status</h2>
            </div>
            <div className="status-breakdown">
              {STAGES.map(stage => {
                const count = statusCounts[stage] || 0;
                const sc = STATUS_COLOR[stage];
                const pct = projects.length ? Math.round(count / projects.length * 100) : 0;
                return (
                  <div key={stage} className="breakdown-row">
                    <div className="breakdown-label">
                      <span className="status-dot" style={{ background: sc?.dot || 'var(--text-dim)' }} />
                      <span>{stage}</span>
                    </div>
                    <div className="breakdown-bar">
                      <div className="breakdown-fill" style={{ width: `${pct}%`, background: sc?.color || 'var(--text-dim)' }} />
                    </div>
                    <span className="breakdown-count" style={{ color: sc?.color || 'var(--text-muted)' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
