import { useAuth } from '../../context/AuthContext';
import { getGuests, getEpisodes, getBookings, getNotes } from '../../services/api';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Mic2, CalendarDays, FileText, CheckCircle2,
  Clock3, TrendingUp, ArrowRight, Activity, Sparkles,
} from 'lucide-react';

const STATUS_BADGE = {
  draft:     'bg-indigo-100 text-indigo-700 border border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/20',
  scheduled: 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/20',
  recorded:  'bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/20',
  published: 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/20',
  completed: 'bg-teal-100 text-teal-700 border border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/20',
  cancelled: 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/20',
};

function StatCard({ label, value, icon: Icon, gradient, sub, to }) {
  return (
    <Link to={to} className="group relative overflow-hidden rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -left-2 h-20 w-20 rounded-full bg-white/5" />
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60">{label}</p>
          <p className="mt-2 text-4xl font-extrabold text-white tracking-tight">{value}</p>
          {sub && <p className="mt-1 text-xs text-white/50">{sub}</p>}
        </div>
        <div className="rounded-xl bg-white/20 p-2.5 backdrop-blur-sm group-hover:bg-white/30 transition-all">
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </Link>
  );
}

function SectionCard({ title, subtitle, action, children }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-100 shadow-sm overflow-hidden dark:bg-[#1a1d2e] dark:border-white/5 dark:shadow-xl">
      {(title || action) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5">
          <div>
            {title && <h2 className="text-sm font-bold text-slate-800 dark:text-white/80">{title}</h2>}
            {subtitle && <p className="text-xs text-slate-400 dark:text-white/30 mt-0.5">{subtitle}</p>}
          </div>
          {action}
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

function EmptyState({ text, icon = '📭' }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-slate-300 dark:text-white/20 select-none">
      <span className="text-3xl mb-2">{icon}</span>
      <p className="text-xs">{text}</p>
    </div>
  );
}

export default function Dashboard() {
  const { tenant, user } = useAuth();
  const [data, setData] = useState({ guests: [], episodes: [], bookings: [], notes: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenant?.id) return;
    Promise.all([
      getGuests(tenant.id),
      getEpisodes(tenant.id),
      getBookings(tenant.id),
      getNotes(tenant.id),
    ]).then(([guests, episodes, bookings, notes]) => {
      setData({ guests, episodes, bookings, notes });
      setLoading(false);
    });
  }, [tenant?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="h-10 w-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin dark:border-violet-500/30 dark:border-t-violet-500" />
      </div>
    );
  }

  const published = data.episodes.filter(e => e.status === 'published').length;
  const scheduled = data.bookings.filter(b => b.status === 'scheduled').length;
  const recentBookings = [...data.bookings]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);
  const guestMap = Object.fromEntries(data.guests.map(g => [g.id, g]));
  const recentGuests = [...data.guests]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={14} className="text-violet-500 dark:text-violet-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-violet-500 dark:text-violet-400">Overview</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''} 👋
          </h1>
          <p className="text-sm text-slate-400 dark:text-white/35 mt-0.5">
            {tenant?.name} · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/bookings" className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all hover:-translate-y-0.5">
            + New Booking
          </Link>
          <Link to="/admin/guests" className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-all hover:-translate-y-0.5 shadow-sm dark:border-white/10 dark:bg-white/8 dark:text-white/70 dark:hover:bg-white/12">
            + Add Guest
          </Link>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Guests"  value={data.guests.length}   icon={Users}        gradient="from-violet-600 to-purple-700"  to="/app/guests"   sub={`${recentGuests.length} recent`} />
        <StatCard label="Episodes"      value={data.episodes.length} icon={Mic2}         gradient="from-blue-600 to-cyan-600"       to="/app/episodes" sub={`${published} published`} />
        <StatCard label="Bookings"      value={data.bookings.length} icon={CalendarDays} gradient="from-amber-500 to-orange-600"    to="/app/bookings" sub={`${scheduled} upcoming`} />
        <StatCard label="Notes"         value={data.notes.length}    icon={FileText}     gradient="from-emerald-500 to-teal-600"    to="/app/notes"    sub="across all entities" />
      </div>

      {/* Content Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <SectionCard
            title="Recent Bookings"
            subtitle="Latest 5 scheduled recordings"
            action={<Link to="/app/bookings" className="flex items-center gap-1 text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 transition-colors">View all <ArrowRight size={11}/></Link>}
          >
            {recentBookings.length === 0 ? <EmptyState text="No bookings yet" icon="📅" /> : (
              <div className="space-y-2">
                {recentBookings.map((b, i) => {
                  const guest = guestMap[b.guestId];
                  const initials = guest?.name?.slice(0, 2).toUpperCase() ?? '??';
                  const gradients = ['from-violet-500 to-purple-600','from-blue-500 to-cyan-500','from-amber-500 to-orange-500','from-emerald-500 to-teal-500','from-pink-500 to-rose-500'];
                  return (
                    <div key={b.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                      <div className={`h-9 w-9 rounded-xl bg-gradient-to-br ${gradients[i % 5]} flex items-center justify-center text-xs font-bold text-white shadow-sm flex-none`}>
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-white/80 truncate">{guest?.name ?? 'Unknown guest'}</p>
                        <p className="text-xs text-slate-400 dark:text-white/30 flex items-center gap-1 mt-0.5">
                          <Clock3 size={10}/> {new Date(b.scheduledAt).toLocaleString('en-US', {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}
                        </p>
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_BADGE[b.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {b.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>
        </div>

        {/* Quick access + Recent guests */}
        <div className="space-y-4">
          <SectionCard title="Quick Access">
            <div className="space-y-1">
              {[
                { to: '/app/guests',   icon: Users,        label: 'Guests',   count: data.guests.length,   iconBg: 'bg-violet-100 dark:bg-violet-500/15', iconColor: 'text-violet-600 dark:text-violet-400' },
                { to: '/app/episodes', icon: Mic2,         label: 'Episodes', count: data.episodes.length, iconBg: 'bg-blue-100 dark:bg-blue-500/15',     iconColor: 'text-blue-600 dark:text-blue-400' },
                { to: '/app/bookings', icon: CalendarDays, label: 'Bookings', count: data.bookings.length, iconBg: 'bg-amber-100 dark:bg-amber-500/15',   iconColor: 'text-amber-600 dark:text-amber-400' },
                { to: '/app/notes',    icon: FileText,     label: 'Notes',    count: data.notes.length,    iconBg: 'bg-emerald-100 dark:bg-emerald-500/15',iconColor: 'text-emerald-600 dark:text-emerald-400' },
              ].map(({ to, icon: Icon, label, count, iconBg, iconColor }) => (
                <Link key={to} to={to} className="flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                  <div className="flex items-center gap-2.5">
                    <div className={`rounded-lg p-1.5 ${iconBg}`}><Icon size={14} className={iconColor} /></div>
                    <span className="text-sm font-medium text-slate-600 dark:text-white/60 group-hover:text-slate-900 dark:group-hover:text-white/80 transition-colors">{label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-400 dark:text-white/30 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors tabular-nums">{count}</span>
                    <ArrowRight size={11} className="text-slate-300 dark:text-white/20 group-hover:text-violet-500 dark:group-hover:text-violet-400 transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Recent Guests" action={<Link to="/app/guests" className="text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300">View all</Link>}>
            <div className="space-y-2">
              {recentGuests.length === 0 ? <EmptyState text="No guests" icon="👥"/> : recentGuests.map((g, i) => {
                const gradients = ['from-violet-500 to-purple-600','from-pink-500 to-rose-500','from-blue-500 to-cyan-500','from-amber-500 to-orange-500'];
                return (
                  <Link key={g.id} to={`/app/guests/${g.id}`} className="flex items-center gap-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 p-2 transition-colors group">
                    <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${gradients[i % 4]} flex items-center justify-center text-xs font-bold text-white flex-none`}>
                      {g.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-700 dark:text-white/70 truncate group-hover:text-slate-900 dark:group-hover:text-white/90">{g.name}</p>
                      <p className="text-[10px] text-slate-400 dark:text-white/30 truncate">{g.email}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </SectionCard>
        </div>
      </div>

      {/* Footer bar */}
      <div className="rounded-2xl bg-gradient-to-r from-violet-600 via-purple-700 to-indigo-700 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl shadow-violet-200 dark:shadow-violet-900/40">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center"><Activity size={18} className="text-white"/></div>
          <div>
            <p className="text-sm font-bold text-white">All systems operational</p>
            <p className="text-xs text-white/50">{data.guests.length + data.episodes.length + data.bookings.length} total records across {tenant?.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/app/guests"   className="rounded-xl bg-white/15 hover:bg-white/25 px-3 py-1.5 text-xs font-semibold text-white transition-all">Guests</Link>
          <Link to="/app/episodes" className="rounded-xl bg-white/15 hover:bg-white/25 px-3 py-1.5 text-xs font-semibold text-white transition-all">Episodes</Link>
          <Link to="/admin"        className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-violet-700 hover:bg-violet-50 transition-all shadow-md">Admin Panel</Link>
        </div>
      </div>
    </div>
  );
}
