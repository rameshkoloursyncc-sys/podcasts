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

const DIVIDER = 'border-black/[0.08] dark:border-white/[0.08] divide-black/[0.08] dark:divide-white/[0.08]';

const STATUS_BADGE = {
  draft: 'bg-black/[0.05] text-black dark:bg-white/10 dark:text-white',
  scheduled: 'bg-black/[0.05] text-black dark:bg-white/10 dark:text-white',
  recorded: 'bg-black/[0.05] text-black dark:bg-white/10 dark:text-white',
  published: 'bg-black text-white dark:bg-white dark:text-black',
  completed: 'bg-black text-white dark:bg-white dark:text-black',
  cancelled: 'border border-black/20 text-black/60 dark:border-white/20 dark:text-white/60',
};

const PIE_PALETTE = ['#000000', '#333333', '#666666', '#999999'];
const PIE_PALETTE_DARK = ['#ffffff', '#cccccc', '#999999', '#666666'];

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

function KpiCard({ label, value, icon: Icon, delta, to, sub }) {
  return (
    <Link to={to} className={`group relative overflow-hidden p-6 transition-all hover:bg-black/[0.02] dark:hover:bg-white/[0.02] border ${DIVIDER}`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-black/40 dark:text-white/40">{label}</p>
        <div className="text-black/30 dark:text-white/30 group-hover:text-black dark:group-hover:text-white transition-all">
          <Icon size={16} />
        </div>
      </div>
      <p className="text-4xl font-extrabold text-black dark:text-white tracking-tight">{value}</p>
      {sub && <p className="mt-1.5 text-xs text-black/40 dark:text-white/40">{sub}</p>}
      {delta !== undefined && (
        <div className="mt-2 flex items-center gap-1 text-black/50 dark:text-white/50 group-hover:text-black dark:group-hover:text-white">
          {delta >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          <span className="text-xs font-semibold">{delta >= 0 ? '+' : ''}{delta} this month</span>
        </div>
      )}
    </Link>
  );
}

const ChartTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className={`border ${DIVIDER} bg-white dark:bg-[#13151f] px-3 py-2 text-xs shadow-xl`}>
      <p className="font-bold text-black/50 dark:text-white/40 mb-0.5">{label}</p>
      <p className="font-semibold text-black dark:text-white">{payload[0].value} {unit}</p>
    </div>
  );
};

function ProgressBar({ label, count, total, isDark }) {
  const w = pct(count, total);
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 text-[11px] font-medium text-black/40 dark:text-white/30 text-right shrink-0 capitalize">{label}</span>
      <div className="flex-1 h-1.5 bg-black/8 dark:bg-white/8 overflow-hidden">
        <div className="h-1.5 transition-all duration-700 bg-black dark:bg-white" style={{ width: `${w}%` }} />
      </div>
      <span className="w-7 text-xs font-bold text-black/50 dark:text-white/40 tabular-nums">{count}</span>
    </div>
  );
}

function EmptyState({ text = 'No data yet', icon = '📭' }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-black/20 dark:text-white/15 select-none">
      <span className="text-3xl mb-2">{icon}</span>
      <p className="text-xs font-medium uppercase tracking-widest">{text}</p>
    </div>
  );
}

const TICK_FILL = 'rgba(0,0,0,0.35)';

export default function AdminIndex() {
  const { tenant, user } = useAuth();
  const [data, setData] = useState({ guests: [], episodes: [], bookings: [], notes: [] });
  const [loading, setLoading] = useState(true);
  const [isDarkMs, setIsDarkMs] = useState(false);

  useEffect(() => {
    setIsDarkMs(document.documentElement.classList.contains('dark'));
    const observer = new MutationObserver(() => setIsDarkMs(document.documentElement.classList.contains('dark')));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

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

  const mainColor = isDarkMs ? '#ffffff' : '#000000';
  const palette = isDarkMs ? PIE_PALETTE_DARK : PIE_PALETTE;

  if (loading) return (
    <div className="flex items-center justify-center h-80 bg-white dark:bg-[#0f1117]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 rounded-full border-4 border-black/10 border-t-black animate-spin dark:border-white/10 dark:border-t-white" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/25 dark:text-white/20">Loading…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1117] text-black dark:text-white">
      <div className={`border-x ${DIVIDER}`}>
        
        {/* Billboard Header */}
        <div className={`border-y ${DIVIDER} bg-white dark:bg-[#0a0c12]`}>
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
              <Link to="/admin/bookings" className={`border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 text-xs font-bold hover:opacity-80 transition-opacity`}>
                + New Booking
              </Link>
              <Link to="/admin/guests" className={`border ${DIVIDER} px-5 py-2.5 text-xs font-bold text-black/60 dark:text-white/60 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all`}>
                + Add Guest
              </Link>
            </div>
          </div>

          <div className="m-6 grid grid-cols-2 lg:grid-cols-4">
            <KpiCard label="Total Guests" value={data.guests.length} icon={Users} delta={guestDelta} to="/admin/guests" sub="registered guests" />
            <KpiCard label="Episodes" value={data.episodes.length} icon={Mic2} to="/admin/episodes" sub={`${published} published`} />
            <KpiCard label="Bookings" value={data.bookings.length} icon={CalendarDays} delta={bookDelta} to="/admin/bookings" sub={`${scheduled} upcoming`} />
            <KpiCard label="Published" value={published} icon={CheckCircle2} to="/admin/episodes" sub={`${pct(published, data.episodes.length)}% of episodes`} />
          </div>
        </div>

        <div className={`border-b ${DIVIDER} divide-y ${DIVIDER}`}>
          
          <div className={`grid lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x ${DIVIDER}`}>
            {/* Guest Growth */}
            <div className="lg:col-span-3 flex flex-col">
              <CellHeader title="Guest Growth" subtitle="New guests per month (last 6)"
                action={<Link to="/admin/guests" className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-black/35 dark:text-white/25 hover:text-black dark:hover:text-white transition-colors">All <ArrowRight size={10} /></Link>}
              />
              <div className="flex-1 px-6 py-5">
                {guestsByMonth.length === 0 ? <EmptyState text="No guest data" icon="👥" /> : (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={guestsByMonth} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMs ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: isDarkMs ? '#ffffff80' : TICK_FILL }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: isDarkMs ? '#ffffff80' : TICK_FILL }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip unit="guests" />} />
                      <Area type="monotone" dataKey="count" stroke={mainColor} strokeWidth={2} fill={mainColor} fillOpacity={0.1}
                        dot={{ r: 3, fill: mainColor, strokeWidth: 0 }} activeDot={{ r: 5, fill: mainColor }} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Episode Pipeline */}
            <div className="lg:col-span-2 flex flex-col">
              <CellHeader title="Episode Pipeline" subtitle="Status breakdown" />
              <div className="flex-1 px-6 py-5 flex flex-col">
                {episodesByStatus.length === 0 ? <EmptyState text="No episodes" icon="🎙️" /> : (
                  <>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={episodesByStatus} cx="50%" cy="50%" innerRadius={52} outerRadius={74} paddingAngle={3} dataKey="value" stroke="none">
                          {episodesByStatus.map((e, i) => <Cell key={e.name} fill={palette[i % palette.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v, n) => [`${v} episodes`, n]}
                          contentStyle={{ border: '1px solid rgba(0,0,0,0.1)', borderRadius: 0, fontSize: 11, background: isDarkMs ? '#13151f' : 'white', color: isDarkMs ? 'white' : 'black' }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="mt-4 space-y-2">
                      {episodesByStatus.map((s, i) => (
                        <div key={s.name} className="flex items-center justify-between text-xs font-bold uppercase tracking-widest">
                          <div className="flex items-center gap-2">
                            <span className="h-2 w-2" style={{ background: palette[i % palette.length] }} />
                            <span className="text-black/50 dark:text-white/40">{s.name}</span>
                          </div>
                          <span className="text-black/70 dark:text-white/60">{s.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className={`grid lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x ${DIVIDER}`}>
            {/* Booking Volume */}
            <div className="lg:col-span-3 flex flex-col">
              <CellHeader title="Booking Volume" subtitle="Bookings per month (last 6)"
                action={<Link to="/admin/bookings" className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-black/35 dark:text-white/25 hover:text-black dark:hover:text-white transition-colors">All <ArrowRight size={10} /></Link>}
              />
              <div className="flex-1 px-6 py-5">
                {bookingsByMonth.length === 0 ? <EmptyState text="No bookings yet" icon="📅" /> : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={bookingsByMonth} barSize={30} margin={{ top: 4, right: 4, left: -22, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={isDarkMs ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 10, fill: isDarkMs ? '#ffffff80' : TICK_FILL }} axisLine={false} tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: isDarkMs ? '#ffffff80' : TICK_FILL }} axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip unit="bookings" />} cursor={{ fill: isDarkMs ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }} />
                      <Bar dataKey="count" fill={mainColor} fillOpacity={0.8} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className={`lg:col-span-2 flex flex-col divide-y ${DIVIDER}`}>
              <div className="flex flex-col">
                <CellHeader title="Booking Health" subtitle="Completion rate" />
                <div className="px-6 py-5 flex items-center gap-5">
                  <div className="relative h-[80px] w-[80px] flex-none">
                    <svg viewBox="0 0 36 36" className="h-[80px] w-[80px] -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke={isDarkMs ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"} strokeWidth="3.5" />
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke={mainColor} strokeWidth="3.5"
                        strokeDasharray={`${completionRate} ${100 - completionRate}`} strokeLinecap="square" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-base font-extrabold">{completionRate}%</span>
                      <span className="text-[9px] font-bold uppercase tracking-widest text-black/30 dark:text-white/25">done</span>
                    </div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <ProgressBar label="Completed" count={completed} total={data.bookings.length} isDark={isDarkMs} />
                    <ProgressBar label="Scheduled" count={scheduled} total={data.bookings.length} isDark={isDarkMs} />
                    <ProgressBar label="Cancelled" count={cancelled} total={data.bookings.length} isDark={isDarkMs} />
                  </div>
                </div>
              </div>

              <div className="flex flex-col flex-1">
                <CellHeader title="Quick Access" />
                <div className="flex-1">
                  {[
                    { to: '/admin/guests', icon: Users, label: 'Guests', count: data.guests.length },
                    { to: '/admin/episodes', icon: Mic2, label: 'Episodes', count: data.episodes.length },
                    { to: '/admin/bookings', icon: CalendarDays, label: 'Bookings', count: data.bookings.length },
                    { to: '/admin/notes', icon: BarChart3, label: 'Notes', count: data.notes.length },
                  ].map(({ to, icon: Icon, label, count }) => (
                    <Link key={to} to={to}
                      className={`flex items-center justify-between px-6 py-3.5 border-b ${DIVIDER} last:border-b-0 hover:bg-black/[0.025] dark:hover:bg-white/[0.025] transition-colors group`}>
                      <div className="flex items-center gap-2.5">
                        <Icon size={14} className="text-black/50 dark:text-white/50" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-black/65 dark:text-white/55 group-hover:text-black dark:group-hover:text-white transition-colors">{label}</span>
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

          <div className={`grid lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x ${DIVIDER}`}>
            {/* Recent Bookings */}
            <div className="flex flex-col">
              <CellHeader title="Recent Bookings" subtitle="Latest activity"
                action={<Link to="/admin/bookings" className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-black/35 dark:text-white/25 hover:text-black dark:hover:text-white transition-colors">All <ArrowRight size={10} /></Link>}
              />
              {recentBookings.length === 0 ? <EmptyState text="No bookings yet" icon="📅" /> : (
                <div>
                  {recentBookings.map(b => {
                    const guest = guestMap[b.guestId];
                    return (
                      <div key={b.id} className={`flex items-center gap-4 px-6 py-4 border-b ${DIVIDER} last:border-b-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors`}>
                        <div className={`h-8 w-8 flex-none bg-black/5 dark:bg-white/10 flex items-center justify-center text-xs font-bold text-black dark:text-white shrink-0`}>
                          {guest?.name?.slice(0, 2).toUpperCase() ?? '??'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-black/80 dark:text-white/80 truncate">{guest?.name ?? 'Unknown guest'}</p>
                          <p className="text-[11px] font-bold uppercase tracking-widest text-black/30 dark:text-white/25 flex items-center gap-1 mt-0.5">
                            <Clock3 size={9} />
                            {new Date(b.scheduledAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${STATUS_BADGE[b.status] ?? 'bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60'}`}>{b.status}</span>
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
                  {recentEpisodes.map(ep => {
                    const guest = guestMap[ep.guestId];
                    return (
                      <div key={ep.id} className={`flex items-center gap-4 px-6 py-4 border-b ${DIVIDER} last:border-b-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors`}>
                        <div className={`h-8 w-8 flex-none bg-black/5 dark:bg-white/10 flex items-center justify-center shrink-0`}>
                          <Mic2 size={13} className="text-black/60 dark:text-white/60" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-black/80 dark:text-white/80 truncate">{ep.title || 'Untitled Episode'}</p>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 dark:text-white/25 mt-0.5 truncate">{guest?.name ?? 'No guest assigned'}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${STATUS_BADGE[ep.status] ?? 'bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60'}`}>{ep.status}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 divide-y lg:divide-y-0 divide-x ${DIVIDER}`}>
            {[
              { label: 'Total Guests', value: data.guests.length, to: '/admin/guests' },
              { label: 'Episodes', value: data.episodes.length, to: '/admin/episodes' },
              { label: 'Bookings', value: data.bookings.length, to: '/admin/bookings' },
              { label: 'Published', value: published, to: '/admin/episodes' },
              { label: 'Notes', value: data.notes.length, to: '/admin/notes' },
              { label: 'Completion', value: `${completionRate}%`, to: '/admin/bookings' },
            ].map(({ label, value, to }) => (
              <Link key={label} to={to} className={`px-6 py-5 flex flex-col gap-1 hover:bg-black/[0.025] dark:hover:bg-white/[0.025] transition-colors group border-t md:border-t-0 ${DIVIDER}`}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 dark:text-white/20">{label}</p>
                <p className="text-2xl font-extrabold tracking-tight transition-colors group-hover:underline underline-offset-4">{value}</p>
              </Link>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}