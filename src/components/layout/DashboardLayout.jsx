import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const nav = [
  { to: '/app', end: true, label: 'Dashboard' },
  { to: '/app/guests', end: false, label: 'Guests' },
  { to: '/app/pipeline', end: false, label: 'Pipeline' },
  { to: '/app/episodes', end: false, label: 'Episodes' },
  { to: '/app/bookings', end: false, label: 'Bookings' },
  { to: '/app/notes', end: false, label: 'Notes' },
  { to: '/app/settings', end: false, label: 'Settings' },
  { to: '/admin', end: false, label: 'Admin' },
];

export default function DashboardLayout() {
  const { user, tenant, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <aside className="w-52 flex flex-col border-r border-slate-200 bg-white">
        <div className="p-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-900">Podcast Lifecycle</h2>
          {tenant && (
            <p className="mt-0.5 text-xs text-slate-500 truncate">{tenant.name}</p>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {nav.map(({ to, end, label }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `block rounded px-3 py-2 text-sm ${isActive ? 'bg-slate-100 text-slate-900 font-medium' : 'text-slate-600 hover:bg-slate-50'}`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 flex items-center justify-between px-4 border-b border-slate-200 bg-white">
          <span className="text-sm text-slate-500" />
          <div className="flex items-center gap-3">
            {user && (
              <span className="text-sm text-slate-600">{user.displayName}</span>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="text-sm text-slate-500 hover:text-slate-700"
            >
              Sign out
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
