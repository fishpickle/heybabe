// app/auth/login.tsx
import { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@/context/AuthContext";
import { router } from "expo-router";

export default function LoginScreen() {
  const { user, signIn, signUp, signInAnon, upgradeAnon } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");

  useEffect(() => {
    console.log("🔐 Login screen mounted");
  }, []);

  // Navigate to main app when user is authenticated
  useEffect(() => {
    if (user) {
      console.log("🚀 User authenticated, navigating to main app");
      router.replace("/(tabs)");
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      if (!email.trim() || !password.trim()) {
        Alert.alert("⚠️ Missing Information", "Please enter both email and password");
        return;
      }
      
      if (password.length < 6) {
        Alert.alert("⚠️ Invalid Password", "Password must be at least 6 characters");
        return;
      }
      
      console.log("🔑 Attempting login with:", email);
      await signIn(email, password);
      // Navigation handled by useEffect
    } catch (err: any) {
      console.error("❌ Login failed:", err.message || err);
      
      let errorMessage = "Unknown error";
      if (err.code === 'auth/invalid-credential') {
        errorMessage = "Invalid email or password. Please check your credentials or sign up first.";
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email. Please sign up first.";
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password. Please try again.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      Alert.alert("⚠️ Login Failed", errorMessage);
    }
  };

  const handleSignup = async () => {
    try {
      if (!email.trim() || !password.trim()) {
        Alert.alert("⚠️ Missing Information", "Please enter both email and password");
        return;
      }
      
      if (password.length < 6) {
        Alert.alert("⚠️ Invalid Password", "Password must be at least 6 characters");
        return;
      }
      
      if (!email.includes('@')) {
        Alert.alert("⚠️ Invalid Email", "Please enter a valid email address");
        return;
      }
      
      console.log("✉️ Attempting signup with:", email);
      await signUp(email, password, joinCode || undefined);
      // Navigation handled by useEffect
    } catch (err: any) {
      console.error("❌ Signup failed:", err.message || err);
      
      let errorMessage = "Unknown error";
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "An account with this email already exists. Please try logging in instead.";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "Password is too weak. Please use at least 6 characters.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Invalid email format.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      Alert.alert("⚠️ Signup Failed", errorMessage);
    }
  };

  const handleAnon = async () => {
    try {
      console.log("👤 Attempting anonymous login...");
      await signInAnon(joinCode || undefined);
      // Navigation handled by useEffect
    } catch (err: any) {
      console.error("❌ Anonymous login failed:", err.message || err);
      Alert.alert("⚠️ Guest Login Failed", err.message || "Unknown error");
    }
  };

  const handleUpgrade = async () => {
    try {
      console.log("⏫ Attempting upgrade...");
      await upgradeAnon(email, password, joinCode || undefined);
      Alert.alert("✅ Account saved", "Your guest account has been upgraded!");
    } catch (err: any) {
      console.error("❌ Upgrade failed:", err.message || err);
      Alert.alert("⚠️ Failed to upgrade", err.message || "Unknown error");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{mode === "login" ? "Login" : "Sign Up"}</Text>
        <Text style={styles.subtitle}>
          {mode === "login"
            ? "Sign in to your HeyBabe account"
            : "Create a new HeyBabe account or join an existing family"}
        </Text>

        {/* Email + Password */}
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        {/* Join Code (signup or upgrade flow) */}
        {mode === "signup" && (
          <TextInput
            placeholder="Family Join Code (optional)"
            value={joinCode}
            onChangeText={setJoinCode}
            autoCapitalize="none"
            style={styles.input}
          />
        )}

        {/* Primary Button */}
        {mode === "login" ? (
          <Button title="Log In" onPress={handleLogin} />
        ) : (
          <Button title="Sign Up" onPress={handleSignup} />
        )}

        {/* Toggle Mode */}
        <View style={{ marginVertical: 8 }} />
        <Button
          title={
            mode === "login"
              ? "Need an account? Sign up"
              : "Already have an account? Log in"
          }
          onPress={() => {
            console.log("🔄 Switching auth mode:", mode === "login" ? "signup" : "login");
            setMode(mode === "login" ? "signup" : "login");
          }}
        />

        {/* Guest Login */}
        <View style={{ marginVertical: 12 }} />
        <Button title="Continue as Guest" onPress={handleAnon} />

        {/* If user is anonymous → allow upgrade */}
        {user?.isAnonymous && (
          <>
            <View style={{ marginVertical: 12 }} />
            <Button title="Save My Account" onPress={handleUpgrade} />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FDFDFE" },
  content: { flex: 1, justifyContent: "center", padding: 20 },
  title: {
    fontSize: 24,
    fontFamily: "Inter-Bold",
    color: "#FF6B6B",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Inter-Regular",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontFamily: "Inter-Regular",
    fontSize: 16,
    backgroundColor: "#fff",
  },
});
