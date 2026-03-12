import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getBookings, getGuestById } from '../../services/api';
import { CalendarDays, Clock3, CheckCircle2, XCircle, Search } from 'lucide-react';

const STATUS_META = {
  scheduled: { gradient: 'from-amber-600 to-orange-600',  badge: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/20',    icon: Clock3,       label: 'Scheduled' },
  completed: { gradient: 'from-emerald-600 to-teal-600',  badge: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/20',icon: CheckCircle2, label: 'Completed' },
  cancelled: { gradient: 'from-red-600 to-rose-700',      badge: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/20',                     icon: XCircle,      label: 'Cancelled' },
};
const CARD_ACCENT = ['from-amber-500 to-orange-600','from-violet-600 to-purple-700','from-blue-600 to-cyan-600','from-emerald-500 to-teal-600','from-pink-500 to-rose-600','from-indigo-600 to-blue-700'];

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
    <div className="flex items-center justify-center h-80">
      <div className="h-10 w-10 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin dark:border-amber-500/30 dark:border-t-amber-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays size={14} className="text-amber-500 dark:text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-500 dark:text-amber-400">Schedule</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Bookings</h1>
          <p className="text-sm text-slate-400 dark:text-white/35 mt-0.5">{bookings.length} total recordings scheduled</p>
        </div>
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-white/25" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by guest…"
            className="pl-8 pr-4 py-2 rounded-xl bg-white border border-slate-200 text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-200 w-52 dark:bg-white/5 dark:border-white/8 dark:text-white/60 dark:placeholder:text-white/25 dark:focus:ring-1 dark:focus:ring-amber-500/50" />
        </div>
      </div>

      {/* Status cards */}
      <div className="grid grid-cols-3 gap-4">
        {Object.entries(STATUS_META).map(([status, meta]) => {
          const Icon = meta.icon;
          const count = bookings.filter(b => b.status === status).length;
          return (
            <button key={status} onClick={() => setFilter(filter === status ? 'all' : status)}
              className={`relative overflow-hidden rounded-2xl p-5 text-left shadow-lg transition-all hover:-translate-y-0.5 ${filter === status ? 'ring-2 ring-violet-400/50 dark:ring-white/25' : ''}`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${meta.gradient}`} />
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
              <div className="relative z-10 flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/60">{meta.label}</p>
                  <p className="mt-1 text-3xl font-extrabold text-white">{count}</p>
                </div>
                <div className="rounded-xl bg-white/20 p-2"><Icon size={18} className="text-white" /></div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Booking cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-100 dark:bg-[#1a1d2e] dark:border-white/5 p-16 flex flex-col items-center text-slate-300 dark:text-white/20">
          <CalendarDays size={36} className="mb-3" /><p className="text-sm">No bookings found</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b, i) => {
            const meta = STATUS_META[b.status] ?? STATUS_META.scheduled;
            const Icon = meta.icon;
            const guestName = guestNames[b.guestId] ?? 'No guest';
            const date = new Date(b.scheduledAt);
            return (
              <div key={b.id} className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300 hover:-translate-y-1 dark:bg-[#1a1d2e] dark:border-white/5 dark:shadow-lg dark:hover:shadow-xl dark:hover:border-white/10">
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${CARD_ACCENT[i % CARD_ACCENT.length]}`} />
                <div className="flex items-center gap-3 mb-4">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${CARD_ACCENT[i % CARD_ACCENT.length]} flex items-center justify-center text-xs font-bold text-white shadow-lg flex-none`}>
                    {guestName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white/90 truncate">{guestName}</p>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${meta.badge}`}>
                      <Icon size={8} /> {meta.label}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-white/5 px-3 py-2">
                    <CalendarDays size={12} className="text-slate-400 dark:text-white/35 flex-none" />
                    <span className="text-xs text-slate-600 dark:text-white/60">{date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-white/5 px-3 py-2">
                    <Clock3 size={12} className="text-slate-400 dark:text-white/35 flex-none" />
                    <span className="text-xs text-slate-600 dark:text-white/60">{date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} · {b.durationMinutes} min</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
