import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  Alert,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Video } from "expo-av";
import jwtDecode from 'jwt-decode';
 // ✅ This works with CommonJS or mixed modules



import {
  uploadToCloudinary,
  uploadVideoToCloudinary,
} from "../../utils/uploadToCloudinary";
import { playSound, stopCurrentSound } from "../../utils/soundManager";

const windowWidth = Dimensions.get("window").width;

const StatusScreen = () => {
  const [stories, setStories] = useState([]);
  const [musicList, setMusicList] = useState([]);
  const [createModal, setCreateModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileType, setFileType] = useState("image");
  const [caption, setCaption] = useState("");
  const [playingId, setPlayingId] = useState(null);
  const [commentText, setCommentText] = useState("");
const [userId, setUserId] = useState(null);
  const openCreateModal = () => setCreateModal(true);
  const closeModal = () => {
    setCreateModal(false);
    setPreview(null);
    setCaption("");
    setSelectedMusic(null);
  };

 useEffect(() => {
    const extractUserIdFromToken = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        console.log("Fetched token:", token);
        if (token) {
          const decoded = jwtDecode(token);
          console.log("Decoded token:", decoded);
          setUserId(decoded._id);
        }
      } catch (err) {
        console.error("Token decode error:", err);
      }
    };

    extractUserIdFromToken();
  }, []);



  const handleComment = async (storyId) => {
    if (!commentText.trim()) return;

    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.post(
        `https://social-media-app-six-nu.vercel.app/api/story/${storyId}/comment`,
        { text: commentText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedComments = res.data;
      setStories((prev) =>
        prev.map((s) =>
          s._id === storyId ? { ...s, comments: updatedComments } : s
        )
      );
      setSelectedStory({ ...selectedStory, comments: updatedComments });
      setCommentText("");
    } catch (err) {
      console.error("Comment Error:", err.message);
    }
  };

  const handleLike = async (storyId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.post(
        `https://social-media-app-six-nu.vercel.app/api/story/${storyId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const updatedLikes = res.data.likes;
      setStories((prev) =>
        prev.map((story) =>
          story._id === storyId ? { ...story, likes: updatedLikes } : story
        )
      );

      if (selectedStory && selectedStory._id === storyId) {
        setSelectedStory({ ...selectedStory, likes: updatedLikes });
      }
    } catch (err) {
      console.error("Like Error:", err.message);
    }
  };

  const fetchStories = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(
        "https://social-media-app-six-nu.vercel.app/api/story",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setStories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMusic = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(
        "https://social-media-app-six-nu.vercel.app/api/music",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMusicList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStories();
    fetchMusic();
    return () => stopCurrentSound();
  }, []);

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setPreview(asset.uri);
      setFileType(asset.type || "image");
    }
  };

  const submitStory = async () => {
    try {
      if (!preview) return Alert.alert("Select image or video first");
      let uploadedUrl;
      if (fileType === "image") {
        uploadedUrl = await uploadToCloudinary({ uri: preview });
      } else {
        uploadedUrl = await uploadVideoToCloudinary(preview);
      }
      if (!uploadedUrl) return Alert.alert("Upload failed", "Try again");
      const token = await AsyncStorage.getItem("token");
      const res = await axios.post(
        "https://social-media-app-six-nu.vercel.app/api/story",
        {
          media: uploadedUrl,
          mediaType: fileType,
          caption,
          musicId: selectedMusic,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setStories([res.data.story, ...stories]);
      closeModal();
    } catch (err) {
      console.error("Story Submit Error:", err);
      Alert.alert("Error", "Something went wrong while submitting your story.");
    }
  };

  const handleMusicToggle = async (story) => {
    try {
      if (!story.music || !story.music.url) return;
      if (playingId === story._id) {
        await stopCurrentSound();
        setPlayingId(null);
      } else {
        await stopCurrentSound();
        await playSound(story.music.url);
        setPlayingId(story._id);
      }
    } catch (error) {
      console.error("Music toggle error:", error);
    }
  };

  const openDetailModal = (story) => {
    setSelectedStory(story);
    setDetailModal(true);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => openDetailModal(item)}
      style={styles.storyCard}
    >
      {item.mediaType === "video" ? (
        <Video
          source={{ uri: item.media }}
          rate={1.0}
          volume={1.0}
          isMuted={false}
          resizeMode="cover"
          shouldPlay={false}
          useNativeControls
          style={styles.video}
        />
      ) : (
        <Image source={{ uri: item.media }} style={styles.image} />
      )}

      {item.music ? (
        <TouchableOpacity
          style={styles.songButton}
          onPress={() => handleMusicToggle(item)}
        >
          <Ionicons
            name={playingId === item._id ? "pause-circle" : "play-circle"}
            size={22}
            color="rgba(186, 184, 184, 0.6)"
            style={{ marginRight: 5 }}
          />
          <Text style={styles.song}>{item.music.title}</Text>
        </TouchableOpacity>
      ) : (
        <Text style={styles.song}>No Music</Text>
      )}
      <Text style={styles.date}>{moment(item.createdAt).fromNow()}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={stories}
        keyExtractor={(item) => item._id}
        horizontal
        ListHeaderComponent={() => (
          <TouchableOpacity
            onPress={openCreateModal}
            style={styles.newStoryCard}
          >
            <Ionicons name="add" size={25} color="#fff" />
            <Text style={styles.newStoryText}>Add Story</Text>
          </TouchableOpacity>
        )}
        renderItem={renderItem}
      />

      {/* Create Modal */}
      <Modal visible={createModal} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.8)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: "90%",
              backgroundColor: "#1c1c1e",
              borderRadius: 12,
              padding: 20,
              elevation: 10,
            }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "700",
                color: "#f2f2f7",
                marginBottom: 15,
                textAlign: "center",
                fontFamily: "Outfit-Bold",
              }}
            >
              🎬 Create Your Story
            </Text>

            <Picker
              selectedValue={selectedMusic}
              onValueChange={setSelectedMusic}
              style={{
                backgroundColor: "#2c2c2e",
                color: "#f2f2f7",
                borderRadius: 8,
                marginBottom: 15,
              }}
              dropdownIconColor="#aaa"
            >
              <Picker.Item label="🎵 No Music" value={null} />
              {musicList.map((m) => (
                <Picker.Item
                  key={m._id}
                  label={`🎵 ${m.title}`}
                  value={m._id}
                />
              ))}
            </Picker>

            <TouchableOpacity
              onPress={pickMedia}
              style={{
                backgroundColor: "#3a3a3c",
                paddingVertical: 12,
                borderRadius: 10,
                marginBottom: 15,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#f2f2f7",
                  fontWeight: "600",
                  fontSize: 16,
                  fontFamily: "Outfit-Regular",
                }}
              >
                📷 Pick Image / Video
              </Text>
            </TouchableOpacity>

            {preview && (
              <Image
                source={{ uri: preview }}
                style={{
                  width: "100%",
                  height: 180,
                  borderRadius: 10,
                  marginBottom: 15,
                  borderColor: "#444",
                  borderWidth: 1,
                }}
              />
            )}

            <TextInput
              placeholder="Write a caption..."
              placeholderTextColor="#888"
              value={caption}
              onChangeText={setCaption}
              multiline
              style={{
                backgroundColor: "#2c2c2e",
                color: "#f2f2f7",
                padding: 12,
                borderRadius: 8,
                minHeight: 80,
                textAlignVertical: "top",
                fontSize: 16,
                marginBottom: 20,
                fontFamily: "Outfit-Regular",
              }}
            />

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "#292f34ff",
                  paddingVertical: 12,
                  borderRadius: 8,
                  marginRight: 8,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#444",
                }}
                onPress={submitStory}
              >
                <Text
                  style={{
                    color: "#fff",
                    fontWeight: "600",
                    fontSize: 16,
                    fontFamily: "Outfit-Bold",
                  }}
                >
                  Submit
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: "#2c2c2e",
                  paddingVertical: 12,
                  borderRadius: 8,
                  marginLeft: 8,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#444",
                }}
                onPress={closeModal}
              >
                <Text
                  style={{
                    color: "#f2f2f7",
                    fontWeight: "600",
                    fontSize: 16,
                    fontFamily: "Outfit-Bold",
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Detail Modal */}
      <Modal
        visible={detailModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setDetailModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.9)",
            justifyContent: "center",
            padding: 16,
          }}
        >
          <ScrollView
            contentContainerStyle={{
              backgroundColor: "#1a1a1a",
              borderRadius: 16,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 10,
            }}
          >
            {selectedStory && (
              <>
                {selectedStory.mediaType === "video" ? (
                  <Video
                    source={{ uri: selectedStory.media }}
                    rate={1.0}
                    volume={1.0}
                    isMuted={false}
                    resizeMode="cover"
                    shouldPlay
                    useNativeControls
                    style={{
                      width: "100%",
                      height: 400,
                      borderRadius: 14,
                      backgroundColor: "#000",
                    }}
                  />
                ) : (
                  <Image
                    source={{ uri: selectedStory.media }}
                    style={{
                      width: "100%",
                      height: 400,
                      borderRadius: 14,
                      backgroundColor: "#222",
                    }}
                    resizeMode="cover"
                  />
                )}

                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: "#f0f0f0",
                    marginTop: 16,
                    lineHeight: 24,
                    fontFamily: "Outfit-Bold",
                  }}
                >
                  {selectedStory.caption}
                </Text>

                <Text
                  style={{
                    marginTop: 6,
                    color: "#888",
                    fontSize: 12,
                    fontStyle: "italic",
                    fontFamily: "Outfit-Regular",
                  }}
                >
                  {moment(selectedStory.createdAt).fromNow()}
                </Text>

                <View
                  style={{
                    marginTop: 12,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <TouchableOpacity
                    style={{ flexDirection: "row", alignItems: "center" }}
                    onPress={() => handleLike(selectedStory._id)}
                  >
                    <Ionicons
                      name="heart"
                      size={18}
                      color={
                        selectedStory.likes?.includes(userId)
                          ? "#ff4d6d"
                          : "#888"
                      }
                    />
                    <Text
                      style={{ color: "#ddd", fontSize: 13, marginLeft: 6 }}
                    >
                      {selectedStory.likes?.length || 0}
                    </Text>
                  </TouchableOpacity>

                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons name="eye" size={16} color="#58a6ff" />
                    <Text
                      style={{
                        color: "#ddd",
                        fontSize: 13,
                        marginLeft: 6,
                        fontFamily: "Outfit-Regular",
                      }}
                    >
                      {selectedStory.viewers?.length}
                    </Text>
                  </View>
                </View>

                <Text
                  style={{
                    marginVertical: 14,
                    color: "#fff",
                    fontSize: 14,
                    fontWeight: "bold",
                    borderBottomWidth: 1,
                    borderBottomColor: "#333",
                    paddingBottom: 4,
                    fontFamily: "Outfit-Bold",
                  }}
                >
                  Comments
                </Text>

             {selectedStory.comments?.map((comment, index) => (
  <View
    key={index}
    style={{
      flexDirection: "row",
      alignItems: "flex-start",
      marginBottom: 12,
      padding: 10,
      backgroundColor: "#262626",
      borderRadius: 8,
      borderLeftWidth: 3,
      borderLeftColor: "#444",
    }}
  >
    {/* Profile Picture */}
    <Image
      source={{
        uri:
          comment.user?.profilePic ||
          "https://via.placeholder.com/40", // fallback image
      }}
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        marginRight: 10,
      }}
    />

    {/* Comment Content */}
    <View style={{ flex: 1 }}>
      <Text
        style={{
          fontWeight: "600",
          color: "#fff",
          fontSize: 13,
          fontFamily: "Outfit-Regular",
        }}
      >
        {comment.user?.name || "User"}
      </Text>

      <Text style={{ color: "#ccc", fontSize: 12 }}>
        {comment.text}
      </Text>

      <Text
        style={{
          color: "#777",
          fontSize: 10,
          marginTop: 3,
          fontStyle: "italic",
        }}
      >
        {moment(comment.createdAt).fromNow()}
      </Text>
    </View>
  </View>
))}

                <View style={{ marginTop: 16 }}>
                  <TextInput
                    placeholder="Add a comment..."
                    placeholderTextColor="#999"
                    value={commentText}
                    onChangeText={setCommentText}
                    style={{
                      backgroundColor: "#2a2a2a",
                      color: "#fff",
                      padding: 10,
                      borderRadius: 8,
                      marginBottom: 10,
                      fontSize: 14,
                    }}
                  />
                  <TouchableOpacity
                    onPress={() => handleComment(selectedStory._id)}
                    style={{
                      backgroundColor: "#007AFF",
                      padding: 10,
                      borderRadius: 8,
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ color: "#fff", fontWeight: "600" }}>
                      Post Comment
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={{
                    marginTop: 24,
                    paddingVertical: 12,
                    backgroundColor: "#151111ff",
                    fontFamily: "Outfit-Bold",
                    borderRadius: 10,
                    alignItems: "center",
                    flexDirection: "row",
                    justifyContent: "center",
                    borderWidth: 1,
                    borderColor: "#fff",
                    gap: 6,
                  }}
                  onPress={() => setDetailModal(false)}
                >
                  <Ionicons
                    name="close-circle-outline"
                    size={18}
                    color="#fff"
                  />
                  <Text
                    style={{
                      color: "#fff",
                      fontWeight: "bold",
                      fontSize: 14,
                      letterSpacing: 1,
                    }}
                  >
                    Close
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 0 },
  newStoryCard: {
    width: windowWidth / 3 - 20,
    height: 130,
    margin: 4,
    borderRadius: 20,
    backgroundColor: "#1E1E1E", // deeper dark tone
    alignItems: "center",
    justifyContent: "center",
    elevation: 10, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#333", // subtle border
    padding: 15,
    gap: 4, // requires React Native >=0.71
  },

  newStoryText: { color: "#fff", marginTop: 5, fontFamily: "Outfit-Regular",fontSize:10 },
  storyCard: {
    width: windowWidth / 3 - 20,
    height: 130,
    margin: 4,
    borderRadius: 15,
    overflow: "hidden",
    paddingBottom: 15,
  },
  image: { width: "100%", height: 85 },
  
  songButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 5,
    marginTop: 0,
  },
  song: {
    fontStyle: "italic",
    color: "rgba(243, 243, 243, 0.76)",
    fontFamily: "Outfit-Regular",
    fontSize:10
  },
  date: {
    paddingLeft: 3,
    fontSize: 12,
    color: "rgba(186, 184, 184, 0.6)",
    fontFamily: "Outfit-Regular",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalCard: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 15,
    borderRadius: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  preview: { width: "100%", height: 150, marginTop: 10 },
  captionInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginVertical: 10,
    padding: 8,
    borderRadius: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 16,
    textAlign: "center",
  },
  picker: {
    backgroundColor: "#333",
    color: "#fff",
    borderRadius: 8,
    marginBottom: 16,
  },
  mediaButton: {
    backgroundColor: "#444",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  mediaButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  preview: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 16,
  },
  captionInput: {
    backgroundColor: "#2a2a2a",
    color: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 15,
    minHeight: 60,
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  submitButton: {
    flex: 1,
    backgroundColor: "#4caf50",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#e53935",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  video: {
    width: "100%",
    height: 130,
    borderRadius: 10,
    backgroundColor: "#000",
  },
});

export default StatusScreen;
