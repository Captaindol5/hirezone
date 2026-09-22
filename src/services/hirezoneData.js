import { addDoc, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  sendStageAdvancedEmail,
  sendFeedbackPublishedEmail,
  sendHiredEmail,
  sendRejectedEmail,
} from './emailService';

const hasFirestore = () => Boolean(db);

// Minimum AI score (out of 100) for a self-apply candidate to appear in the HR pipeline
const AI_SCORE_THRESHOLD = 70;

const normalizeJob = (job) => ({
  id: job.id,
  title: job.title || 'Untitled role',
  location: job.location || 'Remote',
  type: job.type || 'General',
  status: job.status || 'Open',
  company: job.company || 'HireZone',
  stages: Array.isArray(job.stages) ? job.stages : [],
  candidates: Array.isArray(job.candidates) ? job.candidates : [],
  expiresAt: job.expiresAt || null,
  department: job.department || job.type || 'General',
  questions: Array.isArray(job.questions) ? job.questions : [],
  passingThreshold: typeof job.passingThreshold === 'number' ? job.passingThreshold : 70,
});

const normalizeInterviewer = (person) => ({
  id: person.id,
  name: person.name || 'Team member',
  role: person.role || 'interviewer',
  stage: person.stage || 'all',
  email: person.email || '',
});

const buildStageId = (stageName) => {
  const base = String(stageName || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return base || `stage-${Date.now()}`;
};

export const fetchJobs = async () => {
  if (!hasFirestore()) {
    throw new Error('Firestore is not available. Configure Firebase before using the hiring portal.');
  }

  try {
    const snapshot = await getDocs(collection(db, 'jobs'));
    const validJobs = [];
    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      if (data.expiresAt) {
        const expDate = new Date(data.expiresAt);
        expDate.setUTCHours(23, 59, 59, 999);
        if (expDate.getTime() < Date.now()) {
          await deleteDoc(doc(db, 'jobs', docSnap.id)).catch(console.error);
        } else {
          validJobs.push(normalizeJob({ id: docSnap.id, ...data }));
        }
      } else {
        validJobs.push(normalizeJob({ id: docSnap.id, ...data }));
      }
    }
    return validJobs;
  } catch (error) {
    console.error('Unable to fetch jobs:', error);
    throw error;
  }
};

export const subscribeToJobs = (callback) => {
  if (!hasFirestore()) return () => {};
  const q = query(collection(db, 'jobs'));
  return onSnapshot(q, (snapshot) => {
    const validJobs = [];
    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.expiresAt) {
        const expDate = new Date(data.expiresAt);
        expDate.setUTCHours(23, 59, 59, 999);
        if (expDate.getTime() < Date.now()) {
          deleteDoc(doc(db, 'jobs', docSnap.id)).catch(console.error);
        } else {
          validJobs.push(normalizeJob({ id: docSnap.id, ...data }));
        }
      } else {
        validJobs.push(normalizeJob({ id: docSnap.id, ...data }));
      }
    });
    callback(validJobs);
  }, (error) => {
    console.error('Error in subscribeToJobs:', error);
  });
};

/**
 * Public-safe version for the Careers page.
 * Strips candidate data so private info is never sent to unauthenticated users.
 */
export const subscribeToPublicJobs = (callback) => {
  if (!hasFirestore()) return () => {};
  const q = query(collection(db, 'jobs'));
  return onSnapshot(q, (snapshot) => {
    const publicJobs = [];
    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      // Skip closed or expired jobs
      if (data.status === 'Closed') return;
      if (data.expiresAt) {
        const expDate = new Date(data.expiresAt);
        expDate.setUTCHours(23, 59, 59, 999);
        if (expDate.getTime() < Date.now()) return;
      }
      // Strip candidates array — public users must not see applicant data
      publicJobs.push({
        id: docSnap.id,
        title: data.title || 'Untitled role',
        location: data.location || 'Remote',
        department: data.department || data.type || 'General',
        type: data.type || 'General',
        status: data.status || 'Open',
        stages: (data.stages || []).map(s => ({ id: s.id, name: s.name })), // No interviewer ID
        expiresAt: data.expiresAt || null,
        questions: Array.isArray(data.questions) ? data.questions : [],
      });
    });
    callback(publicJobs);
  }, (error) => {
    console.warn('[subscribeToPublicJobs] Snapshot error — check Firestore rules allow public read on jobs:', error.message);
    callback([]);
  });
};

export const fetchInterviewers = async () => {
  if (!hasFirestore()) {
    throw new Error('Firestore is not available. Configure Firebase before using the hiring portal.');
  }

  try {
    const snapshot = await getDocs(collection(db, 'interviewers'));
    const rawList = snapshot.docs.map((docSnap) => normalizeInterviewer({ id: docSnap.id, ...docSnap.data() }));
    // Deduplicate by name (case-insensitive) to fix duplicates
    const uniqueMap = new Map();
    const duplicates = [];
    rawList.forEach((person) => {
      const key = (person.name || '').toLowerCase().trim();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, person);
      } else {
        duplicates.push(person.id);
      }
    });
    
    // Auto-cleanup duplicates from Firestore
    duplicates.forEach(dupId => {
      deleteDoc(doc(db, 'interviewers', dupId)).catch(e => console.error('Failed to cleanup duplicate interviewer:', e));
    });

    return Array.from(uniqueMap.values());
  } catch (error) {
    console.error('Unable to fetch interviewers:', error);
    throw error;
  }
};

export const subscribeToInterviewers = (callback) => {
  if (!hasFirestore()) return () => {};
  const q = query(collection(db, 'interviewers'));
  return onSnapshot(q, (snapshot) => {
    const rawList = snapshot.docs.map((docSnap) => normalizeInterviewer({ id: docSnap.id, ...docSnap.data() }));
    const uniqueMap = new Map();
    const duplicates = [];
    rawList.forEach((person) => {
      const key = (person.name || '').toLowerCase().trim();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, person);
      } else {
        duplicates.push(person.id);
      }
    });
    
    duplicates.forEach(dupId => {
      deleteDoc(doc(db, 'interviewers', dupId)).catch(e => console.error('Failed to cleanup duplicate interviewer:', e));
    });

    callback(Array.from(uniqueMap.values()));
  }, (error) => {
    console.error('Error in subscribeToInterviewers:', error);
  });
};

export const fetchCandidates = async () => {
  if (!hasFirestore()) {
    throw new Error('Firestore is not available. Configure Firebase before using the candidate system.');
  }

  try {
    const snapshot = await getDocs(collection(db, 'candidates'));
    return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
  } catch (error) {
    console.error('Unable to fetch candidates:', error);
    throw error;
  }
};

export const fetchUserProfile = async (uid) => {
  if (!uid) return null;
  if (!hasFirestore()) {
    throw new Error('Firestore is not available. Configure Firebase before using this portal.');
  }

  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? { id: userDoc.id, ...userDoc.data() } : null;
  } catch (error) {
    console.error('Could not read Firestore user profile:', error);
    throw error;
  }
};

export const createJob = async ({ title, department, expiresAt, questions, passingThreshold }) => {
  if (!hasFirestore()) {
    throw new Error('Firestore is not available.');
  }

  if (!title || !title.trim()) {
    throw new Error('Job title is required.');
  }

  const cleanTitle = title.trim();
  const newJobData = {
    title: cleanTitle,
    location: 'Remote',
    type: department || 'General',
    department: department || 'General',
    company: 'HireZone',
    status: 'Open',
    stages: [],
    candidates: [],
    questions: Array.isArray(questions) ? questions : [],
    passingThreshold: typeof passingThreshold === 'number' ? passingThreshold : 70,
    createdAt: Date.now(),
    expiresAt: expiresAt || null,
  };
  const docRef = await addDoc(collection(db, 'jobs'), newJobData);

  return { id: docRef.id, ...newJobData };
};

export const updateJob = async (jobId, payload) => {
  if (!jobId) throw new Error('Job ID is required.');
  const jobRef = doc(db, 'jobs', jobId);
  
  const current = await getDoc(jobRef);
  if (!current.exists()) throw new Error('Job not found.');

  await updateDoc(jobRef, payload);
};

export const deleteJob = async (jobId) => {
  if (!jobId) throw new Error('Job ID is required.');
  await deleteDoc(doc(db, 'jobs', jobId));
};

export const createStageForJob = async (jobId, { name, interviewerId }) => {
  if (!jobId) throw new Error('Job ID is required.');
  const jobRef = doc(db, 'jobs', jobId);
  const current = await getDoc(jobRef);

  if (!current.exists()) {
    throw new Error('Job not found.');
  }

  const existingStages = current.data().stages || [];
  const cleanName = String(name || '').trim();
  if (!cleanName) {
    throw new Error('Stage name is required.');
  }

  const nextStage = {
    id: buildStageId(cleanName),
    name: cleanName,
    interviewer: interviewerId || '',
  };

  const resolvedStages = [...existingStages, nextStage];
  await updateDoc(jobRef, { stages: resolvedStages });

  return { ...current.data(), stages: resolvedStages };
};

export const updateStageForJob = async (jobId, stageId, { name, interviewerId }) => {
  if (!jobId || !stageId) throw new Error('Job and stage are required.');
  const jobRef = doc(db, 'jobs', jobId);
  const current = await getDoc(jobRef);

  if (!current.exists()) {
    throw new Error('Job not found.');
  }

  const cleanName = String(name || '').trim();
  if (!cleanName) {
    throw new Error('Stage name is required.');
  }

  const stages = (current.data().stages || []).map((stage) =>
    stage.id === stageId ? { ...stage, name: cleanName, interviewer: interviewerId || '' } : stage
  );

  await updateDoc(jobRef, { stages });
  return { ...current.data(), stages };
};

export const deleteStageForJob = async (jobId, stageId) => {
  if (!jobId || !stageId) throw new Error('Job and stage are required.');
  const jobRef = doc(db, 'jobs', jobId);
  const current = await getDoc(jobRef);

  if (!current.exists()) {
    throw new Error('Job not found.');
  }

  const jobData = current.data();
  const remainingStages = (jobData.stages || []).filter((stage) => stage.id !== stageId);
  const fallbackStage = remainingStages[0];

  const nextCandidates = (jobData.candidates || []).map((candidate) =>
    candidate.stage === stageId
      ? {
          ...candidate,
          stage: fallbackStage?.id || '',
          stageLabel: fallbackStage?.name || 'Unassigned',
        }
      : candidate
  );

  await updateDoc(jobRef, {
    stages: remainingStages,
    candidates: nextCandidates,
  });

  return { ...jobData, stages: remainingStages, candidates: nextCandidates };
};

export const assignStageInterviewer = async (jobId, stageId, interviewerId) => {
  if (!jobId) throw new Error('Job is required.');
  const jobRef = doc(db, 'jobs', jobId);
  const current = await getDoc(jobRef);
  if (!current.exists()) throw new Error('Job not found.');

  const stages = (current.data().stages || []).map((stage) => {
    if (stageId && stage.id === stageId) {
      return { ...stage, interviewer: interviewerId || '' };
    }
    if (stage.interviewer === interviewerId) {
      return { ...stage, interviewer: '' }; // Remove interviewer from other stages
    }
    return stage;
  });

  await updateDoc(jobRef, { stages });
  return { ...current.data(), stages };
};

export const persistJobs = async (jobs) => {
  if (!hasFirestore()) return;

  for (const job of jobs) {
    await setDoc(doc(db, 'jobs', job.id), normalizeJob(job));
  }
};

export const updateStageAssignment = async (jobId, stageId, interviewerId) => {
  return assignStageInterviewer(jobId, stageId, interviewerId);
};

export const submitCandidateFeedback = async (jobId, candidateId, payload) => {
  const jobRef = doc(db, 'jobs', jobId);
  const current = await getDoc(jobRef);
  if (!current.exists()) throw new Error('Job not found.');

  const currentData = current.data();
  const targetCandidate = (currentData.candidates || []).find(c => c.id === candidateId);
  const updatedCandidates = (currentData.candidates || []).map((candidate) =>
    candidate.id === candidateId ? { ...candidate, ...payload, hasSubmittedFeedback: true } : candidate
  );

  await updateDoc(jobRef, { candidates: updatedCandidates });

  // Send feedback-published email and in-app notification
  if (targetCandidate?.email) {
    const stageInfo = (currentData.stages || []).find(s => s.id === targetCandidate.stage);
    sendFeedbackPublishedEmail({
      candidateName: targetCandidate.name,
      toEmail: targetCandidate.email,
      jobTitle: currentData.title || 'your role',
      stageName: stageInfo?.name || targetCandidate.stageLabel || 'Interview',
    });
    if (targetCandidate.userUid) {
      createNotification(
        targetCandidate.userUid,
        'Your interviewer has submitted feedback. Log in to view your score.',
        'feedback_ready'
      );
    }
    // Also notify HR team about the completed evaluation
    createNotification(
      '1mIpbjxAPBX0kNii8XrjlXmIwdr2',
      `Interviewer submitted feedback for ${targetCandidate.name} (Score: ${payload.score || ''}/10)`,
      'feedback_ready'
    );
  }
};

export const createCandidateProfile = async ({
  name,
  email,
  jobId,
  stageId,
  cvText = '',
  cvUrl = '',
  notes = '',
  source = 'HR portal',
  aiScore = null,
  aiSummary = '',
}) => {
  if (!name || !email || !jobId || !stageId) {
    throw new Error('Candidate name, email, job, and stage are required.');
  }

  const cleanEmail = String(email).trim().toLowerCase();
  const cleanName = String(name).trim();

  const candidateId = `candidate-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const jobDoc = await getDoc(doc(db, 'jobs', jobId));
  const stageName = jobDoc.exists()
    ? (jobDoc.data().stages || []).find((stage) => stage.id === stageId)?.name || stageId
    : stageId;

  const candidateData = {
    id: candidateId,
    name: cleanName,
    email: cleanEmail,
    cvText: cvText || '',
    cvUrl: cvUrl || '',
    notes: notes || '',
    jobId,
    currentStage: stageId,
    status: source === 'self-apply' ? 'Screening' : 'Applied',
    source,
    createdAt: Date.now(),
    hasSubmittedFeedback: false,
    stageLabel: stageName,
    aiScore: aiScore !== null && aiScore !== undefined && !isNaN(Number(aiScore)) ? Number(aiScore) : null,
    aiSummary: aiSummary || '',
  };

  try {
    await setDoc(doc(db, 'candidates', candidateId), candidateData);
  } catch (error) {
    console.warn('Could not write to candidates collection. Check Firestore rules.', error);
  }

  try {
    const jobRef = doc(db, 'jobs', jobId);
    const freshJobDoc = await getDoc(jobRef);
    if (freshJobDoc.exists()) {
      // For self-apply: only add to HR pipeline if AI score meets the threshold
      const selfApply = source === 'self-apply';
      const jobData = freshJobDoc.data();
      const passingThreshold = typeof jobData.passingThreshold === 'number' ? jobData.passingThreshold : AI_SCORE_THRESHOLD;
      const passedScreening = !selfApply || aiScore === null || Number(aiScore) >= passingThreshold;

      if (passedScreening) {
        const existingCandidates = Array.isArray(freshJobDoc.data().candidates) ? freshJobDoc.data().candidates : [];
        await updateDoc(jobRef, {
          candidates: [
            ...existingCandidates,
            {
              id: candidateId,
              name: cleanName,
              email: cleanEmail,
              stage: stageId,
              status: passedScreening && selfApply ? 'Applied' : candidateData.status,
              hasSubmittedFeedback: false,
              score: 0,
              feedback: '',
              stageLabel: stageName,
              cvText: cvText || '',
              cvUrl: cvUrl || '',
              notes: notes || '',
              source,
              aiScore: candidateData.aiScore,
              aiSummary: candidateData.aiSummary,
              createdAt: Date.now(),
            },
          ],
        });
      } else {
        // Below threshold — save to candidates collection but don't add to HR board
        console.log(`[Screening] Candidate ${cleanName} scored ${aiScore}/100 — below threshold (${AI_SCORE_THRESHOLD}). Not added to HR pipeline.`);
        // Update their status in the candidates doc to reflect this
        await setDoc(doc(db, 'candidates', candidateId), { ...candidateData, status: 'Screened Out' }, { merge: true });
      }
    }
  } catch (error) {
    console.error('Failed to add candidate to job:', error);
    throw new Error('Could not add candidate to the job board.', { cause: error });
  }

  return candidateData;
};

export const advanceCandidateStage = async (jobId, candidateId, nextStageId) => {
  const jobRef = doc(db, 'jobs', jobId);
  const current = await getDoc(jobRef);
  if (!current.exists()) throw new Error('Job not found.');

  const nextStages = (current.data().stages || []).map((stage) => ({ ...stage }));
  const stageInfo = nextStages.find((stage) => stage.id === nextStageId);

  const updatedCandidates = (current.data().candidates || []).map((candidate) => {
    if (candidate.id !== candidateId) return candidate;

    const newHistory = [...(candidate.feedbackHistory || [])];
    if (candidate.hasSubmittedFeedback) {
      newHistory.push({
        stageId: candidate.stage,
        stageName: candidate.stageLabel || candidate.stage,
        score: candidate.score || 0,
        feedback: candidate.feedback || '',
        date: Date.now()
      });
    }

    return {
      ...candidate,
      stage: nextStageId,
      stageLabel: stageInfo?.name || nextStageId,
      status: 'Pending',
      hasSubmittedFeedback: false,
      score: 0,
      feedback: '',
      feedbackHistory: newHistory,
    };
  });

  await updateDoc(jobRef, { candidates: updatedCandidates });

  // Send stage-advanced email + in-app notification
  const movedCandidate = (current.data().candidates || []).find(c => c.id === candidateId);
  if (movedCandidate?.email) {
    sendStageAdvancedEmail({
      candidateName: movedCandidate.name,
      toEmail: movedCandidate.email,
      jobTitle: current.data().title || 'your role',
      stageName: stageInfo?.name || nextStageId,
    });
    if (movedCandidate.userUid) {
      createNotification(
        movedCandidate.userUid,
        `Your application has moved to: ${stageInfo?.name || nextStageId}`,
        'stage_advanced'
      );
    }
  }

  const candidateRef = doc(db, 'candidates', candidateId);
  const candidateDoc = await getDoc(candidateRef);
  if (candidateDoc.exists()) {
    await updateDoc(candidateRef, {
      currentStage: nextStageId,
      status: 'Pending',
      hasSubmittedFeedback: false,
    });
  }
};

export const updateCandidateProfile = async (candidateId, payload) => {
  const candidateRef = doc(db, 'candidates', candidateId);
  const current = await getDoc(candidateRef);
  if (!current.exists()) throw new Error('Candidate not found.');

  await updateDoc(candidateRef, payload);
};

export const failCandidate = async (jobId, candidateId) => {
  const jobRef = doc(db, 'jobs', jobId);
  const current = await getDoc(jobRef);
  if (!current.exists()) throw new Error('Job not found.');

  const jobData = current.data();
  const targetCandidate = (jobData.candidates || []).find(c => c.id === candidateId);

  const updatedCandidates = (jobData.candidates || []).map((candidate) =>
    candidate.id === candidateId
      ? { ...candidate, status: 'Failed' }
      : candidate
  );

  await updateDoc(jobRef, { candidates: updatedCandidates });

  const candidateRef = doc(db, 'candidates', candidateId);
  const candidateDoc = await getDoc(candidateRef);
  if (candidateDoc.exists()) {
    await updateDoc(candidateRef, { status: 'Failed' });
  }

  // Send rejection email + in-app notification
  if (targetCandidate?.email) {
    sendRejectedEmail({
      candidateName: targetCandidate.name,
      toEmail: targetCandidate.email,
      jobTitle: jobData.title || 'the role',
    });
    if (targetCandidate.userUid) {
      createNotification(
        targetCandidate.userUid,
        'An update on your application is available. Please log in to view.',
        'application_update'
      );
    }
  }
};

export const hireCandidate = async (jobId, candidateId, offer = {}) => {
  const jobRef = doc(db, 'jobs', jobId);
  const current = await getDoc(jobRef);
  if (!current.exists()) throw new Error('Job not found.');

  const jobData = current.data();
  const targetCandidate = (jobData.candidates || []).find(c => c.id === candidateId);
  const now = Date.now();

  const updatedCandidates = (jobData.candidates || []).map((candidate) =>
    candidate.id === candidateId
      ? { ...candidate, status: 'Hired', hiredAt: now, offer: { startDate: offer.startDate || '', offerNotes: offer.offerNotes || '' } }
      : candidate
  );

  await updateDoc(jobRef, { candidates: updatedCandidates });

  const candidateRef = doc(db, 'candidates', candidateId);
  const candidateDoc = await getDoc(candidateRef);
  if (candidateDoc.exists()) {
    await updateDoc(candidateRef, { status: 'Hired', hiredAt: now, offer });
  }

  // Send hired email + in-app notification
  if (targetCandidate?.email) {
    sendHiredEmail({
      candidateName: targetCandidate.name,
      toEmail: targetCandidate.email,
      jobTitle: jobData.title || 'the role',
      startDate: offer.startDate || '',
      offerNotes: offer.offerNotes || '',
    });
    if (targetCandidate.userUid) {
      createNotification(
        targetCandidate.userUid,
        `🎉 Congratulations! You have been hired for ${jobData.title || 'the role'}.`,
        'hired'
      );
    }
  }
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const createNotification = async (recipientUid, message, type = 'general') => {
  if (!hasFirestore() || !recipientUid) return;
  try {
    await addDoc(collection(db, 'notifications'), {
      recipientUid,
      message,
      type,
      read: false,
      createdAt: Date.now(),
    });
  } catch (err) {
    // Never crash the app on notification failure
    console.warn('[Notifications] Could not create notification:', err.message);
  }
};

export const subscribeToNotifications = (uid, callback) => {
  if (!hasFirestore() || !uid) return () => {};
  const q = query(
    collection(db, 'notifications'),
    where('recipientUid', '==', uid)
  );
  return onSnapshot(q, (snapshot) => {
    const notifs = snapshot.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    callback(notifs);
  }, (err) => {
    // Silently fail if collection doesn't exist yet or rules deny access
    console.warn('[Notifications] Snapshot error (collection may not exist yet):', err.message);
    callback([]);
  });
};

export const markNotificationRead = async (notifId) => {
  if (!hasFirestore() || !notifId) return;
  try {
    await updateDoc(doc(db, 'notifications', notifId), { read: true });
  } catch (err) {
    console.warn('[Notifications] Could not mark notification as read:', err.message);
  }
};

// ─── Candidate real-time listener ─────────────────────────────────────────────

export const subscribeToCandidate = (candidateId, callback) => {
  if (!hasFirestore() || !candidateId) return () => {};
  return onSnapshot(doc(db, 'candidates', candidateId), (snap) => {
    if (snap.exists()) {
      callback({ id: snap.id, ...snap.data() });
    } else {
      callback(null);
    }
  }, (err) => {
    console.warn('[subscribeToCandidate] Error:', err.message);
  });
};

// ─── AI Screening Report ──────────────────────────────────────────────────────

export const saveAiReport = async (jobId, candidateId, report, userUid) => {
  if (!hasFirestore()) return;

  // Save to jobs/{jobId} candidates array
  const jobRef = doc(db, 'jobs', jobId);
  const current = await getDoc(jobRef);
  if (current.exists()) {
    const updated = (current.data().candidates || []).map(c =>
      c.id === candidateId ? { ...c, aiReport: report } : c
    );
    await updateDoc(jobRef, { candidates: updated });
  }

  // Also save to candidates/{candidateId}
  const candidateRef = doc(db, 'candidates', candidateId);
  const candidateDoc = await getDoc(candidateRef);
  if (candidateDoc.exists()) {
    await updateDoc(candidateRef, { aiReport: report });
  }

  // Notify HR (we use a generic HR notification — future: target specific HR uid)
  console.log('[AI Report] Saved for candidate:', candidateId, report);
};
