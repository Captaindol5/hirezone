import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Briefcase, MapPin, ArrowLeft, Loader2, CheckCircle2,
  Sparkles, User, Mail, FileText, AlertCircle, UploadCloud, X, Phone, Building2
} from 'lucide-react';
import { fetchJobs, createCandidateProfile } from '../services/hirezoneData';
import { evaluateApplication } from '../services/aiService';
import { sendCandidateWelcomeEmail } from '../services/emailService';
import { extractTextFromPdf } from '../services/pdfExtractor';
import TopNav from '../components/TopNav';

const JobApplicationPage = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [isLoadingJob, setIsLoadingJob] = useState(true);
  
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [answers, setAnswers] = useState({});
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfError, setPdfError] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [errorMsg, setErrorMsg] = useState('');
  const [aiResult, setAiResult] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchJobs().then((jobs) => {
      setJob(jobs.find((j) => j.id === jobId) || null);
      setIsLoadingJob(false);
    });
  }, [jobId]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPdfError('');
    if (file.type !== 'application/pdf') {
      setPdfError('Only PDF files are accepted.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPdfError('File must be under 5MB.');
      return;
    }

    setPdfFile(file);
    setExtractedText('');
    setIsExtracting(true);
    try {
      const text = await extractTextFromPdf(file);
      if (!text || text.length < 50) {
        setPdfError('Could not extract enough text from this PDF.');
        setPdfFile(null);
      } else {
        setExtractedText(text);
      }
    } catch (err) {
      console.error(err);
      setPdfError('Failed to read the PDF. Please try a different file.');
      setPdfFile(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const clearFile = () => {
    setPdfFile(null);
    setExtractedText('');
    setPdfError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const submitApplication = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setErrorMsg('Please fill in your name and email.');
      return;
    }
    if (!extractedText || extractedText.length < 50) {
      setErrorMsg('Please upload your CV as a PDF before submitting.');
      return;
    }
    if (!job?.stages?.length) {
      setErrorMsg('This job has no interview stages set up yet.');
      return;
    }
    
    const missingAnswers = (job.questions || []).some((_, i) => !answers[i] || !answers[i].trim());
    if (missingAnswers) {
      setErrorMsg('Please answer all the screening questions.');
      return;
    }

    setErrorMsg('');
    setStatus('submitting');

    try {
      // Prepare Q&A array for the AI evaluator
      const qnaList = (job.questions || []).map((q, i) => ({
        question: q,
        answer: answers[i].trim()
      }));

      // Evaluate the candidate instantly
      const { score, summary } = await evaluateApplication(job.title, extractedText, qnaList);
      setAiResult({ score, summary });

      // Save profile
      await createCandidateProfile({
        name: form.name.trim(),
        email: form.email.trim(),
        jobId: job.id,
        stageId: job.stages[0].id,
        cvText: extractedText,
        source: 'self-apply',
        aiScore: score,
        aiSummary: summary,
        notes: form.phone.trim() ? `Phone: ${form.phone.trim()}` : '',
      });

      sendCandidateWelcomeEmail({
        candidateName: form.name.trim(),
        toEmail: form.email.trim(),
        jobTitle: job.title,
      });

      setStatus('success');
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message + (err.cause ? ' Cause: ' + err.cause.message : ''));
      setStatus('error');
    }
  };

  // ─── Loading / Error States ───────────────────────────────────────────────
  if (isLoadingJob) {
    return (
      <div className="landing-shell min-h-screen flex items-center justify-center font-sans bg-[var(--bg-primary)]">
        <Loader2 size={40} className="text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="landing-shell min-h-screen flex flex-col items-center justify-center font-sans bg-[var(--bg-primary)] text-[var(--text-body)] gap-6 p-6">
        <AlertCircle size={64} className="text-red-500" />
        <h2 className="text-3xl font-extrabold text-[var(--text-headers)]">Role not found</h2>
        <p className="text-lg font-medium text-[var(--text-muted)]">This job may have expired or been closed.</p>
        <Link to="/careers" className="flex items-center gap-2 text-orange-500 font-bold hover:text-orange-600 transition-colors">
          <ArrowLeft size={18} /> Back to all roles
        </Link>
      </div>
    );
  }

  // ─── Success ──────────────────────────────────────────────────────────────
  if (status === 'success') {
    return (
      <div className="landing-shell min-h-screen flex flex-col items-center justify-center font-sans bg-[var(--bg-primary)] p-6">
        <TopNav />
        <div className="relative z-10 w-full max-w-xl bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[3rem] p-12 text-center shadow-2xl shadow-emerald-500/10 mt-12">
          <div className="w-24 h-24 rounded-[2rem] bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 size={48} className="text-emerald-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-[var(--text-headers)] mb-4 tracking-tight">Application Submitted!</h1>
          <p className="text-[var(--text-muted)] text-lg mb-8 leading-relaxed font-medium">
            Thank you for applying for <strong className="text-[var(--text-headers)]">{job.title}</strong> at ALTRIUM.<br />
            We have instantly evaluated your profile and our hiring team will reach out if you advance.
          </p>

          {aiResult && (
            <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 rounded-[2rem] p-6 mb-8 text-left">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={18} className="text-orange-500" />
                  <span className="text-orange-600 dark:text-orange-400 font-bold tracking-tight">AI Evaluation Complete</span>
                </div>
              </div>
              <p className="text-[var(--text-body)] font-medium leading-relaxed">{aiResult.summary}</p>
            </div>
          )}

          <Link to="/careers" className="inline-flex items-center gap-2 text-[var(--text-muted)] font-bold hover:text-[var(--text-headers)] transition-colors">
            <ArrowLeft size={18} /> View other openings
          </Link>
        </div>
      </div>
    );
  }

  const isProcessing = status === 'submitting';

  // ─── Main UI ──────────────────────────────────────────────────────────────
  return (
    <div className="landing-shell min-h-screen relative font-sans bg-[#fbfbfc] dark:bg-[#050505] text-gray-900 dark:text-gray-100 transition-colors selection:bg-orange-500/30 pb-32">
      
      {/* Subtle Grid Background */}
      <div className="absolute inset-0 z-0 opacity-50 dark:opacity-20 pointer-events-none bg-[linear-gradient(to_right,#8080801a_1px,transparent_1px),linear-gradient(to_bottom,#8080801a_1px,transparent_1px)] bg-[size:40px_40px]" />

      <div className="relative z-10">
        <TopNav />

        <div className="w-full max-w-3xl mx-auto mt-16 px-6">
          
          {/* Job header */}
          <div className="mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 mb-6 rounded-none">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-widest uppercase">Open Role</span>
            </div>
            <h1 className="text-[clamp(2.5rem,5vw,4rem)] font-extrabold tracking-tighter text-orange-500 leading-[1.05] mb-6">{job.title}</h1>
            <div className="flex flex-wrap gap-6">
              <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-bold tracking-widest uppercase">
                <Briefcase size={16} /> {job.department || job.type || 'General'}
              </span>
              <span className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm font-bold tracking-widest uppercase">
                <MapPin size={16} /> {job.location || 'Remote'}
              </span>
            </div>
          </div>

          {/* Application Form */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-orange-50 dark:bg-orange-500/10 border border-orange-200 dark:border-orange-500/20 p-6 flex gap-4 items-start mb-8 rounded-none">
              <Sparkles size={24} className="text-orange-500 shrink-0 mt-1" />
              <div>
                <p className="text-orange-600 dark:text-orange-400 font-bold text-sm tracking-widest uppercase mb-1">AI-Powered Screening</p>
                <p className="text-gray-600 dark:text-gray-300 font-medium text-sm">
                  Upload your CV and answer the questions below. Our AI will instantly evaluate your application for this role.
                </p>
              </div>
            </div>

            <form onSubmit={submitApplication} className="bg-white dark:bg-[#0a0a0a] border border-gray-200 dark:border-gray-800 p-8 md:p-12 shadow-2xl shadow-black/5 rounded-none">
              <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-10">Your Details.</h2>

              <div className="grid gap-8 md:grid-cols-2 mb-8">
                {[
                  { icon: User, label: 'Full Name *', key: 'name', type: 'text', placeholder: 'e.g. Saman Perera' },
                  { icon: Mail, label: 'Email Address *', key: 'email', type: 'email', placeholder: 'you@email.com' },
                ].map(({ icon: Icon, label, key, type, placeholder }) => (
                  <div key={key}>
                    <label className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                      <Icon size={14} className="text-gray-400" /> {label}
                    </label>
                    <input
                      type={type}
                      value={form[key]}
                      onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                      placeholder={placeholder}
                      disabled={isProcessing}
                      required
                      className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 py-3 text-gray-900 dark:text-white text-lg outline-none focus:border-orange-500 transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700 rounded-none"
                    />
                  </div>
                ))}
              </div>

              <div className="mb-12">
                <label className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-400 uppercase mb-2">
                  <Phone size={14} className="text-gray-400" /> Phone Number <span className="text-gray-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+94 71 234 5678"
                  disabled={isProcessing}
                  className="w-full bg-transparent border-b border-gray-300 dark:border-gray-700 py-3 text-gray-900 dark:text-white text-lg outline-none focus:border-orange-500 transition-colors placeholder:text-gray-300 dark:placeholder:text-gray-700 rounded-none"
                />
              </div>

              <div className="mb-12">
                <label className="flex items-center gap-2 text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">
                  <FileText size={14} className="text-gray-400" /> CV / Resume (PDF) *
                </label>
                {!pdfFile ? (
                  <div
                    onClick={() => !isProcessing && fileInputRef.current?.click()}
                    className={`border border-dashed p-10 text-center transition-all duration-300 rounded-none ${isProcessing ? 'cursor-not-allowed opacity-50 border-gray-300' : 'cursor-pointer border-orange-500/50 bg-orange-500/5 hover:border-orange-500 hover:bg-orange-500/10'}`}
                  >
                    {isExtracting ? (
                      <div className="flex flex-col items-center gap-4">
                        <Loader2 size={36} className="text-orange-500 animate-spin" />
                        <p className="text-gray-500 font-bold tracking-widest text-xs uppercase">Reading your PDF…</p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-16 h-16 bg-white dark:bg-black border border-orange-200 dark:border-orange-900 flex items-center justify-center rounded-none shadow-sm">
                          <UploadCloud size={32} className="text-orange-500" />
                        </div>
                        <div>
                          <p className="text-gray-900 dark:text-white text-lg font-bold">Click to upload your CV</p>
                          <p className="text-gray-500 font-bold tracking-widest text-[10px] uppercase mt-2">PDF only · Max 5MB</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-5 rounded-none">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white dark:bg-black border border-emerald-200 dark:border-emerald-900 flex items-center justify-center rounded-none shadow-sm">
                        <FileText size={24} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-gray-900 dark:text-white font-bold text-base">{pdfFile.name}</p>
                        <p className="text-emerald-600 dark:text-emerald-400 text-xs font-bold tracking-widest uppercase mt-1">✓ Extracted successfully</p>
                      </div>
                    </div>
                    {!isProcessing && (
                      <button type="button" onClick={clearFile} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-none transition-colors">
                        <X size={20} />
                      </button>
                    )}
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="application/pdf" onChange={handleFileChange} disabled={isProcessing} className="hidden" />
                {pdfError && <p className="text-red-500 text-sm font-bold mt-3 flex items-center gap-2"><AlertCircle size={16} /> {pdfError}</p>}
              </div>

              {job.questions && job.questions.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-8">Screening Questions.</h2>
                  <div className="space-y-8">
                    {job.questions.map((q, i) => (
                      <div key={i}>
                        <label className="block text-gray-900 dark:text-white text-sm font-bold mb-3">
                          {i + 1}. {q} <span className="text-orange-500">*</span>
                        </label>
                        <textarea
                          value={answers[i] || ''}
                          onChange={(e) => setAnswers(prev => ({ ...prev, [i]: e.target.value }))}
                          placeholder="Type your answer here..."
                          disabled={isProcessing}
                          required
                          rows={4}
                          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-4 text-gray-900 dark:text-white text-base outline-none focus:border-orange-500 transition-colors font-medium resize-none rounded-none"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-5 mb-6 flex gap-3 items-start rounded-none">
                  <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-red-700 dark:text-red-400 font-bold">{errorMsg}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={!pdfFile || isExtracting || isProcessing}
                className={`w-full py-5 text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-3 transition-all duration-300 rounded-none ${(!pdfFile || isExtracting || isProcessing) ? 'bg-gray-100 dark:bg-gray-900 text-gray-400 cursor-not-allowed' : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-orange-500 dark:hover:bg-orange-500 hover:text-white'}`}
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={22} className="animate-spin" /> Evaluating Application...
                  </>
                ) : (
                  <>
                    <Sparkles size={20} /> {pdfFile ? 'Submit & Evaluate' : 'Upload CV to continue'}
                  </>
                )}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
};
export default JobApplicationPage;
