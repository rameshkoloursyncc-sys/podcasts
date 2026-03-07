import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getNotes, createNote, deleteNote } from '../../services/api';

export default function AdminNotes() {
  const { tenant, user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ entityType: 'guest', entityId: '', body: '' });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  function load() {
    if (!tenant?.id) return;
    getNotes(tenant.id).then(setNotes).finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [tenant?.id]);

  async function handleAdd(e) {
    e.preventDefault();
    if (!form.body.trim() || !tenant?.id || !user?.id) return;
    setSaving(true);
    try {
      await createNote(tenant.id, {
        entityType: form.entityType,
        entityId: form.entityId.trim(),
        authorId: user.id,
        body: form.body.trim(),
      });
      setForm({ entityType: 'guest', entityId: '', body: '' });
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this note?')) return;
    await deleteNote(id);
    load();
  }

  if (loading) return <p className="text-slate-500">Loading…</p>;

  return (
    <div>
      <Link to="/admin" className="text-sm text-slate-500 hover:text-slate-700">
        ← Admin
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Notes (CRUD)</h1>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800"
        >
          {showForm ? 'Cancel' : 'Add note'}
        </button>
      </div>
      {showForm && (
        <form onSubmit={handleAdd} className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
          <select
            value={form.entityType}
            onChange={(e) => setForm((f) => ({ ...f, entityType: e.target.value }))}
            className="mb-2 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="guest">guest</option>
            <option value="episode">episode</option>
          </select>
          <input
            type="text"
            placeholder="Entity ID (e.g. guest-1)"
            value={form.entityId}
            onChange={(e) => setForm((f) => ({ ...f, entityId: e.target.value }))}
            className="mb-2 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Note body"
            value={form.body}
            onChange={(e) => setForm((f) => ({ ...f, body: e.target.value }))}
            className="mb-2 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            rows={2}
            required
          />
          <button type="submit" disabled={saving} className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800 disabled:opacity-50">
            Save
          </button>
        </form>
      )}
      <div className="mt-4 space-y-2">
        {notes.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-white p-6 text-center text-slate-500">No notes.</p>
        ) : (
          notes.map((n) => (
            <div key={n.id} className="flex items-start justify-between rounded-lg border border-slate-200 bg-white p-3">
              <div>
                <p className="text-sm text-slate-900">{n.body}</p>
                <span className="text-xs text-slate-400">{n.entityType} · {n.entityId} · {new Date(n.createdAt).toLocaleString()}</span>
              </div>
              <button type="button" onClick={() => handleDelete(n.id)} className="text-sm text-red-600 hover:text-red-700">Delete</button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
