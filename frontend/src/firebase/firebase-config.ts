// firebase-config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCCr-41q6UqBtjDfa_ODQYthFSEOxJ4tBQ",
  authDomain: "library-management-syste-58861.firebaseapp.com",
  projectId: "library-management-syste-58861",
  storageBucket: "library-management-syste-58861.appspot.com",
//   messagingSenderId: "123456789012",
//   appId: "1:123456789012:web:abcdefghijklmnopqrstuvwxyz"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
