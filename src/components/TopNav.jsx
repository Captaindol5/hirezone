import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, MoonStar, SunMedium, Menu, X, Briefcase, Sparkles, Home } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const TopNav = () => {
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const navLinks = [
    { name: 'HOME', path: '/', icon: Home },
    { name: 'FEATURES', path: '/features', icon: Sparkles },
    { name: 'CAREERS', path: '/careers', icon: Briefcase },
  ];

  return (
    <div className="pt-6 px-4 sm:px-6 w-full flex justify-center sticky top-0 z-50 pointer-events-none">
      <header className="w-full max-w-5xl bg-white/90 dark:bg-[#0f1115]/90 backdrop-blur-md border border-gray-200 dark:border-gray-800 rounded-full shadow-lg transition-colors pointer-events-auto">
        <div className="flex items-center justify-between px-6 py-3.5 sm:py-4">
        
        {/* Left: Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center" onClick={() => setMobileMenuOpen(false)}>
            <img src="/logo.png" alt="HireZone" className="h-8 sm:h-9 md:h-10 dark:hidden object-contain" />
            <img src="/logo-dark.png" alt="HireZone" className="h-8 sm:h-9 md:h-10 hidden dark:block object-contain" />
          </Link>
        </div>

        {/* Center: Desktop Navigation Links */}
        <nav className="hidden md:flex items-center justify-center gap-8 lg:gap-12">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={`text-xs font-bold tracking-[0.2em] transition-all hover:text-orange-500 ${
                  isActive 
                    ? 'text-orange-500' 
                    : 'text-gray-900 dark:text-gray-200'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <button 
            onClick={toggleTheme} 
            className="flex items-center justify-center w-9 h-9 rounded-full text-gray-500 hover:text-orange-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" 
            aria-label="Toggle theme"
          >
            {darkMode ? <SunMedium size={19} /> : <MoonStar size={19} />}
          </button>

          {/* PORTAL Button - Visible across all device viewports */}
          <Link 
            to="/login" 
            className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-bold tracking-[0.1em] text-white bg-gray-900 dark:bg-white dark:text-gray-900 px-3.5 sm:px-5 md:px-6 py-2 sm:py-2.5 rounded-full hover:bg-orange-500 dark:hover:bg-orange-500 dark:hover:text-white transition-all group shadow-sm hover:shadow-md"
          >
            PORTAL
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </Link>

          {/* Mobile & Tablet Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-gray-200 dark:border-gray-800 text-gray-700 dark:text-gray-200 hover:text-orange-500 hover:border-orange-500/50 transition-colors bg-white/50 dark:bg-black/30"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white/95 dark:bg-[#0f1115]/95 backdrop-blur-2xl border-b border-gray-200 dark:border-gray-800 shadow-2xl transition-all duration-200">
          <div className="px-5 py-5 flex flex-col gap-2">
            <p className="text-[10px] font-bold tracking-[0.2em] text-gray-400 uppercase mb-1 px-3">
              Navigation
            </p>
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-bold tracking-wider transition-all ${
                    isActive
                      ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20'
                      : 'text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} className={isActive ? 'text-orange-500' : 'text-gray-400'} />
                    <span>{link.name}</span>
                  </div>
                  {link.name === 'CAREERS' && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-orange-500 text-white">
                      Hiring
                    </span>
                  )}
                </Link>
              );
            })}

            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 text-xs font-bold tracking-[0.1em] text-white bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3 rounded-2xl shadow-lg shadow-orange-500/20 hover:brightness-110 transition-all uppercase"
              >
                Sign in to Portal
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
    </div>
  );
};

export default TopNav;
