import { useRouter } from "expo-router";
import { useContext } from "react";
import { AuthContext } from "../context/authContext";

export const useLogout = () => {
  const router = useRouter();
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await logout(); // ✅ Calls context logout
      router.replace("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return handleLogout;
};
