import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getGuests, getPipelineStages } from '../../services/api';
import { GitBranch, Users, ArrowRight } from 'lucide-react';

const DIVIDER = 'border-black/[0.08] dark:border-white/[0.08] divide-black/[0.08] dark:divide-white/[0.08]';

export default function Pipeline() {
  const { tenant } = useAuth();
  const [guests, setGuests] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // No tenantId needed — multi-tenancy is handled server-side via token
    Promise.all([getGuests(), getPipelineStages()]).then(([g, s]) => {
      setGuests(Array.isArray(g) ? g : []);
      // API returns stages with `order` field — sort by it
      setStages((Array.isArray(s) ? s : []).sort((a, b) => (a.order ?? 0) - (b.order ?? 0)));
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // API returns snake_case: stage_id
  const byStage = stages.map(stage => ({ ...stage, guests: guests.filter(g => g.stage_id === stage.id) }));
  const unassigned = guests.filter(g => !g.stage_id);

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
            {/* <div className="flex items-center gap-2 mb-2">
              <GitBranch size={12} className="text-cyan-500 dark:text-cyan-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-500 dark:text-cyan-400">CRM</span>
            </div> */}
            <h1 className="text-3xl font-extrabold tracking-tight leading-none">Pipeline.</h1>
            <p className="text-sm text-black/35 dark:text-white/30 mt-2">{guests.length} guests across {stages.length} stages</p>
          </div>
          <Link to="/admin/guests" className={`border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 text-xs font-bold hover:opacity-80 transition-opacity`}>
            + Add Guest
          </Link>
        </div>

        {/* Stage summary strip */}
        <div className={`flex overflow-x-auto divide-x ${DIVIDER} border-t border-b ${DIVIDER}`}>
          {[...byStage, ...(unassigned.length > 0 ? [{ id: 'unassigned', label: 'Unassigned', guests: unassigned }] : [])].map((col) => {
            return (
              <div key={col.id} className="relative p-6 px-8 min-w-[180px] flex-1 group hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30 truncate">{col.label}</p>
                <p className="text-3xl font-extrabold mt-2">{col.guests.length}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══ PIPELINE GRID ════════════════════════════════════════════════ */}
      <div className={`flex-1 divide-y ${DIVIDER} flex flex-col`}>
        {[...byStage, ...(unassigned.length > 0 ? [{ id: 'unassigned', label: 'Unassigned', guests: unassigned }] : [])].map((col) => {
          return (
            <div key={col.id} className={`flex flex-col lg:flex-row group transition-colors hover:bg-black/[0.02] dark:hover:bg-white/[0.02]`}>

              {/* Stage Header */}
              <div className={`lg:w-72 p-6 lg:p-8 flex flex-col justify-center border-b lg:border-b-0 lg:border-r ${DIVIDER}`}>
                <h3 className="text-xl font-extrabold tracking-tight mb-3">{col.label}</h3>
                <span className={`inline-flex items-center px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest bg-black/5 dark:bg-white/10 text-black/60 dark:text-white/60 w-fit`}>
                  {col.guests.length} GUEST{col.guests.length !== 1 && 'S'}
                </span>
              </div>

              {/* Stage Cards Grid */}
              <div className="flex-1 p-6 lg:p-8">
                {col.guests.length === 0 ? (
                  <div className={`h-full min-h-[120px] border-2 border-dashed ${DIVIDER} py-8 flex flex-col items-center justify-center text-black/20 dark:text-white/20 select-none`}>
                    <Users size={20} className="mb-2" />
                    <p className="text-[10px] font-bold uppercase tracking-widest">Empty Stage</p>
                  </div>
                ) : (
                  <div>
                    <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6`}>
                      {col.guests.slice(0, 3).map(g => (
                        <Link key={g.id} to={`/app/guests/${g.id}`}
                          className={`block p-5 border ${DIVIDER} bg-white dark:bg-[#0a0c12] hover:border-black dark:hover:border-white transition-all group/card shadow-sm hover:shadow-md`}>
                          <div className="flex items-center gap-4">
                            <div className={`h-10 w-10 flex items-center justify-center text-[10px] font-extrabold text-black dark:text-white bg-black/5 dark:bg-white/10 uppercase group-hover/card:bg-black/10 dark:group-hover/card:bg-white/20 transition-colors shrink-0`}>
                              {g.name?.slice(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-bold text-black dark:text-white truncate">{g.name}</p>
                              <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30 mt-1 truncate">{g.email || 'No Email'}</p>
                            </div>
                            <ArrowRight size={14} className="text-black/20 dark:text-white/20 opacity-0 group-hover/card:opacity-100 transition-opacity transform translate-x-2 group-hover/card:translate-x-0" />
                          </div>
                        </Link>
                      ))}
                    </div>
                    {col.guests.length > 3 && (
                      <div className="mt-6 flex justify-start">
                        <Link to="/app/guests"
                          className={`inline-flex items-center gap-2 px-5 py-2.5 border ${DIVIDER} text-[10px] font-bold uppercase tracking-widest text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white hover:border-black dark:hover:border-white transition-all`}>
                          View {col.guests.length - 3} more <ArrowRight size={12} />
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
