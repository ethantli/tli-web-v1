import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCboCSoLd7LM3v0pe5p2lf2qljUvNbd6Kk",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "peak-bit-486121-n6.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "peak-bit-486121-n6",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "peak-bit-486121-n6.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "207278105140",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:207278105140:web:c7e78ab5d0d122d24f2061",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-W6QWHMQWVQ"
};
console.log(firebaseConfig)
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('Firebase configuration is missing required fields');
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize analytics only if supported
let analyticsInstance = null;
try {
  if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
    analyticsInstance = getAnalytics(app);
  }
} catch (error) {
  console.warn('Analytics not available:', error);
}
export const analytics = analyticsInstance;
