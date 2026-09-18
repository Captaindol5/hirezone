import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Bot, Sparkles, User, Briefcase, MapPin, Link, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ErrorModal from '../../components/ErrorModal';
import PortalLayout from '../../components/PortalLayout';
import LoadingState from '../../components/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { subscribeToJobs, subscribeToCandidate, updateCandidateProfile } from '../../services/hirezoneData';

// ─── Confetti component ───────────────────────────────────────────────────────
const Confetti = () => {
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animDelay: `${Math.random() * 2}s`,
    color: ['#6366f1', '#f59e0b', '#10b981', '#f43f5e', '#8b5cf6', '#06b6d4'][i % 6],
    size: `${6 + Math.random() * 6}px`,
  }));
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute animate-bounce"
          style={{
            left: p.left,
            top: `-${10 + Math.random() * 20}px`,
            width: p.size,
            height: p.size,
            borderRadius: '2px',
            background: p.color,
            animationDelay: p.animDelay,
            animationDuration: `${1.5 + Math.random()}s`,
            opacity: 0.85,
          }}
        />
      ))}
    </div>
  );
};

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'status', label: 'Application Status' },
  { key: 'profile', label: 'My Profile' },
];

const CandidatePortal = () => {
  const navigate = useNavigate();
  const { currentUser, userName, userProfileId } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('status');

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    experience: '',
    currentRole: '',
    skills: '',
    linkedinUrl: '',
    location: '',
    bio: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');

  const currentUserEmail = currentUser?.email?.toLowerCase() || '';

  useEffect(() => {
    const unsubJobs = subscribeToJobs((latestJobs) => {
      setJobs(latestJobs);
      setIsLoading(false);
      setError('');
    });
    return () => unsubJobs();
  }, []);

  // Subscribe to live candidate profile doc
  useEffect(() => {
    if (!userProfileId) return;
    const unsub = subscribeToCandidate(userProfileId, (prof) => {
      if (prof) {
        setCandidateProfile(prof);
        setProfileForm({
          experience: prof.experience || '',
          currentRole: prof.currentRole || '',
          skills: prof.skills || '',
          linkedinUrl: prof.linkedinUrl || '',
          location: prof.location || '',
          bio: prof.bio || '',
        });
      }
    });
    return () => unsub();
  }, [userProfileId]);

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
        jobStages: job?.stages || [],
        jobId: job?.id || null,
      };
    }
    return null;
  }, [currentUserEmail, jobs, userName, userProfileId]);

  const pipelineStages = useMemo(() => {
    if (!candidate || !candidate.jobStages) return [];
    const stages = [{ name: 'Applied', status: 'done' }];
    let isPastCurrent = false;
    candidate.jobStages.forEach(stage => {
      let status = 'upcoming';
      if (candidate.status === 'Hired') {
        status = 'done';
      } else if (candidate.status === 'Failed') {
        if (stage.id === candidate.stage) { status = 'failed'; isPastCurrent = true; }
        else if (isPastCurrent) { status = 'upcoming'; }
        else { status = 'done'; }
      } else {
        if (stage.id === candidate.stage) { status = 'active'; isPastCurrent = true; }
        else if (!isPastCurrent) { status = 'done'; }
      }
      stages.push({ name: stage.name, status });
    });
    return stages;
  }, [candidate]);

  const isAiScreeningStage = candidate?.stage === 'ai-screening';
  const hasAiReport = Boolean(candidate?.aiReport);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!userProfileId) return;
    setProfileSaving(true);
    try {
      await updateCandidateProfile(userProfileId, {
        experience: profileForm.experience,
        currentRole: profileForm.currentRole,
        skills: profileForm.skills,
        linkedinUrl: profileForm.linkedinUrl,
        location: profileForm.location,
        bio: profileForm.bio,
      });
      setProfileSuccess('Profile saved successfully!');
      setTimeout(() => setProfileSuccess(''), 3000);
    } catch (err) {
      setError('Could not save profile: ' + err.message);
    } finally {
      setProfileSaving(false);
    }
  };

  if (isLoading) {
    return (
      <PortalLayout title="Candidate Portal" subtitle="Loading your application status..." profileName={userName || 'Candidate'}>
        <LoadingState title="Loading candidate portal" message="Fetching your application data from the database..." />
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="Candidate Portal" subtitle="Track your application and interview progress." profileName={userName || 'Candidate'}>
      {error && <ErrorModal error={error} onClose={() => setError('')} />}

      {/* Tabs */}
      <div className="mb-5 flex gap-2">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`rounded-2xl px-5 py-2.5 text-sm font-semibold transition ${activeTab === tab.key ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/30' : 'border border-[var(--border-color)] bg-white/70 text-[var(--text-muted)] hover:text-[var(--text-headers)] dark:bg-slate-900/80'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── APPLICATION STATUS TAB ─── */}
      {activeTab === 'status' && (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-[var(--border-color)] bg-white/70 p-5 shadow-[var(--shadow-soft)] dark:bg-slate-900/80">
            {/* Hired celebration banner */}
            {candidate?.status === 'Hired' && (
              <div className="relative mb-5 overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-amber-500 p-6 text-white shadow-xl">
                <Confetti />
                <div className="relative z-10">
                  <p className="text-3xl">🎉</p>
                  <h2 className="mt-2 text-2xl font-black">Congratulations!</h2>
                  <p className="mt-1 text-sm font-medium opacity-90">You have been hired for <strong>{candidate.jobTitle}</strong></p>
                  {candidate.offer?.startDate && (
                    <p className="mt-2 text-sm opacity-80">📅 Start Date: <strong>{candidate.offer.startDate}</strong></p>
                  )}
                  {candidate.offer?.offerNotes && (
                    <p className="mt-1 text-sm italic opacity-80">"{candidate.offer.offerNotes}"</p>
                  )}
                  <p className="mt-3 text-xs opacity-70">Our HR team will be in touch with next steps. Welcome to the team!</p>
                </div>
              </div>
            )}

            {/* AI Screening CTA */}
            {isAiScreeningStage && !hasAiReport && candidate?.status !== 'Failed' && candidate?.status !== 'Hired' && (
              <div className="mb-5 rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-800/40 dark:bg-indigo-900/20">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-500 text-white shadow">
                    <Bot size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-indigo-800 dark:text-indigo-200">AI Screening Required</p>
                    <p className="mt-1 text-sm text-indigo-700 dark:text-indigo-300">Your next step is an AI-powered interview. The AI will ask you 5 technical/behavioral questions with follow-ups to assess your suitability for the role.</p>
                    <button
                      onClick={() => navigate('/portal/ai-screening')}
                      className="mt-3 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white shadow transition hover:bg-indigo-600"
                      id="start-ai-interview-btn"
                    >
                      <Sparkles size={15} />
                      Start AI Interview
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* AI report summary for candidate */}
            {hasAiReport && (
              <div className="mb-5 rounded-2xl border border-purple-200 bg-purple-50/50 p-4 dark:border-purple-800/40 dark:bg-purple-900/10">
                <div className="flex items-center gap-2 mb-3">
                  <Bot size={16} className="text-purple-600" />
                  <p className="text-sm font-bold text-purple-800 dark:text-purple-200">AI Screening Result</p>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-white p-3 text-center dark:bg-slate-800">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Score</p>
                    <p className="mt-1 text-xl font-black text-indigo-600">{candidate.aiReport.score}<span className="text-xs text-slate-400">/10</span></p>
                  </div>
                  <div className="rounded-xl bg-white p-3 text-center dark:bg-slate-800">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Confidence</p>
                    <p className="mt-1 text-sm font-bold text-[var(--text-headers)]">{candidate.aiReport.confidence}</p>
                  </div>
                  <div className="rounded-xl bg-white p-3 text-center dark:bg-slate-800">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Status</p>
                    <p className={`mt-1 text-sm font-bold ${candidate.aiReport.flagged ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {candidate.aiReport.flagged ? '⚠️ Flagged' : '✓ Clean'}
                    </p>
                  </div>
                </div>
              </div>
            )}

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
                      <div className="absolute left-0 top-5 h-1.5 w-full -translate-y-1/2 rounded-full bg-slate-200 dark:bg-slate-700/60" />
                      <div
                        className={`absolute left-0 top-5 h-1.5 -translate-y-1/2 rounded-full transition-all duration-700 ${candidate?.status === 'Failed' ? 'bg-red-500' : 'bg-emerald-500'}`}
                        style={{ width: `${(pipelineStages.findIndex(s => s.status === 'active' || s.status === 'failed') !== -1 ? pipelineStages.findIndex(s => s.status === 'active' || s.status === 'failed') : pipelineStages.length - 1) / (pipelineStages.length - 1 || 1) * 100}%` }}
                      />
                      {pipelineStages.map((stage, index) => {
                        const isDone = stage.status === 'done';
                        const isActive = stage.status === 'active';
                        const isFailed = stage.status === 'failed';
                        return (
                          <div key={index} className="relative z-10 flex flex-col items-center">
                            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-full border-[3px] bg-white transition-all duration-300 dark:bg-slate-900 ${isDone ? 'border-emerald-500 text-emerald-500 shadow-md shadow-emerald-500/20' : isActive ? 'border-amber-500 bg-amber-50 text-amber-600 shadow-md shadow-amber-500/20 dark:border-amber-500/80 dark:bg-amber-900/30 dark:text-amber-400' : isFailed ? 'border-red-500 bg-red-50 text-red-600 shadow-md shadow-red-500/20 dark:border-red-500/80 dark:bg-red-900/30 dark:text-red-400' : 'border-slate-200 text-slate-400 dark:border-slate-700 dark:text-slate-500'}`}>
                              {isDone ? <CheckCircle2 size={18} strokeWidth={3} /> : <span className="text-sm font-bold">{index + 1}</span>}
                            </div>
                            <div className="absolute top-14 left-1/2 w-24 -ml-12 text-center">
                              <div className={`text-[10px] font-bold uppercase tracking-wider ${isDone ? 'text-emerald-600 dark:text-emerald-400' : isActive ? 'text-amber-600 dark:text-amber-400' : isFailed ? 'text-red-600 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'}`}>{stage.name}</div>
                              <div className="mt-0.5 text-[9px] font-semibold text-slate-400 opacity-80">
                                {isDone ? 'Completed' : isActive ? 'In Progress' : isFailed ? 'Failed' : 'Pending'}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="h-16" />
                  </div>
                ) : (
                  <div className="py-10 text-center text-sm font-semibold text-[var(--text-muted)]">No active application pipeline found for your account.</div>
                )}
              </div>

              <div className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-headers)]">Latest Interviewer Feedback</p>
                    <h3 className="mt-1 text-lg font-bold text-[var(--text-headers)]">
                      {candidate?.status === 'Failed' ? 'Not moving forward' : candidate?.status === 'Hired' ? 'Congratulations! You are Hired!' : candidate?.hasSubmittedFeedback ? 'Feedback Published' : 'Pending Review'}
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
                  {candidate?.status === 'Failed' && !candidate?.feedback && <p>Unfortunately, we will not be moving forward with your application at this time.</p>}
                  {candidate?.status === 'Hired' && !candidate?.feedback && <p>Welcome to the team! Our HR department will reach out with next steps.</p>}
                  {candidate?.feedback ? <p className="italic text-[var(--text-headers)]">"{candidate.feedback}"</p> : (!candidate?.status || candidate.status === 'Applied' || candidate.status === 'Pending') && <p>No reviewer feedback has been published for your current stage yet. Check back soon!</p>}
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
                      <div className="mt-3 text-sm italic text-[var(--text-muted)]">"{hist.feedback}"</div>
                    </div>
                  ))}
                </div>
              )}
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
      )}

      {/* ─── MY PROFILE TAB ─── */}
      {activeTab === 'profile' && (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-[var(--border-color)] bg-white/70 p-6 shadow-[var(--shadow-soft)] dark:bg-slate-900/80">
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">My Profile</p>
              <h2 className="mt-1 text-2xl font-bold text-[var(--text-headers)]">Build your candidate profile</h2>
              <p className="mt-1 text-sm text-[var(--text-muted)]">This information is visible to your interviewer during the review process.</p>
            </div>
            {profileSuccess && (
              <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300">
                ✓ {profileSuccess}
              </div>
            )}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-1.5">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-headers)]"><Briefcase size={14} /> Years of Experience</span>
                  <input
                    type="text"
                    value={profileForm.experience}
                    onChange={e => setProfileForm(p => ({ ...p, experience: e.target.value }))}
                    placeholder="e.g. 4 years"
                    className="rounded-xl border border-[var(--border-color)] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-headers)]"><User size={14} /> Current / Previous Role</span>
                  <input
                    type="text"
                    value={profileForm.currentRole}
                    onChange={e => setProfileForm(p => ({ ...p, currentRole: e.target.value }))}
                    placeholder="e.g. Frontend Engineer"
                    className="rounded-xl border border-[var(--border-color)] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-headers)]"><MapPin size={14} /> Location</span>
                  <input
                    type="text"
                    value={profileForm.location}
                    onChange={e => setProfileForm(p => ({ ...p, location: e.target.value }))}
                    placeholder="e.g. Remote / Chennai"
                    className="rounded-xl border border-[var(--border-color)] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
                  />
                </label>
                <label className="grid gap-1.5">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-headers)]"><Link size={14} /> LinkedIn URL</span>
                  <input
                    type="url"
                    value={profileForm.linkedinUrl}
                    onChange={e => setProfileForm(p => ({ ...p, linkedinUrl: e.target.value }))}
                    placeholder="https://linkedin.com/in/..."
                    className="rounded-xl border border-[var(--border-color)] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
                  />
                </label>
              </div>
              <label className="grid gap-1.5">
                <span className="flex items-center gap-1.5 text-sm font-semibold text-[var(--text-headers)]"><Star size={14} /> Skills (comma-separated)</span>
                <input
                  type="text"
                  value={profileForm.skills}
                  onChange={e => setProfileForm(p => ({ ...p, skills: e.target.value }))}
                  placeholder="React, Node.js, Figma, SQL..."
                  className="rounded-xl border border-[var(--border-color)] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
                />
                {profileForm.skills && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {profileForm.skills.split(',').map(s => s.trim()).filter(Boolean).map((skill, i) => (
                      <span key={i} className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">{skill}</span>
                    ))}
                  </div>
                )}
              </label>
              <label className="grid gap-1.5">
                <span className="text-sm font-semibold text-[var(--text-headers)]">Short Bio</span>
                <textarea
                  rows={4}
                  value={profileForm.bio}
                  onChange={e => setProfileForm(p => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell us about yourself, your goals, and what makes you a great candidate..."
                  className="rounded-xl border border-[var(--border-color)] bg-transparent px-3 py-2.5 text-sm outline-none focus:border-indigo-400 resize-none"
                />
              </label>
              <button
                type="submit"
                disabled={profileSaving}
                className="w-full rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/30 transition hover:opacity-90 disabled:opacity-60"
              >
                {profileSaving ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl border border-[var(--border-color)] bg-white/70 p-5 shadow-[var(--shadow-soft)] dark:bg-slate-900/80">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 mb-3">Profile Preview</p>
              <div className="space-y-3 text-sm">
                <p className="font-bold text-[var(--text-headers)] text-lg">{userName || 'Your Name'}</p>
                {profileForm.currentRole && <p className="text-[var(--text-muted)]">💼 {profileForm.currentRole}</p>}
                {profileForm.experience && <p className="text-[var(--text-muted)]">📅 {profileForm.experience} of experience</p>}
                {profileForm.location && <p className="text-[var(--text-muted)]">📍 {profileForm.location}</p>}
                {profileForm.linkedinUrl && <a href={profileForm.linkedinUrl} target="_blank" rel="noreferrer" className="block text-indigo-500 hover:underline truncate">🔗 LinkedIn</a>}
                {profileForm.skills && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {profileForm.skills.split(',').map(s => s.trim()).filter(Boolean).map((skill, i) => (
                      <span key={i} className="rounded-full bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">{skill}</span>
                    ))}
                  </div>
                )}
                {profileForm.bio && <p className="mt-2 text-[var(--text-muted)] italic text-xs leading-relaxed">"{profileForm.bio}"</p>}
              </div>
            </div>
          </aside>
        </div>
      )}
    </PortalLayout>
  );
};

export default CandidatePortal;