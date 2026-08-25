import { LogOut, MoonStar, SunMedium, UserCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const PortalLayout = ({ title, subtitle, profileName, children }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-body)] transition-colors">
      <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-[var(--border-color)] bg-white/70 p-4 shadow-[var(--shadow-soft)] backdrop-blur dark:bg-slate-900/80 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <img src="/logo.png" alt="HireZone Logo" className="h-14 md:h-16 object-contain mb-2 dark:hidden" />
            <img src="/logo-dark.png" alt="HireZone Logo" className="h-14 md:h-16 object-contain mb-2 hidden dark:block" />
            <h1 className="mt-1 text-2xl font-bold text-[var(--text-headers)]">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-[var(--text-muted)]">{subtitle}</p>}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-sm font-medium text-[var(--text-headers)]">
              <UserCircle2 size={18} />
              {profileName || 'Team Member'}
            </div>
            <button onClick={toggleTheme} className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-body)]" aria-label="Toggle theme">
              {darkMode ? <SunMedium size={18} /> : <MoonStar size={18} />}
            </button>
            <button onClick={handleLogout} className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:translate-y-[-1px]">
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
};

export default PortalLayout;
