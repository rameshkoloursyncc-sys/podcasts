import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getGuests, getEpisodes,
  getBookings, createBooking, updateBooking, deleteBooking,
  confirmBooking, cancelBooking, completeBooking,
} from '../../services/api';
import {
  CalendarDays, Plus, X, Check, Pencil, Trash2,
  Clock3, CheckCircle2, XCircle, Search,
} from 'lucide-react';

const DIVIDER = 'border-black/[0.08] dark:border-white/[0.08] divide-black/[0.08] dark:divide-white/[0.08]';
const INPUT = 'w-full border border-black/20 dark:border-white/20 bg-transparent px-4 py-3 text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/25 focus:outline-none focus:border-black dark:focus:border-white transition-colors';
const LABEL = 'block text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30 mb-2';

// API statuses: pending | confirmed | completed | cancelled
const STATUS_META = {
  pending:   { badge: 'bg-black/5 text-black dark:bg-white/10 dark:text-white',                       icon: Clock3,       label: 'Pending' },
  confirmed: { badge: 'bg-black/5 text-black dark:bg-white/10 dark:text-white',                       icon: CheckCircle2, label: 'Confirmed' },
  completed: { badge: 'bg-black text-white dark:bg-white dark:text-black',                            icon: CheckCircle2, label: 'Completed' },
  cancelled: { badge: 'border border-black/20 text-black/60 dark:border-white/20 dark:text-white/60', icon: XCircle,      label: 'Cancelled' },
};

const EMPTY_FORM = {
  guest_id: '', episode_id: '',
  scheduled_at: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
  duration_minutes: 60,
};

function BookingDrawer({ open, onClose, editBooking, guests, episodes, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      setForm(editBooking ? {
        guest_id: editBooking.guest_id ?? editBooking.guest?.id ?? '',
        episode_id: editBooking.episode_id ?? editBooking.episode?.id ?? '',
        scheduled_at: editBooking.scheduled_at
          ? new Date(editBooking.scheduled_at).toISOString().slice(0, 16)
          : EMPTY_FORM.scheduled_at,
        duration_minutes: editBooking.duration_minutes ?? 60,
      } : EMPTY_FORM);
    }
  }, [open, editBooking]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        guest_id: form.guest_id || undefined,
        episode_id: form.episode_id || undefined,
        scheduled_at: new Date(form.scheduled_at).toISOString(),
        duration_minutes: Number(form.duration_minutes) || 60,
      };
      if (editBooking) await updateBooking(editBooking.id, payload);
      else await createBooking(payload);
      onSave();
      onClose();
    } catch (err) {
      setError(err?.message ?? 'Failed to save booking.');
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#0f1117] z-50 shadow-2xl flex flex-col border-l border-black/10 dark:border-white/10">
        <div className={`px-8 py-6 flex items-center justify-between border-b ${DIVIDER}`}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 dark:text-white/25">
              {editBooking ? 'Edit Booking' : 'New Booking'}
            </p>
            <h2 className="text-xl font-extrabold tracking-tight mt-1">
              {editBooking ? 'Update Recording Session' : 'Schedule Session'}
            </h2>
          </div>
          <button onClick={onClose} className="text-black/40 hover:text-black dark:text-white/30 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
          <div>
            <label className={LABEL}>Guest</label>
            <select className={INPUT} value={form.guest_id}
              onChange={e => setForm(f => ({ ...f, guest_id: e.target.value }))}>
              <option value="" className="bg-white dark:bg-black">— No Guest —</option>
              {guests.map(g => (
                <option key={g.id} value={g.id} className="bg-white dark:bg-black">{g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL}>Episode</label>
            <select className={INPUT} value={form.episode_id}
              onChange={e => setForm(f => ({ ...f, episode_id: e.target.value }))}>
              <option value="" className="bg-white dark:bg-black">— No Episode —</option>
              {episodes.map(ep => (
                <option key={ep.id} value={ep.id} className="bg-white dark:bg-black">{ep.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL}>Scheduled At *</label>
            <input className={INPUT} type="datetime-local" required
              value={form.scheduled_at}
              onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} />
          </div>
          <div>
            <label className={LABEL}>Duration (minutes)</label>
            <input className={INPUT} type="number" min={1} max={480}
              value={form.duration_minutes}
              onChange={e => setForm(f => ({ ...f, duration_minutes: e.target.value }))}
              placeholder="60" />
          </div>
          {error && (
            <div className="border border-red-400/40 bg-red-50 dark:bg-red-500/10 px-4 py-3">
              <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}
        </form>

        <div className={`px-8 py-5 border-t ${DIVIDER} flex items-center gap-3`}>
          <button onClick={onClose} type="button"
            className={`flex-1 border ${DIVIDER} py-3 text-xs font-bold uppercase tracking-widest hover:border-black dark:hover:border-white transition-colors`}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex-1 border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black py-3 text-xs font-bold uppercase tracking-widest hover:opacity-80 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2">
            <Check size={13} />
            {saving ? 'Saving…' : editBooking ? 'Update Booking' : 'Create Booking'}
          </button>
        </div>
      </div>
    </>
  );
}

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [guests, setGuests] = useState([]);
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // CRUD state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editBooking, setEditBooking] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [actionLoading, setActionLoading] = useState('');

  function load() {
    Promise.all([
      getBookings({ per_page: 100 }),
      getGuests({ per_page: 100 }),
      getEpisodes({ per_page: 100 }),
    ])
      .then(([b, g, e]) => { setBookings(b); setGuests(g); setEpisodes(e); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function openCreate() { setEditBooking(null); setDrawerOpen(true); }
  function openEdit(b) { setEditBooking(b); setDrawerOpen(true); }

  async function handleDelete(b) {
    const guestName = b.guest?.name ?? guestMap[b.guest_id] ?? 'this booking';
    if (!window.confirm(`Delete booking for "${guestName}"?`)) return;
    setDeleting(b.id);
    try { await deleteBooking(b.id); load(); } catch (err) { alert(err?.message ?? 'Delete failed.'); }
    finally { setDeleting(null); }
  }

  async function handleAction(id, action) {
    setActionLoading(id + action);
    try {
      if (action === 'confirm')  await confirmBooking(id);
      if (action === 'cancel')   await cancelBooking(id);
      if (action === 'complete') await completeBooking(id);
      load();
    } catch (err) { alert(err?.message ?? 'Action failed.'); }
    finally { setActionLoading(''); }
  }

  const guestMap   = Object.fromEntries(guests.map(g => [g.id, g.name]));
  const episodeMap = Object.fromEntries(episodes.map(e => [e.id, e.title]));

  const filtered = bookings.filter(b => {
    const gName = b.guest?.name ?? guestMap[b.guest_id] ?? '';
    const matchSearch = !search || gName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (loading) return (
    <div className="flex items-center justify-center h-80 bg-white dark:bg-[#0f1117]">
      <div className="flex flex-col items-center gap-3">
        <div className="h-9 w-9 border-4 border-black/10 border-t-black animate-spin dark:border-white/10 dark:border-t-white" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/25 dark:text-white/20">Loading…</p>
      </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-[#0f1117] text-black dark:text-white min-h-[calc(100vh-64px)] flex flex-col">

      {/* ══ HEADER ════════════════════════════════════════════════ */}
      <div className={`border-b ${DIVIDER} bg-white dark:bg-[#0a0c12]`}>
        <div className="px-8 py-7 flex items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight leading-none">Bookings.</h1>
            <p className="text-sm text-black/35 dark:text-white/30 mt-2">{bookings.length} total recordings</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/20" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by guest…"
                className={`pl-10 pr-4 py-2 border ${DIVIDER} bg-black/[0.02] dark:bg-white/[0.02] text-xs font-bold focus:outline-none focus:border-black dark:focus:border-white w-48 transition-all focus:w-64 placeholder:text-black/30`} />
            </div>
            <button onClick={openCreate}
              className="flex items-center gap-2 border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 text-xs font-bold hover:opacity-80 transition-opacity">
              <Plus size={13} /> Schedule
            </button>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className={`flex items-center gap-0 border-t ${DIVIDER} overflow-x-auto`}>
          {[
            { key: '', label: `All (${bookings.length})` },
            ...Object.entries(STATUS_META).map(([key, m]) => ({
              key,
              label: `${m.label} (${bookings.filter(b => b.status === key).length})`,
            })),
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setStatusFilter(key)}
              className={`shrink-0 px-6 py-3 text-[10px] font-bold uppercase tracking-widest border-r ${DIVIDER} transition-colors ${statusFilter === key ? 'bg-black dark:bg-white text-white dark:text-black' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ══ BOOKING GRID ══════════════════════════════════════════ */}
      <div className="flex-1">
        {filtered.length === 0 ? (
          <div className="py-24 flex flex-col items-center text-black/20 dark:text-white/15 select-none">
            <CalendarDays size={36} className="mb-3" />
            <p className="text-xs font-bold uppercase tracking-widest">No bookings found</p>
            <button onClick={openCreate}
              className="mt-6 border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-6 py-3 text-xs font-bold hover:opacity-80 transition-opacity flex items-center gap-2">
              <Plus size={12} /> Schedule first session
            </button>
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 divide-y sm:divide-y-0 ${DIVIDER}`}>
            {filtered.map(b => {
              const meta = STATUS_META[b.status] ?? STATUS_META.pending;
              const Icon = meta.icon;
              const guestName = b.guest?.name ?? guestMap[b.guest_id] ?? 'Unknown Guest';
              const episodeTitle = b.episode?.title ?? episodeMap[b.episode_id];

              return (
                <div key={b.id} className={`relative border-b sm:border-r ${DIVIDER} group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors`}>
                  {/* Action buttons on hover */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onClick={() => openEdit(b)} title="Edit"
                      className="h-7 w-7 flex items-center justify-center border border-black/10 dark:border-white/10 bg-white dark:bg-[#0f1117] hover:border-black dark:hover:border-white transition-colors">
                      <Pencil size={11} />
                    </button>
                    <button onClick={() => handleDelete(b)} disabled={deleting === b.id} title="Delete"
                      className="h-7 w-7 flex items-center justify-center border border-black/10 dark:border-white/10 bg-white dark:bg-[#0f1117] hover:border-red-500 hover:text-red-500 transition-colors disabled:opacity-40">
                      <Trash2 size={11} />
                    </button>
                  </div>

                  <div className="p-6 flex flex-col gap-4">
                    <div className="flex items-start justify-between pr-16">
                      <div className="h-10 w-10 flex items-center justify-center text-[10px] font-extrabold text-black dark:text-white bg-black/5 dark:bg-white/10 uppercase">
                        {guestName.slice(0, 2)}
                      </div>
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${meta.badge}`}>
                        <Icon size={8} /> {meta.label}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-black dark:text-white truncate">{guestName}</h3>
                      {episodeTitle && (
                        <p className="text-[11px] text-black/40 dark:text-white/30 truncate mt-0.5">{episodeTitle}</p>
                      )}
                      <div className="mt-2 space-y-1">
                        <p className="text-[11px] font-bold uppercase tracking-wide text-black/40 dark:text-white/30 flex items-center gap-1.5">
                          <Clock3 size={10} />
                          {b.scheduled_at ? new Date(b.scheduled_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </p>
                        {b.duration_minutes && (
                          <p className="text-[11px] font-bold uppercase tracking-wide text-black/30 dark:text-white/25">
                            {b.duration_minutes} min
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons per status */}
                    {b.status === 'pending' && (
                      <div className="flex items-center gap-2 pt-2 border-t border-black/8 dark:border-white/8">
                        <button onClick={() => handleAction(b.id, 'confirm')}
                          disabled={actionLoading === b.id + 'confirm'}
                          className="flex-1 border border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-colors disabled:opacity-40">
                          Confirm
                        </button>
                        <button onClick={() => handleAction(b.id, 'cancel')}
                          disabled={actionLoading === b.id + 'cancel'}
                          className="flex-1 border border-black/20 dark:border-white/20 hover:border-red-500 hover:text-red-500 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-colors disabled:opacity-40">
                          Cancel
                        </button>
                      </div>
                    )}
                    {b.status === 'confirmed' && (
                      <div className="flex items-center gap-2 pt-2 border-t border-black/8 dark:border-white/8">
                        <button onClick={() => handleAction(b.id, 'complete')}
                          disabled={actionLoading === b.id + 'complete'}
                          className="flex-1 border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest hover:opacity-80 transition-opacity disabled:opacity-40">
                          Mark Complete
                        </button>
                        <button onClick={() => handleAction(b.id, 'cancel')}
                          disabled={actionLoading === b.id + 'cancel'}
                          className="border border-black/20 dark:border-white/20 hover:border-red-500 hover:text-red-500 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest transition-colors disabled:opacity-40">
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══ CRUD DRAWER ════════════════════════════════════════════ */}
      <BookingDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editBooking={editBooking}
        guests={guests}
        episodes={episodes}
        onSave={load}
      />
    </div>
  );
}
