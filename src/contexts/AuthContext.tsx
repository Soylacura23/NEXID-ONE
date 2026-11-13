import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import {
  GoogleAuthProvider,
  User,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { userService } from '@/services/dataService';
import { auth, isFirebaseConfigured, testFirestoreConnection } from '@/services/firebase/client';
import { UserAccount } from '@/types/nexid';

interface AuthContextValue {
  user: UserAccount | null;
  firebaseUser: User | null;
  isDemoMode: boolean;
  isCloudActive: boolean;
  isAdmin: boolean;
  loading: boolean;
  authReady: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  enterDemoMode: () => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateAccountProfile: (patch: Partial<Pick<UserAccount, 'displayName' | 'photoURL' | 'onboardingCompleted' | 'themePreference' | 'languagePreference'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const DEMO_SESSION_KEY = 'nexid_one_demo_session';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [user, setUser] = useState<UserAccount | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(DEMO_SESSION_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [authReady, setAuthReady] = useState<boolean>(false);

  const hydrateDemoUser = useCallback(async () => {
    const demoAccount = await userService.getOrCreateUser('demo-user', {
      displayName: 'Alex Rivera (Demo)',
      email: 'demo@nexid-one.ejemplo',
      photoURL: '',
    });
    setUser(demoAccount);
  }, []);

  useEffect(() => {
    testFirestoreConnection();

    if (!isFirebaseConfigured || !auth) {
      if (isDemoMode) {
        hydrateDemoUser().finally(() => {
          setLoading(false);
          setAuthReady(true);
        });
      } else {
        setLoading(false);
        setAuthReady(true);
      }
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          sessionStorage.removeItem(DEMO_SESSION_KEY);
        } catch {
          // ignore
        }
        setIsDemoMode(false);
        try {
          const account = await userService.getOrCreateUser(fbUser.uid, {
            displayName: fbUser.displayName || fbUser.email?.split('@')[0] || 'Usuario NEXID ONE',
            email: fbUser.email || '',
            photoURL: fbUser.photoURL || '',
          });
          setUser(account);
        } catch (err) {
          console.error('Error hydrating user profile:', err);
          setUser({
            uid: fbUser.uid,
            displayName: fbUser.displayName || 'Usuario NEXID ONE',
            email: fbUser.email || '',
            photoURL: fbUser.photoURL || '',
            onboardingCompleted: true,
            accountStatus: 'active',
            themePreference: 'dark',
            languagePreference: 'es',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        }
      } else if (isDemoMode) {
        await hydrateDemoUser();
      } else {
        setUser(null);
      }
      setLoading(false);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, [hydrateDemoUser, isDemoMode]);

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('FIREBASE_NOT_CONFIGURED');
    }
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });
    await signInWithPopup(auth, provider);
  };

  const loginWithEmail = async (email: string, password: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('FIREBASE_NOT_CONFIGURED');
    }
    await signInWithEmailAndPassword(auth, email.trim(), password);
  };

  const registerWithEmail = async (name: string, email: string, password: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('FIREBASE_NOT_CONFIGURED');
    }
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
    if (name.trim()) {
      await updateProfile(cred.user, { displayName: name.trim() });
    }
  };

  const sendPasswordReset = async (email: string) => {
    if (!isFirebaseConfigured || !auth) {
      throw new Error('FIREBASE_NOT_CONFIGURED');
    }
    await sendPasswordResetEmail(auth, email.trim());
  };

  const enterDemoMode = async () => {
    try {
      sessionStorage.setItem(DEMO_SESSION_KEY, '1');
    } catch {
      // ignore
    }
    setIsDemoMode(true);
    await hydrateDemoUser();
  };

  const logout = async () => {
    try {
      sessionStorage.removeItem(DEMO_SESSION_KEY);
    } catch {
      // ignore
    }
    setIsDemoMode(false);
    setUser(null);
    if (isFirebaseConfigured && auth && auth.currentUser) {
      await firebaseSignOut(auth);
    }
  };

  const refreshUser = async () => {
    if (firebaseUser) {
      const account = await userService.getOrCreateUser(firebaseUser.uid, {
        displayName: firebaseUser.displayName || 'Usuario NEXID ONE',
        email: firebaseUser.email || '',
        photoURL: firebaseUser.photoURL || '',
      });
      setUser(account);
    } else if (isDemoMode) {
      await hydrateDemoUser();
    }
  };

  const updateAccountProfile = async (
    patch: Partial<Pick<UserAccount, 'displayName' | 'photoURL' | 'onboardingCompleted' | 'themePreference' | 'languagePreference'>>,
  ) => {
    if (!user) return;
    await userService.updateUser(user.uid, patch);
    setUser((prev) => (prev ? { ...prev, ...patch, updatedAt: new Date().toISOString() } : prev));
  };

  const isCloudActive = Boolean(isFirebaseConfigured && firebaseUser && !isDemoMode);
  const isAdmin = Boolean(
    isCloudActive && firebaseUser?.email === 'elcrack3d3@gmail.com' && firebaseUser?.emailVerified,
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isDemoMode,
        isCloudActive,
        isAdmin,
        loading,
        authReady,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        sendPasswordReset,
        enterDemoMode,
        logout,
        refreshUser,
        updateAccountProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
