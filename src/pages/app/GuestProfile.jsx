import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getGuestById, getPipelineStages, getNotes, createNote } from '../../services/api';

export default function GuestProfile() {
  const { id } = useParams();
  const { tenant, user } = useAuth();
  const [guest, setGuest] = useState(null);
  const [stages, setStages] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!tenant?.id || !id) return;
    Promise.all([
      getGuestById(id),
      getPipelineStages(tenant.id),
      getNotes(tenant.id, 'guest', id),
    ]).then(([g, s, n]) => {
      setGuest(g ?? null);
      setStages(s);
      setNotes(n);
    }).finally(() => setLoading(false));
  }, [tenant?.id, id]);

  async function handleAddNote(e) {
    e.preventDefault();
    if (!newNote.trim() || !tenant?.id || !user?.id) return;
    setSaving(true);
    try {
      const note = await createNote(tenant.id, {
        entityType: 'guest',
        entityId: id,
        authorId: user.id,
        body: newNote.trim(),
      });
      setNotes((prev) => [note, ...prev]);
      setNewNote('');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (!guest) return <p className="text-slate-500">Guest not found.</p>;

  const stage = stages.find((s) => s.id === guest.stageId);

  return (
    <div>
      <Link to="/app/guests" className="text-sm text-slate-500 hover:text-slate-700">
        ← Guests
      </Link>
      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="text-lg font-semibold text-slate-900">{guest.name}</h1>
        <p className="mt-1 text-sm text-slate-600">{guest.email}</p>
        {stage && (
          <span className="mt-2 inline-block rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
            {stage.label}
          </span>
        )}
        {guest.bio && (
          <p className="mt-4 text-sm text-slate-600">{guest.bio}</p>
        )}
      </div>
      <div className="mt-6">
        <h2 className="text-sm font-medium text-slate-900">Notes</h2>
        <form onSubmit={handleAddNote} className="mt-2 flex gap-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note…"
            className="flex-1 rounded border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-slate-900 px-3 py-2 text-sm text-white hover:bg-slate-800 disabled:opacity-50"
          >
            Add
          </button>
        </form>
        <ul className="mt-3 space-y-2">
          {notes.map((n) => (
            <li
              key={n.id}
              className="rounded border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            >
              {n.body}
              <span className="ml-2 text-xs text-slate-400">
                {new Date(n.createdAt).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
