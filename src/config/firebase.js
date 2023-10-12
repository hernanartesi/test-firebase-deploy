// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

import {getAuth, GoogleAuthProvider} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAEEkJwcZXzdSkBDIpbcFtRp1vImNic-lk",
  authDomain: "test1-99d75.firebaseapp.com",
  projectId: "test1-99d75",
  storageBucket: "test1-99d75.appspot.com",
  messagingSenderId: "737336306889",
  appId: "1:737336306889:web:3855c6720ac5c8d0a43118"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);