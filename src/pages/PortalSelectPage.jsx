import { Link } from 'react-router-dom';
import { ArrowRight, BriefcaseBusiness, Building2, Gauge, UserRound } from 'lucide-react';

const portalOptions = [
  {
    key: 'candidate',
    title: 'Candidate',
    subtitle: 'Track your application and interview progress',
    path: '/login/candidate',
    icon: UserRound,
  },
  {
    key: 'hr',
    title: 'HR / Hiring Manager',
    subtitle: 'Post roles, manage pipelines, and approve hires',
    path: '/login/hr',
    icon: BriefcaseBusiness,
  },
  {
    key: 'interviewer',
    title: 'Interviewer',
    subtitle: 'Review candidates with structured blind scoring',
    path: '/login/interviewer',
    icon: Building2,
  },
  {
    key: 'manager',
    title: 'Executive Manager',
    subtitle: 'Monitor hiring performance and bottlenecks',
    path: '/login/manager',
    icon: Gauge,
  },
];

const PortalSelectPage = () => {
  return (
    <div className="portal-shell">
      <div className="portal-card max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-4">
            <img src="/logo.png" alt="HireZone Logo" className="h-16 md:h-20 object-contain self-start dark:hidden" />
            <img src="/logo-dark.png" alt="HireZone Logo" className="h-16 md:h-20 object-contain self-start hidden dark:block" />
            <div>
              <p className="eyebrow">Access portal</p>
              <h1 className="page-title">Choose your workspace</h1>
            </div>
          </div>
          <Link to="/" className="secondary-btn">Back home</Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {portalOptions.map(({ key, title, subtitle, path, icon: Icon }) => (
            <Link
              key={key}
              to={path}
              className="group relative overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-orange-900/20"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500 text-white shadow-lg shadow-orange-500/20">
                <Icon size={22} />
              </div>
              <h2 className="text-xl font-semibold text-[var(--text-headers)]">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">{subtitle}</p>
              <div className="mt-6 flex items-center justify-between border-t border-[var(--border-color)] pt-4">
                <span className="text-sm font-medium text-[var(--text-muted)]">Open login</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--bg-tertiary)] text-[var(--text-headers)] transition group-hover:translate-x-1 group-hover:bg-orange-500 group-hover:text-white">
                  <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PortalSelectPage;
