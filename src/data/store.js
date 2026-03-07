/**
 * In-memory store with localStorage persistence.
 * Seed data is used on first load; all CRUD syncs to localStorage.
 * Backend can replace this by implementing the same interface in services/api.js.
 */

const STORAGE_KEY = 'pgfm_store';

import tenantsSeed from './seed/tenants.json';
import usersSeed from './seed/users.json';
import pipelineStagesSeed from './seed/pipelineStages.json';
import guestsSeed from './seed/guests.json';
import episodesSeed from './seed/episodes.json';
import bookingsSeed from './seed/bookings.json';
import notesSeed from './seed/notes.json';

const seed = {
  tenants: tenantsSeed,
  users: usersSeed,
  pipelineStages: pipelineStagesSeed,
  guests: guestsSeed,
  episodes: episodesSeed,
  bookings: bookingsSeed,
  notes: notesSeed,
};

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return { ...seed };
}

function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_) {}
}

let state = load();

export function getState() {
  return state;
}

export function setState(partial) {
  state = { ...state, ...partial };
  save(state);
  return state;
}

export function getSlice(key) {
  return state[key] ?? [];
}

export function setSlice(key, value) {
  state = { ...state, [key]: value };
  save(state);
  return state[key];
}

export function resetToSeed() {
  state = { ...seed };
  save(state);
  return state;
}
