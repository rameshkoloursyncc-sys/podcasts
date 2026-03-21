/**
 * API service layer — real HTTP implementation.
 *
 * All endpoints follow the API docs:
 *   Base URL: http://localhost:8000/api  (or VITE_API_BASE_URL)
 *   Auth: Bearer token via Sanctum
 *   Response envelope: { success, message, data }
 *   Paginated lists:   { success, message, data: { data: [...], meta: {...}, links: {...} } }
 *
 * The http client in config/index.js already unwraps `response.data`, so:
 *   - For single resources:  http client returns the object directly
 *   - For paginated lists:   http client returns { data: [...], meta, links }
 *   - We call extractList() to pull out the array from paginated responses
 */

import { http, setToken } from '../api/config/index.js';
import { ENDPOINTS } from '../api/contstans/endpoints.js';

/**
 * Paginated list responses from the API look like:
 *   { data: [...], meta: { current_page, per_page, total }, links: {...} }
 * After the http client unwraps the outer envelope, we get that shape.
 * This helper returns just the array.
 */
function extractList(res) {
  if (Array.isArray(res)) return res;
  if (res && Array.isArray(res.data)) return res.data;
  return [];
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Creates a new tenant + owner account, returns { token, user, tenant }.
 * Body (snake_case per API docs):
 *   { tenant_name, tenant_slug, display_name, email, password, password_confirmation }
 */
export async function registerUser(payload) {
  const data = await http.post(ENDPOINTS.REGISTER, payload);
  setToken(data.token);
  return data; // { token, user, tenant }
}

/**
 * POST /api/auth/login
 * Returns { token, user, tenant } — token stored automatically.
 */
export async function loginUser(email, password) {
  const data = await http.post(ENDPOINTS.LOGIN, { email, password });
  // data is already unwrapped from the outer { success, message, data } envelope
  setToken(data.token);
  return data; // { token, user, tenant }
}

/**
 * POST /api/auth/logout
 * Revokes the current token.
 */
export async function logoutUser() {
  try { await http.post(ENDPOINTS.LOGOUT, {}); } catch (_) { }
  setToken(null);
}

/**
 * GET /api/auth/me
 * Returns the current authenticated user object.
 */
export async function getMe() {
  return await http.get(ENDPOINTS.ME);
}

/**
 * PATCH /api/auth/me
 * Update current user profile / password.
 */
export async function updateMe(payload) {
  return await http.patch(ENDPOINTS.ME, payload);
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

/**
 * GET /api/dashboard
 * Returns stats snapshot: totals, pipeline counts, upcoming bookings.
 */
export async function getDashboard() {
  return await http.get(ENDPOINTS.DASHBOARD);
}

// ─── Users ───────────────────────────────────────────────────────────────────

/**
 * GET /api/users
 * List all team members (admin only).
 */
export async function getUsers() {
  const res = await http.get(ENDPOINTS.USERS);
  return extractList(res);
}

/**
 * GET /api/users/{id}
 */
export async function getUserById(id) {
  return await http.get(ENDPOINTS.USER_BY_ID(id));
}

/**
 * POST /api/users
 * Invite a team member (admin only).
 */
export async function createUser(payload) {
  return await http.post(ENDPOINTS.USERS, payload);
}

/**
 * PATCH /api/users/{id}
 */
export async function updateUser(id, payload) {
  return await http.patch(ENDPOINTS.USER_BY_ID(id), payload);
}

/**
 * DELETE /api/users/{id}
 */
export async function deleteUser(id) {
  return await http.delete(ENDPOINTS.USER_BY_ID(id));
}

// ─── Pipeline Stages ─────────────────────────────────────────────────────────

/**
 * GET /api/pipeline-stages
 * Returns list of stages with guest counts.
 */
export async function getPipelineStages() {
  const res = await http.get(ENDPOINTS.PIPELINE_STAGES);
  return extractList(res);
}

/**
 * GET /api/pipeline-stages/{id}
 */
export async function getPipelineStageById(id) {
  return await http.get(ENDPOINTS.PIPELINE_STAGE_BY_ID(id));
}

/**
 * POST /api/pipeline-stages
 * Create a stage (admin only).
 */
export async function createPipelineStage(payload) {
  return await http.post(ENDPOINTS.PIPELINE_STAGES, payload);
}

/**
 * PATCH /api/pipeline-stages/{id}
 * Update label/order (admin only).
 */
export async function updatePipelineStage(id, payload) {
  return await http.patch(ENDPOINTS.PIPELINE_STAGE_BY_ID(id), payload);
}

/**
 * DELETE /api/pipeline-stages/{id}
 * Delete stage — only if empty (admin only).
 */
export async function deletePipelineStage(id) {
  return await http.delete(ENDPOINTS.PIPELINE_STAGE_BY_ID(id));
}

/**
 * POST /api/pipeline-stages/reorder
 * Body: { stages: ["uuid-1", "uuid-2", ...] }
 */
export async function reorderPipelineStages(stageIds) {
  return await http.post(ENDPOINTS.PIPELINE_STAGES_REORDER, { stages: stageIds });
}

// ─── Guests ──────────────────────────────────────────────────────────────────

/**
 * GET /api/guests
 * Query params: stage_id, search, sort_by, sort_dir, per_page, page
 */
export async function getGuests(params = {}) {
  const url = new URL(ENDPOINTS.GUESTS);
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null) url.searchParams.set(k, v); });
  const res = await http.get(url.toString());
  return extractList(res);
}

/**
 * GET /api/guests/{id}
 * Returns guest with episodes, bookings, notes.
 */
export async function getGuestById(id) {
  return await http.get(ENDPOINTS.GUEST_BY_ID(id));
}

/**
 * POST /api/guests
 * Body: { name, email, bio, stage_id, avatar_url }
 */
export async function createGuest(payload) {
  return await http.post(ENDPOINTS.GUESTS, payload);
}

/**
 * PATCH /api/guests/{id}
 */
export async function updateGuest(id, payload) {
  return await http.patch(ENDPOINTS.GUEST_BY_ID(id), payload);
}

/**
 * DELETE /api/guests/{id}
 * Soft-delete.
 */
export async function deleteGuest(id) {
  return await http.delete(ENDPOINTS.GUEST_BY_ID(id));
}

/**
 * PATCH /api/guests/{id}/move
 * Body: { stage_id: "uuid-of-target-stage" }
 */
export async function moveGuest(id, stageId) {
  return await http.patch(ENDPOINTS.GUEST_MOVE(id), { stage_id: stageId });
}

// ─── Episodes ────────────────────────────────────────────────────────────────

/**
 * GET /api/episodes
 * Query params: guest_id, status, search, sort_by, sort_dir, per_page
 * Statuses: draft | scheduled | recorded | published
 */
export async function getEpisodes(params = {}) {
  const url = new URL(ENDPOINTS.EPISODES);
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null) url.searchParams.set(k, v); });
  const res = await http.get(url.toString());
  return extractList(res);
}

/**
 * GET /api/episodes/{id}
 * Returns episode with guest, booking, notes.
 */
export async function getEpisodeById(id) {
  return await http.get(ENDPOINTS.EPISODE_BY_ID(id));
}

/**
 * POST /api/episodes
 * Body: { title, guest_id, status, recorded_at, published_at }
 */
export async function createEpisode(payload) {
  return await http.post(ENDPOINTS.EPISODES, payload);
}

/**
 * PATCH /api/episodes/{id}
 * Full update.
 */
export async function updateEpisode(id, payload) {
  return await http.patch(ENDPOINTS.EPISODE_BY_ID(id), payload);
}

/**
 * PATCH /api/episodes/{id}/status
 * Update status only.  Body: { status: "published" }
 */
export async function updateEpisodeStatus(id, status) {
  return await http.patch(ENDPOINTS.EPISODE_STATUS(id), { status });
}

/**
 * DELETE /api/episodes/{id}
 * Soft-delete.
 */
export async function deleteEpisode(id) {
  return await http.delete(ENDPOINTS.EPISODE_BY_ID(id));
}

// ─── Bookings ────────────────────────────────────────────────────────────────

/**
 * GET /api/bookings
 * Query params: guest_id, episode_id, status, from, to, sort_by, sort_dir, per_page
 * Statuses: pending | confirmed | completed | cancelled
 */
export async function getBookings(params = {}) {
  const url = new URL(ENDPOINTS.BOOKINGS);
  Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null) url.searchParams.set(k, v); });
  const res = await http.get(url.toString());
  return extractList(res);
}

/**
 * GET /api/bookings/{id}
 * Returns booking with guest, episode, notes.
 */
export async function getBookingById(id) {
  return await http.get(ENDPOINTS.BOOKING_BY_ID(id));
}

/**
 * POST /api/bookings
 * Body: { guest_id, episode_id, scheduled_at, duration_minutes }
 */
export async function createBooking(payload) {
  return await http.post(ENDPOINTS.BOOKINGS, payload);
}

/**
 * PATCH /api/bookings/{id}
 * Full update.
 */
export async function updateBooking(id, payload) {
  return await http.patch(ENDPOINTS.BOOKING_BY_ID(id), payload);
}

/**
 * DELETE /api/bookings/{id}
 * Soft-delete.
 */
export async function deleteBooking(id) {
  return await http.delete(ENDPOINTS.BOOKING_BY_ID(id));
}

/**
 * PATCH /api/bookings/{id}/confirm
 * Mark as confirmed.
 */
export async function confirmBooking(id) {
  return await http.patch(ENDPOINTS.BOOKING_CONFIRM(id), {});
}

/**
 * PATCH /api/bookings/{id}/cancel
 * Mark as cancelled.
 */
export async function cancelBooking(id) {
  return await http.patch(ENDPOINTS.BOOKING_CANCEL(id), {});
}

/**
 * PATCH /api/bookings/{id}/complete
 * Mark as completed.
 */
export async function completeBooking(id) {
  return await http.patch(ENDPOINTS.BOOKING_COMPLETE(id), {});
}

// ─── Notes ───────────────────────────────────────────────────────────────────

/**
 * GET /api/notes?entity_type=guest&entity_id=uuid
 * List notes for a specific entity.
 */
export async function getNotes(entityType, entityId) {
  const url = new URL(ENDPOINTS.NOTES);
  if (entityType) url.searchParams.set('entity_type', entityType);
  if (entityId)   url.searchParams.set('entity_id', entityId);
  const res = await http.get(url.toString());
  return extractList(res);
}

/**
 * GET /api/notes/{id}
 */
export async function getNoteById(id) {
  return await http.get(ENDPOINTS.NOTE_BY_ID(id));
}

/**
 * POST /api/notes
 * Body: { entity_type, entity_id, body }
 */
export async function createNote(payload) {
  return await http.post(ENDPOINTS.NOTES, payload);
}

/**
 * PATCH /api/notes/{id}
 * Edit note (author or admin only).
 */
export async function updateNote(id, payload) {
  return await http.patch(ENDPOINTS.NOTE_BY_ID(id), payload);
}

/**
 * DELETE /api/notes/{id}
 * Delete note (author or admin only).
 */
export async function deleteNote(id) {
  return await http.delete(ENDPOINTS.NOTE_BY_ID(id));
}

// ─── Mail (placeholder — implement endpoint when ready) ──────────────────────
export function sendMail(_payload) {
  // TODO: implement when backend /mail endpoint is ready
  return Promise.resolve(null);
}
