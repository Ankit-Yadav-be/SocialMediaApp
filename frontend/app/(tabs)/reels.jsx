import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Dimensions,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  RefreshControl,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Video } from "expo-av";
import axios from "axios";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";

const { height, width } = Dimensions.get("window");

export default function Reel() {
  const [reels, setReels] = useState([]);
  const [modalReel, setModalReel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [likedReels, setLikedReels] = useState({});
  const [isPlaying, setIsPlaying] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReel, setSelectedReel] = useState(null);
  const [commentText, setCommentText] = useState("");
  const videoRefs = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchReels = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;
      const res = await axios.get(
        "https://social-media-app-six-nu.vercel.app/api/reels",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setReels(res.data);
    } catch (error) {
      console.error("Error fetching reels:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchReels();
  };

  const handleLikeToggle = async (reelId) => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.put(
        `https://social-media-app-six-nu.vercel.app/api/reels/${reelId}/like`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReels((prevReels) =>
        prevReels.map((reel) =>
          reel._id === reelId
            ? {
                ...reel,
                likes: likedReels[reelId]
                  ? reel.likes.filter((id) => id !== "self")
                  : [...reel.likes, "self"],
              }
            : reel
        )
      );
      setLikedReels((prev) => ({ ...prev, [reelId]: !prev[reelId] }));
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };
  const submitComment = async () => {
    if (!commentText.trim()) return;
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.post(
        `https://social-media-app-six-nu.vercel.app/api/reels/${selectedReel}/comment`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // ✅ Fix here: use `res.data.comment` instead of `response.data.comment`
      setModalReel((prev) => ({
        ...prev,
        comments: [...prev.comments, res.data.comment],
      }));

      setReels((prevReels) =>
        prevReels.map((reel) =>
          reel._id === selectedReel
            ? { ...reel, comments: [...reel.comments, res.data.comment] }
            : reel
        )
      );

      setCommentText("");
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const togglePlayPause = async (index) => {
    const currentVideo = videoRefs.current[index];
    if (currentVideo) {
      const status = await currentVideo.getStatusAsync();
      if (status.isPlaying) {
        await currentVideo.pauseAsync();
        setIsPlaying((prev) => ({ ...prev, [index]: false }));
      } else {
        await currentVideo.playAsync();
        setIsPlaying((prev) => ({ ...prev, [index]: true }));
      }
    }
  };

 const onViewableItemsChanged = useRef(({ viewableItems }) => {
  if (viewableItems.length > 0) {
    const index = viewableItems[0].index;
    setCurrentIndex(index);
    videoRefs.current.forEach((video, i) => {
      if (video) {
        i === index ? video.playAsync() : video.pauseAsync();
      }
    });
  }
}).current;


  const openCommentModal = (reelId) => {
    const reelData = reels.find((reel) => reel._id === reelId);
    setModalReel(reelData);
    setSelectedReel(reelId);
    setModalVisible(true);
  };

  const renderReel = ({ item, index }) => (
    <View style={styles.reelContainer}>
      <TouchableWithoutFeedback onPress={() => togglePlayPause(index)}>
        
 <View style={{ width:350, height:680 }}>
   <Video
    ref={(ref) => (videoRefs.current[index] = ref)}
    source={{ uri: item.video }}
    style={{ width:350, height:680 }}
    resizeMode="cover"
    isLooping
    useNativeControls={false}
    shouldPlay={false}
  />

 </View>

      </TouchableWithoutFeedback>

      <View style={styles.overlay}>
        <View style={styles.infoWrapper}>
          <View style={styles.userInfo}>
            <TouchableOpacity
              onPress={() => router.push(`/(screens)/${item.user._id}`)}
            >
              <Image
                source={{ uri: item.user.profilePic }}
                style={styles.avatar}
              />
            </TouchableOpacity>
            <Text style={styles.username}>{item.user.name}</Text>
          </View>
          <Text style={styles.caption}>{item.caption}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleLikeToggle(item._id)}
          >
            <Ionicons
              name={likedReels[item._id] ? "heart" : "heart-outline"}
              size={30}
              color={likedReels[item._id] ? "red" : "#fff"}
            />
            <Text style={styles.actionText}>{item.likes.length}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => openCommentModal(item._id)}
          >
            <Ionicons name="chatbubble-outline" size={28} color="#fff" />
            <Text style={styles.actionText}>{item.comments.length}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton}>
            <FontAwesome name="share" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={modalVisible && modalReel?._id === item._id}
        animationType="slide"
        transparent
      >
        <View style={styles.modalOverlay}>
          <View style={styles.flexibleModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Comments</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.commentList}
              contentContainerStyle={{
                paddingHorizontal: 12,
                paddingBottom: 20,
              }}
              showsVerticalScrollIndicator={false}
            >
              {modalReel?.comments?.length === 0 ? (
                <Text style={{ color: "#888", marginTop: 10 }}>
                  No comments yet
                </Text>
              ) : (
                modalReel?.comments?.map((c, i) =>
                  c?.user ? (
                    <View key={i} style={styles.commentItem}>
                     <TouchableOpacity onPress={()=>{router.push(`/(screens)/${c.user._id}`)}}>
                       <Image
                        source={{ uri: c.user.profilePic }}
                        style={styles.commentAvatar}
                      />
                     </TouchableOpacity>
                      <View style={{ flexShrink: 1 }}>
                        <Text style={styles.commentName}>{c.user.name}</Text>
                        <Text style={styles.commentText}>{c.text}</Text>
                      </View>
                    </View>
                  ) : null
                )
              )}
            </ScrollView>

            <View style={styles.commentInputWrapper}>
              <TextInput
                placeholder="Add a comment..."
                placeholderTextColor="#aaa"
                value={commentText}
                onChangeText={setCommentText}
                style={styles.commentInput}
              />
              <TouchableOpacity
                onPress={submitComment}
                style={{ marginLeft: 8 }}
              >
                <Ionicons name="send" size={22} color="#f5f8fbff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fdfdfdff" />
      </View>
    );
  }

  return (
    <FlatList
      data={reels}
      renderItem={renderReel}
      keyExtractor={(item) => item._id}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={{ viewAreaCoveragePercentThreshold: 95 }}
      getItemLayout={(_, index) => ({
        length: height,
        offset: height * index,
        index,
      })}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#fff"
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  reelContainer: {
    height: height,
    width: width,
    backgroundColor: "#121212",
  },
  overlay: {
    position: "absolute",
    bottom: 150,
    left: 25,
    right: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  infoWrapper: {
    flex: 1,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 50,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#fff",
  },
  username: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  caption: {
    color: "#fff",
    fontSize: 15,
  },
  actions: {
    alignItems: "center",
    marginBottom: 20,
  },
  iconButton: {
    alignItems: "center",
    marginBottom: 18,
  },
  actionText: {
    color: "#fff",
    fontSize: 12,
    marginTop: 4,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  flexibleModal: {
    maxHeight: height * 0.7,
    backgroundColor: "#0f0f0f",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
    paddingBottom: 8,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
    borderBottomColor: "#2b2b2b",
    borderBottomWidth: 1,
    backgroundColor: "#141414",
  },
  modalTitle: {
    color: "#ffffff",
    fontSize: 18,
    fontFamily: "Outfit-Bold",
  },
  commentList: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: height * 0.45,
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 14,
    alignItems: "flex-start",
  },
  commentAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentName: {
    color: "#ffffff",
    fontSize: 14,
    fontFamily: "Outfit-Bold",
    marginBottom: 2,
  },
  commentText: {
    color: "#cccccc",
    fontSize: 13,
    fontFamily: "Outfit-Regular",
    lineHeight: 18,
    flexWrap: "wrap",
  },
  commentInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopColor: "#2b2b2b",
    borderTopWidth: 1,
    backgroundColor: "#141414",
  },
  commentInput: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    color: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 30,
    fontSize: 14,
    fontFamily: "Outfit-Regular",
  },
  sendButton: {
    marginLeft: 10,
    padding: 8,
    backgroundColor: "#777879ff",
    borderRadius: 50,
  },
});
