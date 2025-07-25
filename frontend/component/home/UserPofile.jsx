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
  Modal,
  TextInput,
} from "react-native";
import { TouchableWithoutFeedback, Keyboard } from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useLogout } from "./../../utils/logout";
import { router } from "expo-router";
import { uploadToCloudinary } from "./../../utils/uploadToCloudinary";
import * as ImagePicker from "expo-image-picker";
export default function UserProfileScreen() {
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [showAccountDetails, setShowAccountDetails] = useState(false);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [nameInput, setNameInput] = useState(user?.name || "");
  const [bioInput, setBioInput] = useState(user?.bio || "");
  const [imageInput, setImageInput] = useState(user?.profilePic || "");
  const [uploading, setUploading] = useState(false);

  const logout = useLogout();

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.cancelled) {
      setUploading(true);
      const imageUrl = await uploadToCloudinary(result.assets[0]);
      setUploading(false);
      if (imageUrl) {
        setImageInput(imageUrl);
      } else {
        Alert.alert("Upload Failed", "Please try again.");
      }
    }
  };
  const handleUpdateProfile = async () => {
    try {
      setUploading(true);
      const token = await AsyncStorage.getItem("token");

      const payload = {
        name: nameInput,
        bio: bioInput,
        profilePic: imageInput,
      };

      await axios.put(
        "https://social-media-app-six-nu.vercel.app/api/users/update-profile",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEditProfileVisible(false);
      fetchUserProfile(); // Refresh the profile
      Alert.alert("Success", "Profile updated successfully");
    } catch (error) {
      console.error("Update failed", error);
      Alert.alert("Error", "Profile update failed");
    } finally {
      setUploading(false);
    }
  };

  const fetchPosts = async (userId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(
        `https://social-media-app-six-nu.vercel.app/api/posts/getpost/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Error fetching posts:", err);
      setPosts([]);
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
      fetchPosts(data?._id);
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
     <Modal
  visible={editProfileVisible}
  transparent
  animationType="slide"
  onRequestClose={() => setEditProfileVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>Edit Your Profile</Text>

      <TouchableOpacity onPress={handleImagePick}>
        <View style={styles.profilePicWrapper}>
          <Image
            source={{ uri: imageInput }}
            style={styles.profilePic}
          />
          <View style={styles.editIcon}>
            <Text style={{ color: "#fff", fontSize: 18 }}>📷</Text>
          </View>
        </View>
        <Text style={styles.chooseText}>Tap to change profile picture</Text>
      </TouchableOpacity>

      <TextInput
        placeholder="Your Name"
        value={nameInput}
        onChangeText={setNameInput}
        style={styles.input}
        placeholderTextColor="#ccc"
      />
      <TextInput
        placeholder="Your Bio"
        value={bioInput}
        onChangeText={setBioInput}
        style={[styles.input, { height: 100 }]}
        placeholderTextColor="#ccc"
        multiline
      />

      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleUpdateProfile}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.saveButtonText}> Save Changes</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => setEditProfileVisible(false)}
        style={styles.cancelButton}
      >
        <Text style={styles.saveButtonText}> Cancel</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>


      <Modal
        visible={isSidebarVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsSidebarVisible(false)}
      >
        <View style={styles.sidebar}>
          <Text style={styles.sidebarTitle}>Options</Text>

          {/* Account Details Button */}
          <TouchableOpacity
            onPress={() => setShowAccountDetails(!showAccountDetails)}
            style={styles.sidebarItem}
          >
            <Ionicons name="person-outline" size={20} color="#fff" />
            <Text style={styles.sidebarItemText}>Account Details</Text>
          </TouchableOpacity>

          {/* Logout Button */}
          <TouchableOpacity onPress={logout} style={styles.sidebarItem}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.sidebarItemText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <Modal
        visible={showAccountDetails}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAccountDetails(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowAccountDetails(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Account Details</Text>
                <Text style={styles.modalItem}>
                  👤 <Text style={styles.modalLabel}>Name:</Text> {user?.name}
                </Text>
                <Text style={styles.modalItem}>
                  <Text style={styles.modalLabel}>Email:</Text> {user?.email}
                </Text>
                <Text style={styles.modalItem}>
                  <Text style={styles.modalLabel}>Bio:</Text> {user?.bio}
                </Text>
                <Text style={styles.modalItem}>
                  <Text style={styles.modalLabel}>Joined:</Text>{" "}
                  {new Date(user?.createdAt).toDateString()}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowAccountDetails(false)}
                  style={styles.closeButton}
                >
                  <Text style={styles.closeButtonText}>Close</Text>
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image source={{ uri: user.profilePic }} style={styles.avatar} />
            <View>
              <TouchableOpacity
                style={styles.editBtnIcon}
                onPress={() => setEditProfileVisible(true)}
              >
                <Feather name="edit" size={19} color="#fff" />
              </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity
                style={styles.logoutBtnIcon}
                onPress={() => setIsSidebarVisible(true)}
              >
                <Ionicons name="options-outline" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.bio}>{user.bio || "No bio added yet."}</Text>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 35,
              marginTop: 8,
            }}
          >
            <TouchableOpacity onPress={() => setEditProfileVisible(true)}>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 12,
                  fontFamily: "Outfit-Bold",
                  borderWidth: 2,
                  borderColor: "#fff",
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                Edit Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 12,
                  fontFamily: "Outfit-Bold",
                  borderWidth: 2,
                  borderColor: "#fff",
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                }}
              >
                Share Profile
              </Text>
            </TouchableOpacity>
          </View>
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
                  <TouchableOpacity
                    onPress={() => {
                      router.push(`/(screens)/${item._id}`);
                    }}
                  >
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
                  <TouchableOpacity
                    onPress={() => {
                      router.push(`/(screens)/${item._id}`);
                    }}
                  >
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

          {/* User Posts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Posts</Text>
            {posts.length === 0 ? (
              <Text style={{ color: "#999", textAlign: "center" }}>
                No posts yet.
              </Text>
            ) : (
              <FlatList
                data={posts}
                keyExtractor={(item) => item._id}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: "space-between" }}
                scrollEnabled={false}
                renderItem={({ item }) => (
                  <View style={styles.gridItem}>
                    <TouchableOpacity
                      onPress={() => router.push(`/(postscreen)/${item._id}`)}
                    >
                      <Image
                        source={{ uri: item.image }}
                        style={styles.gridImage}
                      />
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
    paddingTop: 40,
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
    fontFamily: "Outfit-Bold",
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 60,
    borderWidth: 2,
    borderColor: "#fbfdffff",
  },
  editBtnIcon: {
    position: "absolute",
    right: -0,
    top: -35,
    backgroundColor: "#141212ff",
    padding: 10,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: "#fff",
    elevation: 4,
  },
  logoutBtnIcon: {
    position: "absolute",
    right: -105,
    top: -90,
    backgroundColor: "#141212ff",
    padding: 5,
    borderWidth: 0,
    borderColor: "#fff",
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
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff",
    fontFamily: "Outfit-Regular",
  },
  bio: {
    fontSize: 12,
    color: "#aaa",
    marginTop: 4,
    textAlign: "center",
    fontFamily: "Outfit-Regular",
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
    fontFamily: "Outfit-Regular",
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
    fontFamily: "Outfit-Regular",
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
    fontFamily: "Outfit-Regular",
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
    fontFamily: "Outfit-Regular",
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
    borderColor: "#fff",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    fontFamily: "Outfit-Bold",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  sidebar: {
    width: "70%",
    backgroundColor: "#121111ff",
    height: "100%",
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.4,
    borderRightWidth: 1,
    borderColor: "rgba(0,0,0,0.5)",
    shadowRadius: 4,
    elevation: 5,
  },

  sidebarTitle: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 20,
    fontFamily: "Outfit-Bold",
  },

  sidebarItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },

  sidebarItemText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
    fontFamily: "Outfit-Regular",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    backgroundColor: "#1f1f1f",
    padding: 20,
    borderRadius: 16,
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    color: "#fff",
    marginBottom: 20,
    fontFamily: "Outfit-Bold",
    textAlign: "center",
  },
  modalItem: {
    color: "#ccc",
    fontSize: 15,
    marginBottom: 12,
    fontFamily: "Outfit-Regular",
  },
  modalLabel: {
    color: "#fff",
    fontWeight: "bold",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#2c2c2c",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Outfit-Bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'rgba(30,30,30,0.95)',
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 20,
  },
  profilePicWrapper: {
    alignSelf: 'center',
    position: 'relative',
    marginBottom: 10,
    borderRadius: 60,
    padding: 4,
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: 'linear-gradient(45deg, #6a11cb, #2575fc)', // you can use expo-linear-gradient for real gradient
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#444',
    padding: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#888',
  },
  chooseText: {
    color: "#aaa",
    textAlign: "center",
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#444',
    marginBottom: 15,
  },
  saveButton: {
    backgroundColor: '#6a11cb',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#444',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

});

const inputStyles = {
  backgroundColor: "#2c2c2c",
  color: "#fff",
  padding: 10,
  borderRadius: 10,
  marginBottom: 12,
};

