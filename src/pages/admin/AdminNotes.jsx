import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getNotes, createNote, deleteNote } from '../../services/api';
import { FileText, ArrowLeft, Plus, Trash2, X, Send, Clock3 } from 'lucide-react';

const INPUT  = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 transition-all dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:placeholder:text-white/25 dark:focus:ring-emerald-500/30 dark:focus:border-emerald-500/40';
const LABEL  = 'block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/35 mb-1.5';
const CARD_ACCENTS = ['from-violet-600 to-purple-700','from-blue-600 to-cyan-600','from-pink-500 to-rose-600','from-emerald-500 to-teal-600','from-amber-500 to-orange-600','from-indigo-600 to-violet-700'];

const TYPE_BADGE = {
  guest:   'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  episode: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
};

export default function AdminNotes() {
  const { tenant, user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ entityType: 'guest', entityId: '', body: '' });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  function load() {
    if (!tenant?.id) return;
    getNotes(tenant.id).then(setNotes).finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, [tenant?.id]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.body.trim() || !tenant?.id || !user?.id) return;
    setSaving(true);
    try {
      await createNote(tenant.id, { entityType: form.entityType, entityId: form.entityId.trim(), authorId: user.id, body: form.body.trim() });
      setForm({ entityType: 'guest', entityId: '', body: '' });
      setShowForm(false);
      load();
    } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this note?')) return;
    await deleteNote(id); load();
  }

  if (loading) return (
    <div className="flex items-center justify-center h-80">
      <div className="h-10 w-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin dark:border-emerald-500/30 dark:border-t-emerald-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-white/35 dark:hover:text-white/60 mb-2 transition-colors">
            <ArrowLeft size={12} /> Admin
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <FileText size={14} className="text-emerald-500 dark:text-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-emerald-500 dark:text-emerald-400">CRUD</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Notes</h1>
          <p className="text-sm text-slate-400 dark:text-white/35 mt-0.5">{notes.length} notes</p>
        </div>
        <button onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all hover:-translate-y-0.5">
          {showForm ? <X size={14} /> : <Plus size={14} />}
          {showForm ? 'Cancel' : 'Add Note'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 dark:bg-[#1a1d2e] dark:border-white/8 dark:shadow-xl">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white/80 mb-5">Add New Note</h2>
          <form onSubmit={handleAdd} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL}>Entity Type</label>
              <select value={form.entityType} onChange={e => setForm(f => ({ ...f, entityType: e.target.value }))} className={INPUT}>
                <option value="guest">Guest</option>
                <option value="episode">Episode</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Entity ID</label>
              <input type="text" placeholder="e.g. guest-123" value={form.entityId} onChange={e => setForm(f => ({ ...f, entityId: e.target.value }))} className={INPUT} />
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL}>Note Body *</label>
              <textarea placeholder="Write your note here…" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} className={INPUT} rows={4} required />
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-2">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-40">
                <Send size={14} /> Save Note
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all dark:border-white/10 dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/8">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-100 dark:bg-[#1a1d2e] dark:border-white/5 p-16 flex flex-col items-center text-slate-300 dark:text-white/20">
          <FileText size={36} className="mb-3" /><p className="text-sm">No notes yet</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {notes.map((n, i) => (
            <div key={n.id} className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 dark:bg-[#1a1d2e] dark:border-white/5 dark:shadow-lg dark:hover:shadow-xl">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${CARD_ACCENTS[i % CARD_ACCENTS.length]}`} />
              <div className="flex items-start justify-between mb-3">
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold capitalize ${TYPE_BADGE[n.entityType] ?? 'bg-slate-100 text-slate-600 dark:bg-white/8 dark:text-white/40'}`}>
                  {n.entityType}
                </span>
                <button onClick={() => handleDelete(n.id)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:text-white/20 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-all">
                  <Trash2 size={13} />
                </button>
              </div>
              <p className="text-sm text-slate-700 dark:text-white/80 leading-relaxed line-clamp-3">{n.body}</p>
              {n.entityId && <p className="mt-2 text-[10px] font-mono text-slate-400 dark:text-white/25 truncate">{n.entityId}</p>}
              <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-white/25">
                <Clock3 size={10} />
                {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
