import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, MoonStar, SunMedium } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const TopNav = () => {
  const { darkMode, toggleTheme } = useTheme();
  const location = useLocation();

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'FEATURES', path: '/features' },
    { name: 'CAREERS', path: '/careers' },
  ];

  return (
    <header className="topbar relative z-40 w-full flex items-center justify-between px-8 py-6 bg-white/80 dark:bg-[#0f1115]/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 transition-colors">
      
      {/* Left: Logo */}
      <div className="flex items-center w-1/4">
        <Link to="/">
          <img src="/logo.png" alt="HireZone" className="h-8 md:h-10 dark:hidden object-contain" />
          <img src="/logo-dark.png" alt="HireZone" className="h-8 md:h-10 hidden dark:block object-contain" />
        </Link>
      </div>

      {/* Center: Navigation Links */}
      <nav className="hidden md:flex items-center justify-center w-2/4 gap-12">
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
      <div className="flex items-center justify-end w-1/4 gap-4">
        <button 
          onClick={toggleTheme} 
          className="text-gray-500 hover:text-orange-500 transition-colors" 
          aria-label="Toggle theme"
        >
          {darkMode ? <SunMedium size={20} /> : <MoonStar size={20} />}
        </button>

        <Link 
          to="/login" 
          className="hidden md:flex items-center gap-2 text-xs font-bold tracking-[0.1em] text-white bg-gray-900 dark:bg-white dark:text-gray-900 px-6 py-2.5 rounded-full hover:bg-orange-500 dark:hover:bg-orange-500 dark:hover:text-white transition-all group"
        >
          PORTAL
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </header>
  );
};

export default TopNav;
