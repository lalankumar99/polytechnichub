import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import { getFirestore, initializeFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCl89l4dQfu_vpcsHG6o_GQoHHZwGsAg5I",
  authDomain: "polytechnic-hub-c3cab.firebaseapp.com",
  databaseURL: "https://polytechnic-hub-c3cab-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "polytechnic-hub-c3cab",
  storageBucket: "polytechnic-hub-c3cab.firebasestorage.app",
  messagingSenderId: "89399734643",
  appId: "1:89399734643:web:4cefbfe8313f2f987d1506",
  measurementId: "G-3V03S8S97P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

// Initialize Analytics (only if supported in the current environment)
export let analytics: any = null;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
    console.log("Firebase Analytics initialized successfully.");
  }
}).catch(console.error);

const auth = getAuth(app);

// Fix for Code: 14 UNAVAILABLE: read ECONNRESET error in Firestore
const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});

export { app, storage, auth, db };

