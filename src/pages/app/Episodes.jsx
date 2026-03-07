import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getEpisodes, getGuestById } from '../../services/api';

export default function Episodes() {
  const { tenant } = useAuth();
  const [episodes, setEpisodes] = useState([]);
  const [guestNames, setGuestNames] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenant?.id) return;
    getEpisodes(tenant.id).then(async (list) => {
      setEpisodes(list);
      const names = {};
      await Promise.all(
        list.map(async (ep) => {
          if (ep.guestId) {
            const g = await getGuestById(ep.guestId);
            if (g) names[ep.guestId] = g.name;
          }
        })
      );
      setGuestNames(names);
    }).finally(() => setLoading(false));
  }, [tenant?.id]);

  if (loading) return <p className="text-slate-500">Loading…</p>;

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-900">Episodes</h1>
      <p className="mt-1 text-sm text-slate-500">All episodes</p>
      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
        {episodes.length === 0 ? (
          <p className="p-6 text-center text-slate-500">No episodes yet.</p>
        ) : (
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Title</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Guest</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Status</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-slate-500" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {episodes.map((ep) => (
                <tr key={ep.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 text-sm text-slate-900">{ep.title}</td>
                  <td className="px-4 py-2 text-sm text-slate-600">
                    {ep.guestId ? guestNames[ep.guestId] ?? '—' : '—'}
                  </td>
                  <td className="px-4 py-2 text-sm text-slate-600">{ep.status}</td>
                  <td className="px-4 py-2 text-right">
                    <Link
                      to={`/app/episodes/${ep.id}`}
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
