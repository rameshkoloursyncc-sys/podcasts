/**
 * API layer: CRUD for all entities. Uses in-memory store for now.
 * Backend dev can implement same function signatures with REST calls.
 * Single module to keep interface in one place (Interface Segregation per SOLID).
 */

import { getSlice, setSlice } from '../data/store';

// --- Tenants ---
export function getTenants() {
  return Promise.resolve(getSlice('tenants'));
}

export function getTenantById(id) {
  const tenants = getSlice('tenants');
  return Promise.resolve(tenants.find((t) => t.id === id) ?? null);
}

// --- Users ---
export function getUsers(tenantId) {
  const users = getSlice('users');
  const list = tenantId ? users.filter((u) => u.tenantId === tenantId) : users;
  return Promise.resolve(list);
}

export function getUserById(id) {
  const users = getSlice('users');
  return Promise.resolve(users.find((u) => u.id === id) ?? null);
}

// --- Pipeline stages ---
export function getPipelineStages(tenantId) {
  const stages = getSlice('pipelineStages');
  const list = tenantId
    ? stages.filter((s) => s.tenantId === tenantId).sort((a, b) => a.order - b.order)
    : stages;
  return Promise.resolve(list);
}

// --- Guests ---
export function getGuests(tenantId) {
  const guests = getSlice('guests');
  const list = tenantId ? guests.filter((g) => g.tenantId === tenantId) : guests;
  return Promise.resolve(list);
}

export function getGuestById(id) {
  const guests = getSlice('guests');
  return Promise.resolve(guests.find((g) => g.id === id) ?? null);
}

export function createGuest(tenantId, payload) {
  const guests = getSlice('guests');
  const id = `guest-${Date.now()}`;
  const now = new Date().toISOString();
  const guest = {
    id,
    tenantId,
    stageId: payload.stageId ?? null,
    name: payload.name ?? '',
    email: payload.email ?? '',
    bio: payload.bio ?? '',
    avatarUrl: payload.avatarUrl ?? null,
    createdAt: now,
    updatedAt: now,
  };
  setSlice('guests', [...guests, guest]);
  return Promise.resolve(guest);
}

export function updateGuest(id, payload) {
  const guests = getSlice('guests');
  const idx = guests.findIndex((g) => g.id === id);
  if (idx === -1) return Promise.resolve(null);
  const updated = {
    ...guests[idx],
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  const next = [...guests];
  next[idx] = updated;
  setSlice('guests', next);
  return Promise.resolve(updated);
}

export function deleteGuest(id) {
  const guests = getSlice('guests').filter((g) => g.id !== id);
  setSlice('guests', guests);
  return Promise.resolve();
}

// --- Episodes ---
export function getEpisodes(tenantId) {
  const episodes = getSlice('episodes');
  const list = tenantId ? episodes.filter((e) => e.tenantId === tenantId) : episodes;
  return Promise.resolve(list);
}

export function getEpisodeById(id) {
  const episodes = getSlice('episodes');
  return Promise.resolve(episodes.find((e) => e.id === id) ?? null);
}

export function createEpisode(tenantId, payload) {
  const episodes = getSlice('episodes');
  const id = `ep-${Date.now()}`;
  const now = new Date().toISOString();
  const episode = {
    id,
    tenantId,
    guestId: payload.guestId ?? null,
    title: payload.title ?? '',
    status: payload.status ?? 'draft',
    recordedAt: payload.recordedAt ?? null,
    publishedAt: payload.publishedAt ?? null,
    createdAt: now,
    updatedAt: now,
  };
  setSlice('episodes', [...episodes, episode]);
  return Promise.resolve(episode);
}

export function updateEpisode(id, payload) {
  const episodes = getSlice('episodes');
  const idx = episodes.findIndex((e) => e.id === id);
  if (idx === -1) return Promise.resolve(null);
  const updated = {
    ...episodes[idx],
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  const next = [...episodes];
  next[idx] = updated;
  setSlice('episodes', next);
  return Promise.resolve(updated);
}

export function deleteEpisode(id) {
  const episodes = getSlice('episodes').filter((e) => e.id !== id);
  setSlice('episodes', episodes);
  return Promise.resolve();
}

// --- Bookings ---
export function getBookings(tenantId) {
  const bookings = getSlice('bookings');
  const list = tenantId ? bookings.filter((b) => b.tenantId === tenantId) : bookings;
  return Promise.resolve(list);
}

export function getBookingById(id) {
  const bookings = getSlice('bookings');
  return Promise.resolve(bookings.find((b) => b.id === id) ?? null);
}

export function createBooking(tenantId, payload) {
  const bookings = getSlice('bookings');
  const id = `book-${Date.now()}`;
  const now = new Date().toISOString();
  const booking = {
    id,
    tenantId,
    guestId: payload.guestId ?? null,
    episodeId: payload.episodeId ?? null,
    scheduledAt: payload.scheduledAt ?? now,
    durationMinutes: payload.durationMinutes ?? 60,
    status: payload.status ?? 'scheduled',
    createdAt: now,
    updatedAt: now,
  };
  setSlice('bookings', [...bookings, booking]);
  return Promise.resolve(booking);
}

export function updateBooking(id, payload) {
  const bookings = getSlice('bookings');
  const idx = bookings.findIndex((b) => b.id === id);
  if (idx === -1) return Promise.resolve(null);
  const updated = {
    ...bookings[idx],
    ...payload,
    updatedAt: new Date().toISOString(),
  };
  const next = [...bookings];
  next[idx] = updated;
  setSlice('bookings', next);
  return Promise.resolve(updated);
}

export function deleteBooking(id) {
  const bookings = getSlice('bookings').filter((b) => b.id !== id);
  setSlice('bookings', bookings);
  return Promise.resolve();
}

// --- Notes ---
export function getNotes(tenantId, entityType, entityId) {
  const notes = getSlice('notes');
  let list = tenantId ? notes.filter((n) => n.tenantId === tenantId) : notes;
  if (entityType) list = list.filter((n) => n.entityType === entityType);
  if (entityId) list = list.filter((n) => n.entityId === entityId);
  list = [...list].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return Promise.resolve(list);
}

export function createNote(tenantId, payload) {
  const notes = getSlice('notes');
  const id = `note-${Date.now()}`;
  const now = new Date().toISOString();
  const note = {
    id,
    tenantId,
    entityType: payload.entityType ?? 'guest',
    entityId: payload.entityId ?? '',
    authorId: payload.authorId ?? null,
    body: payload.body ?? '',
    createdAt: now,
  };
  setSlice('notes', [...notes, note]);
  return Promise.resolve(note);
}

export function deleteNote(id) {
  const notes = getSlice('notes').filter((n) => n.id !== id);
  setSlice('notes', notes);
  return Promise.resolve();
}
