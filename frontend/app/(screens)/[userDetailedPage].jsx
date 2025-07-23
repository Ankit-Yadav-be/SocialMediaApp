// your imports
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
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
      console.error("Profile fetch error:", error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const endpoint = `https://social-media-app-six-nu.vercel.app/api/users/${userDetailedPage}/${isFollowing ? "unfollow" : "follow"}`;
      await axios.put(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsFollowing(!isFollowing);
      fetchUserProfile();
    } catch (error) {
      console.error("Follow toggle error:", error?.response?.data || error.message);
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
          uri: item.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
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
        data={[]}
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
                    uri: userData.profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png",
                  }}
                  style={styles.mainAvatar}
                />
                <View style={styles.infoSection2}>
                  <Text style={styles.mainName}>{userData.name}</Text>
                  <Text style={styles.email}>{userData.email}</Text>
                  {userData.bio && <Text style={styles.bio}>{userData.bio}</Text>}

                  {currentUserId !== userData._id && (
                    <LinearGradient
                      colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.02)"]}
                      style={styles.followWrapper}
                    >
                      <TouchableOpacity
                        onPress={handleFollowToggle}
                        style={styles.followBtn}
                      >
                        <Text style={styles.followBtnText}>
                          {isFollowing ? "Unfollow" : "Follow"}
                        </Text>
                      </TouchableOpacity>
                    </LinearGradient>
                  )}
                </View>
              </View>

              <View style={styles.statsContainer}>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{userData.followers?.length || 0}</Text>
                  <Text style={styles.statLabel}>Followers</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statNumber}>{userData.following?.length || 0}</Text>
                  <Text style={styles.statLabel}>Following</Text>
                </View>
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0e0e0e",
  
  },
  profileCard: {
  
    marginBottom: 30,
    paddingVertical: 16,
    paddingHorizontal: 10,
    marginHorizontal: 12,
 
  },
  infoSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  infoSection2: {
    flex: 1,
    justifyContent: "center",
    marginTop:20
  },
  mainAvatar: {
    width: 90,
    height: 90,
    borderRadius: 50,
    borderColor: "#fff",
    borderWidth: 1,
  },
  mainName: {
    fontSize: 22,
    fontFamily: "Outfit-Bold",
    color: "#fff",
    
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
    marginTop: 3,
  },
  followWrapper: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fff",
    alignSelf: "flex-start",
  },
  followBtn: {
    paddingHorizontal: 15,
    paddingVertical:8,
    alignItems: "center",
    justifyContent: "center",
  },
  followBtnText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Outfit-Bold",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  statBox: {
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
    padding: 14,
    borderRadius: 12,
   
    borderColor: "#fff",
    width: 120,
  },
  statNumber: {
    fontSize: 18,
    fontFamily: "Outfit-Bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 13,
    color: "#aaa",
    fontFamily: "Outfit-Regular",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Outfit-Bold",
    marginTop: 12,
    marginBottom: 6,
    color: "#fff",
    marginLeft: 16,
    
  },
  userCard: {
    alignItems: "center",
    marginRight: 15,
    backgroundColor: "#1f1f1f",
    padding: 10,
    borderRadius: 10,
    width: 90,
    borderColor: "#fff",
    borderWidth: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  name: {
    marginTop: 6,
    fontSize: 13,
    textAlign: "center",
    color: "#eee",
    fontFamily: "Outfit-Regular",
  },
  emptyText: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
    fontFamily: "Outfit-Regular",
    marginBottom: 15,
  },
});

export default UserDetailedPage;
