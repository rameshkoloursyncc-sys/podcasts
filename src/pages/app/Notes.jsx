import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getNotes } from '../../services/api';
import { FileText, Mic2, Users, Clock3 } from 'lucide-react';

const TYPE_META = {
  guest:   { gradient: 'from-violet-600 to-purple-700', icon: Users, badge: 'bg-violet-100 text-violet-700 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/20' },
  episode: { gradient: 'from-blue-600 to-cyan-600',     icon: Mic2,  badge: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/20' },
};
const CARD_ACCENTS = ['from-violet-600 to-purple-700','from-blue-600 to-cyan-600','from-pink-500 to-rose-600','from-emerald-500 to-teal-600','from-amber-500 to-orange-600','from-indigo-600 to-violet-700'];

export default function Notes() {
  const { tenant } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!tenant?.id) return;
    getNotes(tenant.id).then(setNotes).finally(() => setLoading(false));
  }, [tenant?.id]);

  const filtered = notes.filter(n => filter === 'all' || n.entityType === filter);

  if (loading) return (
    <div className="flex items-center justify-center h-80">
      <div className="h-10 w-10 rounded-full border-4 border-emerald-200 border-t-emerald-600 animate-spin dark:border-emerald-500/30 dark:border-t-emerald-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <FileText size={14} className="text-emerald-500 dark:text-emerald-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-emerald-500 dark:text-emerald-400">Notes</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">All Notes</h1>
        <p className="text-sm text-slate-400 dark:text-white/35 mt-0.5">{notes.length} notes across all entities</p>
      </div>

      {/* Filter cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { key: 'all',     label: 'All Notes',    count: notes.length,                                      gradient: 'from-slate-500 to-slate-600' },
          { key: 'guest',   label: 'Guest Notes',  count: notes.filter(n => n.entityType === 'guest').length,   gradient: 'from-violet-600 to-purple-700' },
          { key: 'episode', label: 'Episode Notes',count: notes.filter(n => n.entityType === 'episode').length,  gradient: 'from-blue-600 to-cyan-600' },
        ].map(({ key, label, count, gradient }) => (
          <button key={key} onClick={() => setFilter(key)}
            className={`relative overflow-hidden rounded-2xl p-5 text-left shadow-lg transition-all hover:-translate-y-0.5 ${filter === key ? 'ring-2 ring-violet-400/50 dark:ring-white/25' : ''}`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
            <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
            <div className="relative z-10">
              <FileText size={16} className="text-white/70 mb-2" />
              <p className="text-2xl font-extrabold text-white">{count}</p>
              <p className="text-xs text-white/60 mt-0.5">{label}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Notes grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-100 dark:bg-[#1a1d2e] dark:border-white/5 p-16 flex flex-col items-center text-slate-300 dark:text-white/20">
          <FileText size={36} className="mb-3" /><p className="text-sm">No notes yet</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((n, i) => {
            const meta = TYPE_META[n.entityType] ?? TYPE_META.guest;
            const Icon = meta.icon;
            return (
              <div key={n.id} className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 dark:bg-[#1a1d2e] dark:border-white/5 dark:shadow-lg dark:hover:shadow-xl dark:hover:border-white/10">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${CARD_ACCENTS[i % CARD_ACCENTS.length]}`} />
                <div className="flex items-start justify-between mb-3">
                  <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${CARD_ACCENTS[i % CARD_ACCENTS.length]} flex items-center justify-center shadow-lg`}>
                    <Icon size={14} className="text-white" />
                  </div>
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border capitalize ${meta.badge}`}>
                    {n.entityType}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-white/80 leading-relaxed line-clamp-3">{n.body}</p>
                <div className="mt-4 flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-white/25">
                  <Clock3 size={10} />
                  {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
