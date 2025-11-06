// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyD7J4XFNdFSzGDYGMejpubwv-DHcypPa10",
  authDomain: "otp-6f94e.firebaseapp.com",
  projectId: "otp-6f94e",
  storageBucket: "otp-6f94e.firebasestorage.app",
  messagingSenderId: "882089711585",
  appId: "1:882089711585:web:be04bc875be2849d35e4a0",
  measurementId: "G-43NQN1LWP5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

export { app, analytics, auth };
export default app;

