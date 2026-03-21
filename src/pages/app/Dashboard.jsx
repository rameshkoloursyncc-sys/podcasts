import { useAuth } from '../../context/AuthContext';
import { getDashboard, getGuests, getBookings } from '../../services/api';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Mic2, CalendarDays, FileText, CheckCircle2,
  Clock3, TrendingUp, ArrowRight, Activity, Sparkles,
} from 'lucide-react';

const DIVIDER = 'border-black/[0.08] dark:border-white/[0.08] divide-black/[0.08] dark:divide-white/[0.08]';

const STATUS_BADGE = {
  draft: 'bg-black/5 text-black dark:bg-white/10 dark:text-white',
  scheduled: 'bg-black/5 text-black dark:bg-white/10 dark:text-white',
  recorded: 'bg-black/5 text-black dark:bg-white/10 dark:text-white',
  published: 'bg-black text-white dark:bg-white dark:text-black',
  pending: 'bg-black/5 text-black dark:bg-white/10 dark:text-white',
  confirmed: 'bg-black/5 text-black dark:bg-white/10 dark:text-white',
  completed: 'bg-black text-white dark:bg-white dark:text-black',
  cancelled: 'border border-black/20 text-black/60 dark:border-white/20 dark:text-white/60',
};

function KpiCard({ label, value, icon: Icon, sub, to }) {
  return (
    <Link to={to} className="group relative overflow-hidden p-6 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all duration-200">
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/60 dark:text-white/60">{label}</p>
          <div className="bg-black/5 dark:bg-white/10 p-2 group-hover:bg-black/10 dark:group-hover:bg-white/20 transition-all">
            <Icon size={16} className="text-black/50 dark:text-white/50" />
          </div>
        </div>
        <p className="text-4xl font-extrabold text-black dark:text-white tracking-tight">{value ?? '—'}</p>
        {sub && <p className="mt-1.5 text-xs text-black/40 dark:text-white/40">{sub}</p>}
      </div>
    </Link>
  );
}

function CellHeader({ title, subtitle, action }) {
  return (
    <div className={`flex items-center justify-between px-6 py-4 border-b ${DIVIDER}`}>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/40 dark:text-white/30">{title}</p>
        {subtitle && <p className="text-[11px] text-black/30 dark:text-white/20 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function EmptyState({ text, icon = '📭' }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-black/20 dark:text-white/20 select-none">
      <span className="text-4xl mb-3">{icon}</span>
      <p className="text-[10px] font-bold uppercase tracking-widest">{text}</p>
    </div>
  );
}

export default function Dashboard() {
  const { tenant, user } = useAuth();

  // stats from GET /api/dashboard
  const [stats, setStats] = useState(null);
  // recent lists from GET /api/bookings and /api/guests
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentGuests, setRecentGuests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getDashboard(),
      getBookings({ sort_by: 'created_at', sort_dir: 'desc', per_page: 5 }),
      getGuests({ sort_by: 'created_at', sort_dir: 'desc', per_page: 5 }),
    ])
      .then(([dash, bookings, guests]) => {
        setStats(dash);
        setRecentBookings(Array.isArray(bookings) ? bookings : []);
        setRecentGuests(Array.isArray(guests) ? guests : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80 bg-white dark:bg-[#0f1117]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 border-4 border-black/10 border-t-black animate-spin dark:border-white/10 dark:border-t-white" />
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/25 dark:text-white/20">Loading…</p>
        </div>
      </div>
    );
  }

  // The dashboard endpoint returns a stats snapshot.
  // Fall back to recentGuests/Bookings lengths if stats are unavailable.
  const totalGuests = stats?.total_guests ?? stats?.guests ?? recentGuests.length;
  const totalEpisodes = stats?.total_episodes ?? stats?.episodes ?? 0;
  const totalBookings = stats?.total_bookings ?? stats?.bookings ?? recentBookings.length;
  const totalNotes = stats?.total_notes ?? stats?.notes ?? 0;
  const publishedEpisodes = stats?.published_episodes ?? 0;
  const upcomingBookings = stats?.upcoming_bookings ?? recentBookings.filter(b => b.status === 'confirmed' || b.status === 'pending').length;

  return (
    <div className="bg-white dark:bg-[#0f1117] text-black dark:text-white min-h-[calc(100vh-64px)] overflow-y-auto">

      {/* ══ BILLBOARD HEADER ══════════════════════════════════════════════════ */}
      <div className={`border-b ${DIVIDER} bg-white dark:bg-[#0a0c12]`}>

        {/* Title + actions */}
        <div className="px-8 py-7 flex items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight leading-none">
              Welcome back{user?.display_name || user?.displayName ? `, ${(user.display_name || user.displayName).split(' ')[0]}` : ''} 👋
            </h1>
            <p className="text-sm text-black/35 dark:text-white/30 mt-2">
              {tenant?.name} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <Link to="/app/bookings"
              className={`border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 text-xs font-bold hover:opacity-80 transition-opacity`}>
              + New Booking
            </Link>
            <Link to="/app/guests"
              className={`border ${DIVIDER} px-5 py-2.5 text-xs font-bold text-black/60 dark:text-white/60 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all`}>
              + Add Guest
            </Link>
          </div>
        </div>

        {/* KPI strip */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 divide-x ${DIVIDER} border-t ${DIVIDER}`}>
          <KpiCard label="Total Guests" value={totalGuests} icon={Users} to="/app/guests" sub={`${recentGuests.length} recent`} />
          <KpiCard label="Episodes" value={totalEpisodes} icon={Mic2} to="/app/episodes" sub={`${publishedEpisodes} published`} />
          <KpiCard label="Bookings" value={totalBookings} icon={CalendarDays} to="/app/bookings" sub={`${upcomingBookings} upcoming`} />
          <KpiCard label="Notes" value={totalNotes} icon={FileText} to="/app/notes" sub="across all entities" />
        </div>
      </div>

      {/* ══ BODY GRID ═════════════════════════════════════════════════════════ */}
      <div className={`border-b ${DIVIDER} divide-y ${DIVIDER}`}>

        {/* Main Row */}
        <div className={`grid lg:grid-cols-3 divide-x ${DIVIDER}`}>

          {/* Recent Bookings */}
          <div className="lg:col-span-2 flex flex-col">
            <CellHeader title="Recent Bookings" subtitle="Latest scheduled recordings"
              action={<Link to="/app/bookings" className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-black/35 dark:text-white/25 hover:text-black dark:hover:text-white transition-colors">All <ArrowRight size={10} /></Link>}
            />
            <div className="flex-1">
              {recentBookings.length === 0 ? <EmptyState text="No bookings yet" icon="📅" /> : (
                <div>
                  {recentBookings.map((b) => {
                    // API returns snake_case: guest_id, scheduled_at, status
                    const guestName = b.guest?.name ?? 'Unknown guest';
                    const initials = guestName.slice(0, 2);
                    return (
                      <div key={b.id} className={`flex items-center gap-4 px-6 py-4 border-b ${DIVIDER} last:border-b-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors`}>
                        <div className="h-10 w-10 flex-none bg-black/5 dark:bg-white/10 flex items-center justify-center text-[10px] uppercase font-bold text-black dark:text-white shrink-0">
                          {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-black/80 dark:text-white/80 truncate">{guestName}</p>
                          <p className="text-[11px] font-bold tracking-wide uppercase text-black/30 dark:text-white/25 flex items-center gap-1.5 mt-1">
                            <Clock3 size={10} /> {b.scheduled_at ? new Date(b.scheduled_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest ${STATUS_BADGE[b.status] ?? 'bg-slate-100 text-slate-600 dark:bg-white/8 dark:text-white/40'}`}>
                          {b.status}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className={`flex flex-col divide-y ${DIVIDER}`}>

            {/* Quick Access */}
            <div className="flex flex-col">
              <CellHeader title="Quick Access" />
              <div>
                {[
                  { to: '/app/guests', icon: Users, label: 'Guests', count: totalGuests, accent: 'text-violet-600 dark:text-violet-400' },
                  { to: '/app/episodes', icon: Mic2, label: 'Episodes', count: totalEpisodes, accent: 'text-blue-600 dark:text-blue-400' },
                  { to: '/app/bookings', icon: CalendarDays, label: 'Bookings', count: totalBookings, accent: 'text-amber-600 dark:text-amber-400' },
                  { to: '/app/notes', icon: FileText, label: 'Notes', count: totalNotes, accent: 'text-emerald-600 dark:text-emerald-400' },
                ].map(({ to, icon: Icon, label, count, accent }) => (
                  <Link key={to} to={to} className={`flex items-center justify-between px-6 py-4 border-b ${DIVIDER} last:border-b-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group`}>
                    <div className="flex items-center gap-3">
                      <Icon size={14} className={accent} />
                      <span className="text-[11px] font-bold uppercase tracking-widest text-black/60 dark:text-white/60 group-hover:text-black dark:group-hover:text-white transition-colors">{label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-black/40 dark:text-white/30 tabular-nums">{count ?? '—'}</span>
                      <ArrowRight size={11} className="text-black/20 dark:text-white/15 group-hover:text-black dark:group-hover:text-white transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Guests */}
            <div className="flex flex-col flex-1">
              <CellHeader title="Recent Guests" action={<Link to="/app/guests" className="text-[10px] font-bold uppercase tracking-widest text-black/35 dark:text-white/25 hover:text-black dark:hover:text-white flex items-center gap-1 transition-colors">All <ArrowRight size={10} /></Link>} />
              <div className="flex-1">
                {recentGuests.length === 0 ? <EmptyState text="No guests" icon="👥" /> : recentGuests.map((g) => {
                  return (
                    <Link key={g.id} to={`/app/guests/${g.id}`} className={`flex items-center gap-4 px-6 py-4 border-b ${DIVIDER} last:border-b-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors group`}>
                      <div className="h-8 w-8 flex-none bg-black/5 dark:bg-white/10 flex items-center justify-center text-[10px] uppercase font-bold text-black dark:text-white shrink-0 group-hover:bg-black/10 dark:group-hover:bg-white/20 transition-colors">
                        {g.name?.slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-black/80 dark:text-white/80 truncate group-hover:text-black dark:group-hover:text-white">{g.name}</p>
                        <p className="text-[10px] uppercase font-bold tracking-widest text-black/30 dark:text-white/30 truncate mt-0.5">{g.email || 'No email'}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

        {/* Footer info row */}
        <div className={`grid grid-cols-1 md:grid-cols-3 divide-x ${DIVIDER}`}>
          <div className="p-6 flex items-center gap-4 col-span-1 md:col-span-2">
            <div className="h-10 w-10 border border-black/10 dark:border-white/10 flex items-center justify-center shrink-0">
              <Activity size={16} className="text-black/40 dark:text-white/40" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest">All systems operational</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30 mt-1.5">{(totalGuests ?? 0) + (totalEpisodes ?? 0) + (totalBookings ?? 0)} total records across {tenant?.name}</p>
            </div>
          </div>
          <div className="p-6 flex items-center gap-3 md:justify-end border-t md:border-t-0 border-black/10 dark:border-white/10">
            <Link to="/app/guests" className={`border ${DIVIDER} px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:border-black dark:hover:border-white transition-colors`}>Guests</Link>
            <Link to="/app/episodes" className={`border ${DIVIDER} px-4 py-2 text-[10px] font-bold uppercase tracking-widest hover:border-black dark:hover:border-white transition-colors`}>Episodes</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
