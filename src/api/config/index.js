/**
 * Lightweight HTTP client wrapper.
 * - Automatically attaches Bearer token from sessionStorage.
 * - Throws a structured ApiError on non-2xx responses.
 * - Supports JSON request/response by default.
 *
 * Response envelope from API:
 *   { "success": true, "message": "OK", "data": { ... } }
 *
 * This client returns `json.data` when present, otherwise the full JSON.
 */

const TOKEN_KEY = 'pgfm_token';

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token);
  else sessionStorage.removeItem(TOKEN_KEY);
}

export class ApiError extends Error {
  constructor(status, message, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(url, options = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers ?? {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let data = null;
    try { data = await res.json(); } catch (_) { }
    throw new ApiError(res.status, data?.message ?? res.statusText, data);
  }

  // 204 No Content — return null
  if (res.status === 204) return null;

  const json = await res.json();

  // Unwrap the API envelope: { success, message, data: { ... } }
  // Return json.data if present, otherwise the raw JSON.
  return json?.data !== undefined ? json.data : json;
}

export const http = {
  get:    (url, opts = {})       => request(url, { ...opts, method: 'GET' }),
  post:   (url, body, opts = {}) => request(url, { ...opts, method: 'POST',  body: JSON.stringify(body) }),
  put:    (url, body, opts = {}) => request(url, { ...opts, method: 'PUT',   body: JSON.stringify(body) }),
  patch:  (url, body, opts = {}) => request(url, { ...opts, method: 'PATCH', body: JSON.stringify(body) }),
  delete: (url, opts = {})       => request(url, { ...opts, method: 'DELETE' }),
};
