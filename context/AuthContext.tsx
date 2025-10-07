// context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db, sessionStorage } from "@/firebaseConfig";
import {
  onAuthStateChanged,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  EmailAuthProvider,
  linkWithCredential,
  User,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";

type AuthContextType = {
  user: User | any | null; // can be Firebase User or cached session object
  loading: boolean;
  signInAnon: (joinCode?: string) => Promise<void>;
  signUp: (email: string, password: string, joinCode?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  upgradeAnon: (
    email: string,
    password: string,
    joinCode?: string
  ) => Promise<User>;
  clearInvalidSession: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | any | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on app startup (for debugging only)
  useEffect(() => {
    const checkStoredSession = async () => {
      try {
        const storedSession = await sessionStorage.getUserSession();
        if (storedSession) {
          console.log("📱 Found stored session:", storedSession.uid);
          console.log("📱 Stored session details:", {
            uid: storedSession.uid,
            email: storedSession.email,
            isAnonymous: storedSession.isAnonymous
          });
        } else {
          console.log("📱 No stored session found");
        }
      } catch (error) {
        console.error("❌ Error checking stored session:", error);
      }
    };
    
    checkStoredSession();
  }, []);

  // Always reconcile with Firebase Auth
  useEffect(() => {
    console.log("👀 Subscribing to Firebase onAuthStateChanged...");
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      console.log(
        "🔥 Auth state changed:",
        u ? { uid: u.uid, anon: u.isAnonymous } : null
      );

      if (u) {
        await sessionStorage.setUserSession(u);
        setUser(u);
      } else {
        // Clear stored session when Firebase Auth state is null
        console.log("🧹 Firebase Auth state is null, clearing stored session");
        await sessionStorage.clearUserSession();
        setUser(null);
      }

      setLoading(false);

      if (u && !u.isAnonymous) {
        try {
          console.log("📝 Ensuring user family for authenticated user...");
          await ensureUserFamily(u);
        } catch (err) {
          console.error("❌ Failed to ensure user family:", err);
          // Don't fail the auth flow if family setup fails
          // User can still use the app, family setup can be retried later
        }
      }
    });
    return unsubscribe;
  }, []);

  // Force user to null if Firebase Auth is not initialized properly
  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const currentUser = auth.currentUser;
        console.log("🔍 Current Firebase Auth user:", currentUser ? { uid: currentUser.uid, email: currentUser.email } : null);
        
        if (!currentUser && user) {
          console.log("⚠️ Firebase Auth user is null but local user state is not null, forcing to null");
          setUser(null);
          await sessionStorage.clearUserSession();
        }
      } catch (error) {
        console.error("❌ Error checking auth state:", error);
      }
    };
    
    checkAuthState();
  }, [user]);

  const ensureUserFamily = async (u: User, joinCode?: string) => {
    console.log("🏠 ensureUserFamily called for:", u.uid, "joinCode:", joinCode);
    let familyId: string | null = null;

    // First, check if user already has a family membership stored in their profile
    if (!joinCode) {
      try {
        console.log("🔍 Checking existing user profile for family membership...");
        const profileRef = doc(db, "users", u.uid, "profile", "main");
        console.log("📄 Profile path:", profileRef.path);
        const profileDoc = await getDoc(profileRef);
        console.log("📄 Profile exists:", profileDoc.exists());
        
        if (profileDoc.exists()) {
          const profileData = profileDoc.data();
          console.log("📄 Profile data:", profileData);
          if (profileData.familyId) {
            familyId = profileData.familyId;
            console.log("✅ Found existing family membership:", familyId);
            
            // Verify the family still exists
            if (familyId) {
              const familyRef = doc(db, "families", familyId);
              const familyDoc = await getDoc(familyRef);
              console.log("🏠 Family document exists:", familyDoc.exists());
              if (familyDoc.exists()) {
                console.log("✅ Family still exists, user is already a member");
                return; // User already has a valid family membership
              } else {
                console.log("⚠️ Family no longer exists, will create new one");
                familyId = null;
              }
            }
          } else {
            console.log("❌ No familyId found in profile");
          }
        } else {
          console.log("❌ Profile document does not exist");
        }
      } catch (error) {
        console.error("❌ Error checking existing profile:", error);
      }
    }

    if (joinCode) {
      console.log("🔍 Looking for family with join code:", joinCode);
      const familiesRef = collection(db, "families");
      const q = query(familiesRef, where("joinCode", "==", joinCode));
      const snap = await getDocs(q);
      
      if (!snap.empty) {
        familyId = snap.docs[0].id;
        console.log("✅ Found existing family:", familyId);
        
        // Add user to existing family's members array
        const familyRef = doc(db, "families", familyId);
        const familyDoc = await getDoc(familyRef);
        if (familyDoc.exists()) {
          const familyData = familyDoc.data();
          const currentMembers = familyData.members || [];
          if (!currentMembers.includes(u.uid)) {
            await setDoc(familyRef, {
              members: [...currentMembers, u.uid]
            }, { merge: true });
            console.log("👥 Added user to existing family members");
          }
        }
      } else {
        console.log("❌ No family found with join code:", joinCode);
        throw new Error("Invalid join code");
      }
    }

    if (!familyId) {
      familyId = u.uid;
      console.log("🆕 Creating new family:", familyId);
      const familyRef = doc(db, "families", familyId);
      await setDoc(
        familyRef,
        {
          id: familyId,
          name: `${u.email || "Guest"}'s Family`,
          members: [u.uid],
          joinCode: familyId,
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
    }

    const profileRef = doc(db, "users", u.uid, "profile", "main");
    await setDoc(
      profileRef,
      {
        displayName: u.email || "Guest",
        familyRole: joinCode ? "Member" : "Admin",
        selectedColor: "#FF6B6B",
        familyId,
      },
      { merge: true }
    );

    const memberRef = doc(db, "families", familyId, "members", u.uid);
    await setDoc(
      memberRef,
      {
        id: u.uid,
        displayName: u.email || "Guest",
        color: "#FF6B6B",
        role: joinCode ? "Member" : "Admin",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
    
    console.log("✅ Family setup complete for user:", u.uid, "family:", familyId);
  };

  const signInAnon = async (joinCode?: string) => {
    try {
      console.log("👤 Signing in anonymously...");
      const cred = await signInAnonymously(auth);
      if (cred.user) {
        console.log("✅ Signed in anon:", cred.user.uid);
        await ensureUserFamily(cred.user, joinCode);
      }
    } catch (err: any) {
      console.error("❌ Anonymous sign-in failed:", err.message || err);
      throw err;
    }
  };

  const signUp = async (
    email: string,
    password: string,
    joinCode?: string
  ) => {
    try {
      console.log("✉️ Signing up:", email);
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      if (cred.user) {
        console.log("✅ Signed up:", cred.user.uid);
        await ensureUserFamily(cred.user, joinCode);
      }
    } catch (err: any) {
      console.error("❌ Sign-up failed:", err.message || err);
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log("🔑 Signing in:", email);
      const cred = await signInWithEmailAndPassword(auth, email, password);
      if (cred.user) {
        console.log("✅ Signed in:", cred.user.uid);
        await ensureUserFamily(cred.user);
      }
    } catch (err: any) {
      console.error("❌ Sign-in failed:", err.message || err);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      console.log("🚪 Signing out user...");
      await sessionStorage.clearUserSession();
      await fbSignOut(auth);
      console.log("✅ User signed out successfully");
    } catch (error) {
      console.error("❌ Sign out error:", error);
      // Even if sign out fails, clear the stored session
      await sessionStorage.clearUserSession();
      throw error;
    }
  };

  // Clear invalid sessions (for error recovery)
  const clearInvalidSession = async () => {
    try {
      console.log("🧹 Clearing invalid session...");
      await sessionStorage.clearUserSession();
      setUser(null);
      setLoading(false);
    } catch (error) {
      console.error("❌ Error clearing invalid session:", error);
    }
  };

  const upgradeAnon = async (
    email: string,
    password: string,
    joinCode?: string
  ) => {
    if (!auth.currentUser) throw new Error("No current user");
    if (!auth.currentUser.isAnonymous) throw new Error("Not anonymous");

    const credential = EmailAuthProvider.credential(email, password);
    const result = await linkWithCredential(auth.currentUser, credential);

    await ensureUserFamily(result.user, joinCode);
    setUser(result.user);
    return result.user;
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signInAnon, signUp, signIn, signOut, upgradeAnon, clearInvalidSession }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
