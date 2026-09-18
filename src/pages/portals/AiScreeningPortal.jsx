import { useEffect, useMemo, useState } from 'react';
import { Bot, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PortalLayout from '../../components/PortalLayout';
import LoadingState from '../../components/LoadingState';
import { useAuth } from '../../context/AuthContext';
import { subscribeToJobs } from '../../services/hirezoneData';

const AiScreeningPortal = () => {
  const navigate = useNavigate();
  const { currentUser, userName, userProfileId } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  // Find the candidate's job and candidateId from Firestore
  const currentUserEmail = currentUser?.email?.toLowerCase() || '';
  const { candidate, job } = useMemo(() => {
    for (const j of jobs) {
      const found = (j.candidates || []).find(c => {
        const emailMatch = c.email && c.email.toLowerCase() === currentUserEmail;
        const idMatch = c.id === userProfileId;
        return emailMatch || idMatch;
      });
      if (found) return { candidate: found, job: j };
    }
    return { candidate: null, job: null };
  }, [jobs, currentUserEmail, userProfileId]);

  useEffect(() => {
    const unsub = subscribeToJobs(latestJobs => {
      setJobs(latestJobs);
      setIsLoadingJobs(false);
    });
    return () => unsub();
  }, []);

  if (isLoadingJobs) {
    return (
      <PortalLayout title="AI Screening Status" subtitle="Checking your application..." profileName={userName || 'Candidate'}>
        <LoadingState title="Loading status" message="Pulling your latest AI screening results..." />
      </PortalLayout>
    );
  }

  // Check if candidate has a report
  if (candidate?.aiScore !== null && candidate?.aiScore !== undefined) {
    return (
      <PortalLayout title="AI Screening Status" subtitle="Interview complete" profileName={userName || 'Candidate'}>
        <div className="mx-auto max-w-2xl">
          <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-8 text-center dark:border-emerald-800/40 dark:bg-emerald-900/20">
            <CheckCircle2 size={48} className="mx-auto mb-4 text-emerald-500" />
            <h2 className="text-2xl font-bold text-[var(--text-headers)]">AI Evaluation Complete</h2>
            <p className="mt-2 text-sm text-[var(--text-muted)]">Your application has been evaluated and is being reviewed by the hiring team.</p>
            
            <div className="mt-6 flex flex-col items-center justify-center gap-4">
              <div className="w-full max-w-xs rounded-2xl border border-[var(--border-color)] bg-white p-6 dark:bg-slate-800 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Overall Fit Score</p>
                <p className="mt-2 text-5xl font-black text-orange-500">{candidate.aiScore}<span className="text-xl font-medium text-slate-400">/100</span></p>
              </div>
            </div>

            {candidate.aiSummary && (
              <div className="mt-6 rounded-2xl bg-white p-6 text-sm text-left shadow-sm dark:bg-slate-800 border border-[var(--border-color)]">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Summary</p>
                <p className="italic text-[var(--text-muted)]">"{candidate.aiSummary}"</p>
              </div>
            )}
            
            <button onClick={() => navigate('/portal/candidate')} className="mt-8 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-105">
              Back to My Portal
            </button>
          </div>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout title="AI Screening Status" subtitle={job ? `Role: ${job.title}` : 'No active applications'} profileName={userName || 'Candidate'}>
      <div className="mx-auto max-w-2xl text-center mt-12">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 text-slate-400 mx-auto mb-6 dark:bg-slate-800">
          <Bot size={40} />
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-headers)]">Pending Evaluation</h2>
        <p className="mt-2 text-[var(--text-muted)] max-w-md mx-auto">
          We do not have an AI evaluation for your profile yet. If you applied recently, please wait while the system processes your application.
        </p>
        <button onClick={() => navigate('/portal/candidate')} className="mt-8 rounded-2xl bg-slate-900 px-8 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-105 dark:bg-slate-700">
          Return to My Portal
        </button>
      </div>
    </PortalLayout>
  );
};

export default AiScreeningPortal;
