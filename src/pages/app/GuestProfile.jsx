import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getGuestById, getPipelineStages, getNotes, createNote } from '../../services/api';
import { ArrowLeft, Mail, Tag, FileText, Send, Clock3 } from 'lucide-react';

const GRADIENTS = ['from-violet-600 to-purple-700','from-blue-600 to-cyan-600','from-pink-500 to-rose-600','from-amber-500 to-orange-600','from-emerald-500 to-teal-600'];

export default function GuestProfile() {
  const { id } = useParams();
  const { tenant, user } = useAuth();
  const [guest, setGuest] = useState(null);
  const [stages, setStages] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!tenant?.id || !id) return;
    Promise.all([getGuestById(id), getPipelineStages(tenant.id), getNotes(tenant.id, 'guest', id)])
      .then(([g, s, n]) => { setGuest(g ?? null); setStages(s); setNotes(n); })
      .finally(() => setLoading(false));
  }, [tenant?.id, id]);

  async function handleAddNote(e) {
    e.preventDefault();
    if (!newNote.trim() || !tenant?.id || !user?.id) return;
    setSaving(true);
    try {
      const note = await createNote(tenant.id, { entityType: 'guest', entityId: id, authorId: user.id, body: newNote.trim() });
      setNotes(prev => [note, ...prev]);
      setNewNote('');
    } finally { setSaving(false); }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-80">
      <div className="h-10 w-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin dark:border-violet-500/30 dark:border-t-violet-500" />
    </div>
  );
  if (!guest) return <div className="p-6 text-slate-500 dark:text-white/40">Guest not found.</div>;

  const stage = stages.find(s => s.id === guest.stageId);
  const stageIdx = stages.findIndex(s => s.id === guest.stageId);
  const grad = GRADIENTS[Math.abs((id.charCodeAt(0) || 0)) % GRADIENTS.length];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] p-6 space-y-6">
      <Link to="/app/guests" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-white/40 dark:hover:text-white/70 transition-colors">
        <ArrowLeft size={13} /> Back to Guests
      </Link>

      {/* Profile card */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-[#1a1d2e] dark:border-white/5 dark:shadow-xl">
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${grad}`} />
        <div className="p-6 flex items-start gap-5">
          <div className={`h-20 w-20 rounded-2xl bg-gradient-to-br ${grad} flex items-center justify-center text-2xl font-extrabold text-white shadow-2xl flex-none`}>
            {guest.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">{guest.name}</h1>
            <div className="flex items-center gap-1.5 mt-1">
              <Mail size={12} className="text-slate-400 dark:text-white/30" />
              <p className="text-sm text-slate-500 dark:text-white/40">{guest.email}</p>
            </div>
            {stage && (
              <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-gradient-to-r ${GRADIENTS[stageIdx % GRADIENTS.length]} text-white shadow-md`}>
                <Tag size={9} /> {stage.label}
              </span>
            )}
            {guest.bio && <p className="mt-3 text-sm text-slate-600 dark:text-white/50 leading-relaxed max-w-lg">{guest.bio}</p>}
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] text-slate-400 dark:text-white/25 uppercase tracking-wider">Added</p>
            <p className="text-xs font-semibold text-slate-600 dark:text-white/50 mt-0.5">
              {new Date(guest.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-[#1a1d2e] dark:border-white/5 dark:shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5">
          <div>
            <h2 className="text-sm font-bold text-slate-800 dark:text-white/80">Notes</h2>
            <p className="text-xs text-slate-400 dark:text-white/30 mt-0.5">{notes.length} notes for this guest</p>
          </div>
          <FileText size={14} className="text-slate-300 dark:text-white/25" />
        </div>
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5">
          <form onSubmit={handleAddNote} className="flex gap-3">
            <input type="text" value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note about this guest…"
              className="flex-1 rounded-xl bg-slate-50 border border-slate-200 px-4 py-2.5 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-200 dark:bg-white/5 dark:border-white/8 dark:text-white/70 dark:placeholder:text-white/25 dark:focus:ring-1 dark:focus:ring-violet-500/50" />
            <button type="submit" disabled={saving || !newNote.trim()}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all disabled:opacity-40">
              <Send size={12} /> Add Note
            </button>
          </form>
        </div>
        <div className="p-6 space-y-3">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center py-10 text-slate-300 dark:text-white/20">
              <FileText size={28} className="mb-2" /><p className="text-xs">No notes yet — add one above</p>
            </div>
          ) : notes.map((n, i) => (
            <div key={n.id} className="relative overflow-hidden rounded-xl bg-slate-50 border border-slate-100 p-4 dark:bg-white/4 dark:border-white/5">
              <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${GRADIENTS[i % GRADIENTS.length]} rounded-l-xl`} />
              <p className="text-sm text-slate-700 dark:text-white/75 leading-relaxed pl-2">{n.body}</p>
              <div className="flex items-center gap-1.5 mt-2 pl-2">
                <Clock3 size={9} className="text-slate-400 dark:text-white/20" />
                <span className="text-[10px] text-slate-400 dark:text-white/25">
                  {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
