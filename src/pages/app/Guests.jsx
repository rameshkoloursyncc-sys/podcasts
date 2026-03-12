import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getGuests, getPipelineStages } from '../../services/api';
import { Users, Search, ArrowRight, Mail, Tag } from 'lucide-react';

const CARD_GRADIENTS = [
  'from-violet-600 to-purple-700','from-blue-600 to-cyan-600',
  'from-pink-500 to-rose-600','from-amber-500 to-orange-600',
  'from-emerald-500 to-teal-600','from-indigo-600 to-blue-700',
];
const STAGE_COLORS = [
  'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/20',
  'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/20',
  'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/20',
  'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/20',
  'bg-pink-100 text-pink-700 border-pink-200 dark:bg-pink-500/15 dark:text-pink-300 dark:border-pink-500/20',
];

export default function Guests() {
  const { tenant } = useAuth();
  const [guests, setGuests] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!tenant?.id) return;
    Promise.all([getGuests(tenant.id), getPipelineStages(tenant.id)])
      .then(([g, s]) => { setGuests(g); setStages(s); })
      .finally(() => setLoading(false));
  }, [tenant?.id]);

  const stageMap = Object.fromEntries(stages.map((s, i) => [s.id, { label: s.label, color: STAGE_COLORS[i % STAGE_COLORS.length] }]));
  const filtered = guests.filter(g =>
    !search || g.name.toLowerCase().includes(search.toLowerCase()) || g.email.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="flex items-center justify-center h-80">
      <div className="h-10 w-10 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin dark:border-violet-500/30 dark:border-t-violet-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={14} className="text-blue-500 dark:text-blue-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-blue-500 dark:text-blue-400">People</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Guests</h1>
          <p className="text-sm text-slate-400 dark:text-white/35 mt-0.5">{guests.length} total guests</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/25" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guests…"
              className="pl-8 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-200 w-52 dark:bg-white/5 dark:border-white/8 dark:text-white/60 dark:placeholder:text-white/25 dark:focus:ring-1 dark:focus:ring-blue-500/50" />
          </div>
          <Link to="/admin/guests" className="rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:-translate-y-0.5">
            + Add Guest
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Guests',  value: guests.length,                          gradient: 'from-violet-600 to-purple-700' },
          { label: 'Stages Active', value: stages.length,                          gradient: 'from-blue-600 to-cyan-600' },
          { label: 'Unassigned',    value: guests.filter(g => !g.stageId).length, gradient: 'from-amber-500 to-orange-600' },
        ].map(({ label, value, gradient }) => (
          <div key={label} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 shadow-lg`}>
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
            <p className="text-xs font-semibold uppercase tracking-widest text-white/60">{label}</p>
            <p className="mt-1 text-3xl font-extrabold text-white">{value}</p>
          </div>
        ))}
      </div>

      {/* Guest cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-100 dark:bg-[#1a1d2e] dark:border-white/5 p-16 flex flex-col items-center text-slate-300 dark:text-white/20">
          <Users size={36} className="mb-3" />
          <p className="text-sm">No guests found</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((g, i) => {
            const stage = stageMap[g.stageId];
            return (
              <Link key={g.id} to={`/app/guests/${g.id}`}
                className="group relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 hover:-translate-y-1 dark:bg-[#1a1d2e] dark:border-white/5 dark:shadow-lg dark:hover:shadow-xl dark:hover:border-white/10">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]}`} />
                <div className={`h-[52px] w-[52px] rounded-2xl bg-gradient-to-br ${CARD_GRADIENTS[i % CARD_GRADIENTS.length]} flex items-center justify-center text-lg font-extrabold text-white shadow-lg mb-4`}>
                  {g.name.slice(0, 2).toUpperCase()}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white/90 truncate group-hover:text-slate-900 dark:group-hover:text-white">{g.name}</h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <Mail size={10} className="text-slate-400 dark:text-white/25 flex-none" />
                  <p className="text-xs text-slate-400 dark:text-white/35 truncate">{g.email}</p>
                </div>
                {stage && (
                  <div className="mt-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-semibold border ${stage.color}`}>
                      <Tag size={8} /> {stage.label}
                    </span>
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 dark:text-white/25">{new Date(g.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                  <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 dark:text-white/30 group-hover:text-violet-600 dark:group-hover:text-violet-400">View <ArrowRight size={10} /></span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
