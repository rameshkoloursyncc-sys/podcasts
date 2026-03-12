import { useAuth } from '../../context/AuthContext';
import { Settings, User, Building2, Shield, Bell, Palette, ChevronRight } from 'lucide-react';

const SECTION_CARDS = [
  {
    icon: Building2, title: 'Workspace', gradient: 'from-violet-600 to-purple-700',
    fields: (tenant) => [
      { label: 'Podcast Name', value: tenant?.name ?? '—' },
      { label: 'Slug',         value: tenant?.slug ?? '—' },
      { label: 'Tenant ID',    value: tenant?.id ?? '—' },
    ],
  },
  {
    icon: User, title: 'Account', gradient: 'from-blue-600 to-cyan-600',
    fields: (_, user) => [
      { label: 'Display Name', value: user?.displayName ?? '—' },
      { label: 'Email',        value: user?.email ?? '—' },
      { label: 'Role',         value: user?.role ?? 'admin' },
    ],
  },
];

const QUICK_SETTINGS = [
  { icon: Bell,    label: 'Notifications', sub: 'Email & in-app alerts',   gradient: 'from-amber-500 to-orange-600' },
  { icon: Shield,  label: 'Security',      sub: 'Password & 2FA',          gradient: 'from-emerald-600 to-teal-600' },
  { icon: Palette, label: 'Appearance',    sub: 'Theme & display options', gradient: 'from-pink-500 to-rose-600' },
];

export default function SettingsPage() {
  const { tenant, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1117] p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Settings size={14} className="text-slate-500 dark:text-slate-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">Configuration</span>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-sm text-slate-400 dark:text-white/35 mt-0.5">Manage your workspace and account</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {SECTION_CARDS.map(({ icon: Icon, title, gradient, fields }) => (
          <div key={title} className="relative overflow-hidden rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-[#1a1d2e] dark:border-white/5 dark:shadow-xl">
            <div className={`bg-gradient-to-r ${gradient} px-6 py-5 flex items-center gap-3`}>
              <div className="h-10 w-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Icon size={20} className="text-white" />
              </div>
              <h2 className="text-base font-bold text-white">{title}</h2>
            </div>
            <div className="p-6 space-y-4">
              {fields(tenant, user).map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between rounded-xl bg-slate-50 border border-slate-100 px-4 py-3 dark:bg-white/4 dark:border-white/5">
                  <span className="text-xs font-medium text-slate-500 dark:text-white/40 uppercase tracking-wider">{label}</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-white/80 max-w-[60%] truncate text-right">{value}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl bg-white border border-slate-100 shadow-sm dark:bg-[#1a1d2e] dark:border-white/5 dark:shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5">
          <h2 className="text-sm font-bold text-slate-800 dark:text-white/80">Quick Settings</h2>
          <p className="text-xs text-slate-400 dark:text-white/30 mt-0.5">Manage preferences and configurations</p>
        </div>
        <div className="p-4 space-y-3">
          {QUICK_SETTINGS.map(({ icon: Icon, label, sub, gradient }) => (
            <button key={label} className="w-full flex items-center gap-4 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 px-4 py-3.5 transition-all group text-left dark:bg-white/4 dark:hover:bg-white/8 dark:border-white/5 dark:hover:border-white/10">
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-none shadow-lg`}>
                <Icon size={16} className="text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700 dark:text-white/80 group-hover:text-slate-900 dark:group-hover:text-white">{label}</p>
                <p className="text-xs text-slate-400 dark:text-white/30">{sub}</p>
              </div>
              <ChevronRight size={15} className="text-slate-300 dark:text-white/20 group-hover:text-slate-500 dark:group-hover:text-white/50" />
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-red-100 shadow-sm dark:bg-[#1a1d2e] dark:border-red-500/15 dark:shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-red-100 dark:border-red-500/10">
          <h2 className="text-sm font-bold text-red-500 dark:text-red-400">Danger Zone</h2>
          <p className="text-xs text-slate-400 dark:text-white/30 mt-0.5">Irreversible actions — proceed with caution</p>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-700 dark:text-white/70">Reset all data</p>
            <p className="text-xs text-slate-400 dark:text-white/30 mt-0.5">Clears all guests, episodes, bookings and notes</p>
          </div>
          <button className="rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 px-4 py-2 text-xs font-bold text-red-600 hover:text-red-700 transition-all dark:bg-red-500/15 dark:hover:bg-red-500/25 dark:border-red-500/20 dark:text-red-400 dark:hover:text-red-300">
            Reset Data
          </button>
        </div>
      </div>
    </div>
  );
}
