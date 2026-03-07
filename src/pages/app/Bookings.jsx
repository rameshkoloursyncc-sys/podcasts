import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getBookings, getGuestById } from '../../services/api';

export default function Bookings() {
  const { tenant } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [guestNames, setGuestNames] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenant?.id) return;
    getBookings(tenant.id).then(async (list) => {
      setBookings(list);
      const names = {};
      await Promise.all(
        list.map(async (b) => {
          if (b.guestId) {
            const g = await getGuestById(b.guestId);
            if (g) names[b.guestId] = g.name;
          }
        })
      );
      setGuestNames(names);
    }).finally(() => setLoading(false));
  }, [tenant?.id]);

  if (loading) return <p className="text-slate-500">Loading…</p>;

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-900">Bookings</h1>
      <p className="mt-1 text-sm text-slate-500">Scheduled recordings</p>
      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
        {bookings.length === 0 ? (
          <p className="p-6 text-center text-slate-500">No bookings yet.</p>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Guest</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Scheduled</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Duration</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-sm text-slate-900">
                    {b.guestId ? guestNames[b.guestId] ?? '—' : '—'}
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-600">
                    {new Date(b.scheduledAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-600">{b.durationMinutes} min</td>
                  <td className="px-4 py-2 text-sm text-slate-600">{b.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
