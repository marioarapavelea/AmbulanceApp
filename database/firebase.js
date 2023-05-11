import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCf23dAYgB_fhpK-cqWdtfKFYmJ13QYPRY",
  authDomain: "ambulanceapp-c2844.firebaseapp.com",
  projectId: "ambulanceapp-c2844",
  storageBucket: "ambulanceapp-c2844.appspot.com",
  messagingSenderId: "966944851206",
  appId: "1:966944851206:web:d2ab86a54209a47a7d4a87",
  measurementId: "G-KM813NW4WG",
};
// initialize firebase
initializeApp(firebaseConfig);
export const auth = getAuth();
export const database = getFirestore();
