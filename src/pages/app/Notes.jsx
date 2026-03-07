import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getNotes } from '../../services/api';

export default function Notes() {
  const { tenant } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenant?.id) return;
    getNotes(tenant.id).then(setNotes).finally(() => setLoading(false));
  }, [tenant?.id]);

  if (loading) return <p className="text-slate-500">Loading…</p>;

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-900">Notes</h1>
      <p className="mt-1 text-sm text-slate-500">All notes across guests and entities</p>
      <div className="mt-4 space-y-2">
        {notes.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500">
            No notes yet.
          </p>
        ) : (
          notes.map((n) => (
            <div
              key={n.id}
              className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700"
            >
              {n.body}
              <span className="mt-1 block text-xs text-slate-400">
                {n.entityType} · {new Date(n.createdAt).toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
