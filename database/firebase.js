import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyCf23dAYgB_fhpK-cqWdtfKFYmJ13QYPRY",
  authDomain: "ambulanceapp-c2844.firebaseapp.com",
  databaseURL:
    "https://ambulanceapp-c2844-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ambulanceapp-c2844",
  storageBucket: "ambulanceapp-c2844.appspot.com",
  messagingSenderId: "966944851206",
  appId: "1:966944851206:web:d2ab86a54209a47a7d4a87",
  measurementId: "G-KM813NW4WG",
};
// initialize firebase

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
export default firebase;
// const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const database = getFirestore();
export const db = getDatabase(app);
