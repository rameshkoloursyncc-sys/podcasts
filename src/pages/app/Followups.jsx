import { useEffect, useState, useRef } from 'react';
import {
  getFollowups, createFollowup, deleteFollowup,
  getSmtpConfig, saveSmtpConfig, testSmtpConfig,
} from '../../services/followups';
import {
  Mail, Send, Settings2, Plus, Trash2, X, Check, CheckCircle2,
  Clock3, Eye, AlertCircle, RefreshCw, ChevronRight, Server,
  Zap, Inbox,
} from 'lucide-react';

const DIVIDER = 'border-black/[0.08] dark:border-white/[0.08] divide-black/[0.08] dark:divide-white/[0.08]';
const INPUT   = 'w-full border border-black/20 dark:border-white/20 bg-transparent px-4 py-2.5 text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/25 focus:outline-none focus:border-black dark:focus:border-white transition-colors';
const LABEL   = 'block text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30 mb-1.5';

const TABS = [
  { key: 'compose', label: 'Compose',      icon: Send   },
  { key: 'history', label: 'Sent History', icon: Inbox  },
  { key: 'smtp',    label: 'SMTP Config',  icon: Server },
];

const EMPTY_COMPOSE = { guest_name: '', guest_email: '', subject: '', body: '' };
const EMPTY_SMTP    = { host: '', port: '587', username: '', password: '', encryption: 'tls', from_name: '', from_email: '' };

// ─── Compose Tab ─────────────────────────────────────────────────────────────
function ComposeTab({ onSent }) {
  const [form, setForm]     = useState(EMPTY_COMPOSE);
  const [sending, setSending] = useState(false);
  const [drafted, setDrafted] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError]   = useState('');

  function set(field, value) { setForm(f => ({ ...f, [field]: value })); setError(''); }

  async function handleSend(status) {
    if (!form.guest_email || !form.subject || !form.body) {
      setError('Please fill in Guest Email, Subject, and Message.');
      return;
    }
    setSending(status);
    try {
      await createFollowup({ ...form, status });
      setSuccess(status === 'sent' ? 'Follow-up sent!' : 'Saved as draft.');
      setForm(EMPTY_COMPOSE);
      setTimeout(() => { setSuccess(''); onSent(); }, 1800);
    } catch (err) {
      setError(err?.message ?? 'Failed to send.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col gap-0 h-full">
      {/* Intro banner */}
      <div className={`px-8 py-4 border-b ${DIVIDER} bg-black/[0.02] dark:bg-white/[0.02] flex items-start gap-3`}>
        <Zap size={14} className="text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-black/50 dark:text-white/40 leading-relaxed">
          Compose a follow-up email directly from PodcastOS. Once you configure your SMTP settings,
          emails will be sent from <strong className="text-black/70 dark:text-white/60">your own email address</strong>.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-6 space-y-4">

          {/* To */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Guest Name</label>
              <input className={INPUT} placeholder="Kunal Shah" value={form.guest_name}
                onChange={e => set('guest_name', e.target.value)} />
            </div>
            <div>
              <label className={LABEL}>Guest Email *</label>
              <input className={INPUT} type="email" placeholder="kunal@example.com" value={form.guest_email}
                onChange={e => set('guest_email', e.target.value)} />
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className={LABEL}>Subject *</label>
            <input className={INPUT} placeholder="Quick follow-up — The Founders Pod" value={form.subject}
              onChange={e => set('subject', e.target.value)} />
          </div>

          {/* Body — simple rich textarea for now, Tiptap can be wired in */}
          <div>
            <label className={LABEL}>Message *</label>
            <textarea
              className={`${INPUT} resize-none leading-relaxed`}
              rows={10}
              placeholder={`Hi [Guest Name],\n\nJust wanted to follow up on our upcoming recording session.\n\nBest,\nYour Name`}
              value={form.body}
              onChange={e => set('body', e.target.value)}
            />
            <p className="mt-1.5 text-[10px] text-black/25 dark:text-white/20 uppercase tracking-widest">
              Plain text or basic HTML. Rich editor coming soon.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 border border-red-400/40 bg-red-50 dark:bg-red-500/10 px-4 py-3">
              <AlertCircle size={13} className="text-red-500 shrink-0" />
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2.5 border border-emerald-400/40 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-3">
              <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{success}</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer actions */}
      <div className={`shrink-0 px-8 py-4 border-t ${DIVIDER} flex items-center gap-3`}>
        <button
          onClick={() => handleSend('draft')}
          disabled={!!sending}
          className={`border ${DIVIDER} px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:border-black dark:hover:border-white transition-colors disabled:opacity-40 flex items-center gap-2`}>
          {sending === 'draft' ? <RefreshCw size={11} className="animate-spin" /> : <Clock3 size={11} />}
          Save Draft
        </button>
        <button
          onClick={() => handleSend('sent')}
          disabled={!!sending}
          className="flex-1 border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:opacity-80 disabled:opacity-40 transition-opacity flex items-center justify-center gap-2">
          {sending === 'sent' ? <RefreshCw size={11} className="animate-spin" /> : <Send size={11} />}
          {sending === 'sent' ? 'Sending…' : 'Send Follow-up'}
        </button>
      </div>
    </div>
  );
}

// ─── History Tab ──────────────────────────────────────────────────────────────
function HistoryTab({ followups, loading, onRefresh }) {
  const [deleting, setDeleting] = useState(null);
  const [filter, setFilter]    = useState('all');

  async function handleDelete(id) {
    if (!window.confirm('Delete this follow-up?')) return;
    setDeleting(id);
    try { await deleteFollowup(id); onRefresh(); }
    catch (err) { alert(err?.message ?? 'Delete failed.'); }
    finally { setDeleting(null); }
  }

  const STATUS_META = {
    sent:  { icon: Send,       badge: 'bg-black/5 text-black dark:bg-white/10 dark:text-white',          label: 'Sent' },
    draft: { icon: Clock3,     badge: 'bg-black/5 text-black/50 dark:bg-white/10 dark:text-white/50',    label: 'Draft' },
  };

  const filtered = followups.filter(f => filter === 'all' || f.status === filter);

  return (
    <div className="flex flex-col h-full">
      {/* Filter bar */}
      <div className={`shrink-0 flex items-center border-b ${DIVIDER}`}>
        {[
          { key: 'all',   label: `All (${followups.length})` },
          { key: 'sent',  label: `Sent (${followups.filter(f => f.status === 'sent').length})` },
          { key: 'draft', label: `Drafts (${followups.filter(f => f.status === 'draft').length})` },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`px-6 py-3 text-[10px] font-bold uppercase tracking-widest border-r ${DIVIDER} transition-colors ${filter === key ? 'bg-black dark:bg-white text-white dark:text-black' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
            {label}
          </button>
        ))}
        <div className="flex-1" />
        <button onClick={onRefresh}
          className={`px-4 py-3 text-[10px] font-bold uppercase tracking-widest border-l ${DIVIDER} hover:bg-black/5 dark:hover:bg-white/5 flex items-center gap-2 transition-colors`}>
          <RefreshCw size={10} className={loading ? 'animate-spin' : ''} /> Refresh
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="py-24 flex flex-col items-center text-black/20 dark:text-white/15 select-none">
            <Inbox size={36} className="mb-3" />
            <p className="text-xs font-bold uppercase tracking-widest">No follow-ups yet</p>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-black/15 dark:text-white/10">
              Compose your first follow-up email above
            </p>
          </div>
        ) : (
          <div className={`divide-y ${DIVIDER}`}>
            {filtered.map(f => {
              const meta = STATUS_META[f.status] ?? STATUS_META.sent;
              const Icon = meta.icon;
              return (
                <div key={f.id} className={`px-8 py-5 flex items-start gap-5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group`}>
                  {/* Status icon */}
                  <div className="h-9 w-9 shrink-0 border border-dashed border-black/20 dark:border-white/20 flex items-center justify-center mt-0.5">
                    <Icon size={14} className="text-black/40 dark:text-white/40" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-bold truncate">{f.subject || '(No subject)'}</p>
                      <span className={`shrink-0 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${meta.badge}`}>
                        {meta.label}
                      </span>
                      {f.status === 'sent' && f.opened && (
                        <span className="shrink-0 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                          <Eye size={9} /> Opened
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-black/50 dark:text-white/40 truncate">
                      To: <span className="font-semibold">{f.guest_name || f.guest_email}</span>
                      {f.guest_name && f.guest_email && ` <${f.guest_email}>`}
                    </p>
                    {f.sent_at && (
                      <p className="text-[10px] text-black/30 dark:text-white/20 uppercase tracking-widest mt-1 flex items-center gap-1.5">
                        <Clock3 size={9} />
                        {new Date(f.sent_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(f.id)}
                    disabled={deleting === f.id}
                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-black/30 hover:text-red-500 dark:text-white/20 dark:hover:text-red-400 disabled:opacity-40">
                    <Trash2 size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SMTP Config Tab ──────────────────────────────────────────────────────────
function SmtpTab() {
  const [config, setConfig]     = useState(EMPTY_SMTP);
  const [saved, setSaved]       = useState(false);
  const [saving, setSaving]     = useState(false);
  const [testing, setTesting]   = useState(false);
  const [testTo, setTestTo]     = useState('');
  const [testResult, setTestResult] = useState(null);
  const [error, setError]       = useState('');
  const [loadingCfg, setLoadingCfg] = useState(true);

  useEffect(() => {
    getSmtpConfig()
      .then(cfg => { if (cfg) setConfig(cfg); })
      .catch(console.error)
      .finally(() => setLoadingCfg(false));
  }, []);

  function set(field, value) { setConfig(c => ({ ...c, [field]: value })); }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await saveSmtpConfig(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      setError(err?.message ?? 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    if (!testTo) { setTestResult({ ok: false, msg: 'Enter a test email address.' }); return; }
    setTesting(true); setTestResult(null);
    try {
      const res = await testSmtpConfig({ to_email: testTo });
      setTestResult({ ok: true, msg: res.message ?? 'Test email sent!' });
    } catch (err) {
      setTestResult({ ok: false, msg: err?.message ?? 'Test failed.' });
    } finally {
      setTesting(false);
    }
  }

  if (loadingCfg) return (
    <div className="flex items-center justify-center h-full">
      <div className="h-8 w-8 border-4 border-black/10 border-t-black animate-spin dark:border-white/10 dark:border-t-white" />
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-xl mx-auto px-8 py-6 space-y-6">

        {/* Info */}
        <div className={`flex items-start gap-3 border ${DIVIDER} p-4 bg-black/[0.02] dark:bg-white/[0.02]`}>
          <Server size={14} className="text-blue-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest mb-1">SMTP Configuration</p>
            <p className="text-xs text-black/50 dark:text-white/40 leading-relaxed">
              Configure your email server (Gmail, SendGrid, Postmark, etc.) to send follow-ups 
              directly from your own address. Credentials are stored locally for now.
            </p>
          </div>
        </div>

        {/* Server settings */}
        <form onSubmit={handleSave} className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 dark:text-white/20 border-b border-black/10 dark:border-white/10 pb-2">
            Server
          </p>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className={LABEL}>SMTP Host *</label>
              <input className={INPUT} placeholder="smtp.gmail.com" value={config.host}
                onChange={e => set('host', e.target.value)} required />
            </div>
            <div>
              <label className={LABEL}>Port *</label>
              <input className={INPUT} type="number" placeholder="587" value={config.port}
                onChange={e => set('port', e.target.value)} required />
            </div>
          </div>

          <div>
            <label className={LABEL}>Encryption</label>
            <select className={INPUT} value={config.encryption} onChange={e => set('encryption', e.target.value)}>
              <option value="tls"  className="bg-white dark:bg-black">TLS (recommended)</option>
              <option value="ssl"  className="bg-white dark:bg-black">SSL</option>
              <option value="none" className="bg-white dark:bg-black">None</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Username / Email *</label>
              <input className={INPUT} placeholder="you@gmail.com" value={config.username}
                onChange={e => set('username', e.target.value)} required />
            </div>
            <div>
              <label className={LABEL}>Password / App Key *</label>
              <input className={INPUT} type="password" placeholder="••••••••••••" value={config.password}
                onChange={e => set('password', e.target.value)} required />
            </div>
          </div>

          <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 dark:text-white/20 border-b border-black/10 dark:border-white/10 pb-2 pt-2">
            Sender Identity
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>From Name</label>
              <input className={INPUT} placeholder="The Founders Pod" value={config.from_name}
                onChange={e => set('from_name', e.target.value)} />
            </div>
            <div>
              <label className={LABEL}>From Email</label>
              <input className={INPUT} type="email" placeholder="hello@founderspod.com" value={config.from_email}
                onChange={e => set('from_email', e.target.value)} />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2.5 border border-red-400/40 bg-red-50 dark:bg-red-500/10 px-4 py-3">
              <AlertCircle size={13} className="text-red-500 shrink-0" />
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <button type="submit" disabled={saving}
            className="w-full border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black py-2.5 text-xs font-bold uppercase tracking-widest hover:opacity-80 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2">
            {saving ? <RefreshCw size={11} className="animate-spin" /> : saved ? <Check size={11} /> : <Server size={11} />}
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Configuration'}
          </button>
        </form>

        {/* Test email */}
        <div className={`border ${DIVIDER} p-5 space-y-3`}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30 flex items-center gap-2">
            <Zap size={10} className="text-amber-500" /> Test Connection
          </p>
          <div className="flex items-center gap-3">
            <input className={`${INPUT} flex-1`} type="email" placeholder="test@example.com"
              value={testTo} onChange={e => setTestTo(e.target.value)} />
            <button onClick={handleTest} disabled={testing}
              className={`shrink-0 border ${DIVIDER} px-4 py-2.5 text-xs font-bold uppercase tracking-widest hover:border-black dark:hover:border-white transition-colors disabled:opacity-40 flex items-center gap-2`}>
              {testing ? <RefreshCw size={10} className="animate-spin" /> : <Send size={10} />}
              {testing ? 'Sending…' : 'Send Test'}
            </button>
          </div>
          {testResult && (
            <div className={`flex items-center gap-2.5 px-4 py-3 border ${testResult.ok ? 'border-emerald-400/40 bg-emerald-50 dark:bg-emerald-500/10' : 'border-red-400/40 bg-red-50 dark:bg-red-500/10'}`}>
              {testResult.ok
                ? <CheckCircle2 size={13} className="text-emerald-500 shrink-0" />
                : <AlertCircle size={13} className="text-red-500 shrink-0" />}
              <p className={`text-xs font-semibold ${testResult.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {testResult.msg}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Followups() {
  const [tab, setTab]             = useState('compose');
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading]     = useState(true);

  function loadFollowups() {
    setLoading(true);
    getFollowups()
      .then(list => setFollowups(list))
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { loadFollowups(); }, []);

  const sentCount  = followups.filter(f => f.status === 'sent').length;
  const draftCount = followups.filter(f => f.status === 'draft').length;
  const openedCount = followups.filter(f => f.opened).length;

  return (
    <div className="bg-white dark:bg-[#0f1117] text-black dark:text-white h-full flex flex-col">

      {/* ══ HEADER ════════════════════════════════════════════════ */}
      <div className={`shrink-0 border-b ${DIVIDER} bg-white dark:bg-[#0a0c12]`}>
        <div className="px-8 py-6 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight leading-none">Follow-ups.</h1>
            <p className="text-sm text-black/35 dark:text-white/30 mt-2">
              Email outreach & reminders — sent from your own SMTP
            </p>
          </div>

          {/* KPI strip */}
          <div className="flex items-stretch gap-0 border border-black/10 dark:border-white/10 divide-x divide-black/10 dark:divide-white/10">
            {[
              { label: 'Sent',   value: sentCount   },
              { label: 'Drafts', value: draftCount  },
              { label: 'Opened', value: openedCount },
            ].map(({ label, value }) => (
              <div key={label} className="px-5 py-3 text-center min-w-[80px]">
                <p className="text-xl font-extrabold">{value}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-black/30 dark:text-white/25 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex items-center border-t ${DIVIDER}`}>
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-6 py-3.5 text-[10px] font-bold uppercase tracking-widest border-r ${DIVIDER} transition-colors ${tab === key ? 'bg-black dark:bg-white text-white dark:text-black' : 'text-black/50 dark:text-white/40 hover:bg-black/5 dark:hover:bg-white/5 hover:text-black dark:hover:text-white'}`}>
              <Icon size={11} />
              {label}
              {key === 'history' && followups.length > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 text-[9px] font-bold rounded-sm ${tab === key ? 'bg-white/20 dark:bg-black/20' : 'bg-black/10 dark:bg-white/10'}`}>
                  {followups.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ══ TAB CONTENT ════════════════════════════════════════════ */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {tab === 'compose' && (
          <ComposeTab onSent={() => { loadFollowups(); setTab('history'); }} />
        )}
        {tab === 'history' && (
          <HistoryTab followups={followups} loading={loading} onRefresh={loadFollowups} />
        )}
        {tab === 'smtp' && (
          <SmtpTab />
        )}
      </div>
    </div>
  );
}
