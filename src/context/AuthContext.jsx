/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { auth, db } from '../firebase/config';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext();

const normalizeRole = (role) => {
  if (!role) return 'candidate';

  const normalized = String(role).trim().toLowerCase();
  if (normalized === 'hiring_manager') return 'hiring_manager';
  if (normalized === 'hr') return 'hr';
  if (normalized === 'manager') return 'manager';
  if (normalized === 'interviewer') return 'interviewer';
  if (normalized === 'candidate') return 'candidate';

  return 'candidate';
};

const getStoredPortalRole = () => {
  try {
    return sessionStorage.getItem('hirezone-selected-role') || localStorage.getItem('hirezone-selected-role') || null;
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userProfileId, setUserProfileId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setCurrentUser(null);
        setUserRole(null);
        setUserProfileId(null);
        setUserName(null);
        setAuthError('');
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const profile = userDoc.exists() ? userDoc.data() : null;
        const storedRole = getStoredPortalRole();
        
        let resolvedRole;
        let resolvedProfileId;

        if (profile) {
          resolvedRole = normalizeRole(profile.role);
          resolvedProfileId = profile.profileId || user.uid;
        } else {
          resolvedRole = normalizeRole(storedRole || 'candidate');
          resolvedProfileId = user.uid;
          
          if (storedRole) {
            await setDoc(doc(db, 'users', user.uid), {
              uid: user.uid,
              email: user.email || '',
              name: user.displayName || user.email?.split('@')[0] || 'User',
              role: resolvedRole,
              profileId: resolvedProfileId,
              createdAt: Date.now(),
            }, { merge: true });
          }
        }

        setCurrentUser(user);
        setUserRole(resolvedRole);
        setUserProfileId(resolvedProfileId);
        setUserName(profile?.name || user.displayName || user.email || 'User');
        setAuthError('');
      } catch (error) {
        console.error('Error fetching Firestore user profile:', error);
        const storedRole = getStoredPortalRole();
        const resolvedRole = normalizeRole(storedRole || 'candidate');
        setCurrentUser(user);
        setUserRole(resolvedRole);
        setUserProfileId(user.uid);
        setUserName(user.displayName || user.email || 'User');
        setAuthError('Your Firestore profile could not be loaded. Check Firestore permissions and user documents.');
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email, password, role) => {
    const cleanEmail = String(email || '').trim();
    const cleanPassword = String(password || '');
    const selectedRole = normalizeRole(role || getStoredPortalRole() || 'candidate');

    if (!cleanEmail || !cleanPassword) {
      const error = new Error('Email and password are required.');
      setAuthError('Please enter your email and password.');
      throw error;
    }

    setAuthError('');

    try {
      await setPersistence(auth, browserSessionPersistence);
      const result = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      const profile = userDoc.exists() ? userDoc.data() : null;
      
      const profileRole = profile ? normalizeRole(profile.role) : null;
      const requestedRole = normalizeRole(role || selectedRole || 'candidate');

      if (profileRole && profileRole !== requestedRole) {
        const error = new Error(`Portal role mismatch. This account is registered as a ${profileRole} user. Use the correct portal login.`);
        setAuthError(error.message);
        await signOut(auth);
        throw error;
      }

      const resolvedRole = profileRole || requestedRole;
      const resolvedProfileId = (profile && profile.profileId) || result.user.uid;

      if (!profile) {
        const profileData = {
          uid: result.user.uid,
          email: cleanEmail,
          name: result.user.displayName || cleanEmail.split('@')[0],
          role: resolvedRole,
          profileId: resolvedProfileId,
          createdAt: Date.now(),
        };

        await setDoc(doc(db, 'users', result.user.uid), profileData, { merge: true });
      }

      try {
        sessionStorage.setItem('hirezone-selected-role', resolvedRole);
        localStorage.setItem('hirezone-selected-role', resolvedRole);
      } catch {
        // no-op if storage is unavailable
      }

      setCurrentUser(result.user);
      setUserRole(resolvedRole);
      setUserProfileId(resolvedProfileId);
      setUserName(profile?.name || result.user.displayName || result.user.email || 'User');

      return result.user;
    } catch (error) {
      console.error('Login failed:', error);
      if (!error.message || !error.message.includes('Portal role mismatch')) {
        const msg = `Unable to sign in. Reason: ${error.message}`;
        setAuthError(msg);
        throw new Error(msg);
      }
      throw error;
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    setUserRole(null);
    setUserProfileId(null);
    setUserName(null);
    setAuthError('');

    try {
      sessionStorage.removeItem('hirezone-selected-role');
      localStorage.removeItem('hirezone-selected-role');
    } catch {
      // no-op if storage is unavailable
    }

    try {
      await signOut(auth);
    } catch (error) {
      console.warn('Firebase logout warning:', error);
    }
  };

  const value = useMemo(
    () => ({ currentUser, userRole, userProfileId, userName, loading, authError, login, logout }),
    [currentUser, userRole, userProfileId, userName, loading, authError]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);