import { useEffect, useState } from 'react';
import { AlertCircle, ChevronRight, FileText, ShieldCheck } from 'lucide-react';
import PortalLayout from '../../components/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { subscribeToInterviewers, subscribeToJobs, submitCandidateFeedback } from '../../services/hirezoneData';

const InterviewerPortal = () => {
  const { userProfileId, currentUser, userName } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submittedCandidateIds, setSubmittedCandidateIds] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLoading(true);
    const unsubJobs = subscribeToJobs((latestJobs) => {
      setJobs(latestJobs);
      setIsLoading(false);
      setError('');
    });
    
    const unsubInterviewers = subscribeToInterviewers((latestInterviewers) => {
      setInterviewers(latestInterviewers);
    });

    return () => {
      unsubJobs();
      unsubInterviewers();
    };
  }, []);

  const loggedInEmail = currentUser?.email?.toLowerCase() || '';
  const loggedInName = userName?.toLowerCase() || '';

  const assignedInterviewer = interviewers.find((person) => {
    if (person.id === userProfileId) return true;
    if (loggedInEmail && person.email?.toLowerCase() === loggedInEmail) return true;
    if (loggedInName && person.name?.toLowerCase() === loggedInName) return true;
    return false;
  }) || interviewers[0] || { name: userName || 'Interviewer', id: userProfileId };

  const activeInterviewerId = assignedInterviewer?.id || userProfileId;

  const assignedCandidates = jobs.flatMap((job) =>
    (job.candidates || [])
      .filter((candidate) => {
        const currentStage = (job.stages || []).find((stage) => stage.id === candidate.stage);
        return currentStage?.interviewer === activeInterviewerId;
      })
      .map((candidate) => ({ 
        ...candidate, 
        jobTitle: job.title, 
        stageLabel: (job.stages || []).find((stage) => stage.id === candidate.stage)?.name || candidate.stage 
      }))
  ).filter(candidate => !submittedCandidateIds.includes(candidate.id));

  const selectedCandidate = assignedCandidates.find((candidate) => candidate.id === selectedCandidateId) || assignedCandidates[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    const job = jobs.find((entry) => entry.candidates.some((candidate) => candidate.id === selectedCandidate.id));
    if (!job) return;

    await submitCandidateFeedback(job.id, selectedCandidate.id, {
      score: Number(score) || 0,
      feedback,
      status: 'Ready',
      hasSubmittedFeedback: true,
    });

    setSubmittedCandidateIds(prev => [...prev, selectedCandidate.id]);
    setSelectedCandidateId('');
    setScore('');
    setFeedback('');
    setSuccessMessage(`Feedback submitted successfully for ${selectedCandidate.name}.`);
    setTimeout(() => setSuccessMessage(''), 5000);
  };

  return (
    <PortalLayout title="Interviewer Portal" subtitle={`Assigned stage: ${assignedInterviewer?.stage || 'Interview stage'}`} profileName={assignedInterviewer?.name || 'Interviewer'}>
      <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-3xl border border-[var(--border-color)] bg-white/70 p-5 shadow-[var(--shadow-soft)] dark:bg-slate-900/80">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Queue</p>
            <h2 className="mt-1 text-xl font-bold text-[var(--text-headers)]">Candidates for review</h2>
          </div>

          <div className="space-y-3">
            {assignedCandidates.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[var(--border-color)] p-4 text-sm text-[var(--text-muted)]">
                No candidate is currently assigned to this stage.
              </div>
            ) : (
              assignedCandidates.map((candidate) => (
                <button
                  key={candidate.id}
                  onClick={() => setSelectedCandidateId(candidate.id)}
                  className={`w-full rounded-2xl border p-3 text-left transition ${selectedCandidate?.id === candidate.id ? 'border-emerald-400 bg-emerald-500/5' : 'border-[var(--border-color)] bg-[var(--bg-secondary)]'}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-[var(--text-headers)]">{candidate.name}</span>
                    <ChevronRight size={15} className="text-[var(--text-muted)]" />
                  </div>
                  <p className="mt-1 text-xs text-[var(--text-muted)]">{candidate.jobTitle}</p>
                </button>
              ))
            )}
          </div>
        </aside>

        <main>
          {successMessage && (
            <div className="mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-emerald-800 flex items-center gap-3 shadow-sm dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-300">
              <ShieldCheck size={20} className="text-emerald-500" />
              <span className="font-medium">{successMessage}</span>
            </div>
          )}

          {selectedCandidate ? (
            <section className="rounded-3xl border border-[var(--border-color)] bg-white/70 p-5 shadow-[var(--shadow-soft)] dark:bg-slate-900/80">
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Candidate profile</p>
                  <h2 className="mt-1 text-2xl font-bold text-[var(--text-headers)]">{selectedCandidate.name}</h2>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
                  <ShieldCheck size={14} />
                  Stage: {selectedCandidate.stageLabel || 'Technical Test'}
                </div>
              </div>

              <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="space-y-4">
                  <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                    <p className="text-sm font-semibold text-[var(--text-headers)]">Profile</p>
                    <ul className="mt-3 space-y-2 text-sm text-[var(--text-muted)]">
                      <li><strong className="text-[var(--text-headers)]">Experience:</strong> 6 years</li>
                      <li><strong className="text-[var(--text-headers)]">Role:</strong> Frontend Engineer</li>
                      <li><strong className="text-[var(--text-headers)]">Location:</strong> Remote</li>
                    </ul>
                  </div>

                  <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                    <p className="text-sm font-semibold text-[var(--text-headers)]">Bias guardrail</p>
                    <div className="mt-2 flex items-start gap-2 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
                      <AlertCircle size={16} className="mt-0.5" />
                      Salary expectations, peer scores, and previous notes are hidden from this reviewer panel.
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                  <div className="mb-4 flex items-center gap-2 text-[var(--text-headers)]">
                    <FileText size={18} />
                    <h3 className="text-lg font-bold">Structured evaluation</h3>
                  </div>

                  <div className="grid gap-4">
                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-[var(--text-headers)]">Score out of 5</span>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        value={score}
                        onChange={(e) => setScore(e.target.value)}
                        className="rounded-xl border border-[var(--border-color)] bg-transparent px-3 py-2.5 outline-none focus:border-emerald-400"
                        required
                      />
                    </label>

                    <label className="grid gap-2">
                      <span className="text-sm font-medium text-[var(--text-headers)]">Feedback comments</span>
                      <textarea
                        rows="6"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        className="rounded-xl border border-[var(--border-color)] bg-transparent px-3 py-2.5 outline-none focus:border-emerald-400"
                        required
                      />
                    </label>

                    <button type="submit" className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white">
                      Submit assessment
                    </button>
                  </div>
                </form>
              </div>
            </section>
          ) : (
            <div className="rounded-3xl border border-dashed border-[var(--border-color)] bg-white/70 p-8 text-center text-[var(--text-muted)] dark:bg-slate-900/80">
              No assigned candidate selected.
            </div>
          )}
        </main>
      </div>
    </PortalLayout>
  );
};

export default InterviewerPortal;