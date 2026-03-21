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

// ─── Local Storage Key ───────────────────────────────────────────────────────
const FOLLOWUPS_KEY = 'pgfm_followups';
const SMTP_KEY      = 'pgfm_smtp_config';

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
function seedIfEmpty() {
  const existing = readFollowups();
  if (existing.length > 0) return;
  const demo = [
    {
      id: uuid(), guest_name: 'Kunal Shah', guest_email: 'kunal@example.com',
      subject: 'Quick follow-up — The Founders Pod',
      body: '<p>Hi Kunal, just wanted to touch base about the upcoming episode. Looking forward to it!</p>',
      status: 'sent', sent_at: new Date(Date.now() - 2 * 86400000).toISOString(), opened: true,
    },
    {
      id: uuid(), guest_name: 'Adora Svitak', guest_email: 'adora@example.com',
      subject: 'Reminder: Recording this Friday',
      body: '<p>Hi Adora, just a reminder that we\'re recording this Friday at 2 PM IST. Please confirm!</p>',
      status: 'sent', sent_at: new Date(Date.now() - 5 * 86400000).toISOString(), opened: false,
    },
    {
      id: uuid(), guest_name: 'Priya Shankar', guest_email: 'priya@example.com',
      subject: 'Episode topic confirmation',
      body: '<p>Hi Priya, looking forward to discussing your startup journey on the show!</p>',
      status: 'draft', sent_at: null, opened: false,
    },
  ];
  writeFollowups(demo);
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
