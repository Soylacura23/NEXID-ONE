import { FirebaseApp, initializeApp } from 'firebase/app';
import { Auth, getAuth } from 'firebase/auth';
import { Firestore, doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import appletConfig from '../../../firebase-applet-config.json';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

interface FirebaseRuntimeConfig {
  projectId: string;
  appId: string;
  apiKey: string;
  authDomain: string;
  firestoreDatabaseId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
}

function resolveFirebaseConfig(): FirebaseRuntimeConfig | null {
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY as string | undefined;
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined;

  if (envApiKey && envProjectId) {
    return {
      apiKey: envApiKey,
      authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || `${envProjectId}.firebasestorage.app`,
      messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || '',
      appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || '',
      firestoreDatabaseId: (import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID as string) || undefined,
    };
  }

  if (appletConfig && appletConfig.apiKey && appletConfig.projectId && appletConfig.projectId !== 'remixed-project-id') {
    return appletConfig as FirebaseRuntimeConfig;
  }

  return null;
}

const resolvedConfig = resolveFirebaseConfig();

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;

if (resolvedConfig) {
  try {
    appInstance = initializeApp(resolvedConfig);
    dbInstance = resolvedConfig.firestoreDatabaseId
      ? getFirestore(appInstance, resolvedConfig.firestoreDatabaseId)
      : getFirestore(appInstance);
    authInstance = getAuth(appInstance);
  } catch (err) {
    console.error('Firebase initialization failed, falling back to local mode:', err);
  }
}

export const firebaseApp = appInstance;
export const db = dbInstance;
export const auth = authInstance;
export const isFirebaseConfigured = Boolean(appInstance && dbInstance && authInstance);
export const firebaseProjectId = resolvedConfig?.projectId || null;

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: authInstance?.currentUser?.uid,
      email: authInstance?.currentUser?.email,
      emailVerified: authInstance?.currentUser?.emailVerified,
      isAnonymous: authInstance?.currentUser?.isAnonymous,
      tenantId: authInstance?.currentUser?.tenantId,
      providerInfo:
        authInstance?.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testFirestoreConnection(): Promise<boolean> {
  if (!dbInstance) return false;
  try {
    await getDocFromServer(doc(dbInstance, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return false;
    }
    return true;
  }
}
