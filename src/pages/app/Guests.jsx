import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getGuests } from '../../services/api';
import { getPipelineStages } from '../../services/api';

export default function Guests() {
  const { tenant } = useAuth();
  const [guests, setGuests] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!tenant?.id) return;
    Promise.all([getGuests(tenant.id), getPipelineStages(tenant.id)])
      .then(([g, s]) => {
        setGuests(g);
        setStages(s);
      })
      .catch(() => setError('Failed to load guests'))
      .finally(() => setLoading(false));
  }, [tenant?.id]);

  const stageMap = Object.fromEntries(stages.map((s) => [s.id, s.label]));

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-900">Guests</h1>
      <p className="mt-1 text-sm text-slate-500">All guests for this podcast</p>
      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
        {guests.length === 0 ? (
          <p className="p-6 text-center text-slate-500">No guests yet.</p>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Name</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Stage</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {guests.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-sm text-slate-900">{g.name}</td>
                  <td className="px-4 py-2 text-sm text-slate-600">{g.email}</td>
                  <td className="px-4 py-2 text-sm text-slate-600">
                    {stageMap[g.stageId] ?? '—'}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      to={`/app/guests/${g.id}`}
                      className="text-sm font-medium text-slate-600 hover:text-slate-900"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
