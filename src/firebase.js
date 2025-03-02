import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Replace with your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDyHnwyi-DCCFYfqF3VBmI3zXotsT92NpM",
  authDomain: "tic-tac-toe-multiplayer-a26df.firebaseapp.com",
  projectId: "tic-tac-toe-multiplayer-a26df",
  storageBucket: "tic-tac-toe-multiplayer-a26df.firebasestorage.app",
  databaseURL: "https://tic-tac-toe-multiplayer-a26df-default-rtdb.firebaseio.com", 
  messagingSenderId: "223644617169",
  appId: "1:223644617169:web:4a74c68bcaeb5ffc1db8f0",
  measurementId: "G-JD76PYMS7D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database }; 