import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, FileText, Landmark, Sparkles } from 'lucide-react';
import PortalLayout from '../../components/PortalLayout';
import LoadingState from '../../components/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { fetchJobs } from '../../services/hirezoneData';

const CandidatePortal = () => {
  const { userName, userProfileId } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setIsLoading(true);
        const nextJobs = await fetchJobs();
        setJobs(nextJobs);
        setError('');
      } catch (loadError) {
        console.error('Failed to load candidate data:', loadError);
        setError('The candidate dashboard could not load. Check Firebase Firestore and permissions.');
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  const candidate = useMemo(() => {
    if (!jobs.length) return null;

    const found = jobs.flatMap((job) => job.candidates).find((person) => {
      return person.id === userProfileId || person.name === userName;
    });

    if (found) {
      const job = jobs.find((entry) => entry.candidates.some((item) => item.id === found.id));
      return { 
        ...found, 
        jobTitle: job?.title || 'Current role', 
        stageName: job?.stages.find((stage) => stage.id === found.stage)?.name || found.stage,
        jobStages: job?.stages || []
      };
    }

    return null;
  }, [jobs, userName, userProfileId]);

  const pipelineStages = useMemo(() => {
    if (!candidate || !candidate.jobStages) {
      return [
        { name: 'Applied', status: 'done' },
        { name: 'Review', status: 'active' },
        { name: 'Interview', status: 'upcoming' },
        { name: 'Offer', status: 'upcoming' },
      ];
    }

    const stages = [{ name: 'Applied', status: 'done' }];
    let isPastCurrent = false;

    candidate.jobStages.forEach(stage => {
      let status = 'upcoming';

      if (candidate.status === 'Hired') {
        status = 'done';
      } else if (candidate.status === 'Failed') {
        if (stage.id === candidate.stage) {
          status = 'failed';
          isPastCurrent = true;
        } else if (isPastCurrent) {
          status = 'upcoming'; // Just gray them out
        } else {
          status = 'done';
        }
      } else {
        if (stage.id === candidate.stage) {
          status = 'active';
          isPastCurrent = true;
        } else if (!isPastCurrent) {
          status = 'done';
        }
      }

      stages.push({ name: stage.name, status });
    });

    return stages;
  }, [candidate]);

  if (isLoading) {
    return (
      <PortalLayout title="Candidate Portal" subtitle="Loading your application status..." profileName={userName || 'Candidate'}>
        <LoadingState title="Loading candidate portal" message="Fetching your application data from the database..." />
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Candidate Portal" subtitle="Track your application and interview progress." profileName={userName || 'Candidate'}>
      {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-200">{error}</div>}
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-3xl border border-[var(--border-color)] bg-white/70 p-5 shadow-[var(--shadow-soft)] dark:bg-slate-900/80">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Current role</p>
              <h2 className="mt-1 text-2xl font-bold text-[var(--text-headers)]">{candidate?.jobTitle || 'No active role found'}</h2>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">Status: {candidate ? candidate.status : 'Pending'}</span>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--text-headers)]">Application pipeline</span>
                <span className="text-xs text-[var(--text-muted)]">{candidate ? 'Live status' : 'Waiting for matching record'}</span>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                {pipelineStages.map((stage, index) => (
                  <div key={`${stage.name}-${index}`} className="relative flex flex-col items-center text-center">
                    <div className={`mb-2 flex h-10 w-10 items-center justify-center rounded-full border-2 ${
                      stage.status === 'done'
                        ? 'border-emerald-500 bg-emerald-500 text-white'
                        : stage.status === 'active'
                          ? 'border-amber-500 bg-amber-500 text-white'
                          : stage.status === 'failed'
                            ? 'border-red-500 bg-red-500 text-white'
                            : 'border-slate-200 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {stage.status === 'done' ? <CheckCircle2 size={18} /> : index + 1}
                    </div>
                    <span className="text-xs font-medium text-[var(--text-headers)]">{stage.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-1">
              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                <p className="text-sm font-semibold text-[var(--text-headers)]">Feedback</p>
                <h3 className="mt-2 text-xl font-bold text-[var(--text-headers)]">
                  {candidate?.status === 'Failed' 
                    ? `Unsuccessful at ${candidate?.stageName || 'this'} stage` 
                    : candidate?.status === 'Hired' 
                      ? 'Congratulations! You are Hired!' 
                      : candidate?.hasSubmittedFeedback 
                        ? 'Available' 
                        : 'Pending'}
                </h3>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  {candidate?.status === 'Failed' 
                    ? 'Unfortunately, we will not be moving forward with your application at this time.' 
                    : candidate?.status === 'Hired'
                      ? 'Welcome to the team! Our HR department will reach out with next steps.'
                      : candidate?.feedback || 'No reviewer feedback has been published yet.'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <aside className="space-y-6">


          <div className="rounded-3xl border border-[var(--border-color)] bg-white/70 p-5 shadow-[var(--shadow-soft)] dark:bg-slate-900/80">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Privacy</p>
            <div className="mt-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 text-sm text-[var(--text-muted)]">
              Sensitive internal feedback, salary conversations, and interviewer scoring remain hidden from your candidate view.
            </div>
          </div>
        </aside>
      </div>
    </PortalLayout>
  );
};

export default CandidatePortal;