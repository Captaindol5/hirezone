import { useEffect, useMemo, useState } from 'react';
import {
  BriefcaseBusiness,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Columns3,
  Layers,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  Trash2,
  UserPlus,
  UserRound,
  Eye,
  List,
  Contact,
  XCircle,
  Users,
  X,
} from 'lucide-react';
import PortalLayout from '../../components/PortalLayout';
import LoadingState from '../../components/LoadingState';
import { useAuth } from '../../context/AuthContext';
import {
  createCandidateProfile,
  createJob,
  createStageForJob,
  deleteStageForJob,
  fetchInterviewers,
  fetchJobs,
  persistJobs,
  persistInterviewers,
  updateStageAssignment,
  updateStageForJob,
  failCandidate,
  hireCandidate,
} from '../../services/hirezoneData';

const EMPTY_STAGE = { name: '', interviewerId: '' };

const tabs = [
  { key: 'jobs', label: 'Create jobs', icon: BriefcaseBusiness },
  { key: 'stages', label: 'Create stages', icon: Layers },
  { key: 'assignments', label: 'Assign interviewers', icon: Users },
  { key: 'candidates', label: 'Create candidate', icon: UserPlus },
  { key: 'directory', label: 'Directory', icon: List },
  { key: 'kanban', label: 'Kanban board', icon: Columns3 },
];

const HrPipelinePortal = () => {
  const { userRole } = useAuth();
  const readOnly = userRole === 'manager';
  const [data, setData] = useState({ jobs: [], interviewers: [] });
  const [selectedJobId, setSelectedJobId] = useState('');
  const [activeTab, setActiveTab] = useState('stages');
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [newJob, setNewJob] = useState({ title: '', location: 'Remote', type: 'General', company: 'HireZone' });
  const [newStage, setNewStage] = useState(EMPTY_STAGE);
  const [editingStageId, setEditingStageId] = useState(null);
  const [candidateForm, setCandidateForm] = useState({
    name: '',
    email: '',
    password: 'Welcome@123',
    jobId: '',
    stageId: '',
    cvUrl: '',
    photoUrl: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewingCandidate, setViewingCandidate] = useState(null);
  const [viewingCandidateStageIndex, setViewingCandidateStageIndex] = useState(-1);

  const loadData = async () => {
    const [jobs, interviewers] = await Promise.all([fetchJobs(), fetchInterviewers()]);
    setData({ jobs, interviewers });
    setSelectedJobId((current) => current || jobs[0]?.id || '');
    setCandidateForm((prev) => ({
      ...prev,
      jobId: prev.jobId || jobs[0]?.id || '',
      stageId: prev.stageId || jobs[0]?.stages?.[0]?.id || '',
    }));
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        setIsLoading(true);
        await loadData();
        setError('');
      } catch (loadError) {
        console.error('Failed to load hiring data:', loadError);
        setError('Unable to load the hiring pipeline from Firestore. Check your Firebase setup and permissions.');
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  const selectedJob = useMemo(
    () => data.jobs.find((job) => job.id === selectedJobId) || data.jobs[0],
    [data.jobs, selectedJobId]
  );

  const candidateJob = useMemo(
    () => data.jobs.find((job) => job.id === candidateForm.jobId) || selectedJob || null,
    [data.jobs, candidateForm.jobId, selectedJob]
  );

  const candidateStageOptions = candidateJob?.stages || [];

  const syncData = async (nextData) => {
    setData(nextData);
    try {
      await Promise.all([persistJobs(nextData.jobs), persistInterviewers(nextData.interviewers)]);
    } catch (syncError) {
      console.error('Pipeline sync failed:', syncError);
      setError('Your changes were saved locally but could not be synced to Firestore.');
    }
  };

  const addJob = async () => {
    if (!newJob.title.trim()) return;

    try {
      const created = await createJob({
        title: newJob.title,
        location: newJob.location,
        type: newJob.type,
        company: newJob.company,
      });

      const nextData = { ...data, jobs: [...data.jobs, created] };
      setSelectedJobId(created.id);
      setNewJob({ title: '', location: 'Remote', type: 'General', company: 'HireZone' });
      setData(nextData);
      setError('');
    } catch (createError) {
      console.error('Job creation failed:', createError);
      setError(createError.message || 'Job could not be created.');
    }
  };

  const addStage = async () => {
    if (!selectedJob || !newStage.name.trim()) return;

    try {
      await createStageForJob(selectedJob.id, {
        name: newStage.name,
        interviewerId: newStage.interviewerId,
      });
      const refreshed = await fetchJobs();
      setData((prev) => ({ ...prev, jobs: refreshed }));
      setNewStage(EMPTY_STAGE);
      setError('');
    } catch (createError) {
      console.error('Stage creation failed:', createError);
      setError(createError.message || 'Stage could not be created.');
    }
  };

  const updateStage = async () => {
    if (!selectedJob || !editingStageId || !newStage.name.trim()) return;

    try {
      await updateStageForJob(selectedJob.id, editingStageId, {
        name: newStage.name,
        interviewerId: newStage.interviewerId,
      });
      const refreshed = await fetchJobs();
      setData((prev) => ({ ...prev, jobs: refreshed }));
      setNewStage(EMPTY_STAGE);
      setEditingStageId(null);
      setError('');
    } catch (updateError) {
      console.error('Stage update failed:', updateError);
      setError(updateError.message || 'Stage could not be updated.');
    }
  };

  const deleteStage = async (stageId) => {
    if (!selectedJob) return;

    try {
      await deleteStageForJob(selectedJob.id, stageId);
      const refreshed = await fetchJobs();
      setData((prev) => ({ ...prev, jobs: refreshed }));
      if (editingStageId === stageId) {
        setEditingStageId(null);
        setNewStage(EMPTY_STAGE);
      }
      setError('');
    } catch (deleteError) {
      console.error('Stage deletion failed:', deleteError);
      setError(deleteError.message || 'Stage could not be deleted.');
    }
  };

  const cancelEdit = () => {
    setEditingStageId(null);
    setNewStage(EMPTY_STAGE);
  };

  const assignInterviewerToStage = async (stageId, interviewerId) => {
    if (!selectedJob) return;

    try {
      await updateStageAssignment(selectedJob.id, stageId, interviewerId);
      const refreshed = await fetchJobs();
      setData((prev) => ({ ...prev, jobs: refreshed }));
      setError('');
    } catch (assignmentError) {
      console.error('Assignment update failed:', assignmentError);
      setError('The interviewer assignment could not be saved.');
    }
  };

  const createCandidate = async () => {
    if (!candidateForm.name.trim() || !candidateForm.email.trim() || !candidateForm.jobId || !candidateForm.stageId) {
      setError('Candidate name, email, job, and stage are required.');
      return;
    }

    try {
      await createCandidateProfile({
        name: candidateForm.name,
        email: candidateForm.email,
        password: candidateForm.password,
        jobId: candidateForm.jobId,
        stageId: candidateForm.stageId,
        cvUrl: candidateForm.cvUrl,
        photoUrl: candidateForm.photoUrl,
        notes: candidateForm.notes,
      });

      const refreshed = await fetchJobs();
      setData((prev) => ({ ...prev, jobs: refreshed }));
      setSelectedJobId(candidateForm.jobId);
      setCandidateForm({
        name: '',
        email: '',
        password: 'Welcome@123',
        jobId: candidateForm.jobId,
        stageId: candidateForm.stageId,
        cvUrl: '',
        photoUrl: '',
        notes: '',
      });
      setError('');
      setActiveTab('kanban');
    } catch (createError) {
      console.error('Candidate creation failed:', createError);
      setError(createError.message || 'Candidate could not be created.');
    }
  };

  const canAdvance = (candidate) => {
    const currentIndex = selectedJob?.stages.findIndex((stage) => stage.id === candidate.stage) ?? -1;
    return currentIndex >= 0 && currentIndex < (selectedJob?.stages.length ?? 1) - 1 && candidate.hasSubmittedFeedback;
  };

  const advanceCandidate = async (candidateId, stageIndex) => {
    if (!selectedJob) return;
    const stage = selectedJob.stages[stageIndex + 1];
    if (!stage) return;

    try {
      const job = data.jobs.find((item) => item.id === selectedJob.id);
      if (!job) return;

      const currentCandidates = [...job.candidates];
      const updatedCandidates = currentCandidates.map((candidate) =>
        candidate.id === candidateId
          ? {
              ...candidate,
              stage: stage.id,
              stageLabel: stage.name,
              status: candidate.hasSubmittedFeedback ? 'Ready' : 'Pending',
            }
          : candidate
      );

      const nextData = {
        ...data,
        jobs: data.jobs.map((item) => (item.id === selectedJob.id ? { ...item, candidates: updatedCandidates } : item)),
      };

      await syncData(nextData);
      const refreshedJobs = await fetchJobs();
      setData((prev) => ({ ...prev, jobs: refreshedJobs }));
      setViewingCandidate(null);
    } catch (advanceError) {
      console.error('Candidate advancement failed:', advanceError);
      setError('Candidate movement could not be updated.');
    }
  };

  const handleFailCandidate = async (candidateId) => {
    if (!selectedJob) return;
    try {
      await failCandidate(selectedJob.id, candidateId);
      const refreshedJobs = await fetchJobs();
      setData((prev) => ({ ...prev, jobs: refreshedJobs }));
      setViewingCandidate(null);
    } catch (err) {
      console.error(err);
      setError('Failed to update candidate status.');
    }
  };

  const handleHireCandidate = async (candidateId) => {
    if (!selectedJob) return;
    try {
      await hireCandidate(selectedJob.id, candidateId);
      const refreshedJobs = await fetchJobs();
      setData((prev) => ({ ...prev, jobs: refreshedJobs }));
      setViewingCandidate(null);
    } catch (err) {
      console.error(err);
      setError('Failed to update candidate status.');
    }
  };

  if (isLoading) {
    return (
      <PortalLayout title="HR / Hiring Manager" subtitle="Loading hiring pipeline data..." profileName="HR Team">
        <LoadingState title="Loading pipeline" message="Pulling jobs, stages, interviewers and candidates from Firestore..." />
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title={readOnly ? 'HR Dashboard (Read-only)' : 'HR / Hiring Manager'} subtitle={readOnly ? 'Manager view: review role setup and candidate movement without changing workflow state.' : 'Create jobs, stages, assignment rules, and candidate profiles in one place.'} profileName={readOnly ? 'Executive Review' : 'HR Team'}>
      {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-200">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        {/* ─── Premium Sidebar ─── */}
        <aside className={`hr-sidebar ${isSidebarExpanded ? '' : 'hr-sidebar-collapsed'}`}>
          {/* Header with brand + toggle */}
          <div className="hr-sidebar-header">
            <div className="sidebar-brand">
              <img src="/logo.png" alt="HireZone Logo" className="h-10 md:h-12 w-auto object-left object-contain dark:hidden" />
              <img src="/logo-dark.png" alt="HireZone Logo" className="h-10 md:h-12 w-auto object-left object-contain hidden dark:block" />
            </div>
            <button
              onClick={() => setIsSidebarExpanded((prev) => !prev)}
              className="hr-sidebar-toggle"
              aria-label="Toggle sidebar"
            >
              {isSidebarExpanded ? <PanelLeftClose size={16} /> : <PanelLeftOpen size={16} />}
            </button>
          </div>

          {/* Navigation tabs */}
          <nav className="hr-sidebar-nav">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`hr-nav-item ${activeTab === tab.key ? 'hr-nav-item-active' : ''}`}
                >
                  <span className="nav-icon">
                    <Icon size={16} />
                  </span>
                  <span className="nav-label">{tab.label}</span>
                  <ChevronRight size={13} className="nav-chevron" />
                </button>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="hr-sidebar-divider" />

          {/* Job list */}
          <div className="hr-sidebar-jobs">
            <div className="hr-sidebar-jobs-title">
              <span>{data.jobs.length} open roles</span>
            </div>
            {data.jobs.map((job) => (
              <button
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                className={`hr-job-item ${selectedJob?.id === job.id ? 'hr-job-item-active' : ''}`}
              >
                <div>
                  <div className="job-title">{job.title}</div>
                  <div className="job-count">{job.candidates?.length || 0} candidates</div>
                </div>
                <BriefcaseBusiness size={14} className="nav-chevron" style={{ opacity: 0.4 }} />
              </button>
            ))}
          </div>
        </aside>

        {/* ─── Main content ─── */}
        <main className="space-y-6">
          {/* ───── Create Jobs Tab ───── */}
          {activeTab === 'jobs' && (
            <section className="rounded-3xl border border-[var(--border-color)] bg-white/70 p-5 shadow-[var(--shadow-soft)] dark:bg-slate-900/80">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Jobs</p>
                  <h2 className="mt-1 text-2xl font-bold text-[var(--text-headers)]">Create new role</h2>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <input value={newJob.title} onChange={(e) => setNewJob((prev) => ({ ...prev, title: e.target.value }))} placeholder="Role title" className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm outline-none focus:border-emerald-400" />
                <input value={newJob.location} onChange={(e) => setNewJob((prev) => ({ ...prev, location: e.target.value }))} placeholder="Location" className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm outline-none focus:border-emerald-400" />
                <input value={newJob.type} onChange={(e) => setNewJob((prev) => ({ ...prev, type: e.target.value }))} placeholder="Job type" className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm outline-none focus:border-emerald-400" />
                <input value={newJob.company} onChange={(e) => setNewJob((prev) => ({ ...prev, company: e.target.value }))} placeholder="Company" className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm outline-none focus:border-emerald-400" />
              </div>

              <button onClick={addJob} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white">
                <Plus size={16} /> Add job
              </button>
            </section>
          )}

          {/* ───── Create Stages Tab ───── */}
          {activeTab === 'stages' && (
            <section className="rounded-[28px] border border-[var(--border-color)] bg-white/70 p-5 shadow-[var(--shadow-soft)] dark:bg-slate-900/80">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Stage builder</p>
                  <h2 className="mt-2 text-[42px] font-black leading-tight tracking-[-0.05em] text-[var(--text-headers)]">{selectedJob?.title || 'Select a role'}</h2>
                </div>
                <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-600">{selectedJob?.stages.length || 0} stages</span>
              </div>

              {/* Stage form */}
              <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px_auto]">
                <input value={newStage.name} onChange={(e) => setNewStage((prev) => ({ ...prev, name: e.target.value }))} placeholder="Stage name" className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-3 text-sm outline-none focus:border-emerald-400" />
                <select value={newStage.interviewerId} onChange={(e) => setNewStage((prev) => ({ ...prev, interviewerId: e.target.value }))} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-3 text-sm outline-none focus:border-emerald-400">
                  <option value="">Select interviewer</option>
                  {data.interviewers.filter((person) => person.role === 'interviewer').map((person) => (
                    <option key={person.id} value={person.id}>{person.name}</option>
                  ))}
                </select>
                <div className="flex items-center gap-2">
                  <button onClick={editingStageId ? updateStage : addStage} className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:translate-y-[-1px]">
                    {editingStageId ? 'Update stage' : 'Add stage'}
                  </button>
                  {editingStageId && (
                    <button onClick={cancelEdit} className="flex h-[46px] w-[46px] items-center justify-center rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] text-[var(--text-muted)] transition hover:border-red-300 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20" aria-label="Cancel editing">
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>

              {/* Editing indicator */}
              {editingStageId && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <Pencil size={13} />
                  Editing stage — make changes above and click &quot;Update stage&quot; or cancel
                </div>
              )}

              {/* Stage list */}
              <div className="mt-6 space-y-3">
                {(!selectedJob?.stages || selectedJob.stages.length === 0) ? (
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)]/50 p-8 text-center">
                    <Layers size={32} className="text-[var(--text-muted)] opacity-40" />
                    <p className="text-sm font-semibold text-[var(--text-muted)]">No stages created yet</p>
                    <p className="text-xs text-[var(--text-muted)]">Add your first interview stage above to get started</p>
                  </div>
                ) : (
                  selectedJob.stages.map((stage, index) => (
                    <div
                      key={stage.id}
                      className={`flex items-center justify-between gap-3 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 transition-all duration-200 hover:shadow-md ${editingStageId === stage.id ? 'stage-card-editing' : ''}`}
                    >
                      <div>
                        <p className="text-[20px] font-semibold text-[var(--text-headers)]">{index + 1}. {stage.name}</p>
                        <p className="mt-1 text-sm text-[var(--text-muted)]">Assigned interviewer: {stage.interviewer || 'Unassigned'}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingStageId(stage.id);
                            setNewStage({ name: stage.name, interviewerId: stage.interviewer || '' });
                          }}
                          className={`flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border-color)] text-[var(--text-headers)] transition hover:border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 ${editingStageId === stage.id ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20' : 'bg-white dark:bg-slate-800'}`}
                          aria-label="Edit stage"
                        >
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => deleteStage(stage.id)} className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-600 transition hover:bg-red-500/20" aria-label="Delete stage">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* ───── Assign Interviewers Tab ───── */}
          {activeTab === 'assignments' && (
            <section className="rounded-3xl border border-[var(--border-color)] bg-white/70 p-5 shadow-[var(--shadow-soft)] dark:bg-slate-900/80">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Interviewer assignment</p>
                <h2 className="mt-1 text-2xl font-bold text-[var(--text-headers)]">Map interviewers to job stages</h2>
              </div>

              <div className="space-y-4">
                {data.interviewers.filter((person) => person.role === 'interviewer').map((person) => (
                  <div key={person.id} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[var(--text-headers)]">{person.name}</p>
                        <p className="text-xs text-[var(--text-muted)]">{person.email}</p>
                      </div>
                    </div>

                    <label className="grid gap-2 text-sm text-[var(--text-headers)]">
                      <span>Select stage</span>
                      <select
                        value={selectedJob?.stages.find((stage) => stage.interviewer === person.id)?.id || ''}
                        onChange={(e) => assignInterviewerToStage(e.target.value, person.id)}
                        className="rounded-xl border border-[var(--border-color)] bg-transparent px-3 py-2.5 outline-none focus:border-emerald-400"
                      >
                        <option value="">Unassigned</option>
                        {selectedJob?.stages.map((stage) => (
                          <option key={stage.id} value={stage.id}>{stage.name}</option>
                        ))}
                      </select>
                    </label>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ───── Create Candidate Tab + Live Candidates ───── */}
          {activeTab === 'candidates' && (
            <section className="space-y-6">
              {/* Create candidate form */}
              <div className="rounded-3xl border border-[var(--border-color)] bg-white/70 p-5 shadow-[var(--shadow-soft)] dark:bg-slate-900/80">
                <div className="mb-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Candidate profile</p>
                  <h2 className="mt-1 text-2xl font-bold text-[var(--text-headers)]">Create candidate card</h2>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <input value={candidateForm.name} onChange={(e) => setCandidateForm((prev) => ({ ...prev, name: e.target.value }))} placeholder="Candidate name" className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm outline-none focus:border-emerald-400" />
                  <input value={candidateForm.email} onChange={(e) => setCandidateForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="Candidate email" className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm outline-none focus:border-emerald-400" />
                  <input value={candidateForm.password} onChange={(e) => setCandidateForm((prev) => ({ ...prev, password: e.target.value }))} placeholder="Password" className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm outline-none focus:border-emerald-400" />
                  <select value={candidateForm.jobId} onChange={(e) => {
                    const job = data.jobs.find((item) => item.id === e.target.value);
                    setCandidateForm((prev) => ({ ...prev, jobId: e.target.value, stageId: job?.stages?.[0]?.id || '' }));
                    if (e.target.value) setSelectedJobId(e.target.value);
                  }} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm outline-none focus:border-emerald-400">
                    <option value="">Select job</option>
                    {data.jobs.map((job) => (
                      <option key={job.id} value={job.id}>{job.title}</option>
                    ))}
                  </select>
                  <select
                    value={candidateForm.stageId || candidateStageOptions[0]?.id || ''}
                    onChange={(e) => setCandidateForm((prev) => ({ ...prev, stageId: e.target.value }))}
                    className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm outline-none focus:border-emerald-400 md:col-span-2"
                  >
                    <option value="">Select stage</option>
                    {candidateStageOptions.map((stage) => (
                      <option key={stage.id} value={stage.id}>{stage.name}</option>
                    ))}
                  </select>
                  <textarea value={candidateForm.notes} onChange={(e) => setCandidateForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Notes, CV comments, mail source, portfolio" rows="4" className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2.5 text-sm outline-none focus:border-emerald-400 md:col-span-2" />
                </div>

                <button onClick={createCandidate} className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:translate-y-[-1px]">
                  <UserRound size={16} /> Create candidate profile
                </button>
              </div>

              {/* Directory tab will handle the candidate records */}
            </section>
          )}

          {/* ───── Directory Tab ───── */}
          {activeTab === 'directory' && (
            <section className="space-y-6">
              <div className="rounded-3xl border border-[var(--border-color)] bg-white/70 p-5 shadow-[var(--shadow-soft)] dark:bg-slate-900/80">
                <div className="mb-6 border-b border-[var(--border-color)] pb-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Candidate Directory</p>
                  <h2 className="mt-1 text-2xl font-bold text-[var(--text-headers)]">All Candidates</h2>
                </div>

                {['Live Candidates', 'Hired Candidates', 'Failed Candidates'].map((category) => {
                  const filteredCandidates = data.jobs.flatMap((job) =>
                    (job.candidates || []).filter((c) => {
                      if (category === 'Live Candidates') return c.status !== 'Failed' && c.status !== 'Hired';
                      if (category === 'Hired Candidates') return c.status === 'Hired';
                      if (category === 'Failed Candidates') return c.status === 'Failed';
                      return false;
                    }).map(c => ({ ...c, jobTitle: job.title }))
                  );

                  if (filteredCandidates.length === 0) return null;

                  return (
                    <div key={category} className="mb-8 last:mb-0">
                      <h3 className="mb-3 text-lg font-bold text-[var(--text-headers)]">{category}</h3>
                      <div className="space-y-3">
                        {filteredCandidates.map((candidate) => (
                          <div key={candidate.id} className="rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-4 transition-all duration-200 hover:shadow-md">
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                              <div className="flex items-center gap-3">
                                {candidate.photoUrl ? (
                                  <img src={candidate.photoUrl} alt={candidate.name} className="h-10 w-10 rounded-full object-cover ring-2 ring-emerald-500/20" />
                                ) : (
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white">
                                    {candidate.name?.charAt(0)?.toUpperCase() || '?'}
                                  </div>
                                )}
                                <div>
                                  <p className="text-[18px] font-bold text-[var(--text-headers)]">{candidate.name}</p>
                                  <p className="text-sm text-[var(--text-muted)]">{candidate.jobTitle} · {candidate.email}</p>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-700">{candidate.stageLabel || candidate.stage}</span>
                                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                                  candidate.status === 'Hired' ? 'bg-emerald-500/10 text-emerald-700' :
                                  candidate.status === 'Failed' ? 'bg-red-500/10 text-red-700' :
                                  candidate.hasSubmittedFeedback ? 'bg-emerald-500/10 text-emerald-700' : 'bg-amber-500/10 text-amber-700'
                                }`}>
                                  {candidate.status || 'Applied'}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {data.jobs.every((job) => !job.candidates?.length) && (
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--bg-secondary)]/50 p-8 text-center">
                    <UserRound size={32} className="text-[var(--text-muted)] opacity-40" />
                    <p className="text-sm font-semibold text-[var(--text-muted)]">No candidates yet</p>
                    <p className="text-xs text-[var(--text-muted)]">Create your first candidate in the "Create Candidate" tab.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ───── Kanban Board Tab ───── */}
          {activeTab === 'kanban' && (
            <section className="rounded-3xl border border-[var(--border-color)] bg-white/70 p-5 shadow-[var(--shadow-soft)] dark:bg-slate-900/80">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Kanban board</p>
                  <h2 className="mt-1 text-2xl font-bold text-[var(--text-headers)]">Pipeline</h2>
                </div>
                <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-600">{selectedJob?.stages.length || 0} stages</span>
              </div>

              <div className="grid gap-4 xl:grid-cols-4">
                {selectedJob?.stages.map((stage, index) => (
                  <div key={stage.id} className="min-h-[260px] rounded-2xl border border-[var(--border-color)] bg-[var(--bg-secondary)] p-3">
                    <div className="mb-3 flex items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3">
                      <h3 className="font-bold text-[var(--text-headers)]">{stage.name}</h3>
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                        {(selectedJob.candidates || []).filter((candidate) => candidate.stage === stage.id).length}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {(() => {
                        const stageCandidates = (selectedJob.candidates || []).filter(
                          (candidate) => candidate.stage === stage.id && candidate.status !== 'Failed' && candidate.status !== 'Hired'
                        );
                        if (stageCandidates.length === 0) {
                          return <div className="rounded-2xl border border-dashed border-[var(--border-color)] p-4 text-center text-sm text-[var(--text-muted)]">No candidates in this stage</div>;
                        }
                        return stageCandidates.map((candidate) => (
                            <div key={candidate.id} className="rounded-2xl border border-[var(--border-color)] bg-white/70 p-3 shadow-sm transition-all duration-200 hover:shadow-md dark:bg-slate-800/80">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  {candidate.photoUrl ? (
                                    <img src={candidate.photoUrl} alt={candidate.name} className="h-7 w-7 rounded-full object-cover" />
                                  ) : (
                                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                                      {candidate.name?.charAt(0)?.toUpperCase() || '?'}
                                    </div>
                                  )}
                                  <p className="text-lg font-semibold text-[var(--text-headers)]">{candidate.name}</p>
                                </div>
                                <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${candidate.hasSubmittedFeedback ? 'bg-emerald-500/10 text-emerald-600' : 'bg-amber-500/10 text-amber-600'}`}>
                                  {candidate.hasSubmittedFeedback ? 'Ready' : 'Pending'}
                                </span>
                              </div>
                              <p className="mt-2 text-xs text-[var(--text-muted)]">Feedback: {candidate.hasSubmittedFeedback ? 'Submitted' : 'Missing'}</p>
                              <div className="mt-3 flex items-center justify-between gap-2">
                                <button
                                  onClick={() => { setViewingCandidate(candidate); setViewingCandidateStageIndex(index); }}
                                  disabled={readOnly}
                                  className={`inline-flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold text-white ${readOnly ? 'cursor-not-allowed bg-slate-300 dark:bg-slate-700' : 'bg-slate-800 hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600'}`}
                                >
                                  <Eye size={14} /> View
                                </button>
                                {candidate.hasSubmittedFeedback ? <CheckCircle2 size={16} className="text-emerald-500" /> : <Clock3 size={16} className="text-amber-500" />}
                              </div>
                            </div>
                          ));
                      })()}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      {/* ───── View Candidate Modal ───── */}
      {viewingCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-[var(--border-color)] bg-[var(--bg-secondary)] shadow-2xl dark:bg-slate-800">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] p-5">
              <h3 className="text-xl font-bold text-[var(--text-headers)]">Review feedback</h3>
              <button onClick={() => setViewingCandidate(null)} className="rounded-full p-2 text-slate-500 transition hover:bg-slate-200 dark:hover:bg-slate-700">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 p-5">
              <div>
                <p className="text-lg font-semibold text-[var(--text-headers)]">{viewingCandidate.name}</p>
                <p className="text-sm text-[var(--text-muted)]">{viewingCandidate.email} • Stage: {viewingCandidate.stageLabel}</p>
              </div>
              <div className="rounded-2xl border border-[var(--border-color)] bg-white p-4 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Interviewer Score</p>
                <p className="mt-1 text-3xl font-black text-[var(--text-headers)]">{viewingCandidate.hasSubmittedFeedback ? `${viewingCandidate.score} / 5` : 'N/A'}</p>
              </div>
              <div className="rounded-2xl border border-[var(--border-color)] bg-white p-4 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Feedback notes</p>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  {viewingCandidate.hasSubmittedFeedback ? viewingCandidate.feedback : 'No feedback has been submitted yet for this stage.'}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-[var(--border-color)] bg-slate-50 p-5 dark:bg-slate-900/50">
              <button onClick={() => setViewingCandidate(null)} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700">
                Back
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => handleFailCandidate(viewingCandidate.id)}
                  disabled={!viewingCandidate.hasSubmittedFeedback || readOnly}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition ${viewingCandidate.hasSubmittedFeedback && !readOnly ? 'bg-red-500 hover:bg-red-600' : 'cursor-not-allowed bg-red-300 dark:bg-red-900/50 dark:text-red-300'}`}
                >
                  Fail
                </button>
                {viewingCandidateStageIndex === (selectedJob?.stages?.length || 1) - 1 ? (
                  <button
                    onClick={() => handleHireCandidate(viewingCandidate.id)}
                    disabled={!viewingCandidate.hasSubmittedFeedback || readOnly}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition ${viewingCandidate.hasSubmittedFeedback && !readOnly ? 'bg-emerald-500 hover:bg-emerald-600' : 'cursor-not-allowed bg-emerald-300 dark:bg-emerald-900/50 dark:text-emerald-300'}`}
                  >
                    Hire
                  </button>
                ) : (
                  <button
                    onClick={() => advanceCandidate(viewingCandidate.id, viewingCandidateStageIndex)}
                    disabled={!viewingCandidate.hasSubmittedFeedback || readOnly}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold text-white transition ${viewingCandidate.hasSubmittedFeedback && !readOnly ? 'bg-orange-500 hover:bg-orange-600' : 'cursor-not-allowed bg-orange-300 dark:bg-orange-900/50 dark:text-orange-300'}`}
                  >
                    Advance
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </PortalLayout>
  );
};

export default HrPipelinePortal;