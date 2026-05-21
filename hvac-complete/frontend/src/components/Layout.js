import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import './Layout.css';

const NAV = [
  {
    to: '/app',
    end: true,
    label: 'Dashboard',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="1" y="1" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10" y="1" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="1" y="10" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/>
        <rect x="10" y="10" width="7" height="7" rx="2" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    to: '/app/projects',
    label: 'Projects',
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M2 5a2 2 0 012-2h3l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    to: '/app/users',
    label: 'Users',
    adminOnly: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="7" cy="6" r="3" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M1 16c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M13 8c1.657 0 3 .895 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M11.5 2.5a3 3 0 010 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function Layout() {
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const roleColor = { admin: 'var(--purple)', technician: 'var(--amber)', client: 'var(--green)' };
  const userRole = user?.role || 'client';

  return (
    <div className="layout">
      {/* Mobile overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="8" fill="var(--accent)" fillOpacity="0.15"/>
              <path d="M8 20 C8 14 14 10 16 10 C18 10 24 14 24 20" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 24 L12 18 M20 24 L20 18" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
              <path d="M10 18 L22 18" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="16" cy="10" r="2" fill="var(--accent)"/>
            </svg>
            <span className="sidebar-brand-name">HVAC<span>Ops</span></span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV.filter(n => !n.adminOnly || userRole === 'admin').map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {user && (
            <div className="user-card">
              <div className="user-avatar">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="user-info">
                <div className="user-name">{user.name}</div>
                <div className="user-role" style={{ color: roleColor[userRole] || 'var(--text-muted)' }}>
                  {user.registration_code}
                </div>
              </div>
            </div>
          )}
          <button className="logout-btn" onClick={logout}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M10.5 11L14 8l-3.5-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <button className="menu-toggle" onClick={() => setSidebarOpen(v => !v)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
          <div className="topbar-right">
            {user && (
              <div className="topbar-user">
                <span className="role-badge" style={{ background: roleColor[userRole] + '22', color: roleColor[userRole] || 'var(--text-muted)', border: `1px solid ${roleColor[userRole]}44` }}>
                  {userRole}
                </span>
                <span className="topbar-name">{user.name}</span>
              </div>
            )}
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
