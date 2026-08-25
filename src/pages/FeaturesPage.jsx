import { Link } from 'react-router-dom';
import { ArrowLeft, BriefcaseBusiness, Building2, CheckCircle2, ShieldCheck, Sparkles, UserRound, Users, Zap } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const userTypes = [
  {
    title: 'Candidates',
    icon: UserRound,
    benefits: [
      'Track every stage from application to offer',
      'Upload and manage documents securely',
      'Transparent status updates in real-time'
    ]
  },
  {
    title: 'HR & Recruiters',
    icon: BriefcaseBusiness,
    benefits: [
      'Manage multiple talent pipelines efficiently',
      'Automated stage progression and notifications',
      'Collaborate with hiring managers effortlessly'
    ]
  },
  {
    title: 'Interviewers',
    icon: Building2,
    benefits: [
      'Blind scoring and bias guardrails',
      'Direct access to structured evaluation forms',
      'Streamlined candidate profiles'
    ]
  },
  {
    title: 'Executive Managers',
    icon: Users,
    benefits: [
      'Live hiring insights and analytics',
      'Identify bottlenecks in the recruitment process',
      'Data-driven decision making'
    ]
  }
];

const FeaturesPage = () => {
  const { darkMode } = useTheme();

  return (
    <div className="landing-shell min-h-screen relative overflow-hidden bg-brand-primary-bg">
      <header className="topbar relative z-10 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="HireZone Logo" className="h-16 md:h-20 object-contain dark:hidden" />
          <img src="/logo-dark.png" alt="HireZone Logo" className="h-16 md:h-20 object-contain hidden dark:block" />
        </div>

        <nav className="nav-actions">
          <Link to="/" className="secondary-btn group !flex !items-center !gap-2">
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to Home
          </Link>
        </nav>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto mt-16 space-y-24 pb-24 px-4 sm:px-6">
        
        {/* Header Section */}
        <section className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-200 dark:bg-orange-500/10 dark:border-orange-500/20 shadow-sm text-sm font-semibold text-orange-600 dark:text-orange-400">
            <Sparkles size={16} />
            <span>Everything you need to scale</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-brand-headers">
            Powerful features for <span className="text-orange-500">modern teams</span>.
          </h1>
          <p className="text-lg md:text-xl text-brand-muted max-w-3xl mx-auto">
            From sourcing to onboarding, HireZone brings candidates, HR, interviewers, and executives together on a single, intelligent platform.
          </p>
        </section>

        {/* Who Can Use This Section */}
        <section className="space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-brand-headers">Who can use HireZone?</h2>
            <p className="text-brand-muted mt-2">Tailored experiences for every stakeholder in the hiring process.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {userTypes.map((user, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-white/60 dark:bg-gray-900/40 border border-brand-border backdrop-blur-md shadow-[var(--shadow-soft)] hover:-translate-y-1 transition-transform duration-300 group">
                <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <user.icon size={28} />
                </div>
                <h3 className="text-2xl font-bold text-brand-headers mb-4">{user.title}</h3>
                <ul className="space-y-3">
                  {user.benefits.map((benefit, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-3 text-brand-muted">
                      <CheckCircle2 size={20} className="text-orange-500 shrink-0 mt-0.5" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Deep Dive Features */}
        <section className="rounded-[3rem] bg-orange-600 dark:bg-orange-900/40 p-12 md:p-16 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold">Bank-Grade Security & Bias Guardrails</h2>
              <p className="text-orange-100/90 dark:text-orange-200/80 text-lg leading-relaxed">
                HireZone ensures fair hiring practices with built-in bias guardrails that hide sensitive information (like salary expectations and peer scores) from interviewers. Coupled with enterprise-level encryption, your data is always safe.
              </p>
              <div className="flex gap-4 pt-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-white" />
                  <span className="font-medium">Encrypted Data</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="text-white" />
                  <span className="font-medium">Lightning Fast</span>
                </div>
              </div>
            </div>
            
            <div className="bg-black/20 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-inner">
              <div className="space-y-4">
                <div className="h-12 bg-white/10 rounded-xl animate-pulse" />
                <div className="h-12 bg-white/10 rounded-xl animate-pulse delay-75" />
                <div className="h-12 bg-white/10 rounded-xl animate-pulse delay-150" />
                <div className="flex justify-between items-center mt-8 pt-6 border-t border-white/10">
                  <span className="text-sm font-semibold text-orange-200 uppercase tracking-wider">System Status</span>
                  <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold">All Systems Operational</span>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
};

export default FeaturesPage;
