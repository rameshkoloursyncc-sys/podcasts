import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getBookings,
  getGuests,
  createBooking,
  updateBooking,
  deleteBooking,
} from '../../services/api';

export default function AdminBookings() {
  const { tenant } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    guestId: '',
    scheduledAt: new Date().toISOString().slice(0, 16),
    durationMinutes: 60,
    status: 'scheduled',
  });

  function load() {
    if (!tenant?.id) return;
    Promise.all([getBookings(tenant.id), getGuests(tenant.id)]).then(([b, g]) => {
      setBookings(b);
      setGuests(g);
    }).finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, [tenant?.id]);

  function openCreate() {
    setEditing('new');
    setForm({
      guestId: '',
      scheduledAt: new Date().toISOString().slice(0, 16),
      durationMinutes: 60,
      status: 'scheduled',
    });
  }

  function openEdit(b) {
    setEditing(b.id);
    setForm({
      guestId: b.guestId ?? '',
      scheduledAt: b.scheduledAt ? new Date(b.scheduledAt).toISOString().slice(0, 16) : '',
      durationMinutes: b.durationMinutes ?? 60,
      status: b.status ?? 'scheduled',
    });
  }

  function cancelEdit() {
    setEditing(null);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!tenant?.id) return;
    try {
      const payload = {
        guestId: form.guestId || null,
        scheduledAt: new Date(form.scheduledAt).toISOString(),
        durationMinutes: Number(form.durationMinutes) || 60,
        status: form.status,
      };
      if (editing === 'new') {
        await createBooking(tenant.id, payload);
      } else {
        await updateBooking(editing, payload);
      }
      cancelEdit();
      load();
    } catch (_) {}
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this booking?')) return;
    await deleteBooking(id);
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
        <h1 className="text-lg font-semibold text-slate-900">Bookings (CRUD)</h1>
        <button
          type="button"
          onClick={openCreate}
          className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800"
        >
          Add booking
        </button>
      </div>
      {editing && (
        <form onSubmit={handleSave} className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
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
          <input
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
            className="mb-2 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="number"
            min={1}
            value={form.durationMinutes}
            onChange={(e) => setForm((f) => ({ ...f, durationMinutes: e.target.value }))}
            className="mb-2 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={form.status}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            className="mb-2 w-full rounded border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <div className="flex gap-2">
            <button type="submit" className="rounded bg-slate-900 px-3 py-1.5 text-sm text-white hover:bg-slate-800">Save</button>
            <button type="button" onClick={cancelEdit} className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">Cancel</button>
          </div>
        </form>
      )}
      <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Guest</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Scheduled</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Duration</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-slate-500">Status</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-slate-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {bookings.map((b) => (
              <tr key={b.id} className="hover:bg-slate-50">
                <td className="px-4 py-2 text-sm text-slate-900">{guestMap[b.guestId] ?? '—'}</td>
                <td className="px-4 py-2 text-sm text-slate-600">{new Date(b.scheduledAt).toLocaleString()}</td>
                <td className="px-4 py-2 text-sm text-slate-600">{b.durationMinutes} min</td>
                <td className="px-4 py-2 text-sm text-slate-600">{b.status}</td>
                <td className="px-4 py-2 text-right">
                  <button type="button" onClick={() => openEdit(b)} className="mr-2 text-sm text-slate-600 hover:text-slate-900">Edit</button>
                  <button type="button" onClick={() => handleDelete(b.id)} className="text-sm text-red-600 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
