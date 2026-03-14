import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getGuests, getPipelineStages, createGuest, updateGuest, deleteGuest } from '../../services/api';
import { Users, ArrowLeft, Plus, Pencil, Trash2, X, Check } from 'lucide-react';

const DIVIDER = 'border-black/[0.08] dark:border-white/[0.08] divide-black/[0.08] dark:divide-white/[0.08]';
const INPUT   = 'w-full border border-black/20 dark:border-white/20 bg-transparent px-4 py-3 text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/25 focus:outline-none focus:border-black dark:focus:border-white transition-colors';
const LABEL   = 'block text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30 mb-2';
const TH      = `px-6 py-4 text-left text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30 bg-black/5 dark:bg-white/5 border-b ${DIVIDER}`;
const TD      = 'px-6 py-4 text-sm text-black/80 dark:text-white/80';
const TR_ROW  = `border-b ${DIVIDER} last:border-b-0 hover:bg-black/[0.02] dark:hover:bg-white/[0.02] transition-colors`;

const BTN_PRIMARY = 'flex items-center gap-2 border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-5 py-2.5 text-xs font-bold hover:opacity-80 transition-opacity';
const BTN_GHOST   = `flex items-center gap-2 border ${DIVIDER} px-5 py-2.5 text-xs font-bold text-black/60 dark:text-white/60 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white transition-all`;

const STATUS_BADGE = {
  'Prospecting':  'bg-black/5 text-black dark:bg-white/10 dark:text-white',
  'Outreach':     'bg-black/5 text-black dark:bg-white/10 dark:text-white',
  'Confirmed':    'bg-black text-white dark:bg-white dark:text-black',
  'Completed':    'bg-black text-white dark:bg-white dark:text-black',
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
              <Users size={24} className="text-black/20 dark:text-white/20" /> Guests
            </h1>
            <p className="text-sm text-black/40 dark:text-white/30 mt-2">{guests.length} guests</p>
          </div>
          <button onClick={openCreate} className={BTN_PRIMARY}>
            <Plus size={14} /> Add Guest
          </button>
        </div>

        {/* Content Body */}
        <div className={`border-b ${DIVIDER} flex flex-col`}>
          
          {/* Form */}
          {editing && (
            <div className={`border-b ${DIVIDER} p-8 bg-black/[0.02] dark:bg-white/[0.02]`}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold tracking-tight uppercase">{editing === 'new' ? 'Add New Guest' : 'Edit Guest'}</h2>
                <button onClick={cancelEdit} className="text-black/40 hover:text-black dark:text-white/30 dark:hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={LABEL}>Name *</label>
                  <input type="text" placeholder="Guest name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={INPUT} required />
                </div>
                <div>
                  <label className={LABEL}>Email</label>
                  <input type="email" placeholder="guest@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={INPUT} />
                </div>
                <div className="md:col-span-2">
                  <label className={LABEL}>Bio</label>
                  <textarea placeholder="Short bio..." value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} className={INPUT} rows={3} />
                </div>
                <div>
                  <label className={LABEL}>Pipeline Stage</label>
                  <select value={form.stageId} onChange={e => setForm(f => ({ ...f, stageId: e.target.value }))} className={INPUT}>
                    <option value="" className="bg-white dark:bg-black">— No Stage —</option>
                    {stages.map(s => <option key={s.id} value={s.id} className="bg-white dark:bg-black">{s.label}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2 flex items-center justify-end gap-3 pt-4 border-t border-black/10 dark:border-white/10 mt-2">
                  <button type="button" onClick={cancelEdit} className={BTN_GHOST}>Cancel</button>
                  <button type="submit" className={BTN_PRIMARY}><Check size={14} /> Save Guest</button>
                </div>
              </form>
            </div>
          )}

          {/* Table */}
          <div>
            {guests.length === 0 ? (
              <div className="py-20 flex flex-col items-center text-black/20 dark:text-white/15 select-none">
                <Users size={32} className="mb-3" />
                <p className="text-xs font-bold uppercase tracking-widest">No guests yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left border-collapse">
                  <thead>
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
                        <td className={`${TD} font-bold`}>{g.name}</td>
                        <td className={TD}>{g.email || <span className="text-black/20 dark:text-white/20">—</span>}</td>
                        <td className={TD}>
                          {stageMap[g.stageId] ? (
                            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${STATUS_BADGE[stageMap[g.stageId]] ?? 'bg-black/5 text-black/60 dark:bg-white/10 dark:text-white/60'}`}>
                              {stageMap[g.stageId]}
                            </span>
                          ) : <span className="text-black/20 dark:text-white/20">—</span>}
                        </td>
                        <td className={`${TD} text-right flex items-center justify-end gap-3`}>
                          <button onClick={() => openEdit(g)} className="text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-black dark:text-white/30 dark:hover:text-white flex items-center gap-1 transition-colors">
                            <Pencil size={10} /> Edit
                          </button>
                          <button onClick={() => handleDelete(g.id)} className="text-[10px] font-bold uppercase tracking-widest text-black/40 hover:text-red-500 dark:text-white/30 dark:hover:text-red-400 flex items-center gap-1 transition-colors">
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
