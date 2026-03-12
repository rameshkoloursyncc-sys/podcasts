import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getGuests, getPipelineStages } from '../../services/api';
import { GitBranch, Users, ArrowRight } from 'lucide-react';

const COLUMN_STYLES = [
  { gradient: 'from-violet-600 to-purple-700', border: 'border-violet-200 dark:border-violet-500/20', soft: 'bg-violet-50 dark:bg-violet-500/10', avatarGrad: 'from-violet-500 to-purple-600' },
  { gradient: 'from-blue-600 to-cyan-600',     border: 'border-blue-200 dark:border-blue-500/20',     soft: 'bg-blue-50 dark:bg-blue-500/10',     avatarGrad: 'from-blue-500 to-cyan-500' },
  { gradient: 'from-emerald-600 to-teal-600',  border: 'border-emerald-200 dark:border-emerald-500/20',soft: 'bg-emerald-50 dark:bg-emerald-500/10',avatarGrad: 'from-emerald-500 to-teal-500' },
  { gradient: 'from-amber-600 to-orange-600',  border: 'border-amber-200 dark:border-amber-500/20',   soft: 'bg-amber-50 dark:bg-amber-500/10',   avatarGrad: 'from-amber-500 to-orange-500' },
  { gradient: 'from-pink-600 to-rose-600',     border: 'border-pink-200 dark:border-pink-500/20',     soft: 'bg-pink-50 dark:bg-pink-500/10',     avatarGrad: 'from-pink-500 to-rose-600' },
  { gradient: 'from-indigo-600 to-violet-700', border: 'border-indigo-200 dark:border-indigo-500/20', soft: 'bg-indigo-50 dark:bg-indigo-500/10', avatarGrad: 'from-indigo-500 to-violet-600' },
];

export default function Pipeline() {
  const { tenant } = useAuth();
  const [guests, setGuests] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenant?.id) return;
    Promise.all([getGuests(tenant.id), getPipelineStages(tenant.id)]).then(([g, s]) => {
      setGuests(g);
      setStages(s.sort((a, b) => a.order - b.order));
    }).finally(() => setLoading(false));
  }, [tenant?.id]);

  const byStage = stages.map(stage => ({ ...stage, guests: guests.filter(g => g.stageId === stage.id) }));
  const unassigned = guests.filter(g => !g.stageId);

  if (loading) return (
    <div className="flex items-center justify-center h-80">
      <div className="h-10 w-10 rounded-full border-4 border-cyan-200 border-t-cyan-600 animate-spin dark:border-cyan-500/30 dark:border-t-cyan-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GitBranch size={14} className="text-cyan-500 dark:text-cyan-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-cyan-500 dark:text-cyan-400">CRM</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Pipeline</h1>
          <p className="text-sm text-slate-400 dark:text-white/35 mt-0.5">{guests.length} guests across {stages.length} stages</p>
        </div>
        <Link to="/admin/guests" className="rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all hover:-translate-y-0.5">
          + Add Guest
        </Link>
      </div>

      {/* Stage summary strip */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(stages.length, 6)}, 1fr)` }}>
        {byStage.map((col, i) => {
          const style = COLUMN_STYLES[i % COLUMN_STYLES.length];
          return (
            <div key={col.id} className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${style.gradient} p-4 shadow-lg`}>
              <div className="absolute -right-3 -top-3 h-14 w-14 rounded-full bg-white/10" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 truncate">{col.label}</p>
              <p className="text-2xl font-extrabold text-white mt-1">{col.guests.length}</p>
            </div>
          );
        })}
      </div>

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
        {byStage.map((col, i) => {
          const style = COLUMN_STYLES[i % COLUMN_STYLES.length];
          return (
            <div key={col.id} className={`w-64 flex-none rounded-2xl border ${style.border} bg-white dark:bg-[#1a1d2e] overflow-hidden shadow-md dark:shadow-xl`}>
              <div className={`bg-gradient-to-r ${style.gradient} px-4 py-3 flex items-center justify-between`}>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">{col.label}</h3>
                <span className="rounded-lg bg-white/20 px-2 py-0.5 text-xs font-bold text-white">{col.guests.length}</span>
              </div>
              <div className="p-3 space-y-2">
                {col.guests.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-200 dark:border-white/10 p-4 flex flex-col items-center text-slate-300 dark:text-white/20 text-xs">
                    <Users size={18} className="mb-1" />Empty
                  </div>
                ) : col.guests.map(g => (
                  <Link key={g.id} to={`/app/guests/${g.id}`}
                    className="flex items-center gap-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/5 dark:hover:border-white/10 px-3 py-2.5 transition-all group">
                    <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${style.avatarGrad} flex items-center justify-center text-[10px] font-bold text-white flex-none`}>
                      {g.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-white/80 truncate group-hover:text-slate-900 dark:group-hover:text-white">{g.name}</p>
                      <p className="text-[10px] text-slate-400 dark:text-white/30 truncate">{g.email}</p>
                    </div>
                    <ArrowRight size={10} className="text-slate-300 dark:text-white/20 group-hover:text-slate-500 dark:group-hover:text-white/50 flex-none" />
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        {unassigned.length > 0 && (
          <div className="w-64 flex-none rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-[#1a1d2e] overflow-hidden shadow-md dark:shadow-xl">
            <div className="bg-gradient-to-r from-slate-500 to-slate-600 px-4 py-3 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Unassigned</h3>
              <span className="rounded-lg bg-white/20 px-2 py-0.5 text-xs font-bold text-white">{unassigned.length}</span>
            </div>
            <div className="p-3 space-y-2">
              {unassigned.map(g => (
                <Link key={g.id} to={`/app/guests/${g.id}`}
                  className="flex items-center gap-2.5 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-100 dark:border-white/5 px-3 py-2.5 transition-all group">
                  <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center text-[10px] font-bold text-white flex-none">
                    {g.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 dark:text-white/80 truncate">{g.name}</p>
                    <p className="text-[10px] text-slate-400 dark:text-white/30 truncate">{g.email}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
