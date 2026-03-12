import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getGuests, getEpisodes, getBookings, getNotes } from '../../services/api';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Users, Mic2, CalendarDays, CheckCircle2, TrendingUp, TrendingDown,
  ArrowRight, Clock3, Sparkles, BarChart3,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────
const PIE_PALETTE = ['#6366f1', '#f59e0b', '#10b981', '#3b82f6', '#ec4899', '#8b5cf6'];
const GRADIENTS = ['from-violet-600 to-purple-700', 'from-blue-600 to-cyan-600', 'from-amber-500 to-orange-600', 'from-emerald-500 to-teal-600'];
const DIVIDER = 'border-black/[0.08] dark:border-white/[0.08]'; // single token for all borders

const STATUS_BADGE = {
  draft: 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300',
  scheduled: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  recorded: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  published: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  completed: 'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtMonth(iso) { return new Date(iso).toLocaleDateString('en-US', { month: 'short', year: '2-digit' }); }
function groupByMonth(items, key) {
  const map = {};
  items.forEach(item => { const l = fmtMonth(item[key]); map[l] = (map[l] ?? 0) + 1; });
  return Object.entries(map).slice(-6).map(([month, count]) => ({ month, count }));
}
function groupByStatus(items) {
  const map = {};
  items.forEach(i => { const s = i.status ?? 'unknown'; map[s] = (map[s] ?? 0) + 1; });
  return Object.entries(map).map(([name, value]) => ({ name, value }));
}
function pct(n, total) { return total ? Math.round((n / total) * 100) : 0; }

// ─── Sub-components ───────────────────────────────────────────────────────────

/**
 * Cell header bar — sits at top of every grid cell.
 * No border on the cell itself; parent grid's divide-* handles all separators.
 */
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

/** Gradient KPI card */
function KpiCard({ label, value, icon: Icon, gradient, delta, to, sub }) {
  return (
    <Link to={to} className="group relative overflow-hidden p-6 hover:brightness-110 transition-all duration-200 border">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className="absolute -right-6 -top-6 h-28 w-28 rounded-full bg-white/10" />
      <div className="absolute -bottom-8 -left-4 h-24 w-24 rounded-full bg-white/5" />
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/60">{label}</p>
          <div className="bg-white/20 p-2 backdrop-blur-sm group-hover:bg-white/30 transition-all">
            <Icon size={16} className="text-white" />
          </div>
        </div>
        <p className="text-4xl font-extrabold text-white tracking-tight">{value}</p>
        {sub && <p className="mt-1.5 text-xs text-white/50">{sub}</p>}
        {delta !== undefined && (
          <div className="mt-2 flex items-center gap-1">
            {delta >= 0 ? <TrendingUp size={11} className="text-white/70" /> : <TrendingDown size={11} className="text-white/70" />}
            <span className="text-xs font-semibold text-white/70">{delta >= 0 ? '+' : ''}{delta} this month</span>
          </div>
        )}
      </div>
    </Link>
  );
}

/** Chart tooltip */
const ChartTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`border ${DIVIDER} bg-white dark:bg-[#13151f] px-3 py-2 text-xs shadow-xl`}>
      <p className="font-bold text-black/50 dark:text-white/40 mb-0.5">{label}</p>
      <p className="font-semibold text-black dark:text-white">{payload[0].value} {unit}</p>
    </div>
  );
};

/** Progress bar */
function ProgressBar({ label, count, total, color }) {
  const w = pct(count, total);
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-[11px] font-medium text-black/40 dark:text-white/30 text-right shrink-0 capitalize">{label}</span>
      <div className="flex-1 h-1.5 bg-black/8 dark:bg-white/8 overflow-hidden">
        <div className={`h-1.5 transition-all duration-700 ${color}`} style={{ width: `${w}%` }} />
      </div>
      <span className="w-7 text-xs font-bold text-black/50 dark:text-white/40 tabular-nums">{count}</span>
    </div>
  );
}

function EmptyState({ text = 'No data yet', icon = '📭' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-black/20 dark:text-white/15 select-none">
      <span className="text-3xl mb-2">{icon}</span>
      <p className="text-xs font-medium">{text}</p>
    </div>
  );
}

// ─── Chart tick color helper (dark mode aware) ────────────────────────────────
// recharts ticks don't respond to Tailwind classes, so we pass a class-agnostic value.
const TICK_FILL = 'rgba(0,0,0,0.35)'; // overridden in dark via inline color

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function AdminIndex() {
  const { tenant, user } = useAuth();
  const [data, setData] = useState({ guests: [], episodes: [], bookings: [], notes: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenant?.id) return;
    Promise.all([getGuests(tenant.id), getEpisodes(tenant.id), getBookings(tenant.id), getNotes(tenant.id)])
      .then(([guests, episodes, bookings, notes]) => { setData({ guests, episodes, bookings, notes }); setLoading(false); });
  }, [tenant?.id]);

  const bookingsByMonth = useMemo(() => groupByMonth(data.bookings, 'scheduledAt'), [data.bookings]);
  const guestsByMonth = useMemo(() => groupByMonth(data.guests, 'createdAt'), [data.guests]);
  const episodesByStatus = useMemo(() => groupByStatus(data.episodes), [data.episodes]);

  const thisMonth = fmtMonth(new Date().toISOString());
  const guestDelta = data.guests.filter(g => fmtMonth(g.createdAt) === thisMonth).length;
  const bookDelta = data.bookings.filter(b => fmtMonth(b.scheduledAt) === thisMonth).length;
  const completed = data.bookings.filter(b => b.status === 'completed').length;
  const cancelled = data.bookings.filter(b => b.status === 'cancelled').length;
  const scheduled = data.bookings.filter(b => b.status === 'scheduled').length;
  const published = data.episodes.filter(e => e.status === 'published').length;
  const completionRate = pct(completed, data.bookings.length);
  const guestMap = Object.fromEntries(data.guests.map(g => [g.id, g]));
  const recentBookings = [...data.bookings].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  const recentEpisodes = [...data.episodes].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);

  if (loading) return (
    <div className="flex items-center justify-center h-80 bg-white dark:bg-[#0f1117]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin dark:border-violet-500/30 dark:border-t-violet-500" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/25 dark:text-white/20">Loading…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1117] text-black dark:text-white">

      {/* ══ Single outer border-x so billboard and body share the same left/right edge ══ */}
      <div className={`border-x ${DIVIDER}`}>

        {/* ══ BILLBOARD HEADER ══════════════════════════════════════════════════ */}
        <div className={`border-y ${DIVIDER} bg-white dark:bg-[#0a0c12]`}>

          {/* Title + actions */}
          <div className="px-6 py-6 flex items-center justify-between gap-6">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-black/30 dark:text-white/25 flex items-center gap-1.5 mb-2">
                <Sparkles size={11} /> Admin Dashboard
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight leading-none">
                Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}.
              </h1>
              <p className="text-sm text-black/35 dark:text-white/30 mt-2">
                {tenant?.name} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <Link to="/admin/bookings"
                className={`border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 text-xs font-bold hover:opacity-80 transition-opacity`}>
                + New Booking
              </Link>
              <Link to="/admin/guests"
                className={`border ${DIVIDER} px-5 py-2.5 text-xs font-bold text-black/60 dark:text-white/60 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all`}>
                + Add Guest
              </Link>
            </div>
          </div>

          {/* KPI strip — 4-col inside billboard, no extra border (shares billboard's bottom border) */}
          <div className={`m-6   grid grid-cols-2 lg:grid-cols-4`}>
            <KpiCard label="Total Guests" value={data.guests.length} icon={Users} gradient="from-violet-600 to-purple-700" delta={guestDelta} to="/admin/guests" sub="registered guests" />
            <KpiCard label="Episodes" value={data.episodes.length} icon={Mic2} gradient="from-blue-600 to-cyan-600" to="/admin/episodes" sub={`${published} published`} />
            <KpiCard label="Bookings" value={data.bookings.length} icon={CalendarDays} gradient="from-amber-500 to-orange-600" delta={bookDelta} to="/admin/bookings" sub={`${scheduled} upcoming`} />
            <KpiCard label="Published" value={published} icon={CheckCircle2} gradient="from-emerald-500 to-teal-600" to="/admin/episodes" sub={`${pct(published, data.episodes.length)}% of episodes`} />
          </div>
        </div>

        {/* ══ BODY GRID — inner lines via divide-* only, outer border-x from parent ════ */}
        <div className={`border-b ${DIVIDER} divide-y ${DIVIDER}`}>

          {/* ── Row 1: Guest Growth (3/5) + Episode Pipeline (2/5) ─────────── */}
          <div className={`grid lg:grid-cols-5 divide-x ${DIVIDER}`}>

            {/* Guest Growth */}
            <div className="lg:col-span-3 flex flex-col">
              <CellHeader title="Guest Growth" subtitle="New guests per month (last 6)"
                action={<Link to="/admin/guests" className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-black/35 dark:text-white/25 hover:text-black dark:hover:text-white transition-colors">All <ArrowRight size={10} /></Link>}
              />
              <div className="flex-1 px-6 py-5">
                {guestsByMonth.length === 0 ? <EmptyState text="No guest data" icon="👥" /> : (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={guestsByMonth} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                      <defs>
                        <linearGradient id="guestGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: TICK_FILL }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: TICK_FILL }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip unit="guests" />} />
                      <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#guestGrad)"
                        dot={{ r: 3, fill: '#6366f1', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#6366f1' }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Episode Pipeline donut */}
            <div className="lg:col-span-2 flex flex-col">
              <CellHeader title="Episode Pipeline" subtitle="Status breakdown" />
              <div className="flex-1 px-6 py-5 flex flex-col">
                {episodesByStatus.length === 0 ? <EmptyState text="No episodes" icon="🎙️" /> : (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={episodesByStatus} cx="50%" cy="50%" innerRadius={52} outerRadius={74} paddingAngle={3} dataKey="value">
                          {episodesByStatus.map((e, i) => <Cell key={e.name} fill={PIE_PALETTE[i % PIE_PALETTE.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v, n) => [`${v} episodes`, n]}
                          contentStyle={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: 0, fontSize: 11, background: 'white' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {episodesByStatus.map((s, i) => (
                        <div key={s.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2" style={{ background: PIE_PALETTE[i % PIE_PALETTE.length] }} />
                            <span className="capitalize text-black/50 dark:text-white/40">{s.name}</span>
                          </div>
                          <span className="font-bold text-black/70 dark:text-white/60">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Row 2: Booking Volume (3/5) + Health & Quick Access (2/5) ───── */}
          <div className={`grid lg:grid-cols-5 divide-x ${DIVIDER}`}>

            {/* Booking Volume bar chart */}
            <div className="lg:col-span-3 flex flex-col">
              <CellHeader title="Booking Volume" subtitle="Bookings per month (last 6)"
                action={<Link to="/admin/bookings" className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-black/35 dark:text-white/25 hover:text-black dark:hover:text-white transition-colors">All <ArrowRight size={10} /></Link>}
              />
              <div className="flex-1 px-6 py-5">
                {bookingsByMonth.length === 0 ? <EmptyState text="No bookings yet" icon="📅" /> : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={bookingsByMonth} barSize={30} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: TICK_FILL }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: TICK_FILL }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip unit="bookings" />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                      <Bar dataKey="count" fill="url(#barGrad)" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Right column: Health ring + Quick Access */}
            <div className={`lg:col-span-2 flex flex-col divide-y ${DIVIDER}`}>

              {/* Booking health */}
              <div className="flex flex-col">
                <CellHeader title="Booking Health" subtitle="Completion rate" />
                <div className="px-6 py-5 flex items-center gap-5">
                  <div className="relative h-[80px] w-[80px] flex-none">
                    <svg viewBox="0 0 36 36" className="h-[80px] w-[80px] -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(0,0,0,0.08)" strokeWidth="3.5" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#10b981" strokeWidth="3.5"
                        strokeDasharray={`${completionRate} ${100 - completionRate}`} strokeLinecap="square" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-base font-extrabold">{completionRate}%</span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-black/30 dark:text-white/25">done</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <ProgressBar label="Completed" count={completed} total={data.bookings.length} color="bg-emerald-500" />
                    <ProgressBar label="Scheduled" count={scheduled} total={data.bookings.length} color="bg-amber-400" />
                    <ProgressBar label="Cancelled" count={cancelled} total={data.bookings.length} color="bg-red-400" />
                  </div>
                </div>
              </div>

              {/* Quick Access */}
              <div className="flex flex-col flex-1">
                <CellHeader title="Quick Access" />
                <div className="flex-1">
                  {[
                    { to: '/admin/guests', icon: Users, label: 'Guests', count: data.guests.length, accent: 'text-violet-600 dark:text-violet-400' },
                    { to: '/admin/episodes', icon: Mic2, label: 'Episodes', count: data.episodes.length, accent: 'text-blue-600 dark:text-blue-400' },
                    { to: '/admin/bookings', icon: CalendarDays, label: 'Bookings', count: data.bookings.length, accent: 'text-amber-600 dark:text-amber-400' },
                    { to: '/admin/notes', icon: BarChart3, label: 'Notes', count: data.notes.length, accent: 'text-emerald-600 dark:text-emerald-400' },
                  ].map(({ to, icon: Icon, label, count, accent }) => (
                    <Link key={to} to={to}
                      className={`flex items-center justify-between px-6 py-3.5 border-b ${DIVIDER} last:border-b-0 hover:bg-black/[0.025] dark:hover:bg-white/[0.025] transition-colors group`}>
                      <div className="flex items-center gap-2.5">
                        <Icon size={14} className={accent} />
                        <span className="text-sm font-medium text-black/65 dark:text-white/55 group-hover:text-black dark:group-hover:text-white transition-colors">{label}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-black/30 dark:text-white/25 group-hover:text-black dark:group-hover:text-white tabular-nums">{count}</span>
                        <ArrowRight size={11} className="text-black/20 dark:text-white/15 group-hover:text-black dark:group-hover:text-white transition-colors" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── Row 3: Recent Bookings (1/2) + Episode Pipeline (1/2) ──────── */}
          <div className={`grid lg:grid-cols-2 divide-x ${DIVIDER}`}>

            {/* Recent Bookings */}
            <div className="flex flex-col">
              <CellHeader title="Recent Bookings" subtitle="Latest activity"
                action={<Link to="/admin/bookings" className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-black/35 dark:text-white/25 hover:text-black dark:hover:text-white transition-colors">All <ArrowRight size={10} /></Link>}
              />
              {recentBookings.length === 0 ? <EmptyState text="No bookings yet" icon="📅" /> : (
                <div>
                  {recentBookings.map((b, i) => {
                    const guest = guestMap[b.guestId];
                    return (
                      <div key={b.id} className={`flex items-center gap-4 px-6 py-4 border-b ${DIVIDER} last:border-b-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors`}>
                        <div className={`h-8 w-8 flex-none bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                          {guest?.name?.slice(0, 2).toUpperCase() ?? '??'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-black/80 dark:text-white/80 truncate">{guest?.name ?? 'Unknown guest'}</p>
                          <p className="text-[11px] text-black/30 dark:text-white/25 flex items-center gap-1 mt-0.5">
                            <Clock3 size={9} />
                            {new Date(b.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_BADGE[b.status] ?? 'bg-slate-100 text-slate-600'}`}>{b.status}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Recent Episodes */}
            <div className="flex flex-col">
              <CellHeader title="Episode Pipeline" subtitle="Recently added"
                action={<Link to="/admin/episodes" className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-black/35 dark:text-white/25 hover:text-black dark:hover:text-white transition-colors">All <ArrowRight size={10} /></Link>}
              />
              {recentEpisodes.length === 0 ? <EmptyState text="No episodes yet" icon="🎙️" /> : (
                <div>
                  {recentEpisodes.map((ep, i) => {
                    const guest = guestMap[ep.guestId];
                    return (
                      <div key={ep.id} className={`flex items-center gap-4 px-6 py-4 border-b ${DIVIDER} last:border-b-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors`}>
                        <div className={`h-8 w-8 flex-none bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} flex items-center justify-center shrink-0`}>
                          <Mic2 size={13} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-black/80 dark:text-white/80 truncate">{ep.title || 'Untitled Episode'}</p>
                          <p className="text-[11px] text-black/30 dark:text-white/25 mt-0.5 truncate">{guest?.name ?? 'No guest assigned'}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_BADGE[ep.status] ?? 'bg-slate-100 text-slate-600'}`}>{ep.status}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ── Footer strip ─────────────────────────────────────────────────── */}
          <div className={` grid grid-cols-3 lg:grid-cols-6 divide-x ${DIVIDER}`}>
            {[
              { label: 'Total Guests', value: data.guests.length, to: '/admin/guests' },
              { label: 'Episodes', value: data.episodes.length, to: '/admin/episodes' },
              { label: 'Bookings', value: data.bookings.length, to: '/admin/bookings' },
              { label: 'Published', value: published, to: '/admin/episodes' },
              { label: 'Notes', value: data.notes.length, to: '/admin/notes' },
              { label: 'Completion', value: `${completionRate}%`, to: '/admin/bookings' },
            ].map(({ label, value, to }) => (
              <Link key={label} to={to} className="px-6 py-5 flex flex-col gap-1 hover:bg-black/[0.025] dark:hover:bg-white/[0.025] transition-colors group">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 dark:text-white/20">{label}</p>
                <p className="text-2xl font-extrabold tracking-tight group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">{value}</p>
              </Link>
            ))}
          </div>

        </div>{/* end body grid */}
      </div>{/* end outer border-x wrapper */}
    </div>
  );
}