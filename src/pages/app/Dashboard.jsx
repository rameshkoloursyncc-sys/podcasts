import { useAuth } from '../../context/AuthContext';
import { getGuests, getEpisodes, getBookings } from '../../services/api';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { tenant } = useAuth();
  const [counts, setCounts] = useState({ guests: 0, episodes: 0, bookings: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenant?.id) return;
    Promise.all([
      getGuests(tenant.id),
      getEpisodes(tenant.id),
      getBookings(tenant.id),
    ]).then(([guests, episodes, bookings]) => {
      setCounts({
        guests: guests.length,
        episodes: episodes.length,
        bookings: bookings.length,
      });
      setLoading(false);
    });
  }, [tenant?.id]);

  if (loading) {
    return <p className="text-slate-500">Loading…</p>;
  }

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
      <p className="mt-1 text-sm text-slate-500">Overview for {tenant?.name}</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Link
          to="/app/guests"
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300"
        >
          <span className="text-2xl font-semibold text-slate-900">{counts.guests}</span>
          <p className="mt-1 text-sm text-slate-500">Guests</p>
        </Link>
        <Link
          to="/app/episodes"
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300"
        >
          <span className="text-2xl font-semibold text-slate-900">{counts.episodes}</span>
          <p className="mt-1 text-sm text-slate-500">Episodes</p>
        </Link>
        <Link
          to="/app/bookings"
          className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300"
        >
          <span className="text-2xl font-semibold text-slate-900">{counts.bookings}</span>
          <p className="mt-1 text-sm text-slate-500">Bookings</p>
        </Link>
      </div>
    </div>
  );
}
