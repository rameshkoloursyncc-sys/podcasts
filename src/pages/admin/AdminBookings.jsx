import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getBookings, getGuests, createBooking, updateBooking, deleteBooking } from '../../services/api';
import { CalendarDays, ArrowLeft, Plus, Pencil, Trash2, X, Check } from 'lucide-react';

const INPUT  = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-200 focus:border-amber-400 transition-all dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:placeholder:text-white/25 dark:focus:ring-amber-500/30 dark:focus:border-amber-500/40';
const LABEL  = 'block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/35 mb-1.5';
const TH     = 'px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/35';
const TD     = 'px-5 py-3.5 text-sm text-slate-700 dark:text-white/70';
const TR_ROW = 'border-b border-slate-100 hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/4 transition-colors';

const STATUS_META = {
  scheduled: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  cancelled: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300',
};

export default function AdminBookings() {
  const { tenant } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ guestId: '', scheduledAt: new Date().toISOString().slice(0, 16), durationMinutes: 60, status: 'scheduled' });

  function load() {
    if (!tenant?.id) return;
    Promise.all([getBookings(tenant.id), getGuests(tenant.id)]).then(([b, g]) => {
      setBookings(b); setGuests(g);
    }).finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, [tenant?.id]);

  function openCreate() { setEditing('new'); setForm({ guestId: '', scheduledAt: new Date().toISOString().slice(0, 16), durationMinutes: 60, status: 'scheduled' }); }
  function openEdit(b)  { setEditing(b.id); setForm({ guestId: b.guestId ?? '', scheduledAt: b.scheduledAt ? new Date(b.scheduledAt).toISOString().slice(0, 16) : '', durationMinutes: b.durationMinutes ?? 60, status: b.status ?? 'scheduled' }); }
  function cancelEdit() { setEditing(null); }

  async function handleSave(e) {
    e.preventDefault();
    if (!tenant?.id) return;
    const payload = { guestId: form.guestId || null, scheduledAt: new Date(form.scheduledAt).toISOString(), durationMinutes: Number(form.durationMinutes) || 60, status: form.status };
    if (editing === 'new') await createBooking(tenant.id, payload);
    else await updateBooking(editing, payload);
    cancelEdit(); load();
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this booking?')) return;
    await deleteBooking(id); load();
  }

  const guestMap = Object.fromEntries(guests.map(g => [g.id, g.name]));

  if (loading) return (
    <div className="flex items-center justify-center h-80">
      <div className="h-10 w-10 rounded-full border-4 border-amber-200 border-t-amber-600 animate-spin dark:border-amber-500/30 dark:border-t-amber-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link to="/admin" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-white/35 dark:hover:text-white/60 mb-2 transition-colors">
            <ArrowLeft size={12} /> Admin
          </Link>
          <div className="flex items-center gap-2 mb-1">
            <CalendarDays size={14} className="text-amber-500 dark:text-amber-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-amber-500 dark:text-amber-400">CRUD</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Bookings</h1>
          <p className="text-sm text-slate-400 dark:text-white/35 mt-0.5">{bookings.length} bookings</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transition-all hover:-translate-y-0.5">
          <Plus size={14} /> Add Booking
        </button>
      </div>

      {/* Form */}
      {editing && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 dark:bg-[#1a1d2e] dark:border-white/8 dark:shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white/80">{editing === 'new' ? 'Add New Booking' : 'Edit Booking'}</h2>
            <button onClick={cancelEdit} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-white/30 dark:hover:text-white/60 dark:hover:bg-white/8 transition-all">
              <X size={15} />
            </button>
          </div>
          <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL}>Guest</label>
              <select value={form.guestId} onChange={e => setForm(f => ({ ...f, guestId: e.target.value }))} className={INPUT}>
                <option value="">— No Guest —</option>
                {guests.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>
            </div>
            <div>
              <label className={LABEL}>Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={INPUT}>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Scheduled At</label>
              <input type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} className={INPUT} />
            </div>
            <div>
              <label className={LABEL}>Duration (minutes)</label>
              <input type="number" min={1} value={form.durationMinutes} onChange={e => setForm(f => ({ ...f, durationMinutes: e.target.value }))} className={INPUT} placeholder="60" />
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-2">
              <button type="submit" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                <Check size={14} /> Save Booking
              </button>
              <button type="button" onClick={cancelEdit} className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all dark:border-white/10 dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/8">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden dark:bg-[#1a1d2e] dark:border-white/8 dark:shadow-xl">
        {bookings.length === 0 ? (
          <div className="p-16 flex flex-col items-center text-slate-300 dark:text-white/20">
            <CalendarDays size={32} className="mb-2" /><p className="text-sm">No bookings yet</p>
          </div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-slate-50 border-b border-slate-100 dark:bg-white/4 dark:border-white/5">
              <tr>
                <th className={TH}>Guest</th>
                <th className={TH}>Scheduled</th>
                <th className={TH}>Duration</th>
                <th className={TH}>Status</th>
                <th className={`${TH} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map(b => (
                <tr key={b.id} className={TR_ROW}>
                  <td className={`${TD} font-semibold text-slate-900 dark:text-white/85`}>{guestMap[b.guestId] ?? <span className="text-slate-300 dark:text-white/20">—</span>}</td>
                  <td className={TD}>{new Date(b.scheduledAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                  <td className={TD}>{b.durationMinutes} min</td>
                  <td className={TD}>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_META[b.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => openEdit(b)} className="mr-3 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-amber-700 hover:bg-amber-50 dark:text-white/50 dark:hover:text-amber-300 dark:hover:bg-amber-500/10 transition-all">
                      <Pencil size={11} /> Edit
                    </button>
                    <button onClick={() => handleDelete(b.id)} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-white/30 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-all">
                      <Trash2 size={11} /> Delete
                    </button>
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
