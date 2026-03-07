import { Link } from 'react-router-dom';

const links = [
  { to: '/admin/guests', label: 'Guests' },
  { to: '/admin/episodes', label: 'Episodes' },
  { to: '/admin/bookings', label: 'Bookings' },
  { to: '/admin/notes', label: 'Notes' },
];

export default function AdminIndex() {
  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-900">Admin</h1>
      <p className="mt-1 text-sm text-slate-500">CRUD for all entities</p>
      <ul className="mt-6 space-y-2">
        {links.map(({ to, label }) => (
          <li key={to}>
            <Link
              to={to}
              className="block rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 hover:bg-slate-50"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
