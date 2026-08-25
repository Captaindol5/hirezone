import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, ShieldCheck, Sparkles, Zap, MoonStar, SunMedium, Globe2 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const features = [
  { title: 'Global Reach', text: 'Source top talent from anywhere in the world with borderless recruitment.', icon: Globe2, color: 'text-orange-500' },
  { title: 'Lightning Fast', text: 'Accelerate your time-to-hire by up to 50% with AI-driven screening.', icon: Zap, color: 'text-orange-500' },
  { title: 'Data Driven', text: 'Make informed decisions with real-time analytics and predictive models.', icon: BarChart3, color: 'text-orange-500' },
  { title: 'Bank-grade Security', text: 'Your candidate data is protected with enterprise-level encryption protocols.', icon: ShieldCheck, color: 'text-orange-500' },
];

const LandingPage = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <div className="landing-shell overflow-hidden relative min-h-screen">
      <header className="topbar relative z-10">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="HireZone Logo" className="h-16 md:h-20 object-contain dark:hidden" />
          <img src="/logo-dark.png" alt="HireZone Logo" className="h-16 md:h-20 object-contain hidden dark:block" />
        </div>

        <nav className="nav-actions">
          <button onClick={toggleTheme} className="icon-btn" aria-label="Toggle theme">
            {darkMode ? <SunMedium size={18} /> : <MoonStar size={18} />}
          </button>
          <Link to="/login" className="primary-btn group !flex !items-center !gap-2 bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25 border-none transition-colors">
            Portal Login
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </nav>
      </header>

      <main className="landing-main relative z-10 max-w-6xl mx-auto mt-12 space-y-32 pb-24 !block">
        {/* Hero Section */}
        <section className="text-center space-y-8 flex flex-col items-center justify-center pt-16 mb-32">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20 shadow-sm text-sm font-semibold text-orange-600 dark:text-orange-400">
            <Sparkles size={16} />
            <span>Next Generation Hiring Platform</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-[var(--text-headers)] max-w-4xl mx-auto leading-tight">
            Recruit the top <span className="text-orange-500">1% talent</span> faster than ever.
          </h1>
          
          <p className="text-lg md:text-xl text-[var(--text-muted)] max-w-2xl mx-auto leading-relaxed mt-6">
            Unleash the power of intelligent recruiting. Streamline your entire hiring pipeline from sourcing to offer with unprecedented visibility and speed.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Link to="/login" className="px-8 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg shadow-xl shadow-orange-500/25 hover:scale-105 transition-all duration-300 flex items-center gap-2 group">
              Get Started Now
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/features" className="px-8 py-4 rounded-2xl bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border border-[var(--border-color)] text-[var(--text-headers)] font-bold text-lg hover:bg-white/80 dark:hover:bg-gray-800/80 transition-colors duration-300">
              Discover Features
            </Link>
          </div>

          {/* Abstract Hero Image/Graphic */}
          <div className="w-full max-w-4xl mx-auto mt-24 relative perspective-1000">
            <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] dark:from-[var(--bg-primary)] to-transparent z-10 bottom-0 h-40 pointer-events-none translate-y-4" />
            <div className="rounded-2xl border border-[var(--border-color)] bg-white/50 dark:bg-black/40 backdrop-blur-xl p-4 shadow-2xl overflow-hidden transform hover:-translate-y-2 transition-transform duration-500">
              <div className="flex gap-2 mb-4 px-2">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              </div>
              <div className="grid grid-cols-3 gap-4 h-72">
                <div className="col-span-2 space-y-4">
                  <div className="h-3/5 rounded-xl bg-orange-500/10 border border-[var(--border-color)] animate-pulse" />
                  <div className="h-1/3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] opacity-60" />
                </div>
                <div className="space-y-4">
                  <div className="h-1/3 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] opacity-60" />
                  <div className="h-3/5 rounded-xl bg-orange-500/5 border border-[var(--border-color)]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="space-y-16 mt-32">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold text-[var(--text-headers)]">Why choose HireZone?</h2>
            <p className="text-[var(--text-muted)] max-w-2xl mx-auto text-lg">
              Built for modern teams that demand agility, precision, and collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
            {features.map(({ title, text, icon: Icon, color }) => (
              <div key={title} className="p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-color)] backdrop-blur-md hover:bg-white/90 dark:hover:bg-gray-900/60 transition-all duration-300 group hover:-translate-y-2 shadow-[var(--shadow-soft)] text-center sm:text-left opacity-80">
                <div className={`w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-500/10 shadow-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform mx-auto sm:mx-0 ${color}`}>
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-headers)] mb-3">{title}</h3>
                <p className="text-[var(--text-muted)] leading-relaxed text-sm">{text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="relative rounded-[3rem] overflow-hidden p-16 text-center border border-[var(--border-color)] bg-orange-50 dark:bg-orange-500/10 shadow-2xl mt-32">
           <div className="absolute inset-0 bg-white/30 dark:bg-black/30 backdrop-blur-xl -z-10" />
           <h2 className="text-4xl md:text-5xl font-bold text-[var(--text-headers)] mb-6">Ready to transform your hiring?</h2>
           <p className="text-lg text-[var(--text-muted)] mb-10 max-w-2xl mx-auto">
             Join thousands of forward-thinking companies building their dream teams with HireZone today.
           </p>
           <Link to="/login" className="inline-flex items-center justify-center gap-2 px-10 py-5 rounded-full bg-[var(--text-headers)] text-[var(--bg-primary)] font-bold text-xl hover:scale-105 transition-transform duration-300 shadow-2xl">
             Launch Your Portal
             <Sparkles size={20} />
           </Link>
        </section>
      </main>
    </div>
  );
};

export default LandingPage;