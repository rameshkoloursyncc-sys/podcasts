import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getNotes } from '../../services/api';
import { FileText, Mic2, Users, Clock3 } from 'lucide-react';

const DIVIDER = 'border-black/[0.08] dark:border-white/[0.08] divide-black/[0.08] dark:divide-white/[0.08]';

const TYPE_META = {
  guest:   { icon: Users, badge: 'bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60' },
  episode: { icon: Mic2,  badge: 'bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60' },
};

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
              <FileText size={12} className="text-emerald-500 dark:text-emerald-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 dark:text-emerald-400">Notes</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight leading-none">All Notes.</h1>
            <p className="text-sm text-black/35 dark:text-white/30 mt-2">{notes.length} notes across all entities</p>
          </div>
        </div>

        {/* Filter strip */}
        <div className={`grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x ${DIVIDER} border-t ${DIVIDER}`}>
          {[
            { key: 'all',     label: 'All Notes',    count: notes.length },
            { key: 'guest',   label: 'Guest Notes',  count: notes.filter(n => n.entityType === 'guest').length },
            { key: 'episode', label: 'Episode Notes',count: notes.filter(n => n.entityType === 'episode').length },
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
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 divide-y sm:divide-y-0 ${DIVIDER}`}>
            {filtered.map((n) => {
              const meta = TYPE_META[n.entityType] ?? TYPE_META.guest;
              const Icon = meta.icon;
              return (
                <div key={n.id} className={`relative p-6 border-b sm:border-r ${DIVIDER} hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group`}>
                  
                  <div className="flex items-start justify-between mb-5">
                    <div className="h-10 w-10 border border-dashed border-black/20 dark:border-white/20 flex items-center justify-center">
                      <Icon size={16} className="text-black/50 dark:text-white/50" />
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${meta.badge}`}>
                      {n.entityType}
                    </span>
                  </div>
                  
                  <p className="text-sm font-bold text-black/90 dark:text-white/90 leading-relaxed line-clamp-4">{n.body}</p>
                  
                  <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10 flex items-center gap-2">
                    <Clock3 size={10} className="text-black/30 dark:text-white/20" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30">
                      {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
