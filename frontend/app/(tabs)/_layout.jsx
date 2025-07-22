import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "react-native";

export default function TabLayout() {
  const colorScheme = useColorScheme(); // 'light' or 'dark'
  const isDark = colorScheme === "dark";

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        headerTitle:'Feed',
        tabBarShowLabel: false,
        tabBarActiveTintColor: isDark ? "#fff" : "#000",
        tabBarInactiveTintColor: isDark ? "#aaa" : "#888",
        tabBarStyle: {
          backgroundColor: isDark ? "#11182fff" : "#fff",
          borderTopWidth: 1,
          elevation: 10,
          height: 65,
          marginTop:0,
          borderColor:"#34343eff"
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" color={color} size={size + 4} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
