import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEpisodeById, getGuestById } from '../../services/api';
import { ArrowLeft, Mic2, Radio, Clock3, CheckCircle2, FileEdit, Calendar } from 'lucide-react';

const STATUS_META = {
  draft:     { gradient: 'from-slate-500 to-slate-600',    icon: FileEdit,     label: 'Draft',     badge: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/20' },
  scheduled: { gradient: 'from-amber-600 to-orange-600',   icon: Clock3,       label: 'Scheduled', badge: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/20' },
  recorded:  { gradient: 'from-emerald-600 to-teal-600',   icon: CheckCircle2, label: 'Recorded',  badge: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/20' },
  published: { gradient: 'from-blue-600 to-cyan-600',      icon: Radio,        label: 'Published', badge: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/20' },
};

export default function EpisodeDetail() {
  const { id } = useParams();
  const [episode, setEpisode] = useState(null);
  const [guest, setGuest] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getEpisodeById(id).then((ep) => {
      setEpisode(ep ?? null);
      if (ep?.guestId) return getGuestById(ep.guestId).then(setGuest);
    }).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center h-80">
      <div className="h-10 w-10 rounded-full border-4 border-pink-200 border-t-pink-600 animate-spin dark:border-pink-500/30 dark:border-t-pink-500" />
    </div>
  );
  if (!episode) return <div className="p-6 text-slate-500 dark:text-white/40">Episode not found.</div>;

  const meta = STATUS_META[episode.status] ?? STATUS_META.draft;
  const Icon = meta.icon;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] p-6 space-y-6">
      <Link to="/app/episodes" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-white/40 dark:hover:text-white/70 transition-colors">
        <ArrowLeft size={13} /> Back to Episodes
      </Link>

      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-[#1a1d2e] dark:border-white/5 dark:shadow-xl">
        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${meta.gradient}`} />
        <div className="p-8">
          <div className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${meta.gradient} flex items-center justify-center shadow-2xl mb-5`}>
            <Mic2 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{episode.title || 'Untitled Episode'}</h1>
          <span className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border ${meta.badge}`}>
            <Icon size={10} /> {meta.label}
          </span>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {guest && (
              <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 flex items-center gap-3 dark:bg-white/5 dark:border-white/5">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white flex-none">
                  {guest.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 dark:text-white/30 uppercase tracking-wider">Guest</p>
                  <Link to={`/app/guests/${guest.id}`} className="text-sm font-semibold text-slate-800 dark:text-white/80 hover:text-violet-600 dark:hover:text-violet-400 truncate block">
                    {guest.name}
                  </Link>
                </div>
              </div>
            )}
            {episode.recordedAt && (
              <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 flex items-center gap-3 dark:bg-white/5 dark:border-white/5">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-none">
                  <CheckCircle2 size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-white/30 uppercase tracking-wider">Recorded</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white/80">{new Date(episode.recordedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
            )}
            {episode.publishedAt && (
              <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 flex items-center gap-3 dark:bg-white/5 dark:border-white/5">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-none">
                  <Radio size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 dark:text-white/30 uppercase tracking-wider">Published</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-white/80">{new Date(episode.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
              </div>
            )}
            <div className="rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 flex items-center gap-3 dark:bg-white/5 dark:border-white/5">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-slate-400 to-slate-500 flex items-center justify-center flex-none">
                <Calendar size={16} className="text-white" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 dark:text-white/30 uppercase tracking-wider">Created</p>
                <p className="text-sm font-semibold text-slate-800 dark:text-white/80">{new Date(episode.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
