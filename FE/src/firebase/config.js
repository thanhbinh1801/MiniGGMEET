// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBovhY9eCHczxsoiaxHlXO8Ji48GcvZAjM",
  authDomain: "ggmeet-51a11.firebaseapp.com",
  projectId: "ggmeet-51a11",
  storageBucket: "ggmeet-51a11.firebasestorage.app",
  messagingSenderId: "36136146088",
  appId: "1:36136146088:web:53ddaed4a7b3a0400e5e9d",
  measurementId: "G-9PCLZHBX41"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);