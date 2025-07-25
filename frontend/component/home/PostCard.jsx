import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Pressable,
} from "react-native";
import axios from "axios";
import { FontAwesome, Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Audio } from "expo-av";
import { playSound, stopCurrentSound } from "../../utils/soundManager";



const PostCard = ({ post, fetchFeed, visiblePostId }) => {
  const [liked, setLiked] = useState(post.likes.includes(post.user._id));
  const [commentText, setCommentText] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const [shareText, setShareText] = useState("");
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [commentSummary, setCommentSummary] = useState(null);
  const [showToneSummary, setShowToneSummary] = useState(false); // 🔄 New toggle state


  const router = useRouter();

  const soundRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const fetchCommentToneSummary = async () => {
    try {
      const texts = post.comments.map((c) => c.text); // extract text only

      const response = await axios.post(
        "https://social-media-app-six-nu.vercel.app/api/ai/comments-tone-summary",
        {
          comments: texts,
        }
      );

      setCommentSummary(response.data);

    } catch (error) {
      console.log("Tone summary fetch error:", error.message);
    }
  };

  useEffect(() => {
  if (showToneSummary && post.comments?.length > 0) {
    fetchCommentToneSummary();
  }
}, [showToneSummary]);


  useEffect(() => {
    return () => {
      if (soundRef.current && soundRef.current.unloadAsync) {
        soundRef.current.unloadAsync();
      }
    };
  }, []);

  useEffect(() => {
    let isCancelled = false;

    const startMusic = async () => {
      if (post._id !== visiblePostId || !post?.music?.url) return;

      try {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });

        const sound = await playSound(post.music.url);

        if (!isCancelled && sound) {
          soundRef.current = sound;
          setIsLoaded(true);
          setIsPlaying(true);
        }
      } catch (err) {
        console.error("Audio error:", err.message);
      }
    };

    startMusic();

    return () => {
      isCancelled = true;
      stopCurrentSound();
    };
  }, [visiblePostId]);

  const togglePlayPause = async () => {
    try {
      if (!soundRef.current) {
        console.warn("Sound is not loaded yet");
        return;
      }

      const status = await soundRef.current.getStatusAsync();

      if (!status.isLoaded) {
        console.warn("Sound status not loaded");
        return;
      }

      if (status.isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Toggle play/pause error:", error.message);
    }
  };

  const handleLike = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.put(
        `https://social-media-app-six-nu.vercel.app/api/posts/like/${post._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setLiked(!liked);
      fetchFeed();
    } catch (err) {
      console.log("Error liking post", err.message);
    }
  };

  const handleShare = async () => {
    if (!shareText.trim()) return;
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.put(
        `https://social-media-app-six-nu.vercel.app/api/posts/share/${post._id}`,
        { shareText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShareText("");
      setShareModalVisible(false);
      fetchFeed();
    } catch (err) {
      console.log("Error sharing post", err.message);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      const token = await AsyncStorage.getItem("token");
      await axios.put(
        `https://social-media-app-six-nu.vercel.app/api/posts/comment/${post._id}`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCommentText("");
      fetchFeed();
    } catch (err) {
      console.log("Error adding comment", err.message);
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push(`/(screens)/${post.user._id}`)}
        >
          <Image source={{ uri: post.user.profilePic }} style={styles.avatar} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.username}>{post.user.name}</Text>
          <Text style={styles.dateText}>
            {new Date(post.createdAt).toDateString()}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setShareModalVisible(true)}
          style={styles.shareIcon}
        >
          <Ionicons name="share-social-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Post Image */}
      <Image source={{ uri: post.image }} style={styles.postImage} />

      {/* Caption */}
      <Text style={styles.caption}>{post.caption}</Text>

      {/* Music (optional) */}
      {post.music?.url && (
        <TouchableOpacity
          onPress={togglePlayPause}
          style={{ position: "absolute", top: 410, right: 20 }}
        >
          <Ionicons
            name={isPlaying ? "pause-circle-outline" : "play-circle"}
            size={28}
            color="#fff"

          />
        </TouchableOpacity>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike} style={styles.iconBtn}>
          {liked ? (
            <FontAwesome name="heart" size={20} color="#ef4444" />
          ) : (
            <FontAwesome name="heart-o" size={20} color="#ccc" />
          )}
        </TouchableOpacity>
        <Text style={styles.actionText}>{post.likes.length} Likes</Text>

        <TouchableOpacity
          onPress={() => setShowAllComments(!showAllComments)}
          style={styles.iconBtn}
        >
          <Feather name="message-circle" size={22} color="#ccc" />
        </TouchableOpacity>
        <Text style={styles.actionText}>{post.comments.length} Comments</Text>

        {/* 🔄 Toggle comment tone summary */}
        <TouchableOpacity
          onPress={() => setShowToneSummary(!showToneSummary)}
          style={styles.iconBtn}
        >
          <Ionicons
            name={showToneSummary ? "information-circle" : "information-circle-outline"}
            size={22}
            color="#ccc"
          />
        </TouchableOpacity>
      </View>
      <View
        style={{
          backgroundColor: "#121212",
          padding: 10,
          borderRadius: 12,
          marginVertical: 12,

          borderColor: "#121212",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.3,
          shadowRadius: 5,
          elevation: 5,
        }}
      >
        {showToneSummary && commentSummary && (
          <View style={{
            backgroundColor: "#1f2937",
            padding: 12,
            borderRadius: 10,
            marginVertical: 10,
            borderWidth: 1,
            borderColor: "#4b5563",
          }}>
            <Text style={{
              fontSize: 14,
              fontWeight: "bold",
              color:
                commentSummary.overallTone === "Positive"
                  ? "#7ed957"
                  : commentSummary.overallTone === "Neutral"
                    ? "#38bdf8"
                    : "#f87171",
              marginBottom: 8,
              textAlign: "center",
            }}>
              Overall Tone: {commentSummary.overallTone}
            </Text>

            <Text style={toneStyles.text}>Score: {commentSummary.score}</Text>
            <Text style={toneStyles.text}>Positive: {commentSummary.toneBreakdown?.Positive}</Text>
            <Text style={toneStyles.text}>Neutral: {commentSummary.toneBreakdown?.Neutral}</Text>
            <Text style={toneStyles.text}>Toxic: {commentSummary.toneBreakdown?.Toxic}</Text>

            <Text style={[toneStyles.text, { marginTop: 8, fontStyle: "italic", color: "#d1d5db" }]}>
              "{commentSummary.summary}"
            </Text>
          </View>
        )}

      </View>

      {/* Comment Input */}
      <View style={styles.commentInputContainer}>
        <TextInput
          placeholder="Write a comment..."
          placeholderTextColor="#888"
          style={styles.input}
          value={commentText}
          onChangeText={setCommentText}
        />
        <TouchableOpacity onPress={handleComment} style={styles.sendIcon}>
          <Feather name="send" size={20} color="#4f46e5" />
        </TouchableOpacity>
      </View>

      {/* Comments */}
      {showAllComments && (
        <View style={styles.commentSection}>
          <ScrollView
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            style={styles.commentScrollContainer}
          >
            {post.comments.map((c, i) => (
              <View key={i} style={styles.commentItem}>
                <TouchableOpacity
                  onPress={() => {
                    router.push(`/(screens)/${c.user._id}`);
                  }}
                >
                  <Image
                    source={{
                      uri: c.user?.profilePic || "https://i.pravatar.cc/300",
                    }}
                    style={styles.commentAvatar}
                  />
                </TouchableOpacity>
                <View style={styles.commentContent}>
                  <Text style={styles.commentText}>
                    <Text style={styles.commentUsername}>{c.user?.name}: </Text>
                    {c.text}
                  </Text>
                </View>
              </View>
            ))}

          </ScrollView>
        </View>
      )}

      {/* Share Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={shareModalVisible}
        onRequestClose={() => setShareModalVisible(false)}
      >
        <View style={modalStyles.modalBackground}>
          <View style={modalStyles.modalContainer}>
            <Text style={modalStyles.modalTitle}>Add a message to share</Text>
            <TextInput
              value={shareText}
              onChangeText={setShareText}
              placeholder="What's on your mind?"
              placeholderTextColor="#888"
              style={modalStyles.modalInput}
              multiline
            />
            <View style={modalStyles.modalButtons}>
              <Pressable
                onPress={() => setShareModalVisible(false)}
                style={modalStyles.cancelButton}
              >
                <Text style={modalStyles.buttonText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleShare} style={modalStyles.sendButton}>
                <Text style={modalStyles.buttonText}>Send</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#121212",
    marginVertical: 9,
    marginHorizontal: 0,
    padding: 9,
    borderRadius: 16,
    elevation: 4,
    borderWidth: 3,
    borderColor: "#383636ff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 0,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    borderColor: "#585757ff",
    padding: 8,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 24,
    padding: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#f1f1f1",
  },
  username: {
    fontFamily: "Outfit-Bold",
    fontSize: 14,
    color: "#f1f1f1",
  },
  dateText: {
    fontFamily: "Outfit-Regular",
    fontSize: 12,
    color: "#888",
  },
  postImage: {
    width: "100%",
    height: 370,
    borderRadius: 12,
    marginVertical: 0,
    backgroundColor: "#16161aff",
  },
  caption: {
    fontFamily: "Outfit-Regular",
    fontSize: 15,
    color: "#ddd",
    marginBottom: 12,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    flexWrap: "wrap",
  },
  actionText: {
    fontFamily: "Outfit-Regular",
    fontSize: 14,
    color: "#bbb",
    marginRight: 16,
  },
  iconBtn: {
    marginRight: 8,
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1f1f24ff",
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: "Outfit-Regular",
    color: "#fff",
  },
  sendIcon: {
    paddingLeft: 10,
  },
  commentSection: {
    borderTopWidth: 1,
    borderColor: "#333",
    paddingTop: 10,
  },
  commentScrollContainer: {
    maxHeight: 200,
  },
  commentItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 10,
    marginTop: 2,
  },
  commentContent: {
    flex: 1,
    backgroundColor: "#1f1f24ff",
    borderRadius: 6,
    padding: 8,
  },
  commentText: {
    fontSize: 14,
    fontFamily: "Outfit-Regular",
    color: "#e5e5e5",
  },
  commentUsername: {
    fontWeight: "bold",
    fontFamily: "Outfit-Bold",
    color: "#ffffff",
  },
  shareIcon: {
    padding: 8,
    backgroundColor: "#121212",
    borderRadius: 8,
  },
  audioButton: {
    backgroundColor: "#4f46e5",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  audioButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Outfit-Bold",
  },
});

const modalStyles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#1c1c1e",
    width: "85%",
    borderRadius: 14,
    padding: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#888",
  },
  modalTitle: {
    fontSize: 16,
    color: "#fff",
    fontFamily: "Outfit-Bold",
    marginBottom: 12,
  },
  modalInput: {
    backgroundColor: "#2a2a2d",
    color: "#fff",
    fontFamily: "Outfit-Regular",
    padding: 10,
    borderRadius: 10,
    fontSize: 14,
    marginBottom: 16,
    minHeight: 80,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    backgroundColor: "#444",
    borderRadius: 6,
  },
  sendButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#4f46e5",
    borderRadius: 6,
  },
  buttonText: {
    color: "#fff",
    fontFamily: "Outfit-Bold",
  },
  audioButton: {
    backgroundColor: "#4f46e5",
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: "center",
  },
  audioButtonText: {
    color: "#fff",
    fontSize: 14,
    fontFamily: "Outfit-Bold",
  },

});

const toneStyles = StyleSheet.create({
  text: {
    color: "#f1f1f1",
    fontSize: 13,
    fontFamily: "Outfit-Regular",
    marginVertical: 1,
    textAlign: "center",
  },
});

