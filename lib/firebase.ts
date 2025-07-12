// firebaseAdmin.ts
import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import * as admin from 'firebase-admin';

const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS || '');

function initializeFirebaseAdmin() {
  if (!getApps().length) {
    initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
  return getApp();
}

const adminApp = initializeFirebaseAdmin();
export const adminAuth = getAuth(adminApp);