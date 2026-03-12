import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getEpisodes, getGuests, createEpisode, updateEpisode, deleteEpisode } from '../../services/api';
import { Mic2, ArrowLeft, Plus, Pencil, Trash2, X, Check } from 'lucide-react';

const INPUT = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-200 focus:border-pink-400 transition-all dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:placeholder:text-white/25 dark:focus:ring-pink-500/30 dark:focus:border-pink-500/40';
const LABEL = 'block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/35 mb-1.5';
const TH    = 'px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/35';
const TD    = 'px-5 py-3.5 text-sm text-slate-700 dark:text-white/70';
const TR_ROW= 'border-b border-slate-100 hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/4 transition-colors';

const STATUS_META = {
  draft:     'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300',
  scheduled: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  recorded:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  published: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
};

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
      setEpisodes(e); setGuests(g);
    }).finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, [tenant?.id]);

  function openCreate() { setEditing('new'); setForm({ title: '', guestId: '', status: 'draft' }); }
  function openEdit(ep)  { setEditing(ep.id); setForm({ title: ep.title, guestId: ep.guestId ?? '', status: ep.status ?? 'draft' }); }
  function cancelEdit()  { setEditing(null); setForm({ title: '', guestId: '', status: 'draft' }); }

  async function handleSave(e) {
    e.preventDefault();
    if (!tenant?.id) return;
    if (editing === 'new') await createEpisode(tenant.id, { title: form.title, guestId: form.guestId || null, status: form.status });
    else await updateEpisode(editing, { title: form.title, guestId: form.guestId || null, status: form.status });
    cancelEdit(); load();
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this episode?')) return;
    await deleteEpisode(id); load();
  }

  const guestMap = Object.fromEntries(guests.map(g => [g.id, g.name]));

  if (loading) return (
    <div className="flex items-center justify-center h-80">
      <div className="h-10 w-10 rounded-full border-4 border-pink-200 border-t-pink-600 animate-spin dark:border-pink-500/30 dark:border-t-pink-500" />
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
            <Mic2 size={14} className="text-pink-500 dark:text-pink-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-pink-500 dark:text-pink-400">CRUD</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Episodes</h1>
          <p className="text-sm text-slate-400 dark:text-white/35 mt-0.5">{episodes.length} episodes</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all hover:-translate-y-0.5">
          <Plus size={14} /> Add Episode
        </button>
      </div>

      {/* Form */}
      {editing && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-4 dark:bg-[#1a1d2e] dark:border-white/8 dark:shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white/80">{editing === 'new' ? 'Add New Episode' : 'Edit Episode'}</h2>
            <button onClick={cancelEdit} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-white/30 dark:hover:text-white/60 dark:hover:bg-white/8 transition-all">
              <X size={15} />
            </button>
          </div>
          <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={LABEL}>Title *</label>
              <input type="text" placeholder="Episode title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className={INPUT} required />
            </div>
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
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="recorded">Recorded</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-2">
              <button type="submit" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                <Check size={14} /> Save Episode
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
        {episodes.length === 0 ? (
          <div className="p-16 flex flex-col items-center text-slate-300 dark:text-white/20">
            <Mic2 size={32} className="mb-2" /><p className="text-sm">No episodes yet</p>
          </div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-slate-50 border-b border-slate-100 dark:bg-white/4 dark:border-white/5">
              <tr>
                <th className={TH}>Title</th>
                <th className={TH}>Guest</th>
                <th className={TH}>Status</th>
                <th className={`${TH} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {episodes.map(ep => (
                <tr key={ep.id} className={TR_ROW}>
                  <td className={`${TD} font-semibold text-slate-900 dark:text-white/85`}>{ep.title}</td>
                  <td className={TD}>{guestMap[ep.guestId] ?? <span className="text-slate-300 dark:text-white/20">—</span>}</td>
                  <td className={TD}>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_META[ep.status] ?? 'bg-slate-100 text-slate-600'}`}>
                      {ep.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => openEdit(ep)} className="mr-3 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-pink-700 hover:bg-pink-50 dark:text-white/50 dark:hover:text-pink-300 dark:hover:bg-pink-500/10 transition-all">
                      <Pencil size={11} /> Edit
                    </button>
                    <button onClick={() => handleDelete(ep.id)} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-white/30 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-all">
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
