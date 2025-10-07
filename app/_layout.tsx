// app/_layout.tsx
import { useEffect, useState } from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
} from "@expo-google-fonts/inter";
import { Pacifico_400Regular } from "@expo-google-fonts/pacifico";
import { NunitoSans_700Bold } from "@expo-google-fonts/nunito-sans";
import * as SplashScreen from "expo-splash-screen";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { TasksProvider } from "@/context/TasksContext";
import { EventsProvider } from "@/context/EventsContext";
import { AuthProvider } from "@/context/AuthContext";
import AppSplashScreen from "./splash";

SplashScreen.preventAutoHideAsync();

function AppNavigator() {
  console.log("🎬 App ready - showing main app");
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="(modals)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded] = useFonts({
    "Inter-Regular": Inter_400Regular,
    "Inter-SemiBold": Inter_600SemiBold,
    "Inter-Bold": Inter_700Bold,
    "Pacifico-Regular": Pacifico_400Regular,
    "NunitoSans-Bold": NunitoSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      console.log("🔤 Fonts ready");
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  return (
    <AuthProvider>
      <TasksProvider>
        <EventsProvider>
          <AppNavigator />
          <StatusBar style="auto" />
        </EventsProvider>
      </TasksProvider>
    </AuthProvider>
  );
}
