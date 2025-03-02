import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Replace with your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBXH7JgXIWzi7DNwjN7LzgX4bvRGqKMXXX",
  authDomain: "tic-tac-toe-multiplayer-xxxx.firebaseapp.com",
  projectId: "tic-tac-toe-multiplayer-xxxx",
  databaseURL: "https://tic-tac-toe-multiplayer-xxxx-default-rtdb.firebaseio.com",
  storageBucket: "tic-tac-toe-multiplayer-xxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890abcdef"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

export { database }; 