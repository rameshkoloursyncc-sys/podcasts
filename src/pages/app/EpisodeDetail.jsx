import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEpisodeById } from '../../services/api';
import { ArrowLeft, Mic2, Radio, Clock3, CheckCircle2, FileEdit, Calendar, User } from 'lucide-react';

const DIVIDER = 'border-black/[0.08] dark:border-white/[0.08] divide-black/[0.08] dark:divide-white/[0.08]';

// API statuses: draft | scheduled | recorded | published
const STATUS_META = {
  draft:     { icon: FileEdit,     label: 'Draft',     badge: 'bg-black/5 text-black dark:bg-white/10 dark:text-white' },
  scheduled: { icon: Clock3,       label: 'Scheduled', badge: 'bg-black/5 text-black dark:bg-white/10 dark:text-white' },
  recorded:  { icon: CheckCircle2, label: 'Recorded',  badge: 'bg-black/5 text-black dark:bg-white/10 dark:text-white' },
  published: { icon: Radio,        label: 'Published', badge: 'bg-black text-white dark:bg-white dark:text-black' },
};

export default function EpisodeDetail() {
  const { id } = useParams();
  const [episode, setEpisode] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    // GET /api/episodes/{id} returns episode with guest, booking, notes nested
    getEpisodeById(id)
      .then(ep => setEpisode(ep ?? null))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-80 bg-white dark:bg-[#0f1117]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 border-4 border-black/10 border-t-black animate-spin dark:border-white/10 dark:border-t-white" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/25 dark:text-white/20">Loading…</p>
      </div>
    </div>
  );
  if (!episode) return <div className="p-8 text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/40">Episode not found.</div>;

  const meta = STATUS_META[episode.status] ?? STATUS_META.draft;
  const Icon = meta.icon;

  // API returns snake_case: guest_id, recorded_at, published_at, created_at
  // The detail endpoint may include a nested `guest` object
  const guest = episode.guest ?? null;

  return (
    <div className="bg-white dark:bg-[#0f1117] text-black dark:text-white min-h-[calc(100vh-64px)] flex flex-col">
      
      {/* ══ HEADER ═════════════════════════════════════════════════════ */}
      <div className={`border-b ${DIVIDER} bg-white dark:bg-[#0a0c12]`}>
        <div className="px-8 py-5">
          <Link to="/app/episodes" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black dark:text-white/40 dark:hover:text-white transition-colors">
            <ArrowLeft size={10} /> Back to Episodes
          </Link>
        </div>
        
        <div className={`px-8 py-10 border-t ${DIVIDER} flex flex-col md:flex-row items-start md:items-center justify-between gap-6`}>
          <div className="flex items-start md:items-center gap-6">
            <div className="h-24 w-24 flex items-center justify-center bg-black/5 dark:bg-white/10 shrink-0">
              <Mic2 size={32} className="text-black/50 dark:text-white/50" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight leading-none mb-4">{episode.title || 'Untitled Episode'}</h1>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest ${meta.badge}`}>
                <Icon size={10} /> {meta.label}
              </span>
            </div>
          </div>
          <div className="md:text-right shrink-0">
             <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30">ID</p>
             <p className="text-[11px] font-bold mt-1 text-black/60 dark:text-white/60 tracking-widest uppercase">{episode.id?.slice(0, 8)}</p>
          </div>
        </div>
      </div>

      {/* ══ METADATA GRID ══════════════════════════════════════════════════ */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 lg:divide-x ${DIVIDER} border-b ${DIVIDER}`}>
        
        {/* Guest */}
        {guest ? (
          <div className={`p-8 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors border-b lg:border-b-0 ${DIVIDER}`}>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-black/5 dark:bg-white/10 flex items-center justify-center text-xs font-bold shrink-0">
                {guest.name?.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30 mb-1">Guest</p>
                <Link to={`/app/guests/${guest.id}`} className="text-sm font-bold text-black dark:text-white hover:underline truncate block">
                  {guest.name}
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className={`p-8 text-black/30 dark:text-white/20 border-b lg:border-b-0 ${DIVIDER} flex items-center gap-4`}>
            <div className={`h-12 w-12 border border-dashed ${DIVIDER} flex items-center justify-center shrink-0`}>
              <User size={16} />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest mb-1">Guest</p>
              <p className="text-sm font-bold truncate">None assigned</p>
            </div>
          </div>
        )}

        {/* Created — API: created_at */}
        <div className={`p-8 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors border-b lg:border-b-0 ${DIVIDER}`}>
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 border ${DIVIDER} flex items-center justify-center shrink-0`}>
              <Calendar size={16} className="text-black/40 dark:text-white/40" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30 mb-1">Created</p>
              <p className="text-sm font-bold text-black dark:text-white">
                {episode.created_at ? new Date(episode.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Recorded — API: recorded_at */}
        <div className={`p-8 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors border-b md:border-b-0 ${DIVIDER}`}>
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 ${episode.recorded_at ? 'bg-black/5 dark:bg-white/10' : 'border border-dashed ' + DIVIDER} flex items-center justify-center shrink-0`}>
              <CheckCircle2 size={16} className={episode.recorded_at ? 'text-black/50 dark:text-white/50' : 'text-black/20 dark:text-white/20'} />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30 mb-1">Recorded</p>
              {episode.recorded_at ? (
                <p className="text-sm font-bold text-black dark:text-white">{new Date(episode.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              ) : (
                <p className="text-sm font-bold text-black/30 dark:text-white/20">—</p>
              )}
            </div>
          </div>
        </div>

        {/* Published — API: published_at */}
        <div className="p-8 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
          <div className="flex items-center gap-4">
            <div className={`h-12 w-12 ${episode.published_at ? 'bg-black/5 dark:bg-white/10' : 'border border-dashed ' + DIVIDER} flex items-center justify-center shrink-0`}>
              <Radio size={16} className={episode.published_at ? 'text-black/50 dark:text-white/50' : 'text-black/20 dark:text-white/20'} />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30 mb-1">Published</p>
              {episode.published_at ? (
                <p className="text-sm font-bold text-black dark:text-white">{new Date(episode.published_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              ) : (
                <p className="text-sm font-bold text-black/30 dark:text-white/20">—</p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ══ NOTES SECTION (if available) ══════════════════════════════════ */}
      {episode.notes && episode.notes.length > 0 && (
        <div className="flex-1">
          <div className={`px-8 py-5 border-b ${DIVIDER}`}>
            <h2 className="text-[11px] font-bold uppercase tracking-widest">Notes</h2>
          </div>
          <div className={`divide-y ${DIVIDER}`}>
            {episode.notes.map(n => (
              <div key={n.id} className="p-8">
                <p className="text-sm font-bold text-black/90 dark:text-white/90 leading-relaxed">{n.body}</p>
                <p className="text-[9px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30 mt-3">
                  {n.created_at ? new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
