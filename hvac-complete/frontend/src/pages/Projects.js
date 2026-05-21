import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../api';
import './Projects.css';

const STAGES = [
  'Requirement Submitted',
  'Site Inspection',
  'Quotation Generated',
  'Technician Assigned',
  'Installation In Progress',
  'Quality Check',
  'Completed',
];

const TECH_STAGES = ['Installation In Progress', 'Quality Check', 'Completed'];

const STATUS_COLOR = {
  'Requirement Submitted': { bg: 'var(--accent-dim)', color: 'var(--accent)' },
  'Site Inspection': { bg: 'var(--purple-dim)', color: 'var(--purple)' },
  'Quotation Generated': { bg: 'var(--amber-dim)', color: 'var(--amber)' },
  'Technician Assigned': { bg: 'var(--amber-dim)', color: 'var(--amber)' },
  'Installation In Progress': { bg: 'rgba(255,184,0,0.15)', color: '#ffb800' },
  'Quality Check': { bg: 'var(--purple-dim)', color: 'var(--purple)' },
  'Completed': { bg: 'var(--green-dim)', color: 'var(--green)' },
};

const AC_TYPES = ['Split AC', 'Cassette AC', 'Ducted AC', 'Window AC', 'Tower AC', 'VRF System'];
const FLOORS = ['Ground', 'First', 'Second', 'Third', 'Fourth', 'Top', 'Terrace'];

export default function Projects() {
  const [user] = useState(() => JSON.parse(localStorage.getItem('user') || '{}'));
  const [projects, setProjects] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const [form, setForm] = useState({
    client_id: '', room_area: '', floor: 'Ground', windows: '', ac_type: 'Split AC', notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const proj = await api.getProjects();
      setProjects(proj || []);
      if (user.role === 'admin') {
        const [techs, cls] = await Promise.all([api.getTechnicians(), api.getClients()]);
        setTechnicians(techs || []);
        setClients(cls || []);
      }
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [user.role]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleCreateProject = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createProject({
        client_id: parseInt(form.client_id),
        room_area: parseInt(form.room_area),
        floor: form.floor,
        windows: parseInt(form.windows),
        ac_type: form.ac_type,
        notes: form.notes || undefined,
      });
      showToast('Project created successfully!');
      setShowForm(false);
      setForm({ client_id: '', room_area: '', floor: 'Ground', windows: '', ac_type: 'Split AC', notes: '' });
      loadData();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssign = async (projectId, technicianId) => {
    if (!technicianId) return;
    try {
      await api.assignTechnician(projectId, parseInt(technicianId));
      showToast('Technician assigned!');
      loadData();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const handleStatusUpdate = async (projectId, newStatus) => {
    if (!newStatus) return;
    try {
      await api.updateStatus(projectId, newStatus);
      showToast('Status updated!');
      loadData();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const handleDelete = async id => {
    try {
      await api.deleteProject(id);
      setConfirmDelete(null);
      showToast('Project deleted.');
      loadData();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const filtered = projects.filter(p => {
    const matchStatus = filterStatus === 'All' || p.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !q ||
      String(p.id).includes(q) ||
      p.ac_type?.toLowerCase().includes(q) ||
      p.client?.name?.toLowerCase().includes(q) ||
      p.floor?.toLowerCase().includes(q) ||
      p.status?.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const role = user.role;

  return (
    <div className="projects-page fade-in">
      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type} fade-in-fast`}>
          {toast.type === 'success'
            ? <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="var(--green)" strokeWidth="1.5"/><path d="M5 8l2.5 2.5L11 5.5" stroke="var(--green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            : <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7" stroke="var(--red)" strokeWidth="1.5"/><path d="M8 5v3.5M8 11v.5" stroke="var(--red)" strokeWidth="1.5" strokeLinecap="round"/></svg>
          }
          {toast.msg}
        </div>
      )}

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="modal-overlay fade-in-fast" onClick={() => setConfirmDelete(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <h3 className="modal-title">Delete Project #{confirmDelete}?</h3>
            <p className="modal-body">This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => handleDelete(confirmDelete)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{filtered.length} project{filtered.length !== 1 ? 's' : ''} shown</p>
        </div>
        {role === 'admin' && (
          <button className="btn-primary" onClick={() => setShowForm(v => !v)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            {showForm ? 'Cancel' : 'New Project'}
          </button>
        )}
      </div>

      {/* Create form */}
      {showForm && role === 'admin' && (
        <div className="project-form-card fade-in">
          <h2 className="form-title">New Installation Project</h2>
          <form onSubmit={handleCreateProject} className="project-form">
            <div className="form-grid">
              <div className="field-group">
                <label className="field-label">Client *</label>
                <select value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))} required>
                  <option value="">Select client…</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.registration_code} — {c.name}</option>
                  ))}
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">AC Type *</label>
                <select value={form.ac_type} onChange={e => setForm(f => ({ ...f, ac_type: e.target.value }))}>
                  {AC_TYPES.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Room Area (sq ft) *</label>
                <input type="number" min="1" value={form.room_area} onChange={e => setForm(f => ({ ...f, room_area: e.target.value }))} placeholder="e.g. 200" required />
              </div>
              <div className="field-group">
                <label className="field-label">Floor *</label>
                <select value={form.floor} onChange={e => setForm(f => ({ ...f, floor: e.target.value }))}>
                  {FLOORS.map(fl => <option key={fl}>{fl}</option>)}
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Number of Windows *</label>
                <input type="number" min="0" value={form.windows} onChange={e => setForm(f => ({ ...f, windows: e.target.value }))} placeholder="e.g. 2" required />
              </div>
              <div className="field-group">
                <label className="field-label">Notes</label>
                <input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Optional notes…" />
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? <span className="btn-loading"><span className="spinner-sm" />Creating…</span> : 'Create Project'}
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
          <input
            className="search-input"
            placeholder="Search projects…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="filter-tabs">
          {['All', ...STAGES].map(s => (
            <button
              key={s}
              className={`filter-tab ${filterStatus === s ? 'filter-tab-active' : ''}`}
              onClick={() => setFilterStatus(s)}
            >
              {s === 'All' ? 'All' : s.split(' ').slice(0, 2).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Project cards */}
      {loading ? (
        <div className="page-loading"><div className="spinner-lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M6 12a3 3 0 013-3h7l3 3h12a3 3 0 013 3v14a3 3 0 01-3 3H9a3 3 0 01-3-3V12z" stroke="var(--text-dim)" strokeWidth="1.5"/>
          </svg>
          <p>No projects found</p>
        </div>
      ) : (
        <div className="projects-grid">
          {filtered.map((p, i) => {
            const sc = STATUS_COLOR[p.status] || STATUS_COLOR['Requirement Submitted'];
            const stageIdx = STAGES.indexOf(p.status);
            const pct = Math.round(((stageIdx + 1) / STAGES.length) * 100);
            const assignedTech = technicians.find(t => t.id === p.technician_id);

            return (
              <div key={p.id} className="project-card fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                <div className="project-card-header">
                  <div className="project-id">Project #{p.id}</div>
                  <div className="status-badge" style={{ background: sc.bg, color: sc.color }}>
                    <span className="status-dot" style={{ background: sc.color }} />
                    {p.status}
                  </div>
                  {role === 'admin' && (
                    <button className="btn-danger" style={{ marginLeft: 'auto' }} onClick={() => setConfirmDelete(p.id)}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 3h8M5 3V2h2v1M3.5 3l.5 7h4l.5-7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Delete
                    </button>
                  )}
                </div>

                <div className="project-details">
                  <div className="detail-row">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 5a2 2 0 012-2h2l1.5 1.5H11a2 2 0 012 2v3a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" stroke="var(--text-muted)" strokeWidth="1.2"/></svg>
                    <span className="detail-label">AC Type</span>
                    <span className="detail-value">{p.ac_type}</span>
                  </div>
                  <div className="detail-row">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="2" stroke="var(--text-muted)" strokeWidth="1.2"/><path d="M4 7h6M7 4v6" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    <span className="detail-label">Area</span>
                    <span className="detail-value">{p.room_area} sq ft · {p.floor} floor · {p.windows} windows</span>
                  </div>
                  <div className="detail-row">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1l1.5 4h4l-3 2.5 1 4L7 9l-3.5 2.5 1-4L1 5h4z" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinejoin="round"/></svg>
                    <span className="detail-label">Load</span>
                    <span className="detail-value">{p.cooling_load?.toLocaleString()} BTU · {p.recommended_ton}</span>
                  </div>
                  {p.client && (
                    <div className="detail-row">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="2.5" stroke="var(--text-muted)" strokeWidth="1.2"/><path d="M2 13c0-2.761 2.239-4 5-4s5 1.239 5 4" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                      <span className="detail-label">Client</span>
                      <span className="detail-value">{p.client.name} <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>({p.client.registration_code})</span></span>
                    </div>
                  )}
                  <div className="detail-row">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="var(--text-muted)" strokeWidth="1.2"/><circle cx="7" cy="7" r="2" fill="var(--text-muted)"/></svg>
                    <span className="detail-label">Technician</span>
                    <span className="detail-value">
                      {assignedTech ? `${assignedTech.name} (${assignedTech.registration_code})` : p.technician ? `${p.technician.name}` : <span style={{ color: 'var(--text-dim)' }}>Not assigned</span>}
                    </span>
                  </div>
                  {p.notes && (
                    <div className="detail-row">
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 2h10v10H2z" stroke="var(--text-muted)" strokeWidth="1.2" rx="1.5"/><path d="M4 5h6M4 7h4" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round"/></svg>
                      <span className="detail-label">Notes</span>
                      <span className="detail-value notes-text">{p.notes}</span>
                    </div>
                  )}
                </div>

                {/* Progress */}
                <div className="project-progress">
                  <div className="progress-stages">
                    {STAGES.map((stage, idx) => (
                      <div key={stage} className={`stage-dot ${idx <= stageIdx ? 'stage-done' : ''} ${idx === stageIdx ? 'stage-current' : ''}`} title={stage} style={idx === stageIdx ? { background: sc.color, boxShadow: `0 0 8px ${sc.color}` } : {}} />
                    ))}
                  </div>
                  <div className="progress-track" style={{ marginTop: 6 }}>
                    <div className="progress-fill" style={{ width: `${pct}%`, background: sc.color }} />
                  </div>
                  <div className="progress-label">
                    <span>{p.status}</span>
                    <span>{pct}%</span>
                  </div>
                </div>

                {/* Admin controls */}
                {role === 'admin' && (
                  <div className="project-controls">
                    <div className="control-group">
                      <label className="control-label">Assign Technician</label>
                      <select
                        defaultValue={p.technician_id || ''}
                        onChange={e => handleAssign(p.id, e.target.value)}
                      >
                        <option value="">— Select technician —</option>
                        {technicians.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.registration_code})</option>
                        ))}
                      </select>
                    </div>
                    <div className="control-group">
                      <label className="control-label">Update Status</label>
                      <select defaultValue="" onChange={e => handleStatusUpdate(p.id, e.target.value)}>
                        <option value="" disabled>— Change status —</option>
                        {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {/* Technician controls */}
                {role === 'technician' && p.technician_id === user.id && (
                  <div className="project-controls">
                    <div className="control-group">
                      <label className="control-label">Update Work Status</label>
                      <select defaultValue="" onChange={e => handleStatusUpdate(p.id, e.target.value)}>
                        <option value="" disabled>— Update progress —</option>
                        {TECH_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
