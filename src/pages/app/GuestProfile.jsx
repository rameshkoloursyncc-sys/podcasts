import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getGuestById, getPipelineStages, getNotes, createNote } from '../../services/api';
import { ArrowLeft, Mail, Tag, FileText, Send, Clock3 } from 'lucide-react';

const DIVIDER = 'border-black/[0.08] dark:border-white/[0.08] divide-black/[0.08] dark:divide-white/[0.08]';

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
    if (!id) return;
    Promise.all([
      getGuestById(id),
      getPipelineStages(),
      // GET /api/notes?entity_type=guest&entity_id={id}
      getNotes('guest', id),
    ])
      .then(([g, s, n]) => { setGuest(g ?? null); setStages(Array.isArray(s) ? s : []); setNotes(Array.isArray(n) ? n : []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAddNote(e) {
    e.preventDefault();
    if (!newNote.trim()) return;
    setSaving(true);
    try {
      // POST /api/notes  body: { entity_type, entity_id, body }
      const note = await createNote({
        entity_type: 'guest',
        entity_id: id,
        body: newNote.trim(),
      });
      if (note) setNotes(prev => [note, ...prev]);
      setNewNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-80 bg-white dark:bg-[#0f1117]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 border-4 border-black/10 border-t-black animate-spin dark:border-white/10 dark:border-t-white" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/25 dark:text-white/20">Loading…</p>
      </div>
    </div>
  );
  if (!guest) return <div className="p-8 text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">Guest not found.</div>;

  // API returns snake_case: stage_id, created_at, avatar_url
  const stage = stages.find(s => s.id === guest.stage_id);

  return (
    <div className="bg-white dark:bg-[#0f1117] text-black dark:text-white min-h-[calc(100vh-64px)] flex flex-col">
      
      {/* ══ HEADER ═════════════════════════════════════════════════════ */}
      <div className={`border-b ${DIVIDER} bg-white dark:bg-[#0a0c12]`}>
        <div className="px-8 py-5">
          <Link to="/app/guests" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors">
            <ArrowLeft size={10} /> Back to Guests
          </Link>
        </div>
        <div className={`px-8 py-8 border-t ${DIVIDER} flex flex-col md:flex-row items-start md:items-center justify-between gap-6`}>
          <div className="flex items-start md:items-center gap-6">
            <div className="h-24 w-24 flex items-center justify-center text-3xl font-extrabold bg-black/5 dark:bg-white/10 shrink-0">
              {guest.name?.slice(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-extrabold tracking-tight leading-none mb-3">{guest.name}</h1>
              <div className="flex items-center gap-2 mb-3">
                <Mail size={12} className="text-black/30 dark:text-white/20" />
                <p className="text-[11px] font-bold uppercase tracking-widest text-black/60 dark:text-white/50">{guest.email}</p>
              </div>
              {stage && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60">
                  <Tag size={8} /> {stage.label}
                </span>
              )}
            </div>
          </div>
          <div className="md:text-right shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30">Added</p>
            <p className="text-sm font-bold mt-1">
              {guest.created_at ? new Date(guest.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* ══ CONTENT GRID ══════════════════════════════════════════════════ */}
      <div className={`flex flex-col md:flex-row flex-1 divide-y md:divide-y-0 md:divide-x ${DIVIDER}`}>
        
        {/* Bio Section */}
        <div className="flex-1">
          <div className={`px-8 py-5 border-b ${DIVIDER}`}>
            <h2 className="text-[11px] font-bold uppercase tracking-widest">Biography / Info</h2>
          </div>
          <div className="p-8">
            {guest.bio ? (
              <p className="text-sm font-bold text-black/70 dark:text-white/70 leading-relaxed whitespace-pre-wrap">{guest.bio}</p>
            ) : (
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 dark:text-white/30">No biography provided.</p>
            )}
          </div>

          {/* Social / extra info if available */}
          {(guest.twitter || guest.linkedin || guest.website) && (
            <div className={`px-8 py-5 border-t ${DIVIDER}`}>
              <h2 className="text-[11px] font-bold uppercase tracking-widest mb-4">Links</h2>
              <div className="flex flex-wrap gap-3">
                {guest.twitter && <a href={guest.twitter} target="_blank" rel="noreferrer" className="text-xs font-bold underline text-black/60 dark:text-white/60">Twitter</a>}
                {guest.linkedin && <a href={guest.linkedin} target="_blank" rel="noreferrer" className="text-xs font-bold underline text-black/60 dark:text-white/60">LinkedIn</a>}
                {guest.website && <a href={guest.website} target="_blank" rel="noreferrer" className="text-xs font-bold underline text-black/60 dark:text-white/60">Website</a>}
              </div>
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div className="flex-1 flex flex-col min-w-0 bg-black/[0.02] dark:bg-white/[0.02]">
          <div className={`px-8 py-5 border-b ${DIVIDER} flex items-center justify-between`}>
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-widest">Notes</h2>
              <p className="text-[9px] font-bold uppercase tracking-widest text-black/30 dark:text-white/20 mt-1">{notes.length} notes recorded</p>
            </div>
            <FileText size={14} className="text-black/20 dark:text-white/10" />
          </div>
          
          <div className={`px-8 py-6 border-b ${DIVIDER}`}>
            <form onSubmit={handleAddNote} className="flex flex-col sm:flex-row gap-4">
              <input type="text" value={newNote} onChange={e => setNewNote(e.target.value)} placeholder="Add a note about this guest…"
                className={`flex-1 px-4 py-3 border ${DIVIDER} bg-white dark:bg-[#0a0c12] text-xs font-bold placeholder:text-black/30 dark:placeholder:text-white/20 focus:outline-none focus:border-black dark:focus:border-white transition-colors`} />
              <button type="submit" disabled={saving || !newNote.trim()}
                className="flex items-center justify-center gap-2 border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-6 py-3 text-[10px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-40">
                <Send size={10} /> Add Note
              </button>
            </form>
          </div>

          <div className="flex-1 overflow-y-auto">
            {notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-black/20 dark:text-white/15">
                <FileText size={32} className="mb-4" />
                <p className="text-[10px] font-bold uppercase tracking-widest">No notes yet</p>
              </div>
            ) : (
              <div className={`divide-y ${DIVIDER}`}>
                {notes.map((n) => (
                  <div key={n.id} className="relative p-8 group transition-colors hover:bg-black/[0.04] dark:hover:bg-white/[0.04]">
                    <p className="text-sm font-bold text-black/90 dark:text-white/90 leading-relaxed mb-4">{n.body}</p>
                    <div className="flex items-center gap-2">
                      <Clock3 size={10} className="text-black/30 dark:text-white/20" />
                      <span className="text-[9px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30">
                        {n.created_at ? new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </span>
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
