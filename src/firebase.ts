import { initializeApp, getApps } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
import firebaseConfig from "../firebase-applet-config.json";

// Initialize or get the default Firebase app
const app = getApps().find(a => a.name === '[DEFAULT]') || initializeApp(firebaseConfig);
const storage = getStorage(app);
const auth = getAuth(app);

// Safe export for compatibility without establishing unnecessary gRPC listeners
export const db = null as any;

export { app, storage, auth };


