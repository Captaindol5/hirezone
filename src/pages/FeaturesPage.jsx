import { Link } from 'react-router-dom';
import { BriefcaseBusiness, Building2, CheckCircle2, ShieldCheck, Sparkles, UserRound, Users, Zap } from 'lucide-react';
import TopNav from '../components/TopNav';

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
  return (
    <div className="landing-shell min-h-screen relative font-sans selection:bg-orange-500/30 selection:text-orange-900 dark:selection:text-orange-100 pb-32">
      <TopNav />

      <main className="relative z-10 max-w-[1400px] mx-auto mt-24 space-y-32 px-6">

        {/* Header Section */}
        <section className="text-center space-y-6 pt-16">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-orange-50 dark:bg-orange-500/10 border border-orange-200/50 dark:border-orange-500/20 text-sm font-semibold text-orange-600 dark:text-orange-400 mb-4 backdrop-blur-md">
            <Sparkles size={16} />
            <span>Everything you need to scale</span>
          </div>
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] font-extrabold tracking-tighter text-[var(--text-headers)] leading-[1.05] max-w-4xl mx-auto">
            Powerful features for <span className="text-orange-500 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-400">modern teams.</span>
          </h1>
          <p className="text-lg md:text-2xl text-[var(--text-muted)] max-w-3xl mx-auto font-medium mt-6">
            From sourcing to onboarding, HireZone brings candidates, HR, interviewers, and executives together on a single, intelligent platform.
          </p>
        </section>

        {/* Who Can Use This Section */}
        <section className="space-y-16">
          <div className="text-center">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[var(--text-headers)]">Who can use HireZone?</h2>
            <p className="text-[var(--text-muted)] mt-4 text-xl font-medium">Tailored experiences for every stakeholder.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {userTypes.map((user, idx) => (
              <div key={idx} className="p-10 rounded-[2.5rem] bg-[var(--bg-secondary)] border border-[var(--border-color)] hover:shadow-2xl hover:shadow-orange-500/5 transition-all duration-300 group">
                <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-900/30 text-orange-500 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  <user.icon size={32} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-[var(--text-headers)] mb-6">{user.title}</h3>
                <ul className="space-y-4">
                  {user.benefits.map((benefit, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-4 text-[var(--text-muted)] font-medium">
                      <CheckCircle2 size={24} className="text-orange-500 shrink-0" />
                      <span className="text-lg leading-relaxed">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Deep Dive Features */}
        <section className="rounded-[3rem] bg-gradient-to-br from-orange-500 to-orange-600 dark:from-orange-900/80 dark:to-orange-950/80 p-12 md:p-20 text-white shadow-2xl shadow-orange-500/20 relative overflow-hidden border border-orange-400/20 max-w-6xl mx-auto">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />

          <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">Bank-Grade Security & Bias Guardrails</h2>
              <p className="text-orange-100/90 text-xl font-medium leading-relaxed">
                HireZone ensures fair hiring practices with built-in bias guardrails that hide sensitive information from interviewers. Coupled with enterprise-level encryption, your data is always safe.
              </p>
              <div className="flex gap-6 pt-4">
                <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-full backdrop-blur-md border border-white/10">
                  <ShieldCheck size={20} className="text-white" />
                  <span className="font-semibold text-white">Encrypted Data</span>
                </div>
                <div className="flex items-center gap-3 bg-white/10 px-5 py-3 rounded-full backdrop-blur-md border border-white/10">
                  <Zap size={20} className="text-white" />
                  <span className="font-semibold text-white">Lightning Fast</span>
                </div>
              </div>
            </div>

            <div className="bg-black/20 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl">
              <div className="space-y-5">
                <div className="h-14 bg-white/10 rounded-2xl animate-pulse" />
                <div className="h-14 bg-white/10 rounded-2xl animate-pulse delay-75" />
                <div className="h-14 bg-white/10 rounded-2xl animate-pulse delay-150" />
                <div className="flex justify-between items-center mt-10 pt-8 border-t border-white/10">
                  <span className="text-sm font-bold text-orange-200/80 uppercase tracking-widest">System Status</span>
                  <span className="px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold tracking-wide">ALL SYSTEMS OPERATIONAL</span>
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
