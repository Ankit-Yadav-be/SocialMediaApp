import { Stack } from "expo-router";
import { AuthProvider } from "../context/authContext";
import { SafeAreaView, StyleSheet, useColorScheme } from "react-native";
import { useFonts } from "expo-font";

export default function Layout() {
  const [fontsLoaded] = useFonts({
    "Outfit-Bold": require("../assets/fonts/Outfit-Bold.ttf"),
    "Outfit-Regular": require("../assets/fonts/Outfit-Regular.ttf"),
  });

  const colorScheme = useColorScheme(); // 'light' or 'dark'

  const isDark = colorScheme === 'dark';

  return (
    <AuthProvider>
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#121212' : '#fff' }]}>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaView>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    // backgroundColor is now set dynamically above
  },
});
