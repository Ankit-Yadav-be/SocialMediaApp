import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  FlatList,
} from "react-native";
import axios from "axios";
import { router, useLocalSearchParams } from "expo-router";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PostDetails = () => {
  const { postDetails } = useLocalSearchParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [token, setToken] = useState("");
  const [showFullCaption, setShowFullCaption] = useState(false);

  useEffect(() => {
    const loadToken = async () => {
      const t = await AsyncStorage.getItem("token");
      setToken(t);
    };
    loadToken();
  }, []);

  const fetchPostDetails = async () => {
    try {
      const { data } = await axios.get(
        `https://social-media-app-six-nu.vercel.app/api/posts/allPostbyPostId/${postDetails}`
      );
      setPost(data);
    } catch (err) {
      console.error("Error fetching post:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetails();
  }, [postDetails]);

  const handleLike = async () => {
    try {
      await axios.put(
        `https://social-media-app-six-nu.vercel.app/api/posts/like/${postDetails}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchPostDetails();
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    try {
      await axios.put(
        `https://social-media-app-six-nu.vercel.app/api/posts/comment/${postDetails}`,
        { text: comment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setComment("");
      fetchPostDetails();
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentItem}>
      <Image
        source={{ uri: item.user?.profilePic }}
        style={styles.commentAvatar}
      />
      <View style={styles.commentBox}>
        <Text style={styles.commentUser}>{item.user?.name}</Text>
        <Text style={styles.commentText}>{item.text}</Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loader}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Post not found</Text>
      </SafeAreaView>
    );
  }

  const liked = post.likes?.some((likeUser) => likeUser._id === post.user?._id);

  const renderCaption = () => {
    const words = post.caption?.split(" ") || [];
    if (showFullCaption || words.length <= 2) {
      return (
        <TouchableOpacity onPress={() => setShowFullCaption(false)}>
          <Text style={styles.caption}>
            {post.caption}{" "}
            {words.length > 2 && (
              <Text style={styles.captionToggle}>Show less</Text>
            )}
          </Text>
        </TouchableOpacity>
      );
    } else {
      return (
        <TouchableOpacity onPress={() => setShowFullCaption(true)}>
          <Text style={styles.caption}>
            {words.slice(0, 2).join(" ")}...{" "}
            <Text style={styles.captionToggle}>Read more</Text>
          </Text>
        </TouchableOpacity>
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <FlatList
          data={post.comments}
          keyExtractor={(item, index) => index.toString()}
          ListHeaderComponent={
            <View style={styles.container}>
              <View style={styles.header}>
                <TouchableOpacity onPress={() => router.push(`/(screens)/${post.user._id}`)}>
                  <Image
                    source={{ uri: post.user?.profilePic }}
                    style={styles.avatar}
                  />
                </TouchableOpacity>
                <View style={{ marginLeft: 10 }}>
                  <Text style={styles.userName}>{post.user?.name}</Text>
                  <Text style={styles.email}>{post.user?.email}</Text>
                </View>
              </View>

              {post.image && (
                <Image source={{ uri: post.image }} style={styles.postImage} />
              )}

              {renderCaption()}

              <View style={styles.commentCountWrapper}>
                <TouchableOpacity style={styles.reactions} onPress={handleLike}>
                  <AntDesign
                    name="like1"
                    size={20}
                    color={liked ? "#e91e63" : "#999"}
                  />
                  <Text style={styles.likeText}>{post.likes?.length || 0} Likes</Text>
                </TouchableOpacity>
                <Ionicons name="chatbubble-outline" size={18} color="#aaa" />
                <Text style={styles.commentCount}>
                  {post.comments?.length || 0} Comments
                </Text>
              </View>

              <Text style={styles.commentTitle}>Comments</Text>
            </View>
          }
          renderItem={renderComment}
          contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}
          ListEmptyComponent={
            <Text style={styles.noComments}>No comments yet.</Text>
          }
        />

        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Write a comment..."
            placeholderTextColor="#aaa"
            value={comment}
            onChangeText={setComment}
            style={styles.input}
          />
          <TouchableOpacity onPress={handleComment} style={styles.sendButton}>
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default PostDetails;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#0f0f1a",
    paddingTop: 20,
    
  },
  container: {
    backgroundColor: "#0f0f1a",
       borderTopWidth: 1,
       borderLeftWidth: 1,
       borderRightWidth:1,
       padding:9,
    borderColor: "#9e9a9aff",
       borderRadius: 16,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0f1a",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0f0f1a",
  },
  errorText: {
    fontFamily: "Outfit-Bold",
    fontSize: 18,
    color: "#ff4c4c",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth:1,
    borderBottomLeftRadius:15,
    borderBottomRightRadius:15,
    padding:8,
    borderColor: "#bbbbbbff",

  },
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 25,
    borderWidth: 3,
    borderColor: '#f1f1f1',
    backgroundColor: "#2e2e3e",
  },
  userName: {
    fontFamily: "Outfit-Bold",
    fontSize: 16,
    color: "#ffffff",
  },
  email: {
    fontFamily: "Outfit-Regular",
    fontSize: 13,
    color: "#bbbbbb",
  },
  postImage: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    marginVertical: 15,
    backgroundColor: "#1f1f2e",
  },
  caption: {
    fontFamily: "Outfit-Regular",
    fontSize: 15,
    marginBottom: 10,
    color: "#dddddd",
  },
  captionToggle: {
    color: "#7db7faff",
    fontFamily: "Outfit-Bold",
  },
  reactions: {
    flexDirection: "row",
    alignItems: "center",
  },
  likeText: {
    marginLeft: 6,
    fontSize: 15,
    fontFamily: "Outfit-Regular",
    color: "#aaa",
  },
  commentCountWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    gap: 10,
  },
  commentCount: {
    fontFamily: "Outfit-Regular",
    fontSize: 15,
    color: "#999",
  },
  commentTitle: {
    fontFamily: "Outfit-Bold",
    fontSize: 18,
    marginBottom: 10,
    color: "#ffffff",
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
    backgroundColor: "#13131cff",
    borderRadius: 10,
    padding: 10,
  },
  commentAvatar: {
    height: 35,
    width: 35,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#2e2e38ff",
  },
  commentBox: {
    flex: 1,
  },
  commentUser: {
    fontFamily: "Outfit-Bold",
    fontSize: 14,
    color: "#ffffff",
    marginBottom: 2,
  },
  commentText: {
    fontFamily: "Outfit-Regular",
    fontSize: 14,
    color: "#cccccc",
  },
  noComments: {
    fontSize: 14,
    fontFamily: "Outfit-Regular",
    color: "#888",
    fontStyle: "italic",
    paddingHorizontal: 16,
  },
  inputContainer: {
    flexDirection: "row",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: "#1a1a2e",
    borderTopWidth: 1,
    borderColor: "#333",
    alignItems: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#2a2a3d",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontFamily: "Outfit-Regular",
    fontSize: 14,
    color: "#ffffff",
  },
  sendButton: {
    backgroundColor: "#3c4856ff",
    marginLeft: 10,
    padding: 10,
    borderRadius: 20,
  },
});
