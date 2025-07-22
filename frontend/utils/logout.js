import { useRouter } from "expo-router";
import { useAuth } from "../context/authContext"

export const useLogout = () => {
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return handleLogout;
};
