// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: import.meta.end.VITE_APP_FIREBASE_API_KEY,
  authDomain: "tasky-taskmanager.firebaseapp.com",
  projectId: "tasky-taskmanager",
  storageBucket: "tasky-taskmanager.appspot.com",
  messagingSenderId: "370272523364",
  appId: "1:370272523364:web:646b64faaaa428951b7b71",
  measurementId: "G-B8ZXRHQM0Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);