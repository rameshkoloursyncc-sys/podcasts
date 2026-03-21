import { useEffect, useState } from 'react';
import {
  getFollowups, createFollowup, deleteFollowup,
  getSmtpConfig, saveSmtpConfig, testSmtpConfig,
} from '../../services/followups';
import { getGuests, getBookings } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

import { useEditor, EditorContent } from '@tiptap/react';
import { StarterKit } from '@tiptap/starter-kit';
import { Underline } from '@tiptap/extension-underline';
import { Link as TiptapLink } from '@tiptap/extension-link';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { Highlight } from '@tiptap/extension-highlight';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableCell } from '@tiptap/extension-table-cell';
import { TextAlign } from '@tiptap/extension-text-align';

import {
  Mail, Send, Settings2 as Settings, Plus, Trash2, X, Check,
  CheckCircle2, Clock3, Eye, AlertCircle, RefreshCw, Server,
  Zap, Inbox, Bold, Italic, List, ListOrdered, Quote, Heading1, Heading2,
  Strikethrough, RotateCcw, RotateCw, Underline as UnderlineIcon,
  Link2, Palette, Highlighter, Table as TableIcon,
  AlignLeft, AlignCenter, AlignRight, ChevronDown,
} from 'lucide-react';

const DIVIDER = 'border-black/[0.08] dark:border-white/[0.08] divide-black/[0.08] dark:divide-white/[0.08]';
const INPUT = 'w-full border border-black/20 dark:border-white/20 bg-transparent px-4 py-2.5 text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/25 focus:outline-none focus:border-black dark:focus:border-white transition-colors';
const LABEL = 'block text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30 mb-1.5';

const TABS = [
  { key: 'compose', label: 'Compose', icon: Send },
  { key: 'history', label: 'Sent History', icon: Inbox },
  { key: 'smtp', label: 'SMTP Config', icon: Server },
];

const COLORS = [
  '#000000', '#424242', '#757575', '#bdbdbd', '#eeeeee', '#ffffff',
  '#d32f2f', '#f44336', '#f06292', '#e91e63', '#9c27b0', '#673ab7',
  '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50',
  '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722',
];

const EMPTY_SMTP = { host: '', port: '587', username: '', password: '', encryption: 'tls', from_name: '', from_email: '' };

// ─── Tiptap Toolbar ────────────────────────────────────────────────────────────
function TiptapToolbar({ editor, showColorPicker, setShowColorPicker, showHighlightPicker, setShowHighlightPicker }) {
  if (!editor) return null;
  const btn = (active, onClick, icon, title) => (
    <button type="button" onClick={onClick} title={title}
      className={`p-1.5 rounded transition-colors ${active ? 'bg-black text-white dark:bg-white dark:text-black' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}>
      {icon}
    </button>
  );
  const sep = <div className="w-px h-4 mx-1.5 bg-black/10 dark:bg-white/10" />;

  return (
    <div className={`flex flex-wrap items-center gap-0.5 p-1.5 border-b ${DIVIDER} bg-black/[0.03] dark:bg-white/[0.04]`}>
      {/* History */}
      {btn(false, () => editor.chain().focus().undo().run(), <RotateCcw size={13} />, 'Undo')}
      {btn(false, () => editor.chain().focus().redo().run(), <RotateCw size={13} />, 'Redo')}
      {sep}
      {/* Style */}
      {btn(editor.isActive('bold'), () => editor.chain().focus().toggleBold().run(), <Bold size={13} />, 'Bold')}
      {btn(editor.isActive('italic'), () => editor.chain().focus().toggleItalic().run(), <Italic size={13} />, 'Italic')}
      {btn(editor.isActive('underline'), () => editor.chain().focus().toggleUnderline().run(), <UnderlineIcon size={13} />, 'Underline')}
      {btn(editor.isActive('strike'), () => editor.chain().focus().toggleStrike().run(), <Strikethrough size={13} />, 'Strike')}
      {sep}
      {/* Headings */}
      {btn(editor.isActive('heading', { level: 1 }), () => editor.chain().focus().toggleHeading({ level: 1 }).run(), <Heading1 size={13} />, 'H1')}
      {btn(editor.isActive('heading', { level: 2 }), () => editor.chain().focus().toggleHeading({ level: 2 }).run(), <Heading2 size={13} />, 'H2')}
      {sep}
      {/* Alignment */}
      {btn(editor.isActive({ textAlign: 'left' }), () => editor.chain().focus().setTextAlign('left').run(), <AlignLeft size={13} />, 'Left')}
      {btn(editor.isActive({ textAlign: 'center' }), () => editor.chain().focus().setTextAlign('center').run(), <AlignCenter size={13} />, 'Center')}
      {btn(editor.isActive({ textAlign: 'right' }), () => editor.chain().focus().setTextAlign('right').run(), <AlignRight size={13} />, 'Right')}
      {sep}
      {/* Color */}
      <div className="relative">
        <button type="button" title="Text Color" onClick={() => { setShowColorPicker(v => !v); setShowHighlightPicker(false); }}
          className={`p-1.5 rounded transition-colors ${showColorPicker ? 'bg-black/10 dark:bg-white/10' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}>
          <Palette size={13} />
        </button>
        {showColorPicker && (
          <div className={`absolute top-full left-0 mt-1 p-2 bg-white dark:bg-[#0f1117] border ${DIVIDER} shadow-xl z-50 grid grid-cols-6 gap-1 w-36`}>
            {COLORS.map(c => (
              <button key={c} type="button" onClick={() => { editor.chain().focus().setColor(c).run(); setShowColorPicker(false); }}
                className="w-4 h-4 rounded-full border border-black/10 hover:scale-125 transition-transform" style={{ backgroundColor: c }} />
            ))}
          </div>
        )}
      </div>
      {/* Highlight */}
      <div className="relative">
        <button type="button" title="Highlight" onClick={() => { setShowHighlightPicker(v => !v); setShowColorPicker(false); }}
          className={`p-1.5 rounded transition-colors ${editor.isActive('highlight') || showHighlightPicker ? 'bg-yellow-200 text-black' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}>
          <Highlighter size={13} />
        </button>
        {showHighlightPicker && (
          <div className={`absolute top-full left-0 mt-1 p-2 bg-white dark:bg-[#0f1117] border ${DIVIDER} shadow-xl z-50 grid grid-cols-6 gap-1 w-36`}>
            {COLORS.map(c => (
              <button key={c} type="button" onClick={() => { editor.chain().focus().toggleHighlight({ color: c }).run(); setShowHighlightPicker(false); }}
                className="w-4 h-4 rounded-sm border border-black/10 hover:scale-125 transition-transform" style={{ backgroundColor: c }} />
            ))}
            <button type="button" onClick={() => { editor.chain().focus().unsetHighlight().run(); setShowHighlightPicker(false); }}
              className="col-span-6 text-[8px] font-bold uppercase tracking-widest py-1 hover:bg-black/5 dark:hover:bg-white/5">Clear</button>
          </div>
        )}
      </div>
      {sep}
      {/* Lists */}
      {btn(editor.isActive('bulletList'), () => editor.chain().focus().toggleBulletList().run(), <List size={13} />, 'Bullet List')}
      {btn(editor.isActive('orderedList'), () => editor.chain().focus().toggleOrderedList().run(), <ListOrdered size={13} />, 'Ordered List')}
      {btn(editor.isActive('blockquote'), () => editor.chain().focus().toggleBlockquote().run(), <Quote size={13} />, 'Quote')}
      {sep}
      {/* Link */}
      <button type="button" title="Add Link" onClick={() => { const url = prompt('URL:'); if (url) editor.chain().focus().setLink({ href: url }).run(); }}
        className={`p-1.5 rounded transition-colors ${editor.isActive('link') ? 'bg-blue-500 text-white' : 'hover:bg-black/10 dark:hover:bg-white/10'}`}>
        <Link2 size={13} />
      </button>
      <button type="button" title="Insert Table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
        className="p-1.5 rounded hover:bg-black/10 dark:hover:bg-white/10 transition-colors">
        <TableIcon size={13} />
      </button>
    </div>
  );
}

// ─── Compose Tab ────────────────────────────────────────────────────────────────
function ComposeTab({ onSent }) {
  const { tenant } = useAuth();

  const [guests, setGuests] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loadingGuests, setLoadingGuests] = useState(true);

  const [selectedGuest, setSelectedGuest] = useState(null);
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      TiptapLink.configure({ openOnClick: false, HTMLAttributes: { class: 'text-blue-500 underline cursor-pointer' } }),
      TextStyle, Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Table.configure({ resizable: true }),
      TableRow, TableHeader, TableCell,
    ],
    content: '',
    editorProps: {
      attributes: { class: 'tiptap prose prose-sm dark:prose-invert focus:outline-none max-w-none p-5 min-h-[240px] text-sm leading-relaxed' },
    },
  });

  // Load guests + bookings on mount
  useEffect(() => {
    Promise.all([getGuests({ per_page: 100 }), getBookings({ per_page: 100 })])
      .then(([g, b]) => { setGuests(g); setBookings(b); })
      .catch(console.error)
      .finally(() => setLoadingGuests(false));
  }, []);

  // When a guest is selected, pre-fill subject + rich body
  function handleGuestSelect(guestId) {
    const g = guests.find(x => x.id === guestId);
    setSelectedGuest(g ?? null);
    setError('');

    if (!g) { editor?.commands.setContent(''); setSubject(''); return; }

    // Find upcoming booking for this guest
    const booking = bookings
      .filter(b => (b.guest_id === g.id || b.guest?.id === g.id) && b.status !== 'cancelled')
      .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))[0];

    const dateStr = booking?.scheduled_at
      ? new Date(booking.scheduled_at).toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })
      : null;

    const podcastName = tenant?.name ?? 'our podcast';
    const autoSubject = `Follow-up — ${podcastName} × ${g.name}`;
    setSubject(autoSubject);

    const body = dateStr
      ? `<p>Hi <strong>${g.name}</strong>,</p>
<p>Just wanted to touch base ahead of our recording session — currently scheduled for <strong>${dateStr}</strong>.</p>
<p>Please let us know if you have any questions, need to reschedule, or would like to share your topic ideas beforehand.</p>
<p>Looking forward to having you on <strong>${podcastName}</strong>!</p>
<p>Best,<br /><strong>${tenant?.name ?? 'The Team'}</strong></p>`
      : `<p>Hi <strong>${g.name}</strong>,</p>
<p>This is a friendly follow-up regarding your upcoming appearance on <strong>${podcastName}</strong>.</p>
<p>We'd love to lock in a recording date soon — please reply with your availability and we'll get something scheduled.</p>
<p>Looking forward to connecting!</p>
<p>Best,<br /><strong>${tenant?.name ?? 'The Team'}</strong></p>`;

    editor?.commands.setContent(body);
  }

  async function handleSend(status) {
    if (!selectedGuest) { setError('Please select a guest.'); return; }
    if (!subject) { setError('Subject is required.'); return; }
    const body = editor?.getHTML() ?? '';
    if (!body || body === '<p></p>') { setError('Message body is required.'); return; }

    setSending(status); setError('');
    try {
      await createFollowup({
        guest_name: selectedGuest.name,
        guest_email: selectedGuest.email,
        subject, body, status,
      });
      setSuccess(status === 'sent' ? 'Follow-up sent!' : 'Saved as draft.');
      setSelectedGuest(null); setSubject('');
      editor?.commands.setContent('');
      setTimeout(() => { setSuccess(''); onSent(); }, 1800);
    } catch (err) {
      setError(err?.message ?? 'Failed to send.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Info banner */}
      {/* <div className={`shrink-0 px-8 py-3 border-b ${DIVIDER} bg-black/[0.02] dark:bg-white/[0.02] flex items-start gap-3`}>
        <Zap size={13} className="text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-black/50 dark:text-white/40 leading-relaxed">
          Select a guest — the email will be pre-filled based on their schedule. Configure SMTP to send from your own address.
        </p>
      </div> */}

      {/* Fields */}
      <div className="shrink-0 px-8 pt-5 pb-3 space-y-3">
        {/* Guest selector */}
        <div>
          <label className={LABEL}>Guest *</label>
          <div className="relative">
            <select
              className={`${INPUT} appearance-none pr-10`}
              value={selectedGuest?.id ?? ''}
              onChange={e => handleGuestSelect(e.target.value)}
              disabled={loadingGuests}
            >
              <option value="" className="bg-white dark:bg-black">
                {loadingGuests ? 'Loading guests…' : '— Select a guest —'}
              </option>
              {guests.map(g => (
                <option key={g.id} value={g.id} className="bg-white dark:bg-black">
                  {g.name}{g.email ? ` — ${g.email}` : ''}
                </option>
              ))}
            </select>
            <ChevronDown size={13} className="absolute right-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/30 pointer-events-none" />
          </div>
        </div>

        {/* Show pre-filled email beneath dropdown */}
        {selectedGuest?.email && (
          <p className="text-[11px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30">
            📧 To: <span className="text-black/60 dark:text-white/60">{selectedGuest.name} &lt;{selectedGuest.email}&gt;</span>
          </p>
        )}

        {/* Subject */}
        <div>
          <label className={LABEL}>Subject *</label>
          <input className={INPUT} placeholder="Follow-up — The Founders Pod × Guest Name"
            value={subject} onChange={e => setSubject(e.target.value)} />
        </div>
      </div>

      {/* Tiptap editor — fills remaining space */}
      <div className={`flex-1 min-h-0 mx-8 mb-3 border ${DIVIDER} flex flex-col overflow-hidden`}>
        <TiptapToolbar
          editor={editor}
          showColorPicker={showColorPicker} setShowColorPicker={setShowColorPicker}
          showHighlightPicker={showHighlightPicker} setShowHighlightPicker={setShowHighlightPicker}
        />
        <div className="flex-1 overflow-y-auto bg-white dark:bg-[#0f1117]">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* Error / success */}
      {(error || success) && (
        <div className="px-8 pb-2">
          {error && (
            <div className="flex items-center gap-2.5 border border-red-400/40 bg-red-50 dark:bg-red-500/10 px-4 py-2.5">
              <AlertCircle size={12} className="text-red-500 shrink-0" />
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-2.5 border border-emerald-400/40 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2.5">
              <CheckCircle2 size={12} className="text-emerald-500 shrink-0" />
              <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{success}</p>
            </div>
          )}
        </div>
      )}

      {/* Footer actions */}
      <div className={`shrink-0 px-8 py-4 border-t ${DIVIDER} flex items-center gap-3`}>
        <button type="button" onClick={() => handleSend('draft')} disabled={!!sending}
          className={`border ${DIVIDER} px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:border-black dark:hover:border-white transition-colors disabled:opacity-40 flex items-center gap-2`}>
          {sending === 'draft' ? <RefreshCw size={11} className="animate-spin" /> : <Clock3 size={11} />}
          Save Draft
        </button>
        <button type="button" onClick={() => handleSend('sent')} disabled={!!sending}
          className="flex-1 border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:opacity-80 disabled:opacity-40 transition-opacity flex items-center justify-center gap-2">
          {sending === 'sent' ? <RefreshCw size={11} className="animate-spin" /> : <Send size={11} />}
          {sending === 'sent' ? 'Sending…' : 'Send Follow-up'}
        </button>
      </div>
    </div>
  );
}

// ─── History Tab ────────────────────────────────────────────────────────────────
function HistoryTab({ followups, loading, onRefresh }) {
  const [deleting, setDeleting] = useState(null);
  const [filter, setFilter] = useState('all');

  const STATUS_META = {
    sent: { icon: Send, badge: 'bg-black/5 text-black dark:bg-white/10 dark:text-white', label: 'Sent' },
    draft: { icon: Clock3, badge: 'bg-black/5 text-black/50 dark:bg-white/10 dark:text-white/50', label: 'Draft' },
  };

  async function handleDelete(id) {
    if (!window.confirm('Delete this follow-up?')) return;
    setDeleting(id);
    try { await deleteFollowup(id); onRefresh(); }
    catch (err) { alert(err?.message ?? 'Delete failed.'); }
    finally { setDeleting(null); }
  }

  const filtered = followups.filter(f => filter === 'all' || f.status === filter);

  return (
    <div className="flex flex-col h-full">
      {/* Filter bar */}
      <div className={`shrink-0 flex items-center border-b ${DIVIDER}`}>
        {[
          { key: 'all', label: `All (${followups.length})` },
          { key: 'sent', label: `Sent (${followups.filter(f => f.status === 'sent').length})` },
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
          </div>
        ) : (
          <div className={`divide-y ${DIVIDER}`}>
            {filtered.map(f => {
              const meta = STATUS_META[f.status] ?? STATUS_META.sent;
              const Icon = meta.icon;
              return (
                <div key={f.id} className="px-8 py-5 flex items-start gap-5 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group">
                  <div className="h-9 w-9 shrink-0 border border-dashed border-black/20 dark:border-white/20 flex items-center justify-center mt-0.5">
                    <Icon size={14} className="text-black/40 dark:text-white/40" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-sm font-bold truncate">{f.subject || '(No subject)'}</p>
                      <span className={`shrink-0 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${meta.badge}`}>{meta.label}</span>
                      {f.status === 'sent' && f.opened && (
                        <span className="shrink-0 flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
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
                  <button onClick={() => handleDelete(f.id)} disabled={deleting === f.id}
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

// ─── SMTP Config Tab ────────────────────────────────────────────────────────────
function SmtpTab() {
  const [config, setConfig] = useState(EMPTY_SMTP);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testTo, setTestTo] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [error, setError] = useState('');
  const [loadingCfg, setLoadingCfg] = useState(true);

  useEffect(() => {
    getSmtpConfig().then(cfg => { if (cfg) setConfig(cfg); }).catch(console.error).finally(() => setLoadingCfg(false));
  }, []);

  function set(field, value) { setConfig(c => ({ ...c, [field]: value })); }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try { await saveSmtpConfig(config); setSaved(true); setTimeout(() => setSaved(false), 2500); }
    catch (err) { setError(err?.message ?? 'Failed to save.'); }
    finally { setSaving(false); }
  }

  async function handleTest() {
    if (!testTo) { setTestResult({ ok: false, msg: 'Enter a test email address.' }); return; }
    setTesting(true); setTestResult(null);
    try { const res = await testSmtpConfig({ to_email: testTo }); setTestResult({ ok: true, msg: res.message ?? 'Test email sent!' }); }
    catch (err) { setTestResult({ ok: false, msg: err?.message ?? 'Test failed.' }); }
    finally { setTesting(false); }
  }

  if (loadingCfg) return (
    <div className="flex items-center justify-center h-full">
      <div className="h-8 w-8 border-4 border-black/10 border-t-black animate-spin dark:border-white/10 dark:border-t-white" />
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-xl mx-auto px-8 py-6 space-y-5">
        <div className={`flex items-start gap-3 border ${DIVIDER} p-4 bg-black/[0.02] dark:bg-white/[0.02]`}>
          <Server size={14} className="text-blue-500 mt-0.5 shrink-0" />
          <p className="text-xs text-black/50 dark:text-white/40 leading-relaxed">
            Configure your SMTP server so follow-ups are sent directly from your own email (Gmail, SendGrid, Postmark, etc.).
          </p>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 dark:text-white/20 pb-2 border-b border-black/10 dark:border-white/10">Server</p>
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className={LABEL}>SMTP Host *</label>
              <input className={INPUT} placeholder="smtp.gmail.com" value={config.host} onChange={e => set('host', e.target.value)} required />
            </div>
            <div>
              <label className={LABEL}>Port *</label>
              <input className={INPUT} type="number" placeholder="587" value={config.port} onChange={e => set('port', e.target.value)} required />
            </div>
          </div>
          <div>
            <label className={LABEL}>Encryption</label>
            <select className={INPUT} value={config.encryption} onChange={e => set('encryption', e.target.value)}>
              <option value="tls" className="bg-white dark:bg-black">TLS (recommended)</option>
              <option value="ssl" className="bg-white dark:bg-black">SSL</option>
              <option value="none" className="bg-white dark:bg-black">None</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>Username / Email *</label>
              <input className={INPUT} placeholder="you@gmail.com" value={config.username} onChange={e => set('username', e.target.value)} required />
            </div>
            <div>
              <label className={LABEL}>Password / App Key *</label>
              <input className={INPUT} type="password" placeholder="••••••••••••" value={config.password} onChange={e => set('password', e.target.value)} required />
            </div>
          </div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 dark:text-white/20 pt-2 pb-2 border-b border-black/10 dark:border-white/10">Sender Identity</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={LABEL}>From Name</label>
              <input className={INPUT} placeholder="The Founders Pod" value={config.from_name} onChange={e => set('from_name', e.target.value)} />
            </div>
            <div>
              <label className={LABEL}>From Email</label>
              <input className={INPUT} type="email" placeholder="hello@founderspod.com" value={config.from_email} onChange={e => set('from_email', e.target.value)} />
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2.5 border border-red-400/40 bg-red-50 dark:bg-red-500/10 px-4 py-3">
              <AlertCircle size={12} className="text-red-500 shrink-0" />
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
          <button type="submit" disabled={saving}
            className="w-full border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black py-2.5 text-xs font-bold uppercase tracking-widest hover:opacity-80 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2">
            {saving ? <RefreshCw size={11} className="animate-spin" /> : saved ? <Check size={11} /> : <Server size={11} />}
            {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Configuration'}
          </button>
        </form>

        {/* Test */}
        <div className={`border ${DIVIDER} p-5 space-y-3`}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30 flex items-center gap-2">
            <Zap size={10} className="text-amber-500" /> Test Connection
          </p>
          <div className="flex items-center gap-3">
            <input className={`${INPUT} flex-1`} type="email" placeholder="test@example.com" value={testTo} onChange={e => setTestTo(e.target.value)} />
            <button type="button" onClick={handleTest} disabled={testing}
              className={`shrink-0 border ${DIVIDER} px-4 py-2.5 text-xs font-bold uppercase tracking-widest hover:border-black dark:hover:border-white transition-colors disabled:opacity-40 flex items-center gap-2`}>
              {testing ? <RefreshCw size={10} className="animate-spin" /> : <Send size={10} />}
              {testing ? 'Sending…' : 'Send Test'}
            </button>
          </div>
          {testResult && (
            <div className={`flex items-center gap-2.5 px-4 py-3 border ${testResult.ok ? 'border-emerald-400/40 bg-emerald-50 dark:bg-emerald-500/10' : 'border-red-400/40 bg-red-50 dark:bg-red-500/10'}`}>
              {testResult.ok ? <CheckCircle2 size={12} className="text-emerald-500" /> : <AlertCircle size={12} className="text-red-500" />}
              <p className={`text-xs font-semibold ${testResult.ok ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>{testResult.msg}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function Followups() {
  const [tab, setTab] = useState('compose');
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);

  function loadFollowups() {
    setLoading(true);
    getFollowups().then(setFollowups).catch(console.error).finally(() => setLoading(false));
  }
  useEffect(() => { loadFollowups(); }, []);

  const sentCount = followups.filter(f => f.status === 'sent').length;
  const draftCount = followups.filter(f => f.status === 'draft').length;
  const openedCount = followups.filter(f => f.opened).length;

  return (
    <div className="bg-white dark:bg-[#0f1117] text-black dark:text-white h-full flex flex-col overflow-hidden">

      {/* ══ HEADER ═══════════════════════════════════════════════════════ */}
      <div className={`shrink-0 border-b ${DIVIDER} bg-white dark:bg-[#0a0c12]`}>
        <div className="px-8 py-5 flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight leading-none">Follow-ups.</h1>
            <p className="text-sm text-black/35 dark:text-white/30 mt-1.5">Email outreach & reminders — sent from your own SMTP</p>
          </div>
          <div className="flex items-stretch gap-0 border border-black/10 dark:border-white/10 divide-x divide-black/10 dark:divide-white/10">
            {[{ label: 'Sent', value: sentCount }, { label: 'Drafts', value: draftCount }, { label: 'Opened', value: openedCount }].map(({ label, value }) => (
              <div key={label} className="px-5 py-3 text-center min-w-[72px]">
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
              <Icon size={11} /> {label}
              {key === 'history' && followups.length > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 text-[9px] font-bold ${tab === key ? 'bg-white/20 dark:bg-black/20' : 'bg-black/10 dark:bg-white/10'}`}>
                  {followups.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ══ TAB CONTENT ═══════════════════════════════════════════════════ */}
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {tab === 'compose' && <ComposeTab onSent={() => { loadFollowups(); setTab('history'); }} />}
        {tab === 'history' && <HistoryTab followups={followups} loading={loading} onRefresh={loadFollowups} />}
        {tab === 'smtp' && <SmtpTab />}
      </div>
    </div>
  );
}
