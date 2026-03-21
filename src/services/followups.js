/**
 * Follow-ups Service Layer
 * ─────────────────────────────────────────────────────────────────────────────
 * Currently uses LOCAL mock data (no backend endpoint yet).
 *
 * 🔁 TO SWITCH TO REAL API — change every function to use the real `http`
 * client exactly as done in services/api.js.  The function signatures and
 * return shapes are already designed to match the expected REST contract:
 *
 *   GET    /api/followups             → list (paginated or flat)
 *   POST   /api/followups             → send / schedule a follow-up
 *   GET    /api/followups/:id         → single record
 *   DELETE /api/followups/:id         → delete / unsend
 *   GET    /api/smtp-config           → get SMTP settings for this tenant
 *   POST   /api/smtp-config           → save / update SMTP settings
 *   POST   /api/smtp-config/test      → send a test email
 *
 * All payloads already use snake_case to match the project convention.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import followupsSeed from '../data/seed/followups.json';
import smtpSeed     from '../data/seed/smtp_config.json';

// ─── Local Storage Keys ───────────────────────────────────────────────────────
const FOLLOWUPS_KEY = 'pgfm_followups';
const SMTP_KEY      = 'pgfm_smtp_config';
const SEED_VERSION  = 'pgfm_seed_v2';   // bump this string to force a re-seed

// ─── Helpers ─────────────────────────────────────────────────────────────────
function readFollowups() {
  try { return JSON.parse(localStorage.getItem(FOLLOWUPS_KEY) ?? '[]'); }
  catch { return []; }
}
function writeFollowups(list) { localStorage.setItem(FOLLOWUPS_KEY, JSON.stringify(list)); }

function readSmtp() {
  try { return JSON.parse(localStorage.getItem(SMTP_KEY) ?? 'null'); }
  catch { return null; }
}
function writeSmtp(cfg) { localStorage.setItem(SMTP_KEY, JSON.stringify(cfg)); }

function uuid() {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
}

// ─── Seed Demo Data (first run only) ─────────────────────────────────────────
//
// ══════════════════════════════════════════════════════════════════════════════
//  FOLLOW-UP RECORD — Full JSON shape (what the real API will return)
// ══════════════════════════════════════════════════════════════════════════════
// {
//   id:           "uuid-string",           // unique record ID
//   guest_name:   "Kunal Shah",            // display name of the recipient
//   guest_email:  "kunal@example.com",     // TO address
//   subject:      "Follow-up — Founders Pod × Kunal Shah",
//   body:         "<p>HTML rich content…</p>",  // Tiptap HTML output
//   status:       "sent" | "draft",        // current state
//   sent_at:      "2026-03-19T08:30:00Z" | null,  // ISO 8601, null if draft
//   created_at:   "2026-03-19T08:29:55Z", // when the record was created
//   opened:       true | false,            // email open tracking (future)
//   reply_count:  0,                       // number of replies received (future)
//   tags:         ["reminder", "booking"], // optional classification tags (future)
// }
//
// ══════════════════════════════════════════════════════════════════════════════
//  SMTP CONFIG — Full JSON shape (what the real API will return/accept)
// ══════════════════════════════════════════════════════════════════════════════
// {
//   host:         "smtp.gmail.com",        // SMTP server hostname
//   port:         587,                     // port number (587=TLS, 465=SSL, 25=plain)
//   encryption:   "tls" | "ssl" | "none", // transport security
//   username:     "you@gmail.com",         // SMTP auth username
//   password:     "app-password-here",     // SMTP auth password / app key (never log this)
//   from_name:    "The Founders Pod",      // displayed sender name
//   from_email:   "hello@founderspod.com", // reply-to / from address
// }
// ══════════════════════════════════════════════════════════════════════════════

function seedIfEmpty() {
  // If SEED_VERSION key is already set, data is fresh — nothing to do.
  if (localStorage.getItem(SEED_VERSION)) return;

  // Wipe any stale old data and mark this version as seeded.
  localStorage.removeItem(FOLLOWUPS_KEY);
  localStorage.removeItem(SMTP_KEY);
  localStorage.setItem(SEED_VERSION, '1');

  // ── Resolve timestamp placeholders in followups.json ─────────────────────
  // JSON can't contain dynamic values so we use placeholder strings that we
  // replace here at runtime so timestamps are always relative to "now".
  const now = Date.now();
  const OFFSET_MAP = {
    '__NOW_MINUS_8D__': new Date(now - 8 * 86400000).toISOString(),
    '__NOW_MINUS_5D__': new Date(now - 5 * 86400000).toISOString(),
    '__NOW_MINUS_2D__': new Date(now - 2 * 86400000).toISOString(),
    '__NOW_MINUS_1D__': new Date(now - 1 * 86400000).toISOString(),
    '__NOW_MINUS_1H__': new Date(now - 3600000).toISOString(),
    '__SEED_1__': uuid(),
    '__SEED_2__': uuid(),
    '__SEED_3__': uuid(),
    '__SEED_4__': uuid(),
    '__SEED_5__': uuid(),
  };

  function resolveDates(obj) {
    // Deep-clone via JSON round-trip, then replace all placeholder strings
    return JSON.parse(
      JSON.stringify(obj).replace(
        /__NOW_MINUS_\dD?H?__|__SEED_\d__/g,
        match => OFFSET_MAP[match] ?? match,
      )
    );
  }

  // ── Write follow-ups from JSON seed file ──────────────────────────────────
  writeFollowups(resolveDates(followupsSeed));

  // ── Write SMTP config from JSON seed file ─────────────────────────────────
  // Strip the _comment and _providers documentation keys before storing.
  const { _comment: _c, _providers: _p, ...smtpDefaults } = smtpSeed;
  writeSmtp(smtpDefaults);
}
seedIfEmpty();

// ─── API-Ready Functions ──────────────────────────────────────────────────────

/**
 * GET /api/followups
 * Returns all follow-up records for this tenant.
 *
 * 🔁 Real: const res = await http.get(ENDPOINTS.FOLLOWUPS); return extractList(res);
 */
export async function getFollowups() {
  await delay(180);
  return readFollowups().sort((a, b) => {
    const da = a.sent_at ?? a.created_at ?? '';
    const db = b.sent_at ?? b.created_at ?? '';
    return db.localeCompare(da);
  });
}

/**
 * POST /api/followups
 * Send or draft a follow-up email.
 * payload: { guest_name, guest_email, subject, body, status }
 * status: 'sent' | 'draft'
 *
 * 🔁 Real: return await http.post(ENDPOINTS.FOLLOWUPS, payload);
 */
export async function createFollowup(payload) {
  await delay(400);
  const list = readFollowups();
  const record = {
    id: uuid(),
    ...payload,
    status: payload.status ?? 'sent',
    sent_at: payload.status === 'sent' ? new Date().toISOString() : null,
    created_at: new Date().toISOString(),
    opened: false,
  };
  list.unshift(record);
  writeFollowups(list);
  return record;
}

/**
 * DELETE /api/followups/:id
 *
 * 🔁 Real: return await http.delete(ENDPOINTS.FOLLOWUP_BY_ID(id));
 */
export async function deleteFollowup(id) {
  await delay(200);
  const list = readFollowups().filter(f => f.id !== id);
  writeFollowups(list);
}

/**
 * GET /api/smtp-config
 * Returns the SMTP configuration for this tenant.
 *
 * 🔁 Real: return await http.get(ENDPOINTS.SMTP_CONFIG);
 */
export async function getSmtpConfig() {
  await delay(150);
  return readSmtp();
}

/**
 * POST /api/smtp-config
 * Save SMTP configuration.
 * payload: { host, port, username, password, encryption, from_name, from_email }
 *
 * 🔁 Real: return await http.post(ENDPOINTS.SMTP_CONFIG, payload);
 */
export async function saveSmtpConfig(payload) {
  await delay(400);
  writeSmtp(payload);
  return payload;
}

/**
 * POST /api/smtp-config/test
 * Send a test email using saved SMTP config.
 * payload: { to_email }
 *
 * 🔁 Real: return await http.post(ENDPOINTS.SMTP_CONFIG_TEST, payload);
 */
export async function testSmtpConfig(payload) {
  await delay(1200);
  // Mock: always succeed locally (real API would actually send)
  const cfg = readSmtp();
  if (!cfg?.host) throw new Error('No SMTP configuration saved. Please save your config first.');
  return { success: true, message: `Test email sent to ${payload.to_email}` };
}

// ─── Utility ─────────────────────────────────────────────────────────────────
function delay(ms) { return new Promise(r => setTimeout(r, ms)); }
