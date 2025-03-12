import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBQwG2AlOopA3CfpYSLi7KbP5ikHfaV-ok",
  authDomain: "vyshakh-ee824.firebaseapp.com",
  projectId: "vyshakh-ee824",
  storageBucket: "vyshakh-ee824.firebasestorage.app",
  messagingSenderId: "1080197460053",
  appId: "1:1080197460053:web:f640e9354d207d756ee4dc"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
