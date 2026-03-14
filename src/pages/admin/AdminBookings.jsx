import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getBookings, getGuests, createBooking, updateBooking, deleteBooking } from '../../services/api';
import { CalendarDays, ArrowLeft, Plus, Pencil, Trash2, X, Check } from 'lucide-react';

const DIVIDER = 'border-black/[0.08] dark:border-white/[0.08] divide-black/[0.08] dark:divide-white/[0.08]';
const INPUT   = 'w-full border border-black/20 dark:border-white/20 bg-transparent px-4 py-3 text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/25 focus:outline-none focus:border-black dark:focus:border-white transition-colors';
const LABEL   = 'block text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30 mb-2';
const TH      = `px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30 bg-black/5 dark:bg-white/5 border-b ${DIVIDER}`;
const TD      = 'px-6 py-4 text-sm text-black/80 dark:text-white/80';
const TR_ROW  = `border-b ${DIVIDER} last:border-b-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors`;

const BTN_PRIMARY = 'flex items-center gap-2 border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 text-xs font-bold hover:opacity-80 transition-opacity';
const BTN_GHOST   = `flex items-center gap-2 border ${DIVIDER} px-5 py-2.5 text-xs font-bold text-black/60 dark:text-white/60 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all`;

const STATUS_META = {
  scheduled: 'bg-black/5 text-black dark:bg-white/10 dark:text-white',
  completed: 'bg-black text-white dark:bg-white dark:text-black',
  cancelled: 'border border-black/20 text-black/60 dark:border-white/20 dark:text-white/60',
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
    <div className="flex items-center justify-center h-80 bg-white dark:bg-[#0f1117]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 border-4 border-black/10 border-t-black animate-spin dark:border-white/10 dark:border-t-white" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/25 dark:text-white/20">Loading…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#0f1117] text-black dark:text-white">
      <div className={`border-x ${DIVIDER}`}>
        {/* Header Billboard */}
        <div className={`px-6 py-6 flex items-center justify-between gap-6 border-y ${DIVIDER} bg-white dark:bg-[#0a0c12]`}>
          <div>
            <Link to="/admin" className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30 hover:text-black dark:hover:text-white mb-3 transition-colors">
              <ArrowLeft size={10} /> Admin Dashboard
            </Link>
            <h1 className="text-3xl font-extrabold tracking-tight leading-none flex items-center gap-3">
              <CalendarDays size={24} className="text-black/20 dark:text-white/20" /> Bookings
            </h1>
            <p className="text-sm text-black/40 dark:text-white/30 mt-2">{bookings.length} bookings</p>
          </div>
          <button onClick={openCreate} className={BTN_PRIMARY}>
            <Plus size={14} /> Add Booking
          </button>
        </div>

        {/* Content Body */}
        <div className={`border-b ${DIVIDER} flex flex-col`}>
          
          {/* Form */}
          {editing && (
            <div className={`border-b ${DIVIDER} p-8 bg-black/[0.02] dark:bg-white/[0.02]`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold tracking-tight uppercase">{editing === 'new' ? 'Add New Booking' : 'Edit Booking'}</h2>
                <button onClick={cancelEdit} className="text-black/40 hover:text-black dark:text-white/30 dark:hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={LABEL}>Guest</label>
                  <select value={form.guestId} onChange={e => setForm(f => ({ ...f, guestId: e.target.value }))} className={INPUT}>
                    <option value="" className="bg-white dark:bg-black">— No Guest —</option>
                    {guests.map(g => <option key={g.id} value={g.id} className="bg-white dark:bg-black">{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className={LABEL}>Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className={INPUT}>
                    <option value="scheduled" className="bg-white dark:bg-black">Scheduled</option>
                    <option value="completed" className="bg-white dark:bg-black">Completed</option>
                    <option value="cancelled" className="bg-white dark:bg-black">Cancelled</option>
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
                <div className="md:col-span-2 flex items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10 mt-2">
                  <button type="button" onClick={cancelEdit} className={BTN_GHOST}>Cancel</button>
                  <button type="submit" className={BTN_PRIMARY}><Check size={14} /> Save Booking</button>
                </div>
              </form>
            </div>
          )}

          {/* Table */}
          <div>
            {bookings.length === 0 ? (
              <div className="py-20 flex flex-col items-center text-black/20 dark:text-white/15 select-none">
                <CalendarDays size={32} className="mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest">No bookings yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse">
                  <thead>
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
                        <td className={`${TD} font-bold`}>{guestMap[b.guestId] ?? <span className="text-black/20 dark:text-white/20">—</span>}</td>
                        <td className={TD}>{new Date(b.scheduledAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                        <td className={TD}>{b.durationMinutes} min</td>
                        <td className={TD}>
                          <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_META[b.status] ?? 'bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60'}`}>
                            {b.status}
                          </span>
                        </td>
                        <td className={`${TD} text-right flex items-center justify-end gap-3`}>
                          <button onClick={() => openEdit(b)} className="text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black dark:text-white/30 dark:hover:text-white flex items-center gap-1 transition-colors">
                            <Pencil size={10} /> Edit
                          </button>
                          <button onClick={() => handleDelete(b.id)} className="text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-red-500 dark:text-white/30 dark:hover:text-red-400 flex items-center gap-1 transition-colors">
                            <Trash2 size={10} /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
