import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getEpisodeById, getGuestById } from '../../services/api';

export default function EpisodeDetail() {
  const { id } = useParams();
  const { tenant } = useAuth();
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

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (!episode) return <p className="text-slate-500">Episode not found.</p>;

  return (
    <div>
      <Link to="/app/episodes" className="text-sm text-slate-500 hover:text-slate-700">
        ← Episodes
      </Link>
      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-6">
        <h1 className="text-lg font-semibold text-slate-900">{episode.title}</h1>
        <p className="mt-1 text-sm text-slate-600">Status: {episode.status}</p>
        {guest && (
          <p className="mt-2 text-sm text-slate-600">
            Guest: <Link to={`/app/guests/${guest.id}`} className="text-slate-900 hover:underline">{guest.name}</Link>
          </p>
        )}
        {episode.recordedAt && (
          <p className="mt-1 text-sm text-slate-500">
            Recorded: {new Date(episode.recordedAt).toLocaleDateString()}
          </p>
        )}
        {episode.publishedAt && (
          <p className="mt-1 text-sm text-slate-500">
            Published: {new Date(episode.publishedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </div>
  );
}
