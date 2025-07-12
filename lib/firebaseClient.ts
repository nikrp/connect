// lib/firebaseClient.ts (or similar)
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth"; // Import getAuth for Authentication]
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBlq5Y3hrVYBdzrOANy_S13iPt1H4A3gws",
    authDomain: "connect-29f24.firebaseapp.com",
    projectId: "connect-29f24",
    storageBucket: "connect-29f24.firebasestorage.app",
    messagingSenderId: "688939789514",
    appId: "1:688939789514:web:37541ee2720fd8b4021833"
};  

// Initialize Firebase (only if it hasn't been initialized already)
function createFirebaseApp() {
  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  } else {
    return getApp();
  }
}

const app = createFirebaseApp();
export const auth = getAuth(app); // Export the auth instance
export const firestore = getFirestore(app);
