import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  getEpisodes, getGuests,
  createEpisode, updateEpisode, deleteEpisode,
} from '../../services/api';
import {
  Mic2, Search, Plus, X, Check, Pencil, Trash2,
  FileEdit, Clock3, CheckCircle2, Radio, ChevronRight,
} from 'lucide-react';

const DIVIDER = 'border-black/[0.08] dark:border-white/[0.08] divide-black/[0.08] dark:divide-white/[0.08]';
const INPUT = 'w-full border border-black/20 dark:border-white/20 bg-transparent px-4 py-3 text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/25 focus:outline-none focus:border-black dark:focus:border-white transition-colors';
const LABEL = 'block text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30 mb-2';

// API statuses: draft | scheduled | recorded | published
const STATUS_META = {
  draft:     { badge: 'bg-black/5 text-black dark:bg-white/10 dark:text-white', icon: FileEdit,     label: 'Draft' },
  scheduled: { badge: 'bg-black/5 text-black dark:bg-white/10 dark:text-white', icon: Clock3,       label: 'Scheduled' },
  recorded:  { badge: 'bg-black/5 text-black dark:bg-white/10 dark:text-white', icon: CheckCircle2, label: 'Recorded' },
  published: { badge: 'bg-black text-white dark:bg-white dark:text-black',       icon: Radio,        label: 'Published' },
};

const EMPTY_FORM = { title: '', guest_id: '', status: 'draft', recorded_at: '', published_at: '' };

function EpisodeDrawer({ open, onClose, editEpisode, guests, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      setForm(editEpisode ? {
        title: editEpisode.title ?? '',
        guest_id: editEpisode.guest_id ?? editEpisode.guest?.id ?? '',
        status: editEpisode.status ?? 'draft',
        recorded_at: editEpisode.recorded_at ? new Date(editEpisode.recorded_at).toISOString().slice(0, 16) : '',
        published_at: editEpisode.published_at ? new Date(editEpisode.published_at).toISOString().slice(0, 16) : '',
      } : EMPTY_FORM);
    }
  }, [open, editEpisode]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        guest_id: form.guest_id || undefined,
        status: form.status,
        recorded_at: form.recorded_at ? new Date(form.recorded_at).toISOString() : undefined,
        published_at: form.published_at ? new Date(form.published_at).toISOString() : undefined,
      };
      if (editEpisode) await updateEpisode(editEpisode.id, payload);
      else await createEpisode(payload);
      onSave();
      onClose();
    } catch (err) {
      setError(err?.message ?? 'Failed to save episode.');
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
              {editEpisode ? 'Edit Episode' : 'New Episode'}
            </p>
            <h2 className="text-xl font-extrabold tracking-tight mt-1">
              {editEpisode ? editEpisode.title : 'Add Episode'}
            </h2>
          </div>
          <button onClick={onClose} className="text-black/40 hover:text-black dark:text-white/30 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
          <div>
            <label className={LABEL}>Title *</label>
            <input className={INPUT} placeholder="Building an Audience from Zero" required
              value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
          </div>
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
            <label className={LABEL}>Status</label>
            <select className={INPUT} value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
              <option value="draft"     className="bg-white dark:bg-black">Draft</option>
              <option value="scheduled" className="bg-white dark:bg-black">Scheduled</option>
              <option value="recorded"  className="bg-white dark:bg-black">Recorded</option>
              <option value="published" className="bg-white dark:bg-black">Published</option>
            </select>
          </div>
          <div>
            <label className={LABEL}>Recorded At</label>
            <input className={INPUT} type="datetime-local" value={form.recorded_at}
              onChange={e => setForm(f => ({ ...f, recorded_at: e.target.value }))} />
          </div>
          <div>
            <label className={LABEL}>Published At</label>
            <input className={INPUT} type="datetime-local" value={form.published_at}
              onChange={e => setForm(f => ({ ...f, published_at: e.target.value }))} />
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
            {saving ? 'Saving…' : editEpisode ? 'Update Episode' : 'Create Episode'}
          </button>
        </div>
      </div>
    </>
  );
}

export default function Episodes() {
  const [episodes, setEpisodes] = useState([]);
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // CRUD state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editEpisode, setEditEpisode] = useState(null);
  const [deleting, setDeleting] = useState(null);

  function load() {
    Promise.all([getEpisodes({ per_page: 100 }), getGuests({ per_page: 100 })])
      .then(([e, g]) => { setEpisodes(e); setGuests(g); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function openCreate() { setEditEpisode(null); setDrawerOpen(true); }
  function openEdit(ep) { setEditEpisode(ep); setDrawerOpen(true); }

  async function handleDelete(ep) {
    if (!window.confirm(`Delete "${ep.title}"? This cannot be undone.`)) return;
    setDeleting(ep.id);
    try { await deleteEpisode(ep.id); load(); } catch (err) { alert(err?.message ?? 'Delete failed.'); }
    finally { setDeleting(null); }
  }

  const guestMap = Object.fromEntries(guests.map(g => [g.id, g.name]));
  const filtered = episodes.filter(ep => {
    const matchSearch = !search || ep.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || ep.status === statusFilter;
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
            <h1 className="text-3xl font-extrabold tracking-tight leading-none">Episodes.</h1>
            <p className="text-sm text-black/35 dark:text-white/30 mt-2">{episodes.length} total episodes</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/20" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search episodes…"
                className={`pl-10 pr-4 py-2 border ${DIVIDER} bg-black/[0.02] dark:bg-white/[0.02] text-xs font-bold focus:outline-none focus:border-black dark:focus:border-white w-48 transition-all focus:w-64 placeholder:text-black/30 dark:placeholder:text-white/20`} />
            </div>
            <button onClick={openCreate}
              className="flex items-center gap-2 border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 text-xs font-bold hover:opacity-80 transition-opacity">
              <Plus size={13} /> Add Episode
            </button>
          </div>
        </div>

        {/* Status filter tabs */}
        <div className={`flex items-center gap-0 border-t ${DIVIDER} overflow-x-auto`}>
          {[
            { key: '', label: `All (${episodes.length})` },
            ...Object.entries(STATUS_META).map(([key, m]) => ({
              key,
              label: `${m.label} (${episodes.filter(e => e.status === key).length})`,
            })),
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setStatusFilter(key)}
              className={`shrink-0 px-6 py-3 text-[10px] font-bold uppercase tracking-widest border-r ${DIVIDER} transition-colors ${statusFilter === key ? 'bg-black dark:bg-white text-white dark:text-black' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ══ EPISODE GRID ══════════════════════════════════════════ */}
      <div className="flex-1">
        {filtered.length === 0 ? (
          <div className="py-24 flex flex-col items-center text-black/20 dark:text-white/15 select-none">
            <Mic2 size={36} className="mb-3" />
            <p className="text-xs font-bold uppercase tracking-widest">No episodes found</p>
            <button onClick={openCreate}
              className="mt-6 border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-6 py-3 text-xs font-bold hover:opacity-80 transition-opacity flex items-center gap-2">
              <Plus size={12} /> Add first episode
            </button>
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 divide-y sm:divide-y-0 ${DIVIDER}`}>
            {filtered.map(ep => {
              const meta = STATUS_META[ep.status] ?? STATUS_META.draft;
              const Icon = meta.icon;
              // API returns nested guest.name or guest_id
              const guestName = ep.guest?.name ?? guestMap[ep.guest_id];

              return (
                <div key={ep.id} className={`relative border-b sm:border-r ${DIVIDER} group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors`}>
                  {/* Action buttons */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onClick={() => openEdit(ep)} title="Edit"
                      className="h-7 w-7 flex items-center justify-center border border-black/10 dark:border-white/10 bg-white dark:bg-[#0f1117] hover:border-black dark:hover:border-white transition-colors">
                      <Pencil size={11} />
                    </button>
                    <button onClick={() => handleDelete(ep)} disabled={deleting === ep.id} title="Delete"
                      className="h-7 w-7 flex items-center justify-center border border-black/10 dark:border-white/10 bg-white dark:bg-[#0f1117] hover:border-red-500 hover:text-red-500 transition-colors disabled:opacity-40">
                      <Trash2 size={11} />
                    </button>
                  </div>

                  <Link to={`/app/episodes/${ep.id}`} className="block p-6">
                    <div className="h-10 w-10 border border-dashed border-black/20 dark:border-white/20 mb-5 flex items-center justify-center">
                      <Mic2 size={16} className="text-black/50 dark:text-white/50" />
                    </div>

                    <h3 className="text-sm font-bold text-black dark:text-white line-clamp-2 pr-16">
                      {ep.title || 'Untitled Episode'}
                    </h3>
                    {guestName && (
                      <p className="text-[11px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30 mt-2 truncate">
                        {guestName}
                      </p>
                    )}

                    <div className="mt-8 flex items-center justify-between border-t border-black/10 dark:border-white/10 pt-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest ${meta.badge}`}>
                        <Icon size={8} /> {meta.label}
                      </span>
                      <ChevronRight size={12} className="text-black/20 dark:text-white/15 group-hover:text-black/60 dark:group-hover:text-white/60 transition-colors" />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══ CRUD DRAWER ════════════════════════════════════════════ */}
      <EpisodeDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editEpisode={editEpisode}
        guests={guests}
        onSave={load}
      />
    </div>
  );
}
