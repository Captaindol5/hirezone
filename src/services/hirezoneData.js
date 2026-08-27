import { createUserWithEmailAndPassword, getAuth, signOut, setPersistence, inMemoryPersistence } from 'firebase/auth';
import { initializeApp, deleteApp } from 'firebase/app';
import { addDoc, collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, onSnapshot, query } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const hasFirestore = () => Boolean(db);

const normalizeJob = (job) => ({
  id: job.id,
  title: job.title || 'Untitled role',
  location: job.location || 'Remote',
  type: job.type || 'General',
  status: job.status || 'Open',
  company: job.company || 'HireZone',
  stages: Array.isArray(job.stages) ? job.stages : [],
  candidates: Array.isArray(job.candidates) ? job.candidates : [],
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
    return snapshot.docs.map((docSnap) => normalizeJob({ id: docSnap.id, ...docSnap.data() }));
  } catch (error) {
    console.error('Unable to fetch jobs:', error);
    throw error;
  }
};

export const subscribeToJobs = (callback) => {
  if (!hasFirestore()) return () => {};
  const q = query(collection(db, 'jobs'));
  return onSnapshot(q, (snapshot) => {
    const jobs = snapshot.docs.map((docSnap) => normalizeJob({ id: docSnap.id, ...docSnap.data() }));
    callback(jobs);
  }, (error) => {
    console.error('Error in subscribeToJobs:', error);
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

export const createJob = async ({ title, location, type, company = 'HireZone' }) => {
  if (!hasFirestore()) {
    throw new Error('Firestore is not available.');
  }

  if (!title || !title.trim()) {
    throw new Error('Job title is required.');
  }

  const cleanTitle = title.trim();
  const docRef = await addDoc(collection(db, 'jobs'), {
    title: cleanTitle,
    location: location || 'Remote',
    type: type || 'General',
    company,
    status: 'Open',
    stages: [],
    candidates: [],
    createdAt: Date.now(),
  });

  return { id: docRef.id, title: cleanTitle, location: location || 'Remote', type: type || 'General', company, status: 'Open', stages: [], candidates: [] };
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
  const updatedCandidates = (currentData.candidates || []).map((candidate) =>
    candidate.id === candidateId ? { ...candidate, ...payload, hasSubmittedFeedback: true } : candidate
  );

  await updateDoc(jobRef, { candidates: updatedCandidates });
};

export const createCandidateProfile = async ({
  name,
  email,
  jobId,
  stageId,
  cvUrl = '',
  photoUrl = '',
  notes = '',
  password = 'Welcome@123',
}) => {
  if (!name || !email || !jobId || !stageId) {
    throw new Error('Candidate name, email, job, and stage are required.');
  }

  const cleanEmail = String(email).trim();
  const cleanName = String(name).trim();

  // Initialize a secondary app to create the user so the current HR user is not logged out
  const secondaryApp = initializeApp(auth.app.options, `SecondaryApp-${Date.now()}`);
  const secondaryAuth = getAuth(secondaryApp);
  
  // CRITICAL: Set persistence to in-memory so it doesn't share state with the main app
  await setPersistence(secondaryAuth, inMemoryPersistence);

  let userCredential;
  try {
    userCredential = await createUserWithEmailAndPassword(secondaryAuth, cleanEmail, password);
    await signOut(secondaryAuth);
  } finally {
    await deleteApp(secondaryApp);
  }

  const candidateId = `candidate-${Date.now()}`;
  const jobDoc = await getDoc(doc(db, 'jobs', jobId));
  const stageName = jobDoc.exists()
    ? (jobDoc.data().stages || []).find((stage) => stage.id === stageId)?.name || stageId
    : stageId;

  const candidateData = {
    id: candidateId,
    name: cleanName,
    email: cleanEmail,
    cvUrl,
    photoUrl,
    notes,
    jobId,
    currentStage: stageId,
    status: 'Applied',
    source: 'HR portal',
    userUid: userCredential.user.uid,
    createdAt: Date.now(),
    hasSubmittedFeedback: false,
    stageLabel: stageName,
  };

  try {
    await setDoc(doc(db, 'candidates', candidateId), candidateData);
  } catch (error) {
    console.warn('Could not write to candidates collection. Check Firestore rules.', error);
  }

  try {
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: cleanEmail,
      name: cleanName,
      role: 'candidate',
      profileId: candidateId,
      createdAt: Date.now(),
    });
  } catch (error) {
    console.warn('Could not write to users collection. Check Firestore rules.', error);
    // Even if this fails, we continue so the candidate is added to the job board.
  }

  try {
    const jobRef = doc(db, 'jobs', jobId);
    const freshJobDoc = await getDoc(jobRef);
    if (freshJobDoc.exists()) {
      const existingCandidates = Array.isArray(freshJobDoc.data().candidates) ? freshJobDoc.data().candidates : [];
      await updateDoc(jobRef, {
        candidates: [
          ...existingCandidates,
          {
            id: candidateId,
            name: cleanName,
            email: cleanEmail,
            stage: stageId,
            status: 'Applied',
            hasSubmittedFeedback: false,
            score: 0,
            feedback: '',
            stageLabel: stageName,
            cvUrl: cvUrl || '',
            photoUrl: photoUrl || '',
            notes: notes || '',
            userUid: userCredential.user.uid,
            createdAt: Date.now(),
          },
        ],
      });
    }
  } catch (error) {
    console.error('Failed to add candidate to job:', error);
    throw new Error('Candidate created in Auth, but could not be added to the job board due to permission errors.');
  }

  return candidateData;
};

export const advanceCandidateStage = async (jobId, candidateId, nextStageId) => {
  const jobRef = doc(db, 'jobs', jobId);
  const current = await getDoc(jobRef);
  if (!current.exists()) throw new Error('Job not found.');

  const nextStages = (current.data().stages || []).map((stage) => ({ ...stage }));
  const stageInfo = nextStages.find((stage) => stage.id === nextStageId);

  const updatedCandidates = (current.data().candidates || []).map((candidate) =>
    candidate.id === candidateId
      ? {
          ...candidate,
          stage: nextStageId,
          stageLabel: stageInfo?.name || nextStageId,
          status: 'Pending',
          hasSubmittedFeedback: false,
          score: 0,
          feedback: '',
        }
      : candidate
  );

  await updateDoc(jobRef, { candidates: updatedCandidates });

  const candidateRef = doc(db, 'candidates', candidateId);
  const candidateDoc = await getDoc(candidateRef);
  if (candidateDoc.exists()) {
    await updateDoc(candidateRef, { 
      currentStage: nextStageId, 
      status: 'Pending',
      hasSubmittedFeedback: false
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

  const updatedCandidates = (current.data().candidates || []).map((candidate) =>
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
};

export const hireCandidate = async (jobId, candidateId) => {
  const jobRef = doc(db, 'jobs', jobId);
  const current = await getDoc(jobRef);
  if (!current.exists()) throw new Error('Job not found.');

  const updatedCandidates = (current.data().candidates || []).map((candidate) =>
    candidate.id === candidateId
      ? { ...candidate, status: 'Hired' }
      : candidate
  );

  await updateDoc(jobRef, { candidates: updatedCandidates });

  const candidateRef = doc(db, 'candidates', candidateId);
  const candidateDoc = await getDoc(candidateRef);
  if (candidateDoc.exists()) {
    await updateDoc(candidateRef, { status: 'Hired' });
  }
};
