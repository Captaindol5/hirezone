import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import PortalLayout from '../../components/PortalLayout';
import LoadingState from '../../components/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { subscribeToJobs } from '../../services/hirezoneData';

const CandidatePortal = () => {
  const { currentUser, userName, userProfileId } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const currentUserEmail = currentUser?.email?.toLowerCase() || '';

  useEffect(() => {
    const unsubscribe = subscribeToJobs((latestJobs) => {
      setJobs(latestJobs);
      setIsLoading(false);
      setError('');
    });

    return () => unsubscribe();
  }, []);

  const candidate = useMemo(() => {
    if (!jobs.length) return null;

    const found = jobs.flatMap((job) => job?.candidates || []).find((person) => {
      if (!person) return false;
      const personEmail = String(person.email || '').toLowerCase();
      const personName = String(person.name || '').toLowerCase();
      const userN = String(userName || '').toLowerCase();
      
      const isEmailMatch = Boolean(person.email && currentUserEmail && personEmail === currentUserEmail);
      const isNameMatch = Boolean(person.name && userName && personName === userN);
      return person.id === userProfileId || isEmailMatch || isNameMatch;
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
  }, [currentUserEmail, jobs, userName, userProfileId]);

  const pipelineStages = useMemo(() => {
    if (!candidate || !candidate.jobStages) {
      return [];
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
          <div className="mb-5 flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Current role</p>
              <h2 className="mt-1 text-2xl font-bold text-[var(--text-headers)]">{candidate?.jobTitle || 'No active role found'}</h2>
              {candidate && (
                <p className="mt-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                  Active Stage: <span className="font-bold text-indigo-600 dark:text-indigo-400">{candidate.stageName}</span>
                </p>
              )}
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">Status: {candidate ? candidate.status : 'Pending'}</span>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--text-headers)]">Application pipeline</span>
                <span className="text-xs text-[var(--text-muted)]">{candidate ? 'Live status' : 'Waiting for matching record'}</span>
              </div>

              {pipelineStages.length > 0 ? (
                <div className="relative mt-8 mb-4 px-4 md:px-8">
                  <div className="relative flex items-center justify-between">
                    {/* Background Track */}
                    <div className="absolute left-0 top-5 h-1.5 w-full -translate-y-1/2 rounded-full bg-slate-200 dark:bg-slate-700/60" />
                    
                    {/* Progress Track */}
                    <div 
                      className={`absolute left-0 top-5 h-1.5 -translate-y-1/2 rounded-full transition-all duration-700 ${candidate?.status === 'Failed' ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ 
                        width: `${(pipelineStages.findIndex(s => s.status === 'active' || s.status === 'failed') !== -1 
                          ? pipelineStages.findIndex(s => s.status === 'active' || s.status === 'failed') 
                          : pipelineStages.length - 1) / (pipelineStages.length - 1 || 1) * 100}%` 
                      }}
                    />

                    {/* Nodes */}
                    {pipelineStages.map((stage, index) => {
                      const isDone = stage.status === 'done';
                      const isActive = stage.status === 'active';
                      const isFailed = stage.status === 'failed';
                      
                      return (
                        <div key={index} className="relative z-10 flex flex-col items-center">
                          <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full border-[3px] bg-white transition-all duration-300 dark:bg-slate-900 ${
                            isDone ? 'border-emerald-500 text-emerald-500 shadow-md shadow-emerald-500/20' :
                            isActive ? 'border-amber-500 bg-amber-50 text-amber-600 shadow-md shadow-amber-500/20 dark:border-amber-500/80 dark:bg-amber-900/30 dark:text-amber-400' :
                            isFailed ? 'border-red-500 bg-red-50 text-red-600 shadow-md shadow-red-500/20 dark:border-red-500/80 dark:bg-red-900/30 dark:text-red-400' :
                            'border-slate-200 text-slate-400 dark:border-slate-700 dark:text-slate-500'
                          }`}>
                            {isDone ? <CheckCircle2 size={18} strokeWidth={3} /> : <span className="text-sm font-bold">{index + 1}</span>}
                          </div>
                          
                          <div className="absolute top-14 left-1/2 w-24 -ml-12 text-center">
                            <div className={`text-[10px] font-bold uppercase tracking-wider ${
                              isDone ? 'text-emerald-600 dark:text-emerald-400' :
                              isActive ? 'text-amber-600 dark:text-amber-400' :
                              isFailed ? 'text-red-600 dark:text-red-400' :
                              'text-slate-400 dark:text-slate-500'
                            }`}>{stage.name}</div>
                            <div className="mt-0.5 text-[9px] font-semibold text-slate-400 opacity-80">
                              {isDone ? 'Completed' : isActive ? 'In Progress' : isFailed ? 'Failed' : 'Pending'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="h-16" /> {/* Spacer for absolute text */}
                </div>
              ) : (
                <div className="py-10 text-center text-sm font-semibold text-[var(--text-muted)]">
                  No active application pipeline found for your account.
                </div>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-1">
              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-headers)]">Latest Interviewer Feedback</p>
                    <h3 className="mt-1 text-lg font-bold text-[var(--text-headers)]">
                      {candidate?.status === 'Failed' 
                        ? `Not moving forward` 
                        : candidate?.status === 'Hired' 
                          ? 'Congratulations! You are Hired!' 
                          : candidate?.hasSubmittedFeedback 
                            ? 'Feedback Published' 
                            : 'Pending Review'}
                    </h3>
                  </div>
                  {candidate?.score > 0 && (
                    <div className="text-right">
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Score</p>
                      <p className="text-3xl font-black text-indigo-600">{candidate.score}<span className="text-base font-semibold text-slate-400">/10</span></p>
                    </div>
                  )}
                </div>
                
                <div className="mt-5 rounded-xl border border-[var(--border-color)] bg-white p-4 text-sm text-[var(--text-muted)] shadow-sm dark:bg-slate-800">
                  {candidate?.status === 'Failed' && !candidate?.feedback && (
                    <p>Unfortunately, we will not be moving forward with your application at this time.</p>
                  )}
                  {candidate?.status === 'Hired' && !candidate?.feedback && (
                    <p>Welcome to the team! Our HR department will reach out with next steps.</p>
                  )}
                  {candidate?.feedback ? (
                    <div>
                      <p className="italic text-[var(--text-headers)]">"{candidate.feedback}"</p>
                    </div>
                  ) : (
                    (!candidate?.status || candidate.status === 'Applied' || candidate.status === 'Pending') && (
                      <p>No reviewer feedback has been published for your current stage yet. Check back soon!</p>
                    )
                  )}
                </div>
              </div>

              {Array.isArray(candidate?.feedbackHistory) && candidate.feedbackHistory.length > 0 && (
                <div className="mt-2 space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">Previous Stages</h3>
                  {candidate.feedbackHistory.map((hist, idx) => (
                    <div key={idx} className="rounded-2xl border border-[var(--border-color)] bg-white/50 p-5 shadow-sm dark:bg-slate-900/40">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">Stage: {hist.stageName}</p>
                          <h4 className="text-base font-bold text-[var(--text-headers)]">Completed</h4>
                        </div>
                        {hist.score > 0 && (
                          <div className="text-right">
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Score</p>
                            <p className="text-xl font-black text-indigo-600">{hist.score}<span className="text-xs text-slate-400">/10</span></p>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 text-sm italic text-[var(--text-muted)]">
                        "{hist.feedback}"
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-[var(--border-color)] bg-white/70 p-5 shadow-[var(--shadow-soft)] dark:bg-slate-900/80">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Transparency</p>
            <div className="mt-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 text-sm text-[var(--text-muted)]">
              Your performance score and interviewer feedback for your active stage are shared here for full transparency. Internal salary conversations remain private.
            </div>
          </div>
        </aside>
      </div>
    </PortalLayout>
  );
};

export default CandidatePortal;