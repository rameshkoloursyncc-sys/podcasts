import { useAuth } from '../../context/AuthContext';

export default function Settings() {
  const { tenant, user } = useAuth();

  return (
    <div>
      <h1 className="text-lg font-semibold text-slate-900">Settings</h1>
      <p className="mt-1 text-sm text-slate-500">Tenant and account (read-only for now)</p>
      <div className="mt-6 space-y-4 rounded-lg border border-slate-200 bg-white p-6">
        <div>
          <h2 className="text-sm font-medium text-slate-700">Podcast (tenant)</h2>
          <p className="mt-1 text-sm text-slate-600">{tenant?.name ?? '—'}</p>
          <p className="text-xs text-slate-400">{tenant?.slug ?? '—'}</p>
        </div>
        <div>
          <h2 className="text-sm font-medium text-slate-700">Account</h2>
          <p className="mt-1 text-sm text-slate-600">{user?.displayName ?? '—'}</p>
          <p className="text-xs text-slate-400">{user?.email ?? '—'}</p>
        </div>
      </div>
    </div>
  );
}
