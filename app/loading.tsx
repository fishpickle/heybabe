import { View, Text, Image, StyleSheet, ActivityIndicator } from "react-native";

export default function Loading() {
  return (
    <View style={styles.container}>
      {/* Logo (forced to baby blue) */}
      <Image
        source={require("@/assets/images/icon.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* App Title */}
      <Text style={styles.title}>
        HeyBabe
      </Text>

      {/* Spinner */}
      <ActivityIndicator size="large" color="#89CFF0" style={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF", // clean white background
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
    tintColor: "#89CFF0", // always baby blue
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#89CFF0", // baby blue text
    letterSpacing: 1,
  },
});
