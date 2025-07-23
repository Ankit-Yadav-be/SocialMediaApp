import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useLogout } from "./../../utils/logout";
import { router } from "expo-router";

export default function UserProfileScreen() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

  const logout = useLogout();

  const fetchPosts = async (userId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(
        `https://social-media-app-six-nu.vercel.app/api/posts/getpost/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setPosts([]); // fallback
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const { data } = await axios.get(
        "https://social-media-app-six-nu.vercel.app/api/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser(data);
      fetchPosts(data?._id)

    } catch (error) {
      console.error("Error fetching profile", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2c343eff" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user.profilePic }} style={styles.avatar} />
            <View>
              <TouchableOpacity
                style={styles.editBtnIcon}
                onPress={() =>
                  Alert.alert("Coming Soon", "Edit Profile Feature")
                }
              >
                <Feather name="edit" size={16} color="#2e23e" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.bio}>{user.bio || "No bio added yet."}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <TouchableOpacity
            style={styles.statBox}
            onPress={() => setShowFollowers(!showFollowers)}
          >
            <Text style={styles.statNumber}>{user.followers.length}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.statBox}
            onPress={() => setShowFollowing(!showFollowing)}
          >
            <Text style={styles.statNumber}>{user.following.length}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </TouchableOpacity>
        </View>

        {/* Followers */}
        {showFollowers && user.followers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Followers</Text>
            <FlatList
              horizontal
              data={user.followers}
              keyExtractor={(item) => item._id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.followerItem}>
                  <TouchableOpacity onPress={() => { router.push(`/(screens)/${item._id}`) }}>
                    <Image
                      source={{ uri: item.profilePic }}
                      style={styles.followerAvatar}
                    />
                  </TouchableOpacity>
                  <Text style={styles.followerName}>
                    {item.name.length > 8
                      ? item.name.slice(0, 8) + "…"
                      : item.name}
                  </Text>
                </View>
              )}
            />
          </View>
        )}

        {/* Following */}
        {showFollowing && user.following.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Following</Text>
            <FlatList
              horizontal
              data={user.following}
              keyExtractor={(item) => item._id}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.followerItem}>
                  <TouchableOpacity onPress={() => { router.push(`/(screens)/${item._id}`) }}>
                    <Image
                      source={{ uri: item.profilePic }}
                      style={styles.followerAvatar}
                    />
                  </TouchableOpacity>
                  <Text style={styles.followerName}>
                    {item.name.length > 8
                      ? item.name.slice(0, 8) + "…"
                      : item.name}
                  </Text>
                </View>
              )}
            />
          </View>
        )}

        {/* Account Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Details</Text>

          <View style={styles.detailItem}>
            <View style={styles.iconWrapper}>
              <Feather name="mail" size={16} color="#1a1a1a" />
            </View>
            <Text style={styles.detailText}>{user.email}</Text>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.iconWrapper}>
              <Feather name="calendar" size={16} color="#1a1a1a" />
            </View>
            <Text style={styles.detailText}>
              Joined: {new Date(user.createdAt).toDateString()}
            </Text>
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>


          {/* User Posts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Posts</Text>
            {posts.length === 0 ? (
              <Text style={{ color: "#999", textAlign: "center" }}>No posts yet.</Text>
            ) : (
              <FlatList
                data={posts}
                keyExtractor={(item) => item._id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: "space-between" }}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={styles.gridItem}>
                    <TouchableOpacity onPress={() => router.push(`/(postscreen)/${item._id}`)}>
                      <Image source={{ uri: item.image }} style={styles.gridImage} />
                    </TouchableOpacity>
                    <Text style={styles.gridCaption}>
                      {item.caption.length > 50
                        ? `${item.caption.slice(0, 50)}...`
                        : item.caption}
                    </Text>
                  </View>
                )}
              />
            )}
          </View>


        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#121212",
    paddingTop: 40
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121212",
  },
  container: {
    padding: 0,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#fbfdffff",
  },
  editBtnIcon: {
    position: "absolute",
    right: -0,
    top: -30,
    backgroundColor: "#ffffffff",
    padding: 10,
    borderRadius: 10,
    elevation: 4,
  },
  followBtnText: {
    color: "#fff",
    fontSize: 15,
    fontFamily: "Outfit-Bold",
  },
  followBtn: {
    paddingHorizontal: 50,
    paddingVertical: 10,

    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#fff",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#ffffff",
  },
  bio: {
    fontSize: 14,
    color: "#aaa",
    marginTop: 4,
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginVertical: 20,
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 14,
    color: "#888",
  },
  section: {
    backgroundColor: "#1e1e1e",
    padding: 10,
    borderRadius: 12,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#ccc",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  iconWrapper: {
    backgroundColor: "#e0e0e0",
    padding: 8,
    borderRadius: 10,
    marginRight: 12,
  },
  detailText: {
    fontSize: 14,
    color: "#ccc",
  },
  followerItem: {
    alignItems: "center",
    marginRight: 12,
  },
  followerAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#fbfdffff",
    marginBottom: 6,
  },
  followerName: {
    fontSize: 12,
    color: "#ccc",
    textAlign: "center",
  },
  postCard: {
    backgroundColor: "#2c2c2c",
    borderRadius: 10,
    marginBottom: 16,
    overflow: "hidden",
    borderColor: "#444",
    borderWidth: 1,
  },
  postImage: {
    width: "100%",
    height: 200,
  },
  postCaption: {
    color: "#ccc",
    fontSize: 14,
    padding: 10,
  },
  gridItem: {
    backgroundColor: "#2c2c2c",
    borderRadius: 10,
    marginBottom: 16,
    width: "48%",
    overflow: "hidden",
  },
  gridImage: {
    width: "100%",
    height: 150,
  },
  gridCaption: {
    padding: 8,
    color: "#ccc",
    fontSize: 13,
  },

  logoutButton: {
    marginTop: 16,
    backgroundColor: "#2c2c2c",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: '#fff'
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },

});
