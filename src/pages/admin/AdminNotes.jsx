import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getGuests, getEpisodes, getBookings, getNotes, createNote, deleteNote } from '../../services/api';
import { FileText, ArrowLeft, Plus, Trash2, X, Send, Clock3 } from 'lucide-react';

const DIVIDER = 'border-black/[0.08] dark:border-white/[0.08] divide-black/[0.08] dark:divide-white/[0.08]';
const INPUT   = 'w-full border border-black/20 dark:border-white/20 bg-transparent px-4 py-3 text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/25 focus:outline-none focus:border-black dark:focus:border-white transition-colors';
const LABEL   = 'block text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30 mb-2';

const BTN_PRIMARY = 'flex items-center gap-2 border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 text-xs font-bold hover:opacity-80 transition-opacity disabled:opacity-50';
const BTN_GHOST   = `flex items-center gap-2 border ${DIVIDER} px-5 py-2.5 text-xs font-bold text-black/60 dark:text-white/60 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all`;

// API note types: guest | episode | booking
const TYPE_BADGE = {
  guest:   'bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60',
  episode: 'bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60',
  booking: 'bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60',
};

export default function AdminNotes() {
  const { tenant, user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ entity_type: 'guest', entity_id: '', body: '' });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  /**
   * The API requires entity_type + entity_id for GET /api/notes.
   * There is no "get all notes" endpoint.
   * Strategy: fetch first page of guests/episodes/bookings, then batch-fetch their notes.
   */
  async function fetchAllNotes() {
    const [guests, episodes, bookings] = await Promise.all([
      getGuests({ per_page: 50 }),
      getEpisodes({ per_page: 50 }),
      getBookings({ per_page: 50 }),
    ]);
    const targets = [
      ...guests.map(g => ({ entity_type: 'guest',   entity_id: g.id })),
      ...episodes.map(e => ({ entity_type: 'episode', entity_id: e.id })),
      ...bookings.map(b => ({ entity_type: 'booking', entity_id: b.id })),
    ];
    const CHUNK = 10;
    const all = [];
    for (let i = 0; i < targets.length; i += CHUNK) {
      const chunk = targets.slice(i, i + CHUNK);
      const results = await Promise.allSettled(chunk.map(t => getNotes(t.entity_type, t.entity_id)));
      results.forEach(r => { if (r.status === 'fulfilled') all.push(...r.value); });
    }
    return all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  function load() {
    setLoading(true);
    fetchAllNotes().then(list => setNotes(list)).catch(console.error).finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.body.trim()) return;
    setSaving(true);
    try {
      await createNote({ entity_type: form.entity_type, entity_id: form.entity_id.trim(), body: form.body.trim() });
      setForm({ entity_type: 'guest', entity_id: '', body: '' });
      setShowForm(false);
      load();
    } catch (err) { console.error(err); } finally { setSaving(false); }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this note?')) return;
    await deleteNote(id); load();
  }

  if (loading) return (
    <div className="flex items-center justify-center h-80 bg-white dark:bg-[#0f1117]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 border-4 border-black/10 border-t-black animate-spin dark:border-white/10 dark:border-t-white" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/25 dark:text-white/20">Loading…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1117] text-black dark:text-white">
      <div className={`border-x ${DIVIDER}`}>
        {/* Header Billboard */}
        <div className={`px-6 py-6 flex items-center justify-between gap-6 border-y ${DIVIDER} bg-white dark:bg-[#0a0c12]`}>
          <div>
            <Link to="/admin" className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30 hover:text-black dark:hover:text-white mb-3 transition-colors">
              <ArrowLeft size={10} /> Admin Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight leading-none flex items-center gap-3">
              <FileText size={24} className="text-black/20 dark:text-white/20" /> Notes
            </h1>
            <p className="text-sm text-black/40 dark:text-white/30 mt-2">{notes.length} notes</p>
          </div>
          <button onClick={() => setShowForm(v => !v)} className={BTN_PRIMARY}>
            {showForm ? <X size={14} /> : <Plus size={14} />} {showForm ? 'Cancel' : 'Add Note'}
          </button>
        </div>

        {/* Content Body */}
        <div className={`border-b ${DIVIDER} flex flex-col`}>
          
          {/* Form */}
          {showForm && (
            <div className={`border-b ${DIVIDER} p-8 bg-black/[0.02] dark:bg-white/[0.02]`}>
              <h2 className="text-sm font-bold tracking-tight uppercase mb-6">Add New Note</h2>
              <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={LABEL}>Entity Type</label>
                  <select value={form.entity_type} onChange={e => setForm(f => ({ ...f, entity_type: e.target.value }))} className={INPUT}>
                    <option value="guest"   className="bg-white dark:bg-black">Guest</option>
                    <option value="episode" className="bg-white dark:bg-black">Episode</option>
                    <option value="booking" className="bg-white dark:bg-black">Booking</option>
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Entity ID</label>
                  <input type="text" placeholder="UUID of the guest, episode, or booking" value={form.entity_id} onChange={e => setForm(f => ({ ...f, entity_id: e.target.value }))} className={INPUT} />
                </div>
                <div className="md:col-span-2">
                  <label className={LABEL}>Note Body *</label>
                  <textarea placeholder="Write your note here…" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} className={INPUT} rows={4} required />
                </div>
                <div className="md:col-span-2 flex items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10 mt-2">
                  <button type="button" onClick={() => setShowForm(false)} className={BTN_GHOST}>Cancel</button>
                  <button type="submit" disabled={saving} className={BTN_PRIMARY}><Send size={14} /> Save Note</button>
                </div>
              </form>
            </div>
          )}

          {/* Notes list */}
          <div>
            {notes.length === 0 ? (
              <div className="py-20 flex flex-col items-center text-black/20 dark:text-white/15 select-none">
                <FileText size={36} className="mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest">No notes yet</p>
              </div>
            ) : (
              <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 divide-x divide-y md:divide-y-0 ${DIVIDER}`}>
                {notes.map((n, i) => (
                  <div key={n.id} className={`p-6 relative overflow-hidden bg-white dark:bg-[#0f1117] hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors border-b md:border-b-0 ${DIVIDER}`}>
                    <div className="flex items-start justify-between mb-4">
                      {/* API returns snake_case: entity_type, entity_id, created_at */}
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TYPE_BADGE[n.entity_type] ?? 'bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60'}`}>
                        {n.entity_type}
                      </span>
                      <button onClick={() => handleDelete(n.id)} className="text-black/30 hover:text-red-500 dark:text-white/20 dark:hover:text-red-400 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <p className="text-sm font-medium text-black/80 dark:text-white/80 leading-relaxed min-h-[40px]">{n.body}</p>
                    {n.entity_id && <p className="mt-4 text-[10px] font-mono text-black/40 dark:text-white/30 truncate">{n.entity_id}</p>}
                    <div className="mt-3 flex items-center gap-1.5 text-[10px] uppercase font-bold text-black/30 dark:text-white/25">
                      <Clock3 size={10} />
                      {n.created_at ? new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
