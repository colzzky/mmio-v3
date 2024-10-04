// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth } from "firebase/auth"
import { getFirestore } from 'firebase/firestore'
const {APP_FIREBASE_APIKEY,APP_FIREBASE_AUTHDOMAIN,APP_FIREBASE_PROJECTID,APP_FIREBASE_STORAGEBUCKET,APP_FIREBASE_MESSAGINGSENDERID,APP_FIREBASE_APPID,APP_FIREBASE_MEASUREMENTID} = import.meta.env;

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: APP_FIREBASE_APIKEY,
  authDomain: APP_FIREBASE_AUTHDOMAIN,
  projectId: APP_FIREBASE_PROJECTID,
  storageBucket: APP_FIREBASE_STORAGEBUCKET,
  messagingSenderId: APP_FIREBASE_MESSAGINGSENDERID,
  appId: APP_FIREBASE_APPID,
  measurementId: APP_FIREBASE_MEASUREMENTID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const firestore = getFirestore(app)
//const analytics = getAnalytics(app);

export {
  auth, firestore
}
