import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, MoonStar, SunMedium } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const TopNav = () => {
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Features', path: '/features' },
    { name: 'Careers', path: '/careers' },
  ];

  return (
    <header className="topbar relative z-40 max-w-[1400px] mx-auto mt-6">
      <div className="flex items-center gap-3">
        <Link to="/">
          <img src="/logo.png" alt="HireZone" className="h-12 dark:hidden" />
          <img src="/logo-dark.png" alt="HireZone" className="h-12 hidden dark:block" />
        </Link>
      </div>

      <nav className="nav-actions flex items-center gap-2">
        <div className="hidden md:flex items-center gap-1 mr-4 bg-[var(--bg-primary)]/50 p-1 rounded-full border border-[var(--border-color)]">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                  isActive 
                    ? 'bg-white dark:bg-slate-800 text-[var(--text-headers)] shadow-sm' 
                    : 'text-[var(--text-muted)] hover:text-[var(--text-headers)] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </div>

        <button onClick={toggleTheme} className="icon-btn !rounded-full" aria-label="Toggle theme">
          {darkMode ? <SunMedium size={18} /> : <MoonStar size={18} />}
        </button>

        <Link to="/login" className="primary-btn group !rounded-full !px-6 !text-sm flex items-center gap-2 shadow-xl shadow-orange-500/20 ml-2">
          Portal Login
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </nav>
    </header>
  );
};

export default TopNav;
