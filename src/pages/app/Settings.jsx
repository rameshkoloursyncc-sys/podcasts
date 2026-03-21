import { useAuth } from '../../context/AuthContext';
import { Settings, User, Building2, Shield, Bell, Palette, ChevronRight } from 'lucide-react';

const DIVIDER = 'border-black/[0.08] dark:border-white/[0.08] divide-black/[0.08] dark:divide-white/[0.08]';

const SECTION_CARDS = [
  {
    icon: Building2, title: 'Workspace',
    fields: (tenant) => [
      { label: 'Podcast Name', value: tenant?.name ?? '—' },
      { label: 'Slug', value: tenant?.slug ?? '—' },
      // { label: 'Tenant ID', value: tenant?.id ?? '—' },
    ],
  },
  {
    icon: User, title: 'Account',
    fields: (_, user) => [
      // API returns snake_case (display_name); AuthContext also sets displayName alias
      { label: 'Display Name', value: user?.display_name ?? user?.displayName ?? '—' },
      { label: 'Email', value: user?.email ?? '—' },
      { label: 'Role', value: user?.role ?? '—' },
    ],
  },
];

const QUICK_SETTINGS = [
  { icon: Bell, label: 'Notifications', sub: 'Email & in-app alerts' },
  { icon: Shield, label: 'Security', sub: 'Password & 2FA' },
  { icon: Palette, label: 'Appearance', sub: 'Theme & display options' },
];

export default function SettingsPage() {
  const { tenant, user } = useAuth();

  return (
    <div className="bg-white dark:bg-[#0f1117] text-black dark:text-white min-h-[calc(100vh-64px)] flex flex-col">
      {/* ══ HEADER ═════════════════════════════════════════════════════ */}
      <div className={`border-b ${DIVIDER} bg-white dark:bg-[#0a0c12]`}>
        <div className="px-8 py-7">
          {/* <div className="flex items-center gap-2 mb-2">
            <Settings size={12} className="text-black/40 dark:text-white/40" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-black/50 dark:text-white/40">Configuration</span>
          </div> */}
          <h1 className="text-3xl font-extrabold tracking-tight leading-none">Settings.</h1>
          <p className="text-sm text-black/35 dark:text-white/30 mt-2">Manage your workspace and account operations</p>
        </div>
      </div>

      {/* ══ CONTENT GRID ══════════════════════════════════════════════════ */}
      <div className={`flex flex-1 divide-x ${DIVIDER}`}>

        {/* Main Settings Column */}
        <div className="flex-1 flex flex-col">

          <div className={`grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x ${DIVIDER} border-b ${DIVIDER}`}>
            {SECTION_CARDS.map(({ icon: Icon, title, fields }) => (
              <div key={title} className="flex flex-col">
                <div className={`p-6 border-b ${DIVIDER} flex items-center gap-4`}>
                  <div className="h-12 w-12 bg-black/5 dark:bg-white/10 flex items-center justify-center">
                    <Icon size={16} className="text-black/50 dark:text-white/50" />
                  </div>
                  <h2 className="text-[11px] font-bold uppercase tracking-widest">{title}</h2>
                </div>
                <div className="flex-1">
                  {fields(tenant, user).map(({ label, value }) => (
                    <div key={label} className={`flex items-center justify-between p-6 border-b ${DIVIDER} last:border-b-0`}>
                      <span className="text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30">{label}</span>
                      <span className="text-xs font-bold truncate max-w-[60%] text-right">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col">
            <div className={`p-6 border-b ${DIVIDER}`}>
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-red-600 dark:text-red-500">Danger Zone</h2>
              <p className="text-[10px] uppercase font-bold tracking-widest text-black/30 dark:text-white/20 mt-2">Irreversible actions — proceed with caution</p>
            </div>
            <div className={`p-6 flex items-center justify-between border-b ${DIVIDER} bg-red-50 dark:bg-red-500/5`}>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest text-red-700 dark:text-red-400">Reset all system data</p>
                <p className="text-[10px] uppercase font-bold tracking-widest text-red-700/50 dark:text-red-400/50 mt-1">Clears guests, episodes, bookings and notes</p>
              </div>
              <button className="border border-red-200 dark:border-red-500/20 px-6 py-3 text-[10px] font-bold uppercase tracking-widest text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-500 dark:hover:text-white transition-colors">
                Reset Data
              </button>
            </div>
          </div>
        </div>

        {/* Quick Settings Sidebar */}
        <div className="w-80 flex-none bg-black/[0.02] dark:bg-white/[0.02] flex flex-col">
          <div className={`px-6 py-8 border-b ${DIVIDER}`}>
            <h2 className="text-[11px] font-bold uppercase tracking-widest">Quick Toggles</h2>
            <p className="text-[10px] uppercase font-bold tracking-widest text-black/30 dark:text-white/20 mt-2">Preferences and adjustments</p>
          </div>
          <div className="flex-1">
            {QUICK_SETTINGS.map(({ icon: Icon, label, sub }) => (
              <button key={label} className={`w-full flex items-center gap-4 px-6 py-5 border-b ${DIVIDER} hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-colors group text-left`}>
                <div className="h-10 w-10 flex items-center justify-center bg-black/5 dark:bg-white/10 flex-none group-hover:bg-black/10 dark:group-hover:bg-white/20 transition-colors">
                  <Icon size={14} className="text-black/50 dark:text-white/50 group-hover:text-black dark:group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-widest group-hover:text-black dark:group-hover:text-white">{label}</p>
                  <p className="text-[9px] uppercase font-bold tracking-widest text-black/30 dark:text-white/30 mt-1">{sub}</p>
                </div>
                <ChevronRight size={12} className="text-black/20 dark:text-white/20 group-hover:text-black dark:group-hover:text-white" />
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
