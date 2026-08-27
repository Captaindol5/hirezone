import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Clock3, Users2 } from 'lucide-react';
import PortalLayout from '../../components/PortalLayout';
import LoadingState from '../../components/LoadingState';
import { subscribeToJobs } from '../../services/hirezoneData';

const ManagerAnalyticsPortal = () => {
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToJobs((latestJobs) => {
      setJobs(latestJobs);
      setIsLoading(false);
      setError('');
    });

    return () => unsubscribe();
  }, []);

  const stageSummary = useMemo(
    () =>
      jobs.flatMap((job) =>
        job.stages.map((stage) => ({
          stageName: stage.name,
          count: job.candidates.filter((candidate) => candidate.stage === stage.id).length,
        }))
      ),
    [jobs]
  );

  const totalCandidates = jobs.reduce((count, job) => count + job.candidates.length, 0);
  const metrics = [
    { label: 'Avg time to hire', value: '14 days', icon: Clock3 },
    { label: 'Live candidates', value: totalCandidates.toString(), icon: Users2 },
    { label: 'Offer acceptance', value: '88%', icon: BarChart3 },
  ];

  if (isLoading) {
    return (
      <PortalLayout title="Executive Manager" subtitle="Loading analytics..." profileName="Executive Team">
        <LoadingState title="Loading analytics" message="Gathering pipeline metrics from the database..." />
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Executive Manager" subtitle="Read-only hiring analytics across roles and stages." profileName="Executive Team">
      {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-200">{error}</div>}
      <div className="space-y-6">
        <section className="grid gap-4 md:grid-cols-3">
          {metrics.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-3xl border border-[var(--border-color)] bg-white/70 p-5 shadow-[var(--shadow-soft)] dark:bg-slate-900/80">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-400">
                <Icon size={18} />
              </div>
              <p className="text-sm text-[var(--text-muted)]">{label}</p>
              <h3 className="mt-2 text-3xl font-bold text-[var(--text-headers)]">{value}</h3>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-[var(--border-color)] bg-white/70 p-5 shadow-[var(--shadow-soft)] dark:bg-slate-900/80">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Stage overview</p>
              <h2 className="mt-1 text-2xl font-bold text-[var(--text-headers)]">Candidate movement</h2>
            </div>

            <div className="space-y-4">
              {stageSummary.map(({ stageName, count }) => (
                <div key={stageName}>
                  <div className="mb-1 flex items-center justify-between text-sm text-[var(--text-headers)]">
                    <span>{stageName}</span>
                    <span>{count}</span>
                  </div>
                  <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700">
                    <div className="h-full rounded-full bg-orange-500" style={{ width: `${Math.min(count * 30, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-[var(--border-color)] bg-white/70 p-5 shadow-[var(--shadow-soft)] dark:bg-slate-900/80">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Current pipeline</p>
              <h2 className="mt-1 text-2xl font-bold text-[var(--text-headers)]">Who is where</h2>
            </div>

            <div className="space-y-3">
              {jobs.flatMap((job) =>
                job.candidates.map((candidate) => {
                  const stageName = job.stages.find((stage) => stage.id === candidate.stage)?.name || 'Unassigned';
                  return (
                    <div key={candidate.id} className="flex items-center justify-between rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3">
                      <div>
                        <p className="font-semibold text-[var(--text-headers)]">{candidate.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{job.title}</p>
                      </div>
                      <span className="rounded-full bg-sky-500/10 px-2.5 py-1 text-[10px] font-semibold text-sky-600">{stageName}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>
      </div>
    </PortalLayout>
  );
};

export default ManagerAnalyticsPortal;