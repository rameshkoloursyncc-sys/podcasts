// All API endpoint paths — edit these to match your backend routes.
// Base URL is configured via VITE_API_BASE_URL in .env
// API Docs: https://podcast-api.busyparrot.com/api
// Base: POST /api/auth/login, GET /api/dashboard, etc.

const BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

export const API_BASE = BASE;

export const ENDPOINTS = {
  // Auth
  LOGIN:    `${BASE}/auth/login`,
  LOGOUT:   `${BASE}/auth/logout`,
  REGISTER: `${BASE}/auth/register`,
  ME:       `${BASE}/auth/me`,

  // Dashboard
  DASHBOARD: `${BASE}/dashboard`,

  // Users
  USERS:       `${BASE}/users`,
  USER_BY_ID:  (id) => `${BASE}/users/${id}`,

  // Pipeline stages
  PIPELINE_STAGES:        `${BASE}/pipeline-stages`,
  PIPELINE_STAGE_BY_ID:   (id) => `${BASE}/pipeline-stages/${id}`,
  PIPELINE_STAGES_REORDER: `${BASE}/pipeline-stages/reorder`,

  // Guests
  GUESTS:      `${BASE}/guests`,
  GUEST_BY_ID: (id) => `${BASE}/guests/${id}`,
  GUEST_MOVE:  (id) => `${BASE}/guests/${id}/move`,

  // Episodes
  EPISODES:       `${BASE}/episodes`,
  EPISODE_BY_ID:  (id) => `${BASE}/episodes/${id}`,
  EPISODE_STATUS: (id) => `${BASE}/episodes/${id}/status`,

  // Bookings
  BOOKING_CONFIRM:  (id) => `${BASE}/bookings/${id}/confirm`,
  BOOKING_CANCEL:   (id) => `${BASE}/bookings/${id}/cancel`,
  BOOKING_COMPLETE: (id) => `${BASE}/bookings/${id}/complete`,
  BOOKINGS:         `${BASE}/bookings`,
  BOOKING_BY_ID:    (id) => `${BASE}/bookings/${id}`,

  // Notes
  // GET /api/notes?entity_type=guest&entity_id=uuid
  NOTES:       `${BASE}/notes`,
  NOTE_BY_ID:  (id) => `${BASE}/notes/${id}`,
};
