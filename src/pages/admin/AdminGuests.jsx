import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getGuests, getPipelineStages, createGuest, updateGuest, deleteGuest } from '../../services/api';
import { Users, ArrowLeft, Plus, Pencil, Trash2, X, Check } from 'lucide-react';

/* ── shared class helpers ──────────────────────────────────────────── */
const INPUT  = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:border-violet-400 transition-all dark:border-white/10 dark:bg-white/5 dark:text-white/80 dark:placeholder:text-white/25 dark:focus:ring-violet-500/30 dark:focus:border-violet-500/40';
const LABEL  = 'block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/35 mb-1.5';
const TH     = 'px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-white/35';
const TD     = 'px-5 py-3.5 text-sm text-slate-700 dark:text-white/70';
const TR_ROW = 'border-b border-slate-100 hover:bg-slate-50/70 dark:border-white/5 dark:hover:bg-white/4 transition-colors';

const STATUS_BADGE = {
  'Prospecting':  'bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300',
  'Outreach':     'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300',
  'Confirmed':    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  'Completed':    'bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300',
};

export default function AdminGuests() {
  const { tenant } = useAuth();
  const [guests, setGuests] = useState([]);
  const [stages, setStages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', bio: '', stageId: '' });

  function load() {
    if (!tenant?.id) return;
    Promise.all([getGuests(tenant.id), getPipelineStages(tenant.id)]).then(([g, s]) => {
      setGuests(g); setStages(s.sort((a, b) => a.order - b.order));
    }).finally(() => setLoading(false));
  }
  useEffect(() => { load(); }, [tenant?.id]);

  function openCreate() { setEditing('new'); setForm({ name: '', email: '', bio: '', stageId: stages[0]?.id ?? '' }); }
  function openEdit(g)  { setEditing(g.id); setForm({ name: g.name, email: g.email, bio: g.bio ?? '', stageId: g.stageId ?? '' }); }
  function cancelEdit() { setEditing(null); setForm({ name: '', email: '', bio: '', stageId: '' }); }

  async function handleSave(e) {
    e.preventDefault();
    if (!tenant?.id) return;
    if (editing === 'new') await createGuest(tenant.id, { name: form.name, email: form.email, bio: form.bio, stageId: form.stageId || null });
    else await updateGuest(editing, { name: form.name, email: form.email, bio: form.bio, stageId: form.stageId || null });
    cancelEdit(); load();
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this guest?')) return;
    await deleteGuest(id); load();
  }

  const stageMap = Object.fromEntries(stages.map(s => [s.id, s.label]));

  if (loading) return (
    <div className="flex items-center justify-center h-80">
      <div className="h-10 w-10 rounded-full border-4 border-violet-200 border-t-violet-600 animate-spin dark:border-violet-500/30 dark:border-t-violet-500" />
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
            <Users size={14} className="text-violet-500 dark:text-violet-400" />
            <span className="text-xs font-semibold uppercase tracking-widest text-violet-500 dark:text-violet-400">CRUD</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Guests</h1>
          <p className="text-sm text-slate-400 dark:text-white/35 mt-0.5">{guests.length} guests</p>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all hover:-translate-y-0.5">
          <Plus size={14} /> Add Guest
        </button>
      </div>

      {/* Form */}
      {editing && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6 space-y-4 dark:bg-[#1a1d2e] dark:border-white/8 dark:shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-slate-800 dark:text-white/80">{editing === 'new' ? 'Add New Guest' : 'Edit Guest'}</h2>
            <button onClick={cancelEdit} className="rounded-lg p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-white/30 dark:hover:text-white/60 dark:hover:bg-white/8 transition-all">
              <X size={15} />
            </button>
          </div>
          <form onSubmit={handleSave} className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={LABEL}>Name *</label>
              <input type="text" placeholder="Guest name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={INPUT} required />
            </div>
            <div>
              <label className={LABEL}>Email</label>
              <input type="email" placeholder="guest@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={INPUT} />
            </div>
            <div className="sm:col-span-2">
              <label className={LABEL}>Bio</label>
              <textarea placeholder="Short bio..." value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} className={INPUT} rows={3} />
            </div>
            <div>
              <label className={LABEL}>Pipeline Stage</label>
              <select value={form.stageId} onChange={e => setForm(f => ({ ...f, stageId: e.target.value }))} className={INPUT}>
                <option value="">— No Stage —</option>
                {stages.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-2">
              <button type="submit" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                <Check size={14} /> Save Guest
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
        {guests.length === 0 ? (
          <div className="p-16 flex flex-col items-center text-slate-300 dark:text-white/20">
            <Users size={32} className="mb-2" /><p className="text-sm">No guests yet</p>
          </div>
        ) : (
          <table className="min-w-full">
            <thead className="bg-slate-50 border-b border-slate-100 dark:bg-white/4 dark:border-white/5">
              <tr>
                <th className={TH}>Name</th>
                <th className={TH}>Email</th>
                <th className={TH}>Stage</th>
                <th className={`${TH} text-right`}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {guests.map(g => (
                <tr key={g.id} className={TR_ROW}>
                  <td className={`${TD} font-semibold text-slate-900 dark:text-white/85`}>{g.name}</td>
                  <td className={TD}>{g.email}</td>
                  <td className={TD}>
                    {stageMap[g.stageId] ? (
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_BADGE[stageMap[g.stageId]] ?? 'bg-slate-100 text-slate-600 dark:bg-white/8 dark:text-white/50'}`}>
                        {stageMap[g.stageId]}
                      </span>
                    ) : <span className="text-slate-300 dark:text-white/20">—</span>}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => openEdit(g)} className="mr-3 inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-violet-700 hover:bg-violet-50 dark:text-white/50 dark:hover:text-violet-300 dark:hover:bg-violet-500/10 transition-all">
                      <Pencil size={11} /> Edit
                    </button>
                    <button onClick={() => handleDelete(g.id)} className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:text-red-600 hover:bg-red-50 dark:text-white/30 dark:hover:text-red-400 dark:hover:bg-red-500/10 transition-all">
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
