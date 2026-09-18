import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, MapPin, Clock, ArrowRight, Search, Building2 } from 'lucide-react';
import { subscribeToPublicJobs } from '../services/hirezoneData';
import TopNav from '../components/TopNav';

const CareersPage = () => {
  const [jobs, setJobs] = useState([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeToPublicJobs((allJobs) => {
      setJobs(allJobs);
      setIsLoading(false);
    });
    return unsub;
  }, []);

  const filtered = jobs.filter((j) =>
    j.title.toLowerCase().includes(search.toLowerCase()) ||
    (j.department || j.type || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="landing-shell min-h-screen relative font-sans selection:bg-orange-500/30 selection:text-orange-900 dark:selection:text-orange-100 pb-32">
      <TopNav />

      {/* Hero */}
      <header className="relative z-10 w-full flex flex-col items-center text-center pt-24 px-6 max-w-[1400px] mx-auto">
        <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-orange-50 dark:bg-orange-500/10 border border-orange-200/50 dark:border-orange-500/20 text-sm font-semibold text-orange-600 dark:text-orange-400 mb-6 backdrop-blur-md">
          <Building2 size={16} />
          <span>ALTRIUM — OPEN POSITIONS</span>
        </div>
        <h1 className="text-[clamp(3rem,8vw,5rem)] font-extrabold tracking-tighter text-[var(--text-headers)] leading-[1.05] max-w-4xl">
          Build Your Career <br className="hidden md:block"/>
          <span className="text-orange-500 bg-clip-text text-transparent bg-gradient-to-r from-orange-500 to-amber-400">at ALTRIUM.</span>
        </h1>
        <p className="text-lg md:text-2xl text-[var(--text-muted)] max-w-3xl mt-6 leading-relaxed font-medium">
          Explore open roles and apply directly. Our AI-powered system ensures a fair, fast screening process.
        </p>

        {/* Search bar */}
        <div className="w-full max-w-2xl mx-auto mt-12 relative group">
          <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by role or department…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-full py-5 pl-14 pr-8 text-[var(--text-headers)] text-lg outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 transition-all shadow-xl shadow-black/5"
          />
        </div>
      </header>

      {/* Job grid */}
      <main className="relative z-10 max-w-[1400px] mx-auto mt-24 px-6">
        {isLoading ? (
          <div className="text-center text-[var(--text-muted)] py-20 text-lg font-medium">Loading open positions…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-[var(--text-muted)] py-20 text-lg font-medium border border-dashed border-[var(--border-color)] rounded-[2.5rem]">
            {search ? 'No roles match your search.' : 'No open positions at the moment. Check back soon!'}
          </div>
        ) : (
          <div className="grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((job) => (
              <div key={job.id} className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[2.5rem] p-8 flex flex-col hover:shadow-2xl hover:shadow-orange-500/5 hover:-translate-y-1 transition-all duration-300">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-full px-4 py-1.5 mb-6">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-widest uppercase">Open</span>
                  </div>
                  <h2 className="text-2xl font-bold text-[var(--text-headers)] mb-4 tracking-tight">{job.title}</h2>
                  <div className="flex gap-4 mb-6 flex-wrap">
                    <span className="flex items-center gap-2 text-[var(--text-muted)] text-sm font-medium">
                      <Briefcase size={16} /> {job.department || job.type || 'General'}
                    </span>
                    <span className="flex items-center gap-2 text-[var(--text-muted)] text-sm font-medium">
                      <MapPin size={16} /> {job.location || 'Remote'}
                    </span>
                  </div>
                  {job.expiresAt && (
                    <span className="flex items-center gap-2 text-gray-400 text-sm mb-4">
                      <Clock size={14} /> Closes {new Date(job.expiresAt).toLocaleDateString()}
                    </span>
                  )}
                  <p className="text-[var(--text-muted)] text-sm mb-8 font-medium">
                    {job.stages?.length || 0} interview stage{job.stages?.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <Link to={`/apply/${job.id}`} className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl py-4 text-white font-bold hover:scale-[1.02] transition-transform shadow-lg shadow-orange-500/20">
                  Apply Now <ArrowRight size={18} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default CareersPage;
