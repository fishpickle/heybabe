import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import AppSplashScreen from './splash';

export default function Index() {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    console.log("🏠 Index route mounted, user:", user ? "authenticated" : "not authenticated", "loading:", loading);
  }, [user, loading]);

  // Show splash screen initially
  if (showSplash) {
    return <AppSplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // After splash finishes, handle navigation
  if (loading) {
    console.log("⏳ Still loading auth state");
    return <AppSplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // If user is authenticated, go to main app
  if (user) {
    console.log("🚀 User authenticated, redirecting to tabs");
    return <Redirect href="/(tabs)" />;
  }

  // If no user, go to login
  console.log("🔐 No user, redirecting to login");
  return <Redirect href="/auth/login" />;
}
