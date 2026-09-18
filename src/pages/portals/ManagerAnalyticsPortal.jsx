import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Clock3, TrendingUp, Users2, Award, Briefcase } from 'lucide-react';
import ErrorModal from '../../components/ErrorModal';
import PortalLayout from '../../components/PortalLayout';
import LoadingState from '../../components/LoadingState';
import { subscribeToJobs } from '../../services/hirezoneData';

const ManagerAnalyticsPortal = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeToJobs((latestJobs) => {
      setJobs(latestJobs);
      setIsLoading(false);
      setError('');
    });
    return () => unsubscribe();
  }, []);

  const allCandidates = useMemo(() => jobs.flatMap(j => j.candidates || []), [jobs]);

  const hired = useMemo(() => allCandidates.filter(c => c.status === 'Hired'), [allCandidates]);
  const failed = useMemo(() => allCandidates.filter(c => c.status === 'Failed'), [allCandidates]);
  const active = useMemo(() => allCandidates.filter(c => c.status !== 'Hired' && c.status !== 'Failed'), [allCandidates]);

  // Avg time to hire (in days) — uses hiredAt - createdAt
  const avgTimeToHire = useMemo(() => {
    const withBothTimestamps = hired.filter(c => c.hiredAt && c.createdAt);
    if (!withBothTimestamps.length) return null;
    const avgMs = withBothTimestamps.reduce((sum, c) => sum + (c.hiredAt - c.createdAt), 0) / withBothTimestamps.length;
    return Math.round(avgMs / (1000 * 60 * 60 * 24));
  }, [hired]);

  // Offer acceptance rate = hired / (hired + failed)
  const offerAcceptanceRate = useMemo(() => {
    const total = hired.length + failed.length;
    if (!total) return null;
    return Math.round((hired.length / total) * 100);
  }, [hired, failed]);

  // Hired this month
  const hiredThisMonth = useMemo(() => {
    const now = new Date();
    return hired.filter(c => {
      if (!c.hiredAt) return false;
      const d = new Date(c.hiredAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [hired]);

  // Stage funnel — count candidates per stage name across all jobs
  const stageSummary = useMemo(() =>
    jobs.flatMap((job) =>
      job.stages.map((stage) => ({
        stageName: stage.name,
        jobTitle: job.title,
        count: job.candidates.filter((c) => c.stage === stage.id).length,
      }))
    ),
    [jobs]
  );
  const maxStageCount = Math.max(...stageSummary.map(s => s.count), 1);

  const metrics = [
    {
      label: 'Avg time to hire',
      value: avgTimeToHire !== null ? `${avgTimeToHire}d` : '—',
      sub: avgTimeToHire !== null ? 'from application to offer' : 'Hire candidates to track',
      icon: Clock3,
      color: 'bg-indigo-500/15 text-indigo-600 dark:text-indigo-400',
    },
    {
      label: 'Live candidates',
      value: allCandidates.length.toString(),
      sub: `${active.length} active · ${hired.length} hired · ${failed.length} rejected`,
      icon: Users2,
      color: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
    },
    {
      label: 'Offer acceptance',
      value: offerAcceptanceRate !== null ? `${offerAcceptanceRate}%` : '—',
      sub: offerAcceptanceRate !== null ? `${hired.length} hired of ${hired.length + failed.length} decided` : 'No decisions yet',
      icon: BarChart3,
      color: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
    },
    {
      label: 'Hired this month',
      value: hiredThisMonth.toString(),
      sub: `in ${new Date().toLocaleString('default', { month: 'long' })}`,
      icon: TrendingUp,
      color: 'bg-rose-500/15 text-rose-600 dark:text-rose-400',
    },
  ];

  if (isLoading) {
    return (
      <PortalLayout title="Executive Manager" subtitle="Loading analytics..." profileName="Executive Team">
        <LoadingState title="Loading analytics" message="Gathering pipeline metrics from the database..." />
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Executive Manager" subtitle="Real-time hiring analytics across all roles and stages." profileName="Executive Team">
      {error && <ErrorModal error={error} onClose={() => setError('')} />}
      <div className="space-y-6">

        {/* KPI cards */}
        <section className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(({ label, value, sub, icon: Icon, color }) => (
            <div key={label} className="rounded-[2rem] border border-[var(--border-color)] bg-[var(--bg-secondary)]/60 backdrop-blur-2xl p-6 shadow-2xl shadow-black/5 hover:-translate-y-1 transition-transform">
              <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-2xl ${color}`}>
                <Icon size={18} />
              </div>
              <p className="text-sm text-[var(--text-muted)]">{label}</p>
              <h3 className="mt-1 text-3xl font-bold text-[var(--text-headers)]">{value}</h3>
              <p className="mt-1 text-xs text-[var(--text-muted)]">{sub}</p>
            </div>
          ))}
        </section>

        <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
          {/* Stage funnel */}
          <div className="rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--bg-secondary)]/60 backdrop-blur-2xl p-8 shadow-2xl shadow-black/5">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Stage overview</p>
              <h2 className="mt-1 text-2xl font-bold text-[var(--text-headers)]">Hiring funnel</h2>
            </div>
            {stageSummary.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] py-4">No stages found. Create stages in the HR portal.</p>
            ) : (
              <div className="space-y-4">
                {stageSummary.map(({ stageName, jobTitle, count }, i) => (
                  <div key={i}>
                    <div className="mb-1 flex items-center justify-between text-sm text-[var(--text-headers)]">
                      <div>
                        <span className="font-semibold">{stageName}</span>
                        <span className="ml-2 text-xs text-[var(--text-muted)]">{jobTitle}</span>
                      </div>
                      <span className="font-bold">{count}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
                        style={{ width: `${(count / maxStageCount) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Candidate status list */}
          <div className="rounded-3xl border border-[var(--border-color)] bg-white/70 p-5 shadow-[var(--shadow-soft)] dark:bg-slate-900/80">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Current pipeline</p>
              <h2 className="mt-1 text-2xl font-bold text-[var(--text-headers)]">Who is where</h2>
            </div>
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {allCandidates.length === 0 ? (
                <p className="text-sm text-[var(--text-muted)]">No candidates yet.</p>
              ) : (
                jobs.flatMap((job) =>
                  job.candidates.map((candidate) => {
                    const stageName = job.stages.find((s) => s.id === candidate.stage)?.name || 'Unassigned';
                    const statusColor =
                      candidate.status === 'Hired' ? 'bg-emerald-500/10 text-emerald-600' :
                      candidate.status === 'Failed' ? 'bg-rose-500/10 text-rose-600' :
                      'bg-sky-500/10 text-sky-600';
                    return (
                      <div key={candidate.id} className="flex items-center justify-between rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3">
                        <div>
                          <p className="font-semibold text-[var(--text-headers)]">{candidate.name}</p>
                          <p className="text-xs text-[var(--text-muted)]">{job.title}</p>
                        </div>
                        <div className="text-right">
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusColor}`}>{candidate.status}</span>
                          <p className="mt-1 text-[10px] text-[var(--text-muted)]">{stageName}</p>
                        </div>
                      </div>
                    );
                  })
                )
              )}
            </div>
          </div>
        </section>

        {/* Per-job breakdown */}
        <section className="rounded-3xl border border-[var(--border-color)] bg-white/70 p-5 shadow-[var(--shadow-soft)] dark:bg-slate-900/80">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Jobs breakdown</p>
            <h2 className="mt-1 text-2xl font-bold text-[var(--text-headers)]">Per-role summary</h2>
          </div>
          {jobs.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No jobs found.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {jobs.map(job => {
                const jHired = job.candidates.filter(c => c.status === 'Hired').length;
                const jFailed = job.candidates.filter(c => c.status === 'Failed').length;
                const jActive = job.candidates.filter(c => c.status !== 'Hired' && c.status !== 'Failed').length;
                return (
                  <div key={job.id} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/15 text-orange-600">
                        <Briefcase size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-[var(--text-headers)] truncate">{job.title}</p>
                        <p className="text-xs text-[var(--text-muted)]">{job.candidates.length} candidates total</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl bg-white p-2 dark:bg-slate-800">
                        <p className="text-[10px] text-slate-500">Active</p>
                        <p className="font-bold text-indigo-600">{jActive}</p>
                      </div>
                      <div className="rounded-xl bg-white p-2 dark:bg-slate-800">
                        <p className="text-[10px] text-slate-500">Hired</p>
                        <p className="font-bold text-emerald-600">{jHired}</p>
                      </div>
                      <div className="rounded-xl bg-white p-2 dark:bg-slate-800">
                        <p className="text-[10px] text-slate-500">Rejected</p>
                        <p className="font-bold text-rose-600">{jFailed}</p>
                      </div>
                    </div>
                    {job.stages.length > 0 && (
                      <div className="mt-3 flex items-center gap-1 flex-wrap">
                        <Award size={11} className="text-slate-400" />
                        {job.stages.map(s => (
                          <span key={s.id} className="text-[10px] text-slate-500">{s.name}</span>
                        )).reduce((acc, el, i) => i === 0 ? [el] : [...acc, <span key={`sep-${i}`} className="text-[10px] text-slate-300">→</span>, el], [])}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </PortalLayout>
  );
};

export default ManagerAnalyticsPortal;