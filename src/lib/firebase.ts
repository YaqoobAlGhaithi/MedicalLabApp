import { Capacitor } from '@capacitor/core';
import { initializeApp } from 'firebase/app';
import { getAuth, getRedirectResult, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut } from 'firebase/auth';
import { doc, getDocFromServer, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

/**
 * Firebase configuration resolution:
 * 1. VITE_FIREBASE_* env vars (build-time) take priority — they let you point the app at a
 *    new Firebase project without editing source code.
 * 2. Falls back to firebase-applet-config.json (the currently committed project).
 *
 * NOTE: The values for the new unified Firebase project are NOT present in this repository.
 * You must supply them (see the change report) — nothing here is invented.
 */
const env = import.meta.env;
const resolvedConfig = {
  projectId: env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  appId: env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  apiKey: env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfig.measurementId,
};

const app = initializeApp(resolvedConfig);

/**
 * Firestore database selection — the app must never break because of a database id mismatch:
 * - If a custom Firestore Database ID is configured (VITE_FIRESTORE_DATABASE_ID or
 *   firebaseConfig.firestoreDatabaseId), use it.
 * - Otherwise fall back to the default "(default)" database.
 */
const configuredDatabaseId = (env.VITE_FIRESTORE_DATABASE_ID || firebaseConfig.firestoreDatabaseId || '').trim();
export const db =
  configuredDatabaseId && configuredDatabaseId !== '(default)'
    ? getFirestore(app, configuredDatabaseId)
    : getFirestore(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

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

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
    return false;
  }
}

/**
 * Google Sign-In:
 * - Web: signInWithPopup (opens a popup window).
 * - Capacitor Android WebView: signInWithRedirect + getRedirectResult — popups are unreliable
 *   inside a WebView, so the redirect flow is used (opens the system browser / custom tab via
 *   authDomain, then returns to the app where getRedirectResult completes the sign-in).
 *
 * NOTE: For a fully native experience, install @capacitor-firebase/authentication and use its
 * native Google provider. That requires Firebase Console setup: Android app registered with
 * the same project, SHA-1/SHA-256 of the signing certificate, and an OAuth client.
 */
const isNativePlatform = Capacitor.isNativePlatform();

export async function signInWithGoogle() {
  if (isNativePlatform) {
    await signInWithRedirect(auth, googleProvider);
    return null;
  }
  return await signInWithPopup(auth, googleProvider);
}

export async function resolveRedirectResult() {
  return await getRedirectResult(auth);
}

export async function logOutFirebase() {
  return await signOut(auth);
}

export default app;
