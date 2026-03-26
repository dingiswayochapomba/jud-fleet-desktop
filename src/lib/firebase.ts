import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBHrLPJ-yNLrfp7qd4jCd2F4DgZh7ZZ3WY",
  authDomain: "judiciary-fleet-management.firebaseapp.com",
  projectId: "judiciary-fleet-management",
  storageBucket: "judiciary-fleet-management.firebasestorage.app",
  messagingSenderId: "734283841006",
  appId: "1:734283841006:web:d5f3c8eaf3802a0ab622ff",
};

export const firebaseApp = initializeApp(firebaseConfig);
export const firebaseAuth = getAuth(firebaseApp);
export const firestoreDb = getFirestore(firebaseApp);
