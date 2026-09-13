// Client API Service for UniWorkload AI Backend

const API_BASE = '/api';

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    console.warn('[API] Health check unreachable:', err);
    return null;
  }
}

export async function fetchFacultyList() {
  try {
    const res = await fetch(`${API_BASE}/faculty`);
    if (!res.ok) throw new Error('Failed to fetch faculties');
    return await res.json();
  } catch (err) {
    console.warn('[API] Failed to fetch faculty from server:', err);
    return null;
  }
}

export async function createFaculty(facultyData) {
  const res = await fetch(`${API_BASE}/faculty`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(facultyData)
  });
  if (!res.ok) throw new Error('Failed to create faculty');
  return await res.json();
}

export async function fetchOrders(params = {}) {
  try {
    const query = new URLSearchParams();
    if (params.facultyId) query.set('facultyId', params.facultyId);
    if (params.category) query.set('category', params.category);
    if (params.status) query.set('status', params.status);
    if (params.search) query.set('search', params.search);
    if (params.startDate) query.set('startDate', params.startDate);
    if (params.endDate) query.set('endDate', params.endDate);

    const res = await fetch(`${API_BASE}/orders?${query.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch orders');
    return await res.json();
  } catch (err) {
    console.warn('[API] Failed to fetch orders from server:', err);
    return null;
  }
}

export async function createOrder(orderData) {
  const res = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  if (!res.ok) throw new Error('Failed to create order');
  return await res.json();
}

export async function updateOrder(id, orderData) {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });
  if (!res.ok) throw new Error('Failed to update order');
  return await res.json();
}

export async function deleteOrder(id) {
  const res = await fetch(`${API_BASE}/orders/${id}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('Failed to delete order');
  return await res.json();
}

export async function uploadEvidenceFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) throw new Error('Failed to upload file');
  return await res.json();
}

export async function fetchTunnelInfo() {
  try {
    const res = await fetch(`${API_BASE}/tunnel/info`);
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}
