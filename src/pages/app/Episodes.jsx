import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getEpisodes, getGuestById } from '../../services/api';
import { Mic2, Search, ArrowRight, Radio, Clock3, CheckCircle2, FileEdit } from 'lucide-react';

const STATUS_META = {
  draft:     { color: 'from-slate-500 to-slate-600',    badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/20', icon: FileEdit,     label: 'Draft' },
  scheduled: { color: 'from-amber-600 to-orange-600',   badge: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/20',   icon: Clock3,       label: 'Scheduled' },
  recorded:  { color: 'from-emerald-600 to-teal-600',   badge: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/20', icon: CheckCircle2, label: 'Recorded' },
  published: { color: 'from-blue-600 to-cyan-600',      badge: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/20',          icon: Radio,        label: 'Published' },
};
const CARD_ACCENT = ['from-violet-600 to-purple-700','from-blue-600 to-cyan-600','from-pink-500 to-rose-600','from-amber-500 to-orange-600','from-emerald-500 to-teal-600','from-indigo-600 to-violet-700'];

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
    <div className="flex items-center justify-center h-80">
      <div className="h-10 w-10 rounded-full border-4 border-pink-200 border-t-pink-600 animate-spin dark:border-pink-500/30 dark:border-t-pink-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Mic2 size={14} className="text-pink-500 dark:text-pink-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-pink-500 dark:text-pink-400">Content</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Episodes</h1>
          <p className="text-sm text-slate-400 dark:text-white/35 mt-0.5">{episodes.length} total episodes</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/25" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search episodes…"
              className="pl-8 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-200 w-52 dark:bg-white/5 dark:border-white/8 dark:text-white/60 dark:placeholder:text-white/25 dark:focus:ring-1 dark:focus:ring-pink-500/50" />
          </div>
          <Link to="/admin/episodes" className="rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all hover:-translate-y-0.5">
            + New Episode
          </Link>
        </div>
      </div>

      {/* Status filter cards */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(STATUS_META).map(([status, meta]) => {
          const Icon = meta.icon;
          const count = episodes.filter(e => e.status === status).length;
          return (
            <button key={status} onClick={() => setFilter(filter === status ? 'all' : status)}
              className={`relative overflow-hidden rounded-2xl p-4 text-left shadow-lg transition-all hover:-translate-y-0.5 ${filter === status ? 'ring-2 ring-violet-400/50 dark:ring-white/30' : ''}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${meta.color}`} />
              <div className="absolute -right-3 -top-3 h-16 w-16 rounded-full bg-white/10" />
              <div className="relative z-10">
                <Icon size={16} className="text-white/70 mb-2" />
                <p className="text-2xl font-extrabold text-white">{count}</p>
                <p className="text-xs text-white/60 capitalize mt-0.5">{meta.label}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Episode cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-100 dark:bg-[#1a1d2e] dark:border-white/5 p-16 flex flex-col items-center text-slate-300 dark:text-white/20">
          <Mic2 size={36} className="mb-3" /><p className="text-sm">No episodes found</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ep, i) => {
            const meta = STATUS_META[ep.status] ?? STATUS_META.draft;
            const Icon = meta.icon;
            return (
              <Link key={ep.id} to={`/app/episodes/${ep.id}`}
                className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 hover:-translate-y-1 dark:bg-[#1a1d2e] dark:border-white/5 dark:shadow-lg dark:hover:shadow-xl dark:hover:border-white/10">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${CARD_ACCENT[i % CARD_ACCENT.length]}`} />
                <div className={`h-11 w-11 rounded-xl bg-gradient-to-br ${CARD_ACCENT[i % CARD_ACCENT.length]} flex items-center justify-center mb-4 shadow-lg`}>
                  <Mic2 size={18} className="text-white" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white/90 group-hover:text-slate-900 dark:group-hover:text-white line-clamp-2">{ep.title || 'Untitled Episode'}</h3>
                {ep.guestId && guestNames[ep.guestId] && <p className="text-xs text-slate-400 dark:text-white/35 mt-1.5 truncate">with {guestNames[ep.guestId]}</p>}
                <div className="mt-3 flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${meta.badge}`}>
                    <Icon size={8} /> {meta.label}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 dark:text-white/25 group-hover:text-pink-600 dark:group-hover:text-pink-400">View <ArrowRight size={10} /></span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
