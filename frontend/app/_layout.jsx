import { Stack } from "expo-router";
import { AuthProvider } from "../context/authContext";
import { SafeAreaView, StyleSheet } from "react-native";

export default function Layout() {
  return (
    <AuthProvider>
      <SafeAreaView style={styles.safeArea}>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff", 
  },
});
