// src/utils/api.js
const BASE = '/api';

export async function apiFetch(path, options = {}) {
const token = localStorage.getItem('admin_token') || localStorage.getItem('user_token');
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// Generate a stable session ID for likes
export function getSessionId() {
  let sid = localStorage.getItem('session_id');
  if (!sid) {
    sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('session_id', sid);
  }
  return sid;
}

// Slug helper
export function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}
