import React from "react";
import { Button, SafeAreaView, StyleSheet } from "react-native";
import { useLogout } from "../../utils/logout";

const LogoutButton = () => {
  const logout = useLogout();

  return (
    <SafeAreaView style={styles.container}>
      <Button title="Logout" onPress={logout} color="#d9534f" />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
});

export default LogoutButton;
