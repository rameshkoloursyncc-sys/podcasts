import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, Sun, Moon, ArrowRight, Users, Mic2, CalendarDays, Radio } from 'lucide-react';

const INPUT = 'w-full border border-black/20 dark:border-white/20 bg-transparent px-3 py-2.5 text-sm text-black dark:text-white placeholder:text-black/30 dark:placeholder:text-white/25 focus:outline-none focus:border-black dark:focus:border-white transition-colors';
const LABEL = 'block text-[10px] font-bold uppercase tracking-widest text-black/40 dark:text-white/30 mb-1.5';

function toSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function Register() {
  const { register } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    tenant_name: '', tenant_slug: '',
    display_name: '', email: '',
    password: '', password_confirmation: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [slugEdited, setSlugEdited] = useState(false);

  function handleChange(field, value) {
    setForm(f => {
      const next = { ...f, [field]: value };
      if (field === 'tenant_name' && !slugEdited) next.tenant_slug = toSlug(value);
      return next;
    });
    setFieldErrors(fe => ({ ...fe, [field]: undefined }));
  }

  function handleSlugChange(value) {
    setSlugEdited(true);
    setForm(f => ({ ...f, tenant_slug: toSlug(value) }));
    setFieldErrors(fe => ({ ...fe, tenant_slug: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    if (form.password !== form.password_confirmation) {
      setFieldErrors({ password_confirmation: 'Passwords do not match.' });
      return;
    }
    setLoading(true);
    try {
      const ok = await register(form);
      if (ok) navigate('/app', { replace: true });
      else setError('Registration failed. Please check your details and try again.');
    } catch (err) {
      if (err?.errors) {
        const fe = {};
        Object.entries(err.errors).forEach(([k, v]) => { fe[k] = Array.isArray(v) ? v[0] : v; });
        setFieldErrors(fe);
        setError('Please fix the errors below.');
      } else {
        setError(err?.message ?? 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    /* Entire page locked to 100vh — no scrolling on the outer shell */
    <div className="h-screen overflow-hidden bg-white dark:bg-black text-black dark:text-white flex flex-col">

      {/* ── Top bar ────────────────────────────────────────── */}
      <header className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-black dark:border-white/20">
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
          <Link to="/login" className="text-xs font-semibold text-black/50 dark:text-white/40 hover:text-black dark:hover:text-white transition-colors">
            Sign in →
          </Link>
        </div>
      </header>

      {/* ── Body: fills remaining height, no outer scroll ─── */}
      <div className="flex-1 min-h-0 grid lg:grid-cols-2">

        {/* ── Left: scrollable form column ───────────────── */}
        <div className="overflow-y-auto flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-black dark:border-white/20">
          <div className="w-full max-w-sm mx-auto px-8 py-8">

            {/* Heading */}
            <div className="mb-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40 dark:text-white/30 mb-2">Create Account</p>
              <h1 className="text-3xl font-bold tracking-tight leading-tight">Start your<br />podcast OS.</h1>
              <p className="mt-2 text-xs text-black/50 dark:text-white/40 leading-relaxed">
                Set up your workspace in seconds — guests, episodes & bookings ready to go.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">

              {/* ── Workspace ── */}
              <div className="pb-3 border-b border-black/10 dark:border-white/10 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 dark:text-white/20">Workspace</p>

                <div>
                  <label className={LABEL}>Podcast Name *</label>
                  <input type="text" value={form.tenant_name}
                    onChange={e => handleChange('tenant_name', e.target.value)}
                    placeholder="The Founders Pod" required className={INPUT} />
                  {fieldErrors.tenant_name && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.tenant_name}</p>}
                </div>

                <div>
                  <label className={LABEL}>Workspace Slug *</label>
                  <input type="text" value={form.tenant_slug}
                    onChange={e => handleSlugChange(e.target.value)}
                    placeholder="founders-pod" required className={INPUT} />
                  <p className="mt-1 text-[10px] text-black/25 dark:text-white/20 uppercase tracking-widest">Auto-generated · lowercase · unique</p>
                  {fieldErrors.tenant_slug && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.tenant_slug}</p>}
                </div>
              </div>

              {/* ── Account ── */}
              <div className="space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-black/30 dark:text-white/20">Your Account</p>

                <div>
                  <label className={LABEL}>Your Name *</label>
                  <input type="text" value={form.display_name}
                    onChange={e => handleChange('display_name', e.target.value)}
                    placeholder="Alex Rivera" required className={INPUT} />
                  {fieldErrors.display_name && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.display_name}</p>}
                </div>

                <div>
                  <label className={LABEL}>Email *</label>
                  <input type="email" value={form.email}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder="alex@founderspod.com" required autoComplete="email" className={INPUT} />
                  {fieldErrors.email && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.email}</p>}
                </div>

                {/* Passwords side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={LABEL}>Password *</label>
                    <input type="password" value={form.password}
                      onChange={e => handleChange('password', e.target.value)}
                      placeholder="••••••••" required autoComplete="new-password" className={INPUT} />
                    {fieldErrors.password && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.password}</p>}
                  </div>
                  <div>
                    <label className={LABEL}>Confirm *</label>
                    <input type="password" value={form.password_confirmation}
                      onChange={e => handleChange('password_confirmation', e.target.value)}
                      placeholder="••••••••" required autoComplete="new-password" className={INPUT} />
                    {fieldErrors.password_confirmation && <p className="mt-1 text-[11px] text-red-500">{fieldErrors.password_confirmation}</p>}
                  </div>
                </div>
              </div>

              {error && (
                <div className="border border-red-400/40 bg-red-50 dark:bg-red-500/10 px-3 py-2.5">
                  <p className="text-xs font-semibold text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-between border border-black dark:border-white bg-black dark:bg-white text-white dark:text-black px-5 py-3 text-sm font-bold hover:bg-black/90 dark:hover:bg-white/90 disabled:opacity-50 transition-all group">
                <span>{loading ? 'Creating account…' : 'Create account'}</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <p className="text-center text-[10px] font-bold uppercase tracking-widest text-black/30 dark:text-white/25 pt-1">
                Already have an account?{' '}
                <Link to="/login" className="text-black dark:text-white underline">Sign in</Link>
              </p>
            </form>
          </div>
        </div>

        {/* ── Right: Feature grid (desktop only, no scroll) ─ */}
        <div className="hidden lg:grid grid-cols-2 grid-rows-2 divide-y divide-x divide-black dark:divide-white/20 overflow-hidden">
          {[
            { icon: Users, label: 'Guest CRM', desc: 'Pipeline stages from outreach to publication.' },
            { icon: Mic2, label: 'Episodes', desc: 'Manage status from draft to published.' },
            { icon: CalendarDays, label: 'Bookings', desc: 'Schedule sessions and track RSVPs.' },
            { icon: Radio, label: 'Publish Ready', desc: 'One workflow — from outreach to live.' },
          ].map(({ icon: Icon, label, desc }, i) => (
            <div key={label} className={`p-8 flex flex-col justify-between overflow-hidden
              ${i === 0 ? 'border-b border-r border-black dark:border-white/20' : ''}
              ${i === 1 ? 'border-b border-black dark:border-white/20' : ''}
              ${i === 2 ? 'border-r border-black dark:border-white/20' : ''}
            `}>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-black/20 dark:text-white/15">0{i + 1}</span>
              <div>
                <div className="h-9 w-9 border border-black/20 dark:border-white/20 flex items-center justify-center mb-4">
                  <Icon size={16} className="text-black dark:text-white" />
                </div>
                <h3 className="text-lg font-bold tracking-tight mb-1">{label}</h3>
                <p className="text-xs text-black/50 dark:text-white/40 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
