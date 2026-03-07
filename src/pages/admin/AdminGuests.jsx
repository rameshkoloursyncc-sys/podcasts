import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getGuests,
  getPipelineStages,
  createGuest,
  updateGuest,
  deleteGuest,
} from '../../services/api';

export default function AdminGuests() {
  const { tenant } = useAuth();
  const [guests, setGuests] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', bio: '', stageId: '' });

  function load() {
    if (!tenant?.id) return;
    Promise.all([getGuests(tenant.id), getPipelineStages(tenant.id)]).then(
      ([g, s]) => {
        setGuests(g);
        setStages(s.sort((a, b) => a.order - b.order));
      }
    ).finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [tenant?.id]);

  function openCreate() {
    setEditing('new');
    setForm({ name: '', email: '', bio: '', stageId: stages[0]?.id ?? '' });
  }

  function openEdit(g) {
    setEditing(g.id);
    setForm({
      name: g.name,
      email: g.email,
      bio: g.bio ?? '',
      stageId: g.stageId ?? '',
    });
  }

  function cancelEdit() {
    setEditing(null);
    setForm({ name: '', email: '', bio: '', stageId: '' });
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!tenant?.id) return;
    try {
      if (editing === 'new') {
        await createGuest(tenant.id, {
          name: form.name,
          email: form.email,
          bio: form.bio,
          stageId: form.stageId || null,
        });
      } else {
        await updateGuest(editing, {
          name: form.name,
          email: form.email,
          bio: form.bio,
          stageId: form.stageId || null,
        });
      }
      cancelEdit();
      load();
    } catch (_) {}
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this guest?')) return;
    await deleteGuest(id);
    load();
  }

  const stageMap = Object.fromEntries(stages.map((s) => [s.id, s.label]));

  if (loading) return <p className="text-slate-500">Loading…</p>;

  return (
    <div>
      <Link to="/admin" className="text-sm text-slate-500 hover:text-slate-700">
        ← Admin
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Guests (CRUD)</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800"
        >
          Add guest
        </button>
      </div>
      {editing && (
        <form onSubmit={handleSave} className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
          <input
            type="text"
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="mb-2 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            className="mb-2 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <textarea
            placeholder="Bio"
            value={form.bio}
            onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
            className="mb-2 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            rows={2}
          />
          <select
            value={form.stageId}
            onChange={(e) => setForm((f) => ({ ...f, stageId: e.target.value }))}
            className="mb-2 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">—</option>
            {stages.map((s) => (
              <option key={s.id} value={s.id}>{s.label}</option>
            ))}
          </select>
          <div className="flex gap-2">
            <button type="submit" className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800">
              Save
            </button>
            <button type="button" onClick={cancelEdit} className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
              Cancel
            </button>
          </div>
        </form>
      )}
      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Stage</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {guests.map((g) => (
              <tr key={g.id} className="hover:bg-slate-50">
                <td className="px-4 py-2 text-sm text-slate-900">{g.name}</td>
                <td className="px-4 py-2 text-sm text-slate-600">{g.email}</td>
                <td className="px-4 py-2 text-sm text-slate-600">{stageMap[g.stageId] ?? '—'}</td>
                <td className="px-4 py-2 text-right">
                  <button
                    type="button"
                    onClick={() => openEdit(g)}
                    className="mr-2 text-sm text-slate-600 hover:text-slate-900"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(g.id)}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
