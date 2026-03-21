import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard, Users, GitBranch, Mic2, CalendarDays,
  FileText, Settings, ShieldCheck, LogOut, Bell, Search, Sparkles, Sun, Moon, Mail,
} from 'lucide-react';

const DIVIDER = 'border-black/[0.08] dark:border-white/[0.08] divide-black/[0.08] dark:divide-white/[0.08]';

const nav = [
  { to: '/app', end: true, label: 'Overview', icon: LayoutDashboard, lightColor: 'text-violet-500', darkColor: 'text-violet-400', activeLight: 'bg-black/[0.4] text-black border-l-2 border-l-violet-500', activeDark: 'bg-white/[0.04] text-white border-l-2 border-l-violet-400' },
  { to: '/app/guests', end: false, label: 'Guests', icon: Users, lightColor: 'text-blue-500', darkColor: 'text-blue-400', activeLight: 'bg-black/[0.4] text-black border-l-2 border-l-blue-500', activeDark: 'bg-white/[0.04] text-white border-l-2 border-l-blue-400' },
  { to: '/app/pipeline', end: false, label: 'Pipeline', icon: GitBranch, lightColor: 'text-cyan-500', darkColor: 'text-cyan-400', activeLight: 'bg-black/[0.4] text-black border-l-2 border-l-cyan-500', activeDark: 'bg-white/[0.04] text-white border-l-2 border-l-cyan-400' },
  { to: '/app/episodes', end: false, label: 'Episodes', icon: Mic2, lightColor: 'text-pink-500', darkColor: 'text-pink-400', activeLight: 'bg-black/[0.4] text-black border-l-2 border-l-pink-500', activeDark: 'bg-white/[0.04] text-white border-l-2 border-l-pink-400' },
  { to: '/app/bookings', end: false, label: 'Bookings', icon: CalendarDays, lightColor: 'text-amber-500', darkColor: 'text-amber-400', activeLight: 'bg-black/[0.4] text-black border-l-2 border-l-amber-500', activeDark: 'bg-white/[0.04] text-white border-l-2 border-l-amber-400' },
  { to: '/app/notes', end: false, label: 'Notes', icon: FileText, lightColor: 'text-emerald-500', darkColor: 'text-emerald-400', activeLight: 'bg-black/[0.4] text-black border-l-2 border-l-emerald-500', activeDark: 'bg-white/[0.04] text-white border-l-2 border-l-emerald-400' },
  { to: '/app/followups', end: false, label: 'Follow-ups', icon: Mail, lightColor: 'text-orange-500', darkColor: 'text-orange-400', activeLight: 'bg-black/[0.4] text-black border-l-2 border-l-orange-500', activeDark: 'bg-white/[0.04] text-white border-l-2 border-l-orange-400' },
  { to: '/app/settings', end: false, label: 'Settings', icon: Settings, lightColor: 'text-slate-500', darkColor: 'text-slate-400', activeLight: 'bg-black/[0.4] text-black border-l-2 border-l-black', activeDark: 'bg-white/[0.04] text-white border-l-2 border-l-white' },
];
const adminNav = {
  to: '/admin', end: false, label: 'Admin Panel', icon: ShieldCheck,
  lightColor: 'text-rose-500', darkColor: 'text-rose-400',
  activeLight: 'bg-rose-500/10 text-rose-700 border-l-2 border-l-rose-500',
  activeDark: 'bg-rose-500/20 text-rose-300 border-l-2 border-l-rose-400',
};

export default function DashboardLayout() {
  const { user, tenant, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();

  function handleLogout() { logout(); navigate('/login'); }

  const initials = user?.displayName
    ? user.displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <div className="flex h-screen overflow-hidden bg-white dark:bg-[#0f1117] text-black dark:text-white font-sans">

      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside className={`w-[240px] flex-none flex flex-col border-r ${DIVIDER} bg-white dark:bg-[#0a0c12]`}>

        {/* Logo */}
        <div className={`px-6 py-5 border-b ${DIVIDER}`}>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shrink-0">
              <Sparkles size={14} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-extrabold tracking-tight uppercase leading-none truncate">PodcastOS</p>
              {tenant && <p className="text-[10px] font-bold text-black/40 dark:text-white/30 mt-1 uppercase tracking-widest truncate">{tenant.name}</p>}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4">
          <p className="px-6 mb-3 text-[10px] font-bold uppercase tracking-widest text-black/30 dark:text-white/20">System Views</p>
          <div className="space-y-0.5">
            {nav.map(({ to, end, label, icon: Icon, lightColor, darkColor, activeLight, activeDark }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-6 py-3 text-xs font-bold transition-all border-l-2 ${isActive
                    ? `${activeLight} dark:${activeDark}`
                    : 'border-l-transparent text-black/60 dark:text-white/60 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] hover:text-black dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={14} className={isActive ? '' : `${lightColor} dark:${darkColor}`} />
                    <span className="tracking-wide uppercase">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* <div className={`pt-4 mt-4 border-t ${DIVIDER}`}>
            <p className="px-6 mb-3 text-[10px] font-bold uppercase tracking-widest text-black/30 dark:text-white/20">Administration</p>
            <NavLink
              to={adminNav.to}
              end={adminNav.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-xs font-bold transition-all border-l-2 ${isActive
                  ? `${adminNav.activeLight} dark:${adminNav.activeDark}`
                  : 'border-l-transparent text-black/60 dark:text-white/60 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] hover:text-black dark:hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <ShieldCheck size={14} className={isActive ? '' : `${adminNav.lightColor} dark:${adminNav.darkColor}`} />
                  <span className="tracking-wide uppercase">{adminNav.label}</span>
                </>
              )}
            </NavLink>
          </div> */}
        </nav>

        {/* User panel */}
        <div className={`px-6 py-4 border-t ${DIVIDER}`}>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-black/5 dark:bg-white/10 flex items-center justify-center text-xs font-extrabold flex-none">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">{user?.displayName ?? 'User'}</p>
              <p className="text-[10px] text-black/40 dark:text-white/30 truncate uppercase tracking-widest mt-0.5">{user?.email ?? ''}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-black/40 hover:text-red-500 dark:text-white/30 dark:hover:text-red-400 transition-colors shrink-0"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className={`h-16 flex-none flex items-center justify-between px-6 border-b ${DIVIDER} bg-white dark:bg-[#0a0c12]`}>
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-4 text-black/30 dark:text-white/20" />
            <input
              placeholder="Search anything…"
              className={`pl-10 pr-4 py-2 border ${DIVIDER} bg-black/[0.02] dark:bg-white/[0.02] text-xs font-bold text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/20 focus:outline-none focus:border-black dark:focus:border-white focus:bg-transparent w-64 transition-all focus:w-80`}
            />
          </div>

          <div className="flex items-center gap-4">
            {/* 🌗 Dark / Light toggle */}
            <button
              onClick={toggle}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`flex items-center gap-2 border ${DIVIDER} px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest hover:border-black dark:hover:border-white transition-colors`}
            >
              {isDark ? (
                <><Sun size={12} className="text-amber-400" /> Light</>
              ) : (
                <><Moon size={12} className="text-violet-500" /> Dark</>
              )}
            </button>

            {/* Notifications */}
            <button className={`relative border ${DIVIDER} p-2 hover:border-black dark:hover:border-white transition-colors`}>
              <Bell size={14} className="text-black/60 dark:text-white/60" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-violet-500" />
            </button>

            {/* Avatar Header */}
            <div className={`h-8 w-8 border ${DIVIDER} flex items-center justify-center text-[10px] font-extrabold shrink-0`}>
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-white dark:bg-[#0f1117]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
