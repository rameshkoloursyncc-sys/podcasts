import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getGuests, getPipelineStages, createGuest, updateGuest, deleteGuest } from '../../services/api';
import {
  Users, Search, Plus, X, Check, Pencil, Trash2, ArrowRight, ChevronRight,
} from 'lucide-react';

const DIVIDER = 'border-black/[0.08] dark:border-white/[0.08] divide-black/[0.08] dark:divide-white/[0.08]';
const INPUT = 'w-full border border-black/20 dark:border-white/20 bg-transparent px-4 py-3 text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/25 focus:outline-none focus:border-black dark:focus:border-white transition-colors';
const LABEL = 'block text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30 mb-2';

const EMPTY_FORM = { name: '', email: '', bio: '', stage_id: '' };

function GuestDrawer({ open, onClose, editGuest, stages, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setError('');
      setForm(editGuest
        ? { name: editGuest.name ?? '', email: editGuest.email ?? '', bio: editGuest.bio ?? '', stage_id: editGuest.stage_id ?? '' }
        : EMPTY_FORM
      );
    }
  }, [open, editGuest]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim() || undefined,
        bio: form.bio.trim() || undefined,
        stage_id: form.stage_id || undefined,
      };
      if (editGuest) await updateGuest(editGuest.id, payload);
      else await createGuest(payload);
      onSave();
      onClose();
    } catch (err) {
      setError(err?.message ?? 'Failed to save guest.');
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 backdrop-blur-sm" onClick={onClose} />
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-[#0f1117] z-50 shadow-2xl flex flex-col border-l border-black/10 dark:border-white/10">
        <div className={`px-8 py-6 flex items-center justify-between border-b ${DIVIDER}`}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 dark:text-white/25">
              {editGuest ? 'Edit Guest' : 'New Guest'}
            </p>
            <h2 className="text-xl font-extrabold tracking-tight mt-1">
              {editGuest ? editGuest.name : 'Add Guest'}
            </h2>
          </div>
          <button onClick={onClose} className="text-black/40 hover:text-black dark:text-white/30 dark:hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
          <div>
            <label className={LABEL}>Name *</label>
            <input className={INPUT} placeholder="Kunal Shah" required value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div>
            <label className={LABEL}>Email</label>
            <input className={INPUT} type="email" placeholder="kunal@example.com" value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div>
            <label className={LABEL}>Pipeline Stage</label>
            <select className={INPUT} value={form.stage_id}
              onChange={e => setForm(f => ({ ...f, stage_id: e.target.value }))}>
              <option value="" className="bg-white dark:bg-black">— No Stage —</option>
              {stages.map(s => (
                <option key={s.id} value={s.id} className="bg-white dark:bg-black">{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL}>Bio</label>
            <textarea className={INPUT} rows={4} placeholder="Short bio about the guest…" value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
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
            {saving ? 'Saving…' : editGuest ? 'Update Guest' : 'Create Guest'}
          </button>
        </div>
      </div>
    </>
  );
}

export default function Guests() {
  const [guests, setGuests] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');

  // CRUD state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editGuest, setEditGuest] = useState(null);
  const [deleting, setDeleting] = useState(null);

  function load() {
    Promise.all([getGuests({ per_page: 100 }), getPipelineStages()])
      .then(([g, s]) => { setGuests(g); setStages(s.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function openCreate() { setEditGuest(null); setDrawerOpen(true); }
  function openEdit(g) { setEditGuest(g); setDrawerOpen(true); }

  async function handleDelete(g) {
    if (!window.confirm(`Delete "${g.name}"? This cannot be undone.`)) return;
    setDeleting(g.id);
    try { await deleteGuest(g.id); load(); } catch (err) { alert(err?.message ?? 'Delete failed.'); }
    finally { setDeleting(null); }
  }

  const stageMap = Object.fromEntries(stages.map(s => [s.id, s.label]));
  const filtered = guests.filter(g => {
    const matchSearch = !search || g.name?.toLowerCase().includes(search.toLowerCase()) || g.email?.toLowerCase().includes(search.toLowerCase());
    const matchStage = !stageFilter || g.stage_id === stageFilter;
    return matchSearch && matchStage;
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

      {/* ══ HEADER ═════════════════════════════════════════════════════ */}
      <div className={`border-b ${DIVIDER} bg-white dark:bg-[#0a0c12]`}>
        <div className="px-8 py-7 flex items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight leading-none">Guests.</h1>
            <p className="text-sm text-black/35 dark:text-white/30 mt-2">{guests.length} total registered</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search size={13} className="absolute left-4 top-1/2 -translate-y-1/2 text-black/30 dark:text-white/20" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guests…"
                className={`pl-10 pr-4 py-2 border ${DIVIDER} bg-black/[0.02] dark:bg-white/[0.02] text-xs font-bold focus:outline-none focus:border-black dark:focus:border-white w-48 transition-all focus:w-64 placeholder:text-black/30 dark:placeholder:text-white/20`} />
            </div>
            <button onClick={openCreate}
              className="flex items-center gap-2 border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 text-xs font-bold hover:opacity-80 transition-opacity">
              <Plus size={13} /> Add Guest
            </button>
          </div>
        </div>

        {/* Stage filter strip + stat counters */}
        <div className={`grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x ${DIVIDER} border-t ${DIVIDER}`}>
          {[
            { label: 'Total Guests', value: guests.length },
            { label: 'Stages Active', value: stages.length },
            { label: 'Unassigned', value: guests.filter(g => !g.stage_id).length },
          ].map(({ label, value }) => (
            <div key={label} className="p-6">
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30">{label}</p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ══ STAGE FILTER BAR ══════════════════════════════════════════ */}
      {stages.length > 0 && (
        <div className={`border-b ${DIVIDER} flex items-center gap-0 overflow-x-auto`}>
          <button onClick={() => setStageFilter('')}
            className={`shrink-0 px-6 py-3 text-[10px] font-bold uppercase tracking-widest border-r ${DIVIDER} transition-colors ${!stageFilter ? 'bg-black dark:bg-white text-white dark:text-black' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
            All
          </button>
          {stages.map(s => (
            <button key={s.id} onClick={() => setStageFilter(s.id === stageFilter ? '' : s.id)}
              className={`shrink-0 px-6 py-3 text-[10px] font-bold uppercase tracking-widest border-r ${DIVIDER} transition-colors ${stageFilter === s.id ? 'bg-black dark:bg-white text-white dark:text-black' : 'hover:bg-black/5 dark:hover:bg-white/5'}`}>
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* ══ GUEST GRID ═══════════════════════════════════════════════ */}
      <div className="flex-1">
        {filtered.length === 0 ? (
          <div className="py-24 flex flex-col items-center text-black/20 dark:text-white/15 select-none">
            <Users size={36} className="mb-3" />
            <p className="text-xs font-bold uppercase tracking-widest">No guests found</p>
            <button onClick={openCreate}
              className="mt-6 border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-6 py-3 text-xs font-bold hover:opacity-80 transition-opacity flex items-center gap-2">
              <Plus size={12} /> Add first guest
            </button>
          </div>
        ) : (
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 divide-y sm:divide-y-0 ${DIVIDER}`}>
            {filtered.map(g => {
              const stageName = stageMap[g.stage_id];
              const initials = g.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?';
              return (
                <div key={g.id} className={`relative border-b sm:border-r ${DIVIDER} group hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors`}>
                  {/* Action buttons — visible on hover */}
                  <div className="absolute top-4 right-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onClick={() => openEdit(g)} title="Edit"
                      className="h-7 w-7 flex items-center justify-center border border-black/10 dark:border-white/10 bg-white dark:bg-[#0f1117] hover:border-black dark:hover:border-white transition-colors">
                      <Pencil size={11} />
                    </button>
                    <button onClick={() => handleDelete(g)} disabled={deleting === g.id} title="Delete"
                      className="h-7 w-7 flex items-center justify-center border border-black/10 dark:border-white/10 bg-white dark:bg-[#0f1117] hover:border-red-500 hover:text-red-500 transition-colors disabled:opacity-40">
                      <Trash2 size={11} />
                    </button>
                  </div>

                  <Link to={`/app/guests/${g.id}`} className="block p-6">
                    {/* Avatar */}
                    <div className="h-10 w-10 bg-black/5 dark:bg-white/10 flex items-center justify-center text-xs font-extrabold text-black/60 dark:text-white/60 mb-5 group-hover:bg-black/10 dark:group-hover:bg-white/20 transition-colors">
                      {initials}
                    </div>

                    <h3 className="text-sm font-bold text-black dark:text-white truncate">{g.name}</h3>
                    {g.email && (
                      <p className="text-[11px] text-black/40 dark:text-white/30 truncate mt-1">{g.email}</p>
                    )}

                    {g.bio && (
                      <p className="text-[11px] text-black/50 dark:text-white/40 mt-3 line-clamp-2 leading-relaxed">{g.bio}</p>
                    )}

                    <div className="mt-6 pt-4 border-t border-black/8 dark:border-white/8 flex items-center justify-between">
                      {stageName ? (
                        <span className="px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-black/5 dark:bg-white/10 text-black/60 dark:text-white/60">
                          {stageName}
                        </span>
                      ) : (
                        <span className="text-[9px] font-bold uppercase tracking-wider text-black/20 dark:text-white/15">No Stage</span>
                      )}
                      <ChevronRight size={12} className="text-black/20 dark:text-white/15 group-hover:text-black/60 dark:group-hover:text-white/60 transition-colors" />
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══ CRUD DRAWER ══════════════════════════════════════════════ */}
      <GuestDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        editGuest={editGuest}
        stages={stages}
        onSave={load}
      />
    </div>
  );
}
