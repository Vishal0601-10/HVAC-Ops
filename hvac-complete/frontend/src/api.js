const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

const getToken = () => localStorage.getItem('token');

const authHeaders = () => ({
  'Authorization': `Bearer ${getToken()}`,
  'Content-Type': 'application/json',
});

async function handleResponse(res) {
  if (res.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
    return;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || 'Request failed');
  return data;
}

export const api = {
  // Auth
  async login(email, password) {
    const body = new URLSearchParams({ username: email, password });
    const res = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${BASE_URL}/users/me`, { headers: authHeaders() });
    return handleResponse(res);
  },

  // Users
  async createUser(data) {
    const res = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getAllUsers() {
    const res = await fetch(`${BASE_URL}/users`, { headers: authHeaders() });
    return handleResponse(res);
  },

  async getTechnicians() {
    const res = await fetch(`${BASE_URL}/technicians`, { headers: authHeaders() });
    return handleResponse(res);
  },

  async getClients() {
    const res = await fetch(`${BASE_URL}/clients`, { headers: authHeaders() });
    return handleResponse(res);
  },

  async deleteUser(id) {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (res.status === 204) return true;
    return handleResponse(res);
  },

  // Projects
  async getProjects() {
    const res = await fetch(`${BASE_URL}/projects`, { headers: authHeaders() });
    return handleResponse(res);
  },

  async createProject(data) {
    const res = await fetch(`${BASE_URL}/projects`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async assignTechnician(projectId, technicianId) {
    const res = await fetch(`${BASE_URL}/projects/${projectId}/assign`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ technician_id: technicianId }),
    });
    return handleResponse(res);
  },

  async updateStatus(projectId, newStatus) {
    const res = await fetch(`${BASE_URL}/projects/${projectId}/status`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ new_status: newStatus }),
    });
    return handleResponse(res);
  },

  async deleteProject(id) {
    const res = await fetch(`${BASE_URL}/projects/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    });
    if (res.status === 204) return true;
    return handleResponse(res);
  },

  async getStats() {
    const res = await fetch(`${BASE_URL}/stats`, { headers: authHeaders() });
    return handleResponse(res);
  },
};
