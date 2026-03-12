import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LayoutDashboard, Users, GitBranch, Mic2, CalendarDays,
  FileText, Settings, ShieldCheck, LogOut, Bell, Search, Sparkles, Sun, Moon,
} from 'lucide-react';

const nav = [
  { to: '/app',          end: true,  label: 'Dashboard', icon: LayoutDashboard, lightColor: 'text-violet-500', darkColor: 'text-violet-400', activeLight: 'bg-violet-50 text-violet-700 border-violet-200',   activeDark: 'bg-violet-500/15 text-violet-300 border-violet-500/30' },
  { to: '/app/guests',   end: false, label: 'Guests',    icon: Users,           lightColor: 'text-blue-500',   darkColor: 'text-blue-400',   activeLight: 'bg-blue-50 text-blue-700 border-blue-200',           activeDark: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  { to: '/app/pipeline', end: false, label: 'Pipeline',  icon: GitBranch,       lightColor: 'text-cyan-500',   darkColor: 'text-cyan-400',   activeLight: 'bg-cyan-50 text-cyan-700 border-cyan-200',           activeDark: 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30' },
  { to: '/app/episodes', end: false, label: 'Episodes',  icon: Mic2,            lightColor: 'text-pink-500',   darkColor: 'text-pink-400',   activeLight: 'bg-pink-50 text-pink-700 border-pink-200',           activeDark: 'bg-pink-500/15 text-pink-300 border-pink-500/30' },
  { to: '/app/bookings', end: false, label: 'Bookings',  icon: CalendarDays,    lightColor: 'text-amber-500',  darkColor: 'text-amber-400',  activeLight: 'bg-amber-50 text-amber-700 border-amber-200',        activeDark: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  { to: '/app/notes',    end: false, label: 'Notes',     icon: FileText,        lightColor: 'text-emerald-500',darkColor: 'text-emerald-400',activeLight: 'bg-emerald-50 text-emerald-700 border-emerald-200',  activeDark: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  { to: '/app/settings', end: false, label: 'Settings',  icon: Settings,        lightColor: 'text-slate-500',  darkColor: 'text-slate-400',  activeLight: 'bg-slate-100 text-slate-700 border-slate-200',       activeDark: 'bg-slate-500/15 text-slate-300 border-slate-500/30' },
];

const adminNav = {
  to: '/admin', end: false, label: 'Admin', icon: ShieldCheck,
  lightColor: 'text-rose-500', darkColor: 'text-rose-400',
  activeLight: 'bg-rose-50 text-rose-700 border-rose-200',
  activeDark: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
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
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#0f1117]">

      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside className="w-[220px] flex-none flex flex-col border-r border-slate-200 bg-white shadow-sm dark:border-white/5 dark:bg-[#13151f] dark:shadow-2xl">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
              <Sparkles size={14} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">PodcastOS</p>
              {tenant && <p className="text-[10px] text-slate-400 dark:text-white/40 mt-0.5 truncate max-w-[130px]">{tenant.name}</p>}
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-white/25">Main</p>
          {nav.map(({ to, end, label, icon: Icon, lightColor, darkColor, activeLight, activeDark }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 border ${
                  isActive
                    ? `${activeLight} dark:${activeDark} border`
                    : 'text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-800 dark:text-white/40 dark:hover:bg-white/5 dark:hover:text-white/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={16} className={isActive ? '' : `${lightColor} dark:${darkColor}`} />
                  {label}
                </>
              )}
            </NavLink>
          ))}

          <div className="pt-3 mt-3 border-t border-slate-100 dark:border-white/5">
            <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-white/25">System</p>
            <NavLink
              to={adminNav.to}
              end={adminNav.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 border ${
                  isActive
                    ? `${adminNav.activeLight} dark:${adminNav.activeDark} border`
                    : 'text-slate-500 border-transparent hover:bg-slate-50 hover:text-slate-800 dark:text-white/40 dark:hover:bg-white/5 dark:hover:text-white/70'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <ShieldCheck size={16} className={isActive ? '' : `${adminNav.lightColor} dark:${adminNav.darkColor}`} />
                  {adminNav.label}
                </>
              )}
            </NavLink>
          </div>
        </nav>

        {/* User panel */}
        <div className="px-3 py-4 border-t border-slate-100 dark:border-white/5">
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 dark:bg-white/5 px-3 py-2.5">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white flex-none">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-700 dark:text-white/80 truncate">{user?.displayName ?? 'User'}</p>
              <p className="text-[10px] text-slate-400 dark:text-white/35 truncate">{user?.email ?? ''}</p>
            </div>
            <button
              onClick={handleLogout}
              className="rounded-lg p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:text-white/30 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-all"
              title="Sign out"
            >
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ───────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header */}
        <header className="h-14 flex-none flex items-center justify-between px-6 border-b border-slate-200 bg-white dark:border-white/5 dark:bg-[#13151f]/80 dark:backdrop-blur-sm">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-3 text-slate-400 dark:text-white/25" />
            <input
              placeholder="Search anything…"
              className="pl-9 pr-4 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:bg-white w-56 transition-all focus:w-72 dark:bg-white/5 dark:border-white/8 dark:text-white/60 dark:placeholder:text-white/25 dark:focus:ring-1 dark:focus:ring-violet-500/50 dark:focus:bg-white/8"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* 🌗 Dark / Light toggle */}
            <button
              onClick={toggle}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className="relative flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold border transition-all duration-300 hover:scale-105
                bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200
                dark:bg-white/8 dark:border-white/10 dark:text-white/60 dark:hover:bg-white/15"
            >
              {isDark ? (
                <>
                  <Sun size={14} className="text-amber-400" />
                  <span className="hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon size={14} className="text-violet-500" />
                  <span className="hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            {/* Bell */}
            <button className="relative rounded-xl p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 dark:text-white/40 dark:hover:text-white/70 dark:hover:bg-white/5 transition-all">
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-violet-500" />
            </button>

            {/* Avatar */}
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-violet-500/20">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-slate-50 dark:bg-[#0f1117]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
