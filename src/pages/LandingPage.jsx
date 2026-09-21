import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, BarChart3, ShieldCheck, Sparkles, Zap, Globe2, Users, Search } from 'lucide-react';
import TopNav from '../components/TopNav';

const allFeatures = [
  { id: 1, category: 'RECRUITING', title: 'Global Reach', text: 'Source top talent from anywhere in the world.', image: '/feature_global.jpg' },
  { id: 2, category: 'AI', title: 'Lightning Fast', text: 'Accelerate your time-to-hire by up to 50% with AI.', image: '/feature_fast.jpg' },
  { id: 3, category: 'ANALYTICS', title: 'Data Driven', text: 'Make informed decisions with real-time analytics.', image: '/feature_data.jpg' },
  { id: 4, category: 'SECURITY', title: 'Enterprise Security', text: 'Candidate data is protected with enterprise encryption.', image: '/feature_security.jpg' },
  { id: 5, category: 'RECRUITING', title: 'Smart Matching', text: 'Find the perfect fit based on skills and culture.', image: '/feature_match.jpg' },
  { id: 6, category: 'ANALYTICS', title: 'Team Insights', text: 'Track team performance and recruitment KPIs.', image: '/feature_team.jpg' },
];

const categories = ['SHOW ALL', 'RECRUITING', 'AI', 'ANALYTICS', 'SECURITY'];

const LandingPage = () => {
  const [activeFilter, setActiveFilter] = useState('SHOW ALL');

  const filteredFeatures = activeFilter === 'SHOW ALL' 
    ? allFeatures 
    : allFeatures.filter(f => f.category === activeFilter);

  return (
    <div className="landing-shell relative min-h-screen font-sans bg-[#fbfbfc] dark:bg-[#050505] text-gray-900 dark:text-gray-100 transition-colors selection:bg-orange-500/30">
      
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 z-0 opacity-50 dark:opacity-20 pointer-events-none bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10">
        <TopNav />

        {/* Hero Section */}
        <section className="relative w-full min-h-[75vh] flex flex-col items-center justify-center text-center px-6">
          <h1 className="text-[clamp(4rem,10vw,8rem)] font-extrabold tracking-tight leading-[0.95] max-w-6xl text-orange-500">
            Recruit & hire.
          </h1>
          
          {/* Scroll Indicator */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce text-gray-400 hover:text-orange-500 transition-colors cursor-pointer" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}>
            <ChevronDown size={32} strokeWidth={1.5} />
          </div>
        </section>

        {/* Content Section */}
        <section className="w-full max-w-[1600px] mx-auto px-8 pb-32">
          
          {/* Filter Menu */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-6 md:gap-10 mb-16 text-xs font-bold tracking-[0.15em] text-gray-400 dark:text-gray-600">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`transition-colors hover:text-orange-500 ${
                  activeFilter === cat ? 'text-gray-900 dark:text-white' : ''
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Masonry / Grid of Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredFeatures.map((feature) => (
              <div 
                key={feature.id} 
                className="group relative flex flex-col bg-white dark:bg-[#0a0a0a] transition-all duration-500 hover:-translate-y-2 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-orange-500/10 border border-gray-100 dark:border-gray-900 overflow-hidden rounded-[2rem]"
              >
                {/* Image Section */}
                <div className="w-full aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img 
                    src={feature.image} 
                    alt={feature.title} 
                    className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                
                {/* Content Section */}
                <div className="relative z-10 flex flex-col p-10 bg-white dark:bg-[#0a0a0a]">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-transparent group-hover:bg-orange-500 transition-colors duration-300" />
                  <p className="text-xs font-bold tracking-[0.2em] text-gray-400 mb-3 uppercase">{feature.category}</p>
                  <h3 className="text-2xl font-bold tracking-tight mb-3 group-hover:text-orange-500 transition-colors duration-300">{feature.title}</h3>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {feature.text}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
        </section>
      </div>
    </div>
  );
};

export default LandingPage;