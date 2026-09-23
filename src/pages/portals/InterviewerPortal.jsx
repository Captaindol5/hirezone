import { useEffect, useState } from 'react';
import { AlertCircle, Bot, ChevronRight, FileText, ShieldCheck } from 'lucide-react';
import PortalLayout from '../../components/PortalLayout';
import { useAuth } from '../../context/AuthContext';
import { subscribeToInterviewers, subscribeToJobs, submitCandidateFeedback, subscribeToCandidate } from '../../services/hirezoneData';

const InterviewerPortal = () => {
  const { userProfileId, currentUser, userName } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [interviewers, setInterviewers] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState('');
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [submittedCandidateIds, setSubmittedCandidateIds] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [liveProfile, setLiveProfile] = useState(null);

  useEffect(() => {
    const unsubJobs = subscribeToJobs((latestJobs) => {
      setJobs(latestJobs);
    });
    
    const unsubInterviewers = subscribeToInterviewers((latestInterviewers) => {
      setInterviewers(latestInterviewers);
    });

    return () => {
      unsubJobs();
      unsubInterviewers();
    };
  }, []);

  // Subscribe to real candidate profile when selection changes
  useEffect(() => {
    if (!selectedCandidate?.id) { setLiveProfile(null); return; }
    const unsub = subscribeToCandidate(selectedCandidate.id, setLiveProfile);
    return () => unsub();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCandidateId]);

  const loggedInEmail = String(currentUser?.email || '').toLowerCase();
  const loggedInName = String(userName || '').toLowerCase();

  const assignedInterviewer = interviewers.find((person) => {
    if (person.id === userProfileId) return true;
    const pEmail = String(person.email || '').toLowerCase();
    const pName = String(person.name || '').toLowerCase();
    if (loggedInEmail && pEmail === loggedInEmail) return true;
    if (loggedInName && pName === loggedInName) return true;
    return false;
  }) || interviewers[0] || { name: userName || 'Interviewer', id: userProfileId };

  const activeInterviewerId = assignedInterviewer?.id || userProfileId;

  const assignedCandidates = jobs.flatMap((job) =>
    (job.candidates || [])
      .filter((candidate) => {
        const currentStage = (job.stages || []).find((stage) => stage.id === candidate.stage);
        return (
          currentStage?.interviewer === activeInterviewerId &&
          candidate.status !== 'Failed' &&
          candidate.status !== 'Hired'
        );
      })
      .map((candidate) => ({ 
        ...candidate, 
        jobTitle: job.title, 
        stageLabel: (job.stages || []).find((stage) => stage.id === candidate.stage)?.name || candidate.stage 
      }))
  );

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
      <div className="grid gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--bg-secondary)]/60 backdrop-blur-2xl p-8 shadow-2xl shadow-black/5">
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
                  className={`w-full rounded-[1.5rem] border p-4 text-left transition-all duration-300 ${selectedCandidate?.id === candidate.id ? 'border-orange-500 bg-orange-500/10 shadow-lg shadow-orange-500/5' : 'border-[var(--border-color)] bg-[var(--bg-secondary)] hover:shadow-md hover:-translate-y-1'}`}
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
            <section className="rounded-[2.5rem] border border-[var(--border-color)] bg-[var(--bg-secondary)]/60 backdrop-blur-2xl p-8 shadow-2xl shadow-black/5 flex flex-col h-full">
              <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                      <li><strong className="text-[var(--text-headers)]">Experience:</strong> {liveProfile?.experience || 'Not provided'}</li>
                      <li><strong className="text-[var(--text-headers)]">Role:</strong> {liveProfile?.currentRole || 'Not provided'}</li>
                      <li><strong className="text-[var(--text-headers)]">Location:</strong> {liveProfile?.location || 'Not provided'}</li>
                      {liveProfile?.skills && (
                        <li>
                          <strong className="text-[var(--text-headers)]">Skills:</strong>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {liveProfile.skills.split(',').map(s => s.trim()).filter(Boolean).map((skill, i) => (
                              <span key={i} className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400">{skill}</span>
                            ))}
                          </div>
                        </li>
                      )}
                      {liveProfile?.linkedinUrl && (
                        <li><a href={liveProfile.linkedinUrl} target="_blank" rel="noreferrer" className="text-indigo-500 hover:underline">🔗 LinkedIn Profile</a></li>
                      )}
                      {liveProfile?.bio && (
                        <li className="italic text-[11px] opacity-80">"{liveProfile.bio}"</li>
                      )}
                    </ul>
                  </div>

                  {/* AI Report card */}
                  {(selectedCandidate?.aiReport || (selectedCandidate?.aiScore !== null && selectedCandidate?.aiScore !== undefined)) && (
                    <div className="rounded-2xl border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-800/40 dark:bg-purple-900/10">
                      <div className="flex items-center gap-2 mb-3">
                        <Bot size={15} className="text-purple-600" />
                        <p className="text-sm font-semibold text-purple-800 dark:text-purple-200">AI Screening Report</p>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="rounded-xl bg-white p-2 text-center dark:bg-slate-800">
                          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Score</p>
                          <p className="mt-0.5 text-lg font-black text-indigo-600">{selectedCandidate.aiReport?.score ?? (Math.round((Number(selectedCandidate?.aiScore) || 0) / 10))}<span className="text-[10px] text-slate-400">/10</span></p>
                        </div>
                        <div className="rounded-xl bg-white p-2 text-center dark:bg-slate-800">
                          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Confidence</p>
                          <p className="mt-0.5 text-xs font-bold text-[var(--text-headers)]">{selectedCandidate.aiReport?.confidence || (selectedCandidate?.aiScore ? `${selectedCandidate.aiScore}%` : "High")}</p>
                        </div>
                        <div className="rounded-xl bg-white p-2 text-center dark:bg-slate-800">
                          <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500">Flags</p>
                          <p className={`mt-0.5 text-xs font-bold ${selectedCandidate.aiReport?.flagged ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {selectedCandidate.aiReport?.flagged ? '⚠️ Flagged' : '✓ Clean'}
                          </p>
                        </div>
                      </div>
                      <p className="text-[11px] italic text-[var(--text-muted)] leading-relaxed">"{selectedCandidate.aiReport?.summary || selectedCandidate?.aiSummary || 'AI evaluation complete.'}"</p>
                      {selectedCandidate.aiReport?.tabSwitchCount > 0 && (
                        <p className="mt-2 text-[10px] text-amber-600 font-semibold">Tab switches during interview: {selectedCandidate.aiReport.tabSwitchCount}</p>
                      )}
                    </div>
                  )}

                  {selectedCandidate?.cvText && (
                    <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText size={15} className="text-orange-500" />
                        <p className="text-sm font-semibold text-[var(--text-headers)]">Resume Preview</p>
                      </div>
                      <div className="max-h-32 overflow-y-auto rounded-xl bg-white dark:bg-slate-900 p-3 text-xs text-[var(--text-muted)] leading-relaxed whitespace-pre-wrap font-mono">
                        {selectedCandidate.cvText.slice(0, 1000)}
                      </div>
                    </div>
                  )}

                  <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                    <p className="text-sm font-semibold text-[var(--text-headers)]">Bias guardrail</p>
                    <div className="mt-2 flex items-start gap-2 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
                      <AlertCircle size={16} className="mt-0.5" />
                      Salary expectations, peer scores, and previous notes are hidden from this reviewer panel.
                    </div>
                  </div>
                </div>

                {selectedCandidate?.hasSubmittedFeedback === true || submittedCandidateIds.includes(selectedCandidate?.id) ? (
                  <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-8 flex flex-col items-center justify-center text-center">
                    <ShieldCheck size={48} className="text-emerald-500 mb-4" />
                    <h3 className="text-xl font-bold text-[var(--text-headers)]">Feedback is given</h3>
                    <p className="mt-2 text-[var(--text-muted)]">You have already evaluated this candidate for this stage. The HR team has been notified.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                    <div className="mb-4 flex items-center gap-2 text-[var(--text-headers)]">
                      <FileText size={18} />
                      <h3 className="text-lg font-bold">Structured evaluation</h3>
                    </div>

                    <div className="grid gap-4">
                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-[var(--text-headers)]">Score out of 10</span>
                        <input
                          type="number"
                          min="1"
                          max="10"
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
                )}
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