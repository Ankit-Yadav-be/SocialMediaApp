import { Stack } from "expo-router";
import { AuthProvider } from "../context/authContext";
import { SafeAreaView, StyleSheet } from "react-native";
import {useFonts} from "expo-font"
export default function Layout() {
   const [fontsLoaded] = useFonts({
    "Outfit-Bold": require("../assets/fonts/Outfit-Bold.ttf"),
    "Outfit-Regular": require("../assets/fonts/Outfit-Regular.ttf"),
  });
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
