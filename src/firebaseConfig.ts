import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBGPHnj5bI5eA_5q1bJyG8XQd3L5fSYFho",
  authDomain: "closetly-prototype.firebaseapp.com",
  projectId: "closetly-prototype",
  storageBucket: "closetly-prototype.firebasestorage.app",
  messagingSenderId: "539607453750",
  appId: "1:539607453750:web:e00c65161cfdd2375b0897",
  measurementId: "G-2GGPVY2ERF"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Initialize analytics only on client side
let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then(yes => yes ? getAnalytics(app) : null).then(analyticsInstance => {
    analytics = analyticsInstance;
  });
}

export { analytics }; 