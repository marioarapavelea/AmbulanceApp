import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";

// Firebase config
export const firebaseConfig = {
  apiKey: "AIzaSyD5IGrYkJWVmjYTefUj4bGrXrbwafX56bg",
  authDomain: "ambulance-project-3eb92.firebaseapp.com",
  projectId: "ambulance-project-3eb92",
  storageBucket: "ambulance-project-3eb92.appspot.com",
  messagingSenderId: "793558916727",
  appId: "1:793558916727:web:acbf7d3922511ab64e3072",
  measurementId: "G-1TZDN5TK7D",
  databaseURL:
    "https://ambulance-project-3eb92-default-rtdb.europe-west1.firebasedatabase.app",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth();
export const database = getFirestore(app);
export const db = getDatabase(app);

// export default app;

// if (!firebase.apps.length) {
//   firebase.initializeApp(firebaseConfig);
// }
// export default firebase;
