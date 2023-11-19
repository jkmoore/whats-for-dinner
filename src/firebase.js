// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCnaH-6ndEOBUJIIwQKkPUzXP5odtanidY",
  authDomain: "whats-for-dinner-26f01.firebaseapp.com",
  projectId: "whats-for-dinner-26f01",
  storageBucket: "whats-for-dinner-26f01.appspot.com",
  messagingSenderId: "836493515880",
  appId: "1:836493515880:web:20e325c200e91738502fdd",
  measurementId: "G-BQ6FM4B466",
};

// Initialize Firebase and Firebase Authentication
const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
