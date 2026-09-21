import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown } from 'lucide-react';
import { subscribeToPublicJobs } from '../services/hirezoneData';
import TopNav from '../components/TopNav';

const CareersPage = () => {
  const [jobs, setJobs] = useState([]);
  const [activeFilter, setActiveFilter] = useState('SHOW ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [departments, setDepartments] = useState(['SHOW ALL']);

  useEffect(() => {
    const unsub = subscribeToPublicJobs((allJobs) => {
      setJobs(allJobs);
      setIsLoading(false);
      
      // Extract unique departments
      const deps = new Set(allJobs.map(j => (j.department || 'GENERAL').toUpperCase()));
      setDepartments(['SHOW ALL', ...Array.from(deps)]);
    });
    return unsub;
  }, []);

  const filteredJobs = activeFilter === 'SHOW ALL' 
    ? jobs 
    : jobs.filter(j => (j.department || 'GENERAL').toUpperCase() === activeFilter);

  return (
    <div className="landing-shell min-h-screen relative font-sans bg-[#f7f8fa] dark:bg-[#0a0b0e] text-gray-900 dark:text-gray-100 transition-colors selection:bg-orange-500/30 pb-32">
      <TopNav />

      {/* Hero Section */}
      <section className="relative w-full min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <h1 className="text-[clamp(4rem,10vw,8rem)] font-extrabold tracking-tight leading-[0.95] max-w-6xl text-orange-500">
          Join our team.
        </h1>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce text-gray-400 hover:text-orange-500 transition-colors cursor-pointer" onClick={() => window.scrollTo({ top: window.innerHeight * 0.6, behavior: 'smooth' })}>
          <ChevronDown size={32} strokeWidth={1.5} />
        </div>
      </section>

      {/* Content Section */}
      <section className="w-full max-w-[1600px] mx-auto px-8 mt-12">
        
        {/* Filter Menu */}
        <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 md:gap-10 mb-16 text-xs font-bold tracking-[0.15em] text-gray-400 dark:text-gray-600">
          {departments.map((dept) => (
            <button
              key={dept}
              onClick={() => setActiveFilter(dept)}
              className={`transition-colors hover:text-orange-500 ${
                activeFilter === dept ? 'text-gray-900 dark:text-white' : ''
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        {/* Job Grid */}
        {isLoading ? (
          <div className="text-center text-gray-400 py-20 text-xs font-bold tracking-[0.2em]">LOADING...</div>
        ) : filteredJobs.length === 0 ? (
          <div className="text-center text-gray-400 py-20 text-xs font-bold tracking-[0.2em]">
            NO POSITIONS FOUND.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredJobs.map((job) => (
              <div 
                key={job.id} 
                className="group bg-white dark:bg-[#12141a] flex flex-col p-10 transition-transform hover:-translate-y-2 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 group-hover:bg-orange-500 transition-colors duration-300" />
                
                <div className="flex-1">
                  <p className="text-xs font-bold tracking-[0.15em] text-gray-400 dark:text-gray-500 mb-4 uppercase">
                    {job.department || 'General'}
                  </p>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 mb-6">
                    {job.title}
                  </h2>
                  <div className="flex flex-col gap-2 mb-10">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {job.location || 'Remote'}
                    </span>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {job.type || 'Full-time'}
                    </span>
                  </div>
                </div>
                
                <Link 
                  to={`/apply/${job.id}`} 
                  className="flex items-center gap-2 text-xs font-bold tracking-[0.15em] text-gray-900 dark:text-white group-hover:text-orange-500 transition-colors"
                >
                  APPLY NOW <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default CareersPage;
