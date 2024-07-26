import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const getEnvVariable = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set.`);
  }
  return value;
};

const firebaseConfig = {
  apiKey: getEnvVariable('REACT_APP_FIREBASE_API_KEY'),
  authDomain: getEnvVariable('REACT_APP_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnvVariable('REACT_APP_FIREBASE_PROJECT_ID'),
  storageBucket: getEnvVariable('REACT_APP_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnvVariable('REACT_APP_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnvVariable('REACT_APP_FIREBASE_APP_ID'),
  measurementId: getEnvVariable('REACT_APP_FIREBASE_MEASUREMENT_ID'),
};

// Initialize Firebase
const app: FirebaseApp = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and Firestore
export const firestore: Firestore = getFirestore(app);
export const auth: Auth = getAuth(app);
