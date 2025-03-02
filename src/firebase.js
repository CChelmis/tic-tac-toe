import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// IMPORTANT: Replace with your actual Firebase configuration from the Firebase console
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-actual-project-id.firebaseapp.com",
  projectId: "your-actual-project-id",
  databaseURL: "https://your-actual-project-id-default-rtdb.firebaseio.com", 
  storageBucket: "your-actual-project-id.appspot.com",
  messagingSenderId: "YOUR_ACTUAL_MESSAGING_SENDER_ID",
  appId: "YOUR_ACTUAL_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database }; 