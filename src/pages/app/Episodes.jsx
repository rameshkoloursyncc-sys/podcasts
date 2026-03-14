import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getEpisodes, getGuestById } from '../../services/api';
import { Mic2, Search, ArrowRight, Radio, Clock3, CheckCircle2, FileEdit } from 'lucide-react';

const DIVIDER = 'border-black/[0.08] dark:border-white/[0.08] divide-black/[0.08] dark:divide-white/[0.08]';

const STATUS_META = {
  draft:     { badge: 'bg-black/5 text-black dark:bg-white/10 dark:text-white', icon: FileEdit,     label: 'Draft' },
  scheduled: { badge: 'bg-black/5 text-black dark:bg-white/10 dark:text-white', icon: Clock3,       label: 'Scheduled' },
  recorded:  { badge: 'bg-black/5 text-black dark:bg-white/10 dark:text-white', icon: CheckCircle2, label: 'Recorded' },
  published: { badge: 'bg-black text-white dark:bg-white dark:text-black',          icon: Radio,        label: 'Published' },
};

export default function Episodes() {
  const { tenant } = useAuth();
  const [episodes, setEpisodes] = useState([]);
  const [guestNames, setGuestNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!tenant?.id) return;
    getEpisodes(tenant.id).then(async list => {
      setEpisodes(list);
      const names = {};
      await Promise.all(list.map(async ep => { if (ep.guestId) { const g = await getGuestById(ep.guestId); if (g) names[ep.guestId] = g.name; } }));
      setGuestNames(names);
    }).finally(() => setLoading(false));
  }, [tenant?.id]);

  const filtered = episodes.filter(ep => (filter === 'all' || ep.status === filter) && (!search || ep.title.toLowerCase().includes(search.toLowerCase())));

  if (loading) return (
    <div className="flex items-center justify-center h-80 bg-white dark:bg-[#0f1117]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 border-4 border-black/10 border-t-black animate-spin dark:border-white/10 dark:border-t-white" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/25 dark:text-white/20">Loading…</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-[#0f1117] text-black dark:text-white min-h-[calc(100vh-64px)] flex flex-col">
      
      {/* ══ HEADER ═════════════════════════════════════════════════════ */}
      <div className={`border-b ${DIVIDER} bg-white dark:bg-[#0a0c12]`}>
        <div className="px-8 py-7 flex items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Mic2 size={12} className="text-pink-500 dark:text-pink-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-pink-500 dark:text-pink-400">Content</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight leading-none">Episodes.</h1>
            <p className="text-sm text-black/35 dark:text-white/30 mt-2">{episodes.length} total episodes</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/20" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search episodes…"
                className={`pl-10 pr-4 py-2 border ${DIVIDER} bg-black/[0.02] dark:bg-white/[0.02] text-xs font-bold focus:outline-none focus:border-black dark:focus:border-white w-52 transition-all focus:w-64 placeholder:text-black/30 dark:placeholder:text-white/20`} />
            </div>
            <Link to="/admin/episodes" className={`border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 text-xs font-bold hover:opacity-80 transition-opacity`}>
              + New Episode
            </Link>
          </div>
        </div>

        {/* Status filter strip */}
        <div className={`grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 ${DIVIDER} border-t ${DIVIDER}`}>
          {Object.entries(STATUS_META).map(([status, meta]) => {
            const count = episodes.filter(e => e.status === status).length;
            const active = filter === status;
            return (
              <button key={status} onClick={() => setFilter(filter === status ? 'all' : status)}
                className={`relative overflow-hidden p-6 text-left group transition-colors ${active ? 'bg-black/[0.04] dark:bg-white/[0.04]' : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'}`}>
                <div className={`absolute top-0 right-0 h-full w-1 transition-opacity ${active ? 'bg-black dark:bg-white opacity-100' : 'bg-transparent opacity-0 group-hover:bg-black/10 dark:group-hover:bg-white/10 group-hover:opacity-100'}`} />
                <p className={`text-[10px] font-bold uppercase tracking-widest ${active ? 'text-black dark:text-white' : 'text-black/40 dark:text-white/30'}`}>{meta.label}</p>
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
            <Mic2 size={36} className="mb-3" />
            <p className="text-xs font-bold uppercase tracking-widest">No episodes found</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 divide-y sm:divide-y-0 ${DIVIDER}`}>
            {filtered.map((ep) => {
              const meta = STATUS_META[ep.status] ?? STATUS_META.draft;
              const Icon = meta.icon;
              return (
                <Link key={ep.id} to={`/app/episodes/${ep.id}`}
                  className={`relative p-6 border-b sm:border-r ${DIVIDER} hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group`}>
                  
                  <div className="h-10 w-10 border border-dashed border-black/20 dark:border-white/20 mb-5 flex items-center justify-center">
                    <Mic2 size={16} className="text-black/50 dark:text-white/50" />
                  </div>
                  
                  <h3 className="text-sm font-bold text-black dark:text-white line-clamp-2">{ep.title || 'Untitled Episode'}</h3>
                  {ep.guestId && guestNames[ep.guestId] && (
                    <p className="text-[11px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30 mt-2 truncate">
                      with {guestNames[ep.guestId]}
                    </p>
                  )}
                  
                  <div className="mt-8 flex items-center justify-between border-t border-black/10 dark:border-white/10 pt-4">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${meta.badge}`}>
                      <Icon size={8} /> {meta.label}
                    </span>
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-black/30 dark:text-white/20 group-hover:text-black dark:group-hover:text-white transition-colors">View <ArrowRight size={10} /></span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
