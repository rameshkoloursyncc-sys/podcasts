import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getGuests, getPipelineStages } from '../../services/api';
import { Users, Search, ArrowRight, Mail, Tag } from 'lucide-react';

const DIVIDER = 'border-black/[0.08] dark:border-white/[0.08] divide-black/[0.08] dark:divide-white/[0.08]';

const STAGE_COLORS = [
  'bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60',
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
              <Users size={12} className="text-blue-500 dark:text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-blue-500 dark:text-blue-400">People</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight leading-none">Guests.</h1>
            <p className="text-sm text-black/35 dark:text-white/30 mt-2">{guests.length} total guests registered</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/20" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guests…"
                className={`pl-10 pr-4 py-2 border ${DIVIDER} bg-black/[0.02] dark:bg-white/[0.02] text-xs font-bold focus:outline-none focus:border-black dark:focus:border-white w-52 transition-all focus:w-64 placeholder:text-black/30 dark:placeholder:text-white/20`} />
            </div>
            <Link to="/admin/guests" className={`border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 text-xs font-bold hover:opacity-80 transition-opacity`}>
              + Add Guest
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div className={`grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x ${DIVIDER} border-t ${DIVIDER}`}>
          {[
            { label: 'Total Guests',  value: guests.length },
            { label: 'Stages Active', value: stages.length },
            { label: 'Unassigned',    value: guests.filter(g => !g.stageId).length },
          ].map(({ label, value }) => (
            <div key={label} className="relative overflow-hidden p-6 group group-hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors">
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30">{label}</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ CONTENT GRID ══════════════════════════════════════════════════ */}
      <div className={`flex-1 border-b ${DIVIDER}`}>
        {filtered.length === 0 ? (
          <div className="py-24 flex flex-col items-center text-black/20 dark:text-white/15 select-none">
            <Users size={36} className="mb-3" />
            <p className="text-xs font-bold uppercase tracking-widest">No guests found</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 divide-y sm:divide-y-0 ${DIVIDER}`}>
            {filtered.map((g) => {
              const stage = stageMap[g.stageId];
              return (
                <Link key={g.id} to={`/app/guests/${g.id}`}
                  className={`relative p-6 border-b sm:border-r ${DIVIDER} hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group`}>
                  
                  <div className="h-12 w-12 bg-black/5 dark:bg-white/10 flex items-center justify-center text-[10px] uppercase font-extrabold text-black dark:text-white mb-5 transition-colors group-hover:bg-black/10 dark:group-hover:bg-white/20">
                    {g.name.slice(0, 2)}
                  </div>
                  
                  <h3 className="text-sm font-bold text-black dark:text-white truncate">{g.name}</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <Mail size={10} className="text-black/30 dark:text-white/20 flex-none" />
                    <p className="text-xs font-bold text-black/40 dark:text-white/30 tracking-widest uppercase truncate">{g.email}</p>
                  </div>
                  
                  {stage && (
                    <div className="mt-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${stage.color}`}>
                        <Tag size={8} /> {stage.label}
                      </span>
                    </div>
                  )}
                  
                  <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10 flex items-center justify-between">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-black/30 dark:text-white/20">{new Date(g.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
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
