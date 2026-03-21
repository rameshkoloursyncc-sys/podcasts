import { useEffect, useState } from 'react';
import { getGuests, getEpisodes, getBookings, getNotes, createNote } from '../../services/api';
import { FileText, Mic2, Users, Clock3, CalendarDays, RefreshCw, Send } from 'lucide-react';

const DIVIDER = 'border-black/[0.08] dark:border-white/[0.08] divide-black/[0.08] dark:divide-white/[0.08]';

// API note entity types: guest | episode | booking
const TYPE_META = {
  guest: { icon: Users, badge: 'bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60', label: 'Guest' },
  episode: { icon: Mic2, badge: 'bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60', label: 'Episode' },
  booking: { icon: CalendarDays, badge: 'bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60', label: 'Booking' },
};

/**
 * The /api/notes endpoint REQUIRES entity_type + entity_id params.
 * There is no "get all notes" endpoint.
 *
 * Strategy:
 *  1. Fetch all guests → for each, call getNotes('guest', id)
 *     (We can also grab guest list first to get page 1 sample)
 *  2. Same for episodes and bookings
 *
 * To keep it practical, we load the first page of each resource
 * then batch-fetch their notes in parallel.
 */
async function fetchAllNotes() {
  // Load first page of each entity type (up to 50)
  const [guests, episodes, bookings] = await Promise.all([
    getGuests({ per_page: 50 }),
    getEpisodes({ per_page: 50 }),
    getBookings({ per_page: 50 }),
  ]);

  // Build a flat list of {entity_type, entity_id, entity_name} to fetch notes for
  const targets = [
    ...guests.map(g => ({ entity_type: 'guest', entity_id: g.id, entity_name: g.name })),
    ...episodes.map(e => ({ entity_type: 'episode', entity_id: e.id, entity_name: e.title })),
    ...bookings.map(b => ({ entity_type: 'booking', entity_id: b.id, entity_name: b.guest?.name ?? 'Booking' })),
  ];

  // Parallel fetch — but cap concurrency to avoid flooding
  const CHUNK_SIZE = 10;
  const allNotes = [];
  for (let i = 0; i < targets.length; i += CHUNK_SIZE) {
    const chunk = targets.slice(i, i + CHUNK_SIZE);
    const results = await Promise.allSettled(
      chunk.map(t => getNotes(t.entity_type, t.entity_id).then(notes =>
        notes.map(n => ({ ...n, _entity_name: t.entity_name }))
      ))
    );
    results.forEach(r => {
      if (r.status === 'fulfilled') allNotes.push(...r.value);
    });
  }

  // Sort by created_at desc
  return allNotes.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  function load(isRefresh = false) {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    fetchAllNotes()
      .then(n => setNotes(n))
      .catch(console.error)
      .finally(() => { setLoading(false); setRefreshing(false); });
  }

  useEffect(() => { load(); }, []);

  // Filter by entity_type (snake_case from API)
  const filtered = notes.filter(n => filter === 'all' || n.entity_type === filter);

  if (loading) return (
    <div className="flex items-center justify-center h-80 bg-white dark:bg-[#0f1117]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 border-4 border-black/10 border-t-black animate-spin dark:border-white/10 dark:border-t-white" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/25 dark:text-white/20">Loading notes…</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-[#0f1117] text-black dark:text-white min-h-[calc(100vh-64px)] flex flex-col">

      {/* ══ HEADER ═════════════════════════════════════════════════════ */}
      <div className={`border-b ${DIVIDER} bg-white dark:bg-[#0a0c12]`}>
        <div className="px-8 py-7 flex items-center justify-between gap-6">
          <div>
            {/* <div className="flex items-center gap-2 mb-2">
              <FileText size={12} className="text-emerald-500 dark:text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 dark:text-emerald-400">Notes</span>
            </div> */}
            <h1 className="text-3xl font-extrabold tracking-tight leading-none">All Notes.</h1>
            <p className="text-sm text-black/35 dark:text-white/30 mt-2">{notes.length} notes across all entities</p>
          </div>
          <button
            onClick={() => load(true)}
            disabled={refreshing}
            className={`border ${DIVIDER} px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:border-black dark:hover:border-white transition-colors flex items-center gap-2 disabled:opacity-40`}
          >
            <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Filter strip */}
        <div className={`grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x ${DIVIDER} border-t ${DIVIDER}`}>
          {[
            { key: 'all', label: 'All Notes', count: notes.length },
            { key: 'guest', label: 'Guest Notes', count: notes.filter(n => n.entity_type === 'guest').length },
            { key: 'episode', label: 'Episode Notes', count: notes.filter(n => n.entity_type === 'episode').length },
            { key: 'booking', label: 'Booking Notes', count: notes.filter(n => n.entity_type === 'booking').length },
          ].map(({ key, label, count }) => {
            const active = filter === key;
            return (
              <button key={key} onClick={() => setFilter(key)}
                className={`relative p-6 text-left group transition-colors ${active ? 'bg-black/[0.04] dark:bg-white/[0.04]' : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'}`}>
                <div className={`absolute top-0 right-0 h-full w-1 transition-opacity ${active ? 'bg-black dark:bg-white opacity-100' : 'bg-transparent opacity-0 group-hover:bg-black/10 dark:group-hover:bg-white/10 group-hover:opacity-100'}`} />
                <p className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-black dark:text-white' : 'text-black/40 dark:text-white/30'}`}>{label}</p>
                <p className="mt-2 text-3xl font-extrabold tracking-tight">{count}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ══ CONTENT GRID ══════════════════════════════════════════════════ */}
      <div className={`flex-1 border-b ${DIVIDER}`}>
        {filtered.length === 0 ? (
          <div className="py-24 flex flex-col items-center text-black/20 dark:text-white/15 select-none">
            <FileText size={36} className="mb-3" />
            <p className="text-xs font-bold uppercase tracking-widest">No notes yet</p>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-2 text-black/15 dark:text-white/10">Add notes from Guest, Episode, or Booking detail pages</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 divide-y sm:divide-y-0 ${DIVIDER}`}>
            {filtered.map((n) => {
              // API response: entity_type, entity_id, created_at, body (all snake_case)
              const meta = TYPE_META[n.entity_type] ?? TYPE_META.guest;
              const Icon = meta.icon;
              return (
                <div key={n.id} className={`relative p-6 border-b sm:border-r ${DIVIDER} hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group`}>

                  <div className="flex items-start justify-between mb-5">
                    <div className="h-10 w-10 border border-dashed border-black/20 dark:border-white/20 flex items-center justify-center">
                      <Icon size={16} className="text-black/50 dark:text-white/50" />
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${meta.badge}`}>
                      {meta.label}
                    </span>
                  </div>

                  {n._entity_name && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30 mb-2 truncate">
                      {n._entity_name}
                    </p>
                  )}

                  <p className="text-sm font-bold text-black/90 dark:text-white/90 leading-relaxed line-clamp-4">{n.body}</p>

                  <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10 flex items-center gap-2">
                    <Clock3 size={10} className="text-black/30 dark:text-white/20" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30">
                      {n.created_at ? new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
