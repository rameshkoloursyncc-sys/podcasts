import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getEpisodes,
  getGuests,
  createEpisode,
  updateEpisode,
  deleteEpisode,
} from '../../services/api';

export default function AdminEpisodes() {
  const { tenant } = useAuth();
  const [episodes, setEpisodes] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', guestId: '', status: 'draft' });

  function load() {
    if (!tenant?.id) return;
    Promise.all([getEpisodes(tenant.id), getGuests(tenant.id)]).then(([e, g]) => {
      setEpisodes(e);
      setGuests(g);
    }).finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [tenant?.id]);

  function openCreate() {
    setEditing('new');
    setForm({ title: '', guestId: '', status: 'draft' });
  }

  function openEdit(ep) {
    setEditing(ep.id);
    setForm({
      title: ep.title,
      guestId: ep.guestId ?? '',
      status: ep.status ?? 'draft',
    });
  }

  function cancelEdit() {
    setEditing(null);
    setForm({ title: '', guestId: '', status: 'draft' });
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!tenant?.id) return;
    try {
      if (editing === 'new') {
        await createEpisode(tenant.id, {
          title: form.title,
          guestId: form.guestId || null,
          status: form.status,
        });
      } else {
        await updateEpisode(editing, {
          title: form.title,
          guestId: form.guestId || null,
          status: form.status,
        });
      }
      cancelEdit();
      load();
    } catch (_) {}
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this episode?')) return;
    await deleteEpisode(id);
    load();
  }

  const guestMap = Object.fromEntries(guests.map((g) => [g.id, g.name]));

  if (loading) return <p className="text-slate-500">Loading…</p>;

  return (
    <div>
      <Link to="/admin" className="text-sm text-slate-500 hover:text-slate-700">
        ← Admin
      </Link>
      <div className="mt-2 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900">Episodes (CRUD)</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800"
        >
          Add episode
        </button>
      </div>
      {editing && (
        <form onSubmit={handleSave} className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
          <input
            type="text"
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="mb-2 w-full rounded border border-slate-300 px-3 py-2 text-sm"
            required
          />
          <select
            value={form.guestId}
            onChange={(e) => setForm((f) => ({ ...f, guestId: e.target.value }))}
            className="mb-2 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">— No guest —</option>
            {guests.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            className="mb-2 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="recorded">Recorded</option>
            <option value="published">Published</option>
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
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Title</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Guest</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Status</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {episodes.map((ep) => (
              <tr key={ep.id} className="hover:bg-slate-50">
                <td className="px-4 py-2 text-sm text-slate-900">{ep.title}</td>
                <td className="px-4 py-2 text-sm text-slate-600">{guestMap[ep.guestId] ?? '—'}</td>
                <td className="px-4 py-2 text-sm text-slate-600">{ep.status}</td>
                <td className="px-4 py-2 text-right">
                  <button type="button" onClick={() => openEdit(ep)} className="mr-2 text-sm text-slate-600 hover:text-slate-900">Edit</button>
                  <button type="button" onClick={() => handleDelete(ep.id)} className="text-sm text-red-600 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
