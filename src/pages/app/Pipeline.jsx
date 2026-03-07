import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getGuests, getPipelineStages } from '../../services/api';

export default function Pipeline() {
  const { tenant } = useAuth();
  const [guests, setGuests] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenant?.id) return;
    Promise.all([getGuests(tenant.id), getPipelineStages(tenant.id)]).then(
      ([g, s]) => {
        setGuests(g);
        setStages(s.sort((a, b) => a.order - b.order));
      }
    ).finally(() => setLoading(false));
  }, [tenant?.id]);

  const byStage = stages.map((stage) => ({
    ...stage,
    guests: guests.filter((g) => g.stageId === stage.id),
  }));

  if (loading) return <p className="text-slate-500">Loading…</p>;

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-900">Pipeline</h1>
      <p className="mt-1 text-sm text-slate-500">Guest stages</p>
      <div className="mt-4 flex gap-4 overflow-x-auto pb-4">
        {byStage.map((col) => (
          <div
            key={col.id}
            className="w-64 flex-shrink-0 rounded-lg border border-slate-200 bg-slate-50 p-3"
          >
            <h3 className="text-sm font-medium text-slate-700">{col.label}</h3>
            <p className="text-xs text-slate-500">{col.guests.length} guests</p>
            <ul className="mt-2 space-y-1">
              {col.guests.map((g) => (
                <li key={g.id}>
                  <Link
                    to={`/app/guests/${g.id}`}
                    className="block rounded bg-white px-2 py-1.5 text-sm text-slate-900 hover:bg-slate-100"
                  >
                    {g.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
