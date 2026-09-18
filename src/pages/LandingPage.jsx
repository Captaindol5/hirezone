import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, ShieldCheck, Sparkles, Zap, Globe2 } from 'lucide-react';
import TopNav from '../components/TopNav';

const features = [
  { title: 'Global Reach', text: 'Source top talent from anywhere in the world with borderless recruitment.', icon: Globe2, color: 'text-orange-500' },
  { title: 'Lightning Fast', text: 'Accelerate your time-to-hire by up to 50% with AI-driven screening.', icon: Zap, color: 'text-orange-500' },
  { title: 'Data Driven', text: 'Make informed decisions with real-time analytics and predictive models.', icon: BarChart3, color: 'text-orange-500' },
  { title: 'Enterprise Security', text: 'Your candidate data is protected with enterprise-level encryption protocols.', icon: ShieldCheck, color: 'text-orange-500' },
];

const LandingPage = () => {
  return (
    <div className="landing-shell relative min-h-screen font-sans selection:bg-orange-500/30 selection:text-orange-900 dark:selection:text-orange-100">
      <TopNav />

      {/* Main Content */}
      <main className="relative z-10 w-full flex flex-col items-center pb-32">
        {/* Hero Section */}
        <section className="w-full flex flex-col items-center text-center pt-28 md:pt-40 px-6">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-orange-50 dark:bg-orange-500/10 border border-orange-200/50 dark:border-orange-500/20 text-sm font-semibold text-orange-600 dark:text-orange-400 mb-8 backdrop-blur-md">
            <Sparkles size={16} />
            <span>Next Generation Platform</span>
          </div>
          
          <h1 className="text-[clamp(3rem,8vw,5.5rem)] font-extrabold tracking-tighter text-[var(--text-headers)] leading-[1.05] max-w-5xl">
            Recruit the top <span className="text-orange-500 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-400">1% talent.</span>
            <br className="hidden md:block"/> Faster than ever.
          </h1>
          
          <p className="text-lg md:text-2xl text-[var(--text-muted)] max-w-3xl mt-8 leading-relaxed font-medium">
            Unleash the power of intelligent recruiting. Streamline your entire hiring pipeline from sourcing to offer with unprecedented visibility.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-5 mt-12">
            <Link to="/login" className="px-10 py-5 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg shadow-2xl shadow-orange-500/30 transition-transform hover:scale-105 flex items-center gap-2">
              Start Building Your Team
              <ArrowRight size={20} />
            </Link>
            <Link to="/features" className="px-10 py-5 rounded-full bg-black/5 dark:bg-white/5 border border-[var(--border-color)] text-[var(--text-headers)] font-semibold text-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors backdrop-blur-md">
              Explore the Platform
            </Link>
          </div>
        </section>

        {/* Hero Image / Mockup */}
        <section className="w-full max-w-[1400px] mx-auto px-6 mt-32 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--bg-primary)] z-10 bottom-0 h-40 pointer-events-none translate-y-4" />
          <div className="relative rounded-[2rem] border border-[var(--border-color)] overflow-hidden shadow-2xl shadow-orange-500/10 group bg-[var(--bg-secondary)]">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-purple-500/5 pointer-events-none" />
            
            {/* Window Controls */}
            <div className="absolute top-0 left-0 right-0 h-14 bg-white/40 dark:bg-black/40 backdrop-blur-xl border-b border-[var(--border-color)] flex items-center px-6 z-20">
              <div className="flex gap-2">
                <div className="w-3.5 h-3.5 rounded-full bg-red-400 border border-red-500/20" />
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-amber-500/20" />
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-400 border border-emerald-500/20" />
              </div>
            </div>

            {/* Generated Mockup Image */}
            <img 
              src="/hero-mockup.jpg" 
              alt="HireZone Platform Dashboard" 
              className="w-full h-auto object-cover transform transition-transform duration-700 group-hover:scale-[1.02] pt-14"
            />
          </div>
        </section>

        {/* Features Grid */}
        <section className="w-full max-w-[1400px] mx-auto px-6 mt-40">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--text-headers)]">Designed for modern teams.</h2>
            <p className="text-[var(--text-muted)] text-xl font-medium max-w-2xl mx-auto">
              Everything you need to hire at scale, built into a seamless experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map(({ title, text, icon: Icon, color }) => (
              <div key={title} className="p-8 rounded-[2rem] bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:shadow-2xl hover:shadow-orange-500/5 transition-all duration-300 group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-10 transform translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-500">
                  <Icon size={120} className={color} />
                </div>
                
                <div className={`w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mb-8 relative z-10 ${color}`}>
                  <Icon size={26} strokeWidth={2.5} />
                </div>
                <h3 className="text-xl font-bold text-[var(--text-headers)] mb-3 relative z-10">{title}</h3>
                <p className="text-[var(--text-muted)] leading-relaxed font-medium relative z-10">{text}</p>
              </div>
            ))}
          </div>
        </section>

      </main>
    </div>
  );
};

export default LandingPage;