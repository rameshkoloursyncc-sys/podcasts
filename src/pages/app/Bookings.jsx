import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getBookings, getGuestById } from '../../services/api';
import { CalendarDays, Clock3, CheckCircle2, XCircle, Search, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const DIVIDER = 'border-black/[0.08] dark:border-white/[0.08] divide-black/[0.08] dark:divide-white/[0.08]';

const STATUS_META = {
  scheduled: { badge: 'bg-black/5 text-black dark:bg-white/10 dark:text-white',    icon: Clock3,       label: 'Scheduled' },
  completed: { badge: 'bg-black text-white dark:bg-white dark:text-black',icon: CheckCircle2, label: 'Completed' },
  cancelled: { badge: 'border border-black/20 text-black/60 dark:border-white/20 dark:text-white/60', icon: XCircle,      label: 'Cancelled' },
};

export default function Bookings() {
  const { tenant } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [guestNames, setGuestNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!tenant?.id) return;
    getBookings(tenant.id).then(async list => {
      setBookings(list.sort((a, b) => new Date(b.scheduledAt) - new Date(a.scheduledAt)));
      const names = {};
      await Promise.all(list.map(async b => { if (b.guestId) { const g = await getGuestById(b.guestId); if (g) names[b.guestId] = g.name; } }));
      setGuestNames(names);
    }).finally(() => setLoading(false));
  }, [tenant?.id]);

  const filtered = bookings.filter(b => {
    const matchStatus = filter === 'all' || b.status === filter;
    const matchSearch = !search || (guestNames[b.guestId] ?? '').toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

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
              <CalendarDays size={12} className="text-amber-500 dark:text-amber-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500 dark:text-amber-400">Schedule</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight leading-none">Bookings.</h1>
            <p className="text-sm text-black/35 dark:text-white/30 mt-2">{bookings.length} total recordings scheduled</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/20" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bookings…"
                className={`pl-10 pr-4 py-2 border ${DIVIDER} bg-black/[0.02] dark:bg-white/[0.02] text-xs font-bold focus:outline-none focus:border-black dark:focus:border-white w-52 transition-all focus:w-64 placeholder:text-black/30 dark:placeholder:text-white/20`} />
            </div>
            <Link to="/admin/bookings" className={`border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 text-xs font-bold hover:opacity-80 transition-opacity`}>
              + Add Booking
            </Link>
          </div>
        </div>

        {/* Stats strip */}
        <div className={`grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x ${DIVIDER} border-t ${DIVIDER}`}>
          {Object.entries(STATUS_META).map(([status, meta]) => {
            const count = bookings.filter(b => b.status === status).length;
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
            <CalendarDays size={36} className="mb-3" />
            <p className="text-xs font-bold uppercase tracking-widest">No bookings found</p>
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 divide-y sm:divide-y-0 ${DIVIDER}`}>
            {filtered.map((b) => {
              const meta = STATUS_META[b.status] ?? STATUS_META.scheduled;
              const Icon = meta.icon;
              const guestName = guestNames[b.guestId] ?? 'No guest';
              const date = new Date(b.scheduledAt);
              return (
                <div key={b.id} className={`relative p-6 border-b sm:border-r ${DIVIDER} hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group`}>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-start justify-between">
                       <div className="h-10 w-10 flex items-center justify-center text-[10px] font-extrabold text-black dark:text-white bg-black/5 dark:bg-white/10 uppercase group-hover:bg-black/10 dark:group-hover:bg-white/20 transition-colors">
                        {guestName.slice(0, 2)}
                       </div>
                       <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${meta.badge}`}>
                        <Icon size={8} /> {meta.label}
                       </span>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-bold text-black dark:text-white truncate">{guestName}</h3>
                      <div className="mt-2 space-y-1.5">
                        <div className="flex items-center gap-2">
                          <CalendarDays size={10} className="text-black/30 dark:text-white/20 flex-none" />
                          <span className="text-[11px] font-bold uppercase tracking-widest text-black/50 dark:text-white/40">{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock3 size={10} className="text-black/30 dark:text-white/20 flex-none" />
                          <span className="text-[11px] font-bold uppercase tracking-widest text-black/50 dark:text-white/40">{date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} · {b.durationMinutes} min</span>
                        </div>
                      </div>
                    </div>
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
