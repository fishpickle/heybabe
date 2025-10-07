import React, { useEffect, useState } from "react";
import { View, StyleSheet, StatusBar } from "react-native";
import { Video, ResizeMode } from "expo-av";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const [videoFinished, setVideoFinished] = useState(false);

  useEffect(() => {
    console.log("🎬 SplashScreen mounted");
    // Hide status bar
    StatusBar.setHidden(true, 'fade');

    return () => {
      console.log("🎬 SplashScreen unmounting");
      // Show status bar again when component unmounts
      StatusBar.setHidden(false, 'fade');
    };
  }, []);

  useEffect(() => {
    if (videoFinished) {
      console.log("🎬 Video finished, calling onFinish");
      const timer = setTimeout(() => {
        onFinish();
      }, 500); // Small delay for smooth transition

      return () => clearTimeout(timer);
    }
  }, [videoFinished, onFinish]);

  return (
    <View style={styles.container}>
      <Video
        source={require('@/assets/animations/HayBabe-Splash.mov')}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isLooping={false}
        onPlaybackStatusUpdate={(status) => {
          if (status.isLoaded && status.didJustFinish) {
            console.log("🎬 Video finished");
            setVideoFinished(true);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '100%',
    transform: [
      { scale: 2.5 }, // Make it 2.5 times larger
      { translateX: -25 }, // Shift 25 pixels to the left
    ],
  },
});

