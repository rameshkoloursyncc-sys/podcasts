import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, Sun, Moon, ArrowRight, Radio, Users, Mic2, CalendarDays } from 'lucide-react';

const FEATURE_GRID = [
  { icon: Users, label: 'Guest CRM', desc: 'Manage podcast guests with pipeline stages and outreach tracking.' },
  { icon: Mic2, label: 'Episodes', desc: 'Track recording status from draft to published in one place.' },
  { icon: CalendarDays, label: 'Bookings', desc: 'Schedule recording sessions and manage your calendar with ease.' },
  { icon: Radio, label: 'Publish Ready', desc: 'Move from guest outreach to published episode — all in one workflow.' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? '/app';

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const ok = await login(email, password);
      if (ok) navigate(from, { replace: true });
      else setError('Invalid credentials. Please try again.');
    } catch (err) {
      setError(err?.message ?? 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white flex flex-col">

      {/* ── Top bar ─────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-black dark:border-white/20">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-lg bg-black dark:bg-white flex items-center justify-center">
            <Sparkles size={14} className="text-white dark:text-black" />
          </div>
          <span className="text-sm font-bold tracking-tight">PodcastOS</span>
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={toggle}
            className="flex items-center gap-1.5 rounded-lg border border-black/20 dark:border-white/20 px-3 py-1.5 text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/8 transition-all">
            {isDark ? <><Sun size={13} className="text-amber-500" /> Light</> : <><Moon size={13} className="text-violet-600" /> Dark</>}
          </button>
          <Link to="/" className="text-xs font-semibold text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors">
            ← Back to home
          </Link>
        </div>
      </header>

      {/* ── Main grid layout ────────────────────────────────────── */}
      <div className="flex-1 grid lg:grid-cols-2 border-b border-black dark:border-white/20">

        {/* ── Left: Login form ─────────────────────────────────── */}
        <div className="flex flex-col justify-center px-8 py-16 lg:px-16 border-b lg:border-b-0 lg:border-r border-black dark:border-white/20">
          <div className="max-w-sm w-full mx-auto lg:mx-0">

            <div className="mb-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/30 mb-3">Sign In</p>
              <h1 className="text-4xl font-bold tracking-tight leading-tight">
                Welcome<br />back.
              </h1>
              <p className="mt-3 text-sm text-black/50 dark:text-white/40 leading-relaxed">
                Sign in to access your podcast management dashboard.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                  className="w-full border border-black/20 dark:border-white/20 bg-transparent px-4 py-3 text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/25 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full border border-black/20 dark:border-white/20 bg-transparent px-4 py-3 text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/25 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>

              {error && (
                <div className="border border-red-400/40 bg-red-50 dark:bg-red-500/10 px-4 py-3">
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-between border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-5 py-3.5 text-sm font-bold hover:bg-black/90 dark:hover:bg-white/90 disabled:opacity-50 transition-all group">
                <span>{loading ? 'Signing in…' : 'Sign in'}</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-center text-[10px] font-bold uppercase tracking-widest text-black/30 dark:text-white/25">
                No account?{' '}
                <Link to="/register" className="text-black dark:text-white underline">Create one free</Link>
              </p>
            </form>
          </div>
        </div>

        {/* ── Right: Feature grid ──────────────────────────────── */}
        <div className="hidden lg:grid grid-cols-2 grid-rows-2 divide-y divide-x divide-black dark:divide-white/20">
          {FEATURE_GRID.map(({ icon: Icon, label, desc }, i) => (
            <div key={label}
              className={`p-10 flex flex-col justify-between relative overflow-hidden
                ${i === 0 ? 'border-b border-r border-black dark:border-white/20' : ''}
                ${i === 1 ? 'border-b border-black dark:border-white/20' : ''}
                ${i === 2 ? 'border-r border-black dark:border-white/20' : ''}
              `}>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/20 dark:text-white/15 mb-auto">0{i + 1}</span>
              <div className="mt-auto">
                <div className="h-10 w-10 border border-black/20 dark:border-white/20 flex items-center justify-center mb-5">
                  <Icon size={18} className="text-black dark:text-white" />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-2">{label}</h3>
                <p className="text-sm text-black/50 dark:text-white/40 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom strip ────────────────────────────────────────── */}
      <div className="grid grid-cols-3 divide-x divide-black dark:divide-white/20 border-t border-black dark:border-white/20">
        {[
          { label: 'Guests', value: 'CRM Pipeline' },
          { label: 'Episodes', value: 'Status Tracking' },
          { label: 'Bookings', value: 'Scheduling' },
        ].map(({ label, value }) => (
          <div key={label} className="px-6 py-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 dark:text-white/25">{label}</p>
            <p className="text-sm font-semibold mt-1 text-black/70 dark:text-white/60">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

