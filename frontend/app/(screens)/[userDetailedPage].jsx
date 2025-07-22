import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { decode as atob } from "base-64";
import PostById from "../../component/home/PostById";

const UserDetailedPage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const { userDetailedPage } = useLocalSearchParams();

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Token not found");

      const res = await axios.get(
        `https://social-media-app-six-nu.vercel.app/api/users/${userDetailedPage}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const decoded = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserId(decoded.id || decoded._id);

      const isFollowing = res.data.followers?.some(
        (follower) =>
          follower._id === decoded.id || follower._id === decoded._id
      );
      setIsFollowing(isFollowing);

      setUserData(res.data);
    } catch (error) {
      console.error(
        "Error fetching profile:",
        error?.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const endpoint = `https://social-media-app-six-nu.vercel.app/api/users/${userDetailedPage}/${isFollowing ? "unfollow" : "follow"
        }`;
      await axios.put(
        endpoint,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setIsFollowing(!isFollowing);
      fetchUserProfile();
    } catch (error) {
      console.error(
        "Error toggling follow:",
        error?.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const renderUserCard = ({ item }) => (
    <TouchableOpacity
      style={styles.userCard}
      onPress={() => router.push(`/(screens)/${item._id}`)}
    >
      <Image
        source={{
          uri:
            item.profilePic ||
            "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        }}
        style={styles.avatar}
      />
      <Text style={styles.name} numberOfLines={1}>
        {item.name || "Unknown"}
      </Text>
    </TouchableOpacity>
  );

  if (loading || !userData) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#6ab0ff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0e0e0e" }}>
      <FlatList
        data={[]} // No actual item list; we use only ListHeaderComponent
        renderItem={null}
        ListHeaderComponent={
          <>
            <LinearGradient
              colors={["#1a1a1a", "#121212"]}
              style={styles.profileCard}
            >
              <View style={styles.infoSection}>
                <Image
                  source={{
                    uri:
                      userData.profilePic ||
                      "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                  }}
                  style={styles.mainAvatar}
                />
                <View style={styles.infoSection2}>
                  <View style={styles.infoSection3}>
                    <Text style={styles.mainName}>{userData.name}</Text>
                    <Text style={styles.email}>{userData.email}</Text>
                    {userData.bio && <Text style={styles.bio}>{userData.bio}</Text>}
                  </View>

                  <View style={styles.buttonRow}>
                    {currentUserId === userData._id && (
                      <LinearGradient
                        colors={["rgba(37, 29, 29, 0.9)", "rgba(41, 31, 31, 0.89)"]}
                        style={styles.followWrapper}
                      >
                        <TouchableOpacity style={styles.followBtn}>
                          <Text style={styles.followBtnText}>Edit</Text>
                        </TouchableOpacity>
                      </LinearGradient>
                    )}

                    <LinearGradient
                      colors={["rgba(37, 29, 29, 0.9)", "rgba(41, 31, 31, 0.89)"]}
                      style={styles.followWrapper}
                    >
                      <TouchableOpacity
                        onPress={handleFollowToggle}
                        disabled={currentUserId === userData._id}
                        style={[
                          styles.followBtn,
                          currentUserId === userData._id && styles.disabledBtn,
                        ]}
                      >
                        <Text style={styles.followBtnText}>
                          {isFollowing ? "Unfollow" : "Follow"}
                        </Text>
                      </TouchableOpacity>
                    </LinearGradient>
                  </View>
                </View>
              </View>

              <View style={styles.statsContainer}>
                <LinearGradient
                  colors={["#1e1e2e", "#121212"]}
                  style={styles.statBox}
                >

                  <Text style={styles.statNumber}>
                    {userData.followers?.length || 0}
                  </Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </LinearGradient>

                <LinearGradient
                  colors={["#1e1e2e", "#121212"]}
                  style={styles.statBox}
                >

                  <Text style={styles.statNumber}>
                    {userData.following?.length || 0}
                  </Text>
                  <Text style={styles.statLabel}>Following</Text>
                </LinearGradient>
              </View>
            </LinearGradient>

            <Text style={styles.sectionTitle}>Followers</Text>
            {userData.followers?.length ? (
              <FlatList
                data={userData.followers}
                keyExtractor={(item) => item._id}
                renderItem={renderUserCard}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 10 }}
              />
            ) : (
              <Text style={styles.emptyText}>No followers yet</Text>
            )}

            <Text style={styles.sectionTitle}>Following</Text>
            {userData.following?.length ? (
              <FlatList
                data={userData.following}
                keyExtractor={(item) => item._id}
                renderItem={renderUserCard}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingLeft: 10 }}
              />
            ) : (
              <Text style={styles.emptyText}>Not following anyone</Text>
            )}

            <Text style={styles.sectionTitle}>Posts</Text>
            <PostById userDetailedPage={userDetailedPage} />
          </>
        }
      />
    </SafeAreaView>
  );

};

const styles = StyleSheet.create({
  disabledBtn: {
    opacity: 0.3,
  },

  editbutton: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    gap: 5,
  },
  infoSection: {
    flex: 1,
    flexDirection: "row",
    margin: 7,
    paddingLeft: 0,
  },
  infoSection2: {
    flex: 1,
    flexDirection: "column",
    margin: 8,
  },
  infoSection3: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
  },
  container: {
    paddingTop: 20,
    padding: 8,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "#0e0e0e",
    justifyContent: "center",
    alignItems: "center",
  },
  profileCard: {
    borderRadius: 20,
    paddingTop: 8,
    marginBottom: 30,
    alignItems: "center",
    shadowColor: "#6ab0ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  mainAvatar: {
    width: 100,
    height: 100,
    borderRadius: 55,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#ffffffff",
  },
  mainName: {
    fontSize: 24,
    fontFamily: "Outfit-Bold",
    color: "#ffffff",
  },
  email: {
    fontSize: 14,
    color: "#aaa",
    fontFamily: "Outfit-Regular",
    marginTop: 4,
  },
  bio: {
    fontSize: 14,
    color: "#bbb",
    fontFamily: "Outfit-Regular",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 10,
  },
  followWrapper: {
    padding: 2,
    borderRadius: 20,
  },
  followBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20, // Constant padding
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    minWidth: 100, // Minimum width for equal sizing
    alignSelf: "flex-start", // Prevent stretching
  },
  followBtnText: {
    color: "#fff",
    fontFamily: "Outfit-Bold",
    fontSize: 15,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 25,
  },
  statBox: {
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    width: 130,
    marginHorizontal: 5,
    backgroundColor: "rgba(255,255,255,0.05)",
  },
  statNumber: {
    fontSize: 20,
    fontFamily: "Outfit-Bold",
    color: "#fff",
    marginTop: 4,
  },
  statLabel: {
    fontSize: 14,
    color: "#aaa",
    fontFamily: "Outfit-Regular",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Outfit-Bold",
    marginBottom: 5,
    margin: 10,
    marginLeft: 10,
    color: "#fff",
  },
  userCard: {
    alignItems: "center",
    marginRight: 15,
    backgroundColor: "#1f1f1f",
    padding: 10,
    borderRadius: 10,
    width: 90,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#333",
  },
  name: {
    marginTop: 6,
    fontSize: 13,
    textAlign: "center",
    fontFamily: "Outfit-Regular",
    color: "#eee",
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    fontFamily: "Outfit-Regular",
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginTop: 10,
  },
});

export default UserDetailedPage;
