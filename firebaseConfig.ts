// firebaseConfig.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: "G-MHYNJJ1HF5",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Firestore
export const db = getFirestore(app);

// Auth (Firebase still manages credentials & persistence internally)
export const auth = getAuth(app);

// --- AsyncStorage Session Utilities ---
export const sessionStorage = {
  // Store lightweight user metadata
  async setUserSession(user: any) {
    try {
      const sessionData = {
        uid: user.uid,
        email: user.email,
        isAnonymous: user.isAnonymous,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastSignIn: new Date().toISOString(),
      };
      await AsyncStorage.setItem("userSession", JSON.stringify(sessionData));
    } catch (error) {
      console.error("❌ Error saving user session:", error);
    }
  },

  // Retrieve stored session (returns parsed object or null)
  async getUserSession() {
    try {
      const sessionData = await AsyncStorage.getItem("userSession");
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error("❌ Error retrieving user session:", error);
      return null;
    }
  },

  // Clear stored session
  async clearUserSession() {
    try {
      await AsyncStorage.removeItem("userSession");
    } catch (error) {
      console.error("❌ Error clearing user session:", error);
    }
  },
};
