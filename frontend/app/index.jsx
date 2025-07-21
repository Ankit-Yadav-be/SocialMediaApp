import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useContext } from "react";
import { AuthContext } from "../context/authContext";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace("/home");
    } else {
      router.replace("/landing");
    }
  }, [user, loading]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
