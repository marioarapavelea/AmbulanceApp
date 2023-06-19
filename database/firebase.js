import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Firebase config
export const firebaseConfig = {
  // apiKey: "AIzaSyCf23dAYgB_fhpK-cqWdtfKFYmJ13QYPRY",
  // authDomain: "ambulanceapp-c2844.firebaseapp.com",
  // databaseURL:
  //   "https://ambulanceapp-c2844-default-rtdb.europe-west1.firebasedatabase.app",
  // projectId: "ambulanceapp-c2844",
  // storageBucket: "ambulanceapp-c2844.appspot.com",
  // messagingSenderId: "966944851206",
  // appId: "1:966944851206:web:d2ab86a54209a47a7d4a87",
  // measurementId: "G-KM813NW4WG",
  apiKey: "AIzaSyB0SJwVIu3Ie7_BnOh83RRn0n_9-bu3-NA",
  authDomain: "ambulance-application-2f945.firebaseapp.com",
  databaseURL:
    "https://ambulance-application-2f945-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "ambulance-application-2f945",
  storageBucket: "ambulance-application-2f945.appspot.com",
  messagingSenderId: "1016875093163",
  appId: "1:1016875093163:web:462207fc6a7e5659c7bbee",
  measurementId: "G-ETFQ5B8NXV",
};
// initialize firebase

export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const database = getFirestore(app);

export const db = getDatabase(app);

// export default app;

// if (!firebase.apps.length) {
//   firebase.initializeApp(firebaseConfig);
// }
// export default firebase;
