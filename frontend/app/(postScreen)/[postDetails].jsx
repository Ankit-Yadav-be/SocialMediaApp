import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import axios from 'axios';
import { useLocalSearchParams } from 'expo-router';
import { Ionicons, AntDesign } from '@expo/vector-icons';

const PostDetails = () => {
  const { postDetails } = useLocalSearchParams(); // postId passed
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPostDetails = async () => {
    try {
      const { data } = await axios.get(`https://social-media-app-six-nu.vercel.app/api/posts/allPostbyPostId/${postDetails}`);
      setPost(data);
    } catch (err) {
      console.error("Error fetching post:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostDetails();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Post not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: post.user?.profilePic }} style={styles.avatar} />
        <View style={{ marginLeft: 10 }}>
          <Text style={styles.userName}>{post.user?.name}</Text>
          <Text style={styles.email}>{post.user?.email}</Text>
        </View>
      </View>

      {post.image && (
        <Image source={{ uri: post.image }} style={styles.postImage} />
      )}

      <Text style={styles.caption}>{post.caption}</Text>

      <View style={styles.reactions}>
        <AntDesign name="like1" size={20} color="#e91e63" />
        <Text style={styles.likeText}>{post.likes?.length || 0} Likes</Text>
      </View>

      <View style={styles.commentSection}>
        <Text style={styles.commentTitle}>Comments</Text>
        {post.comments?.length > 0 ? (
          post.comments.map((comment, index) => (
            <View key={index} style={styles.commentItem}>
              <Image source={{ uri: comment.user?.profilePic }} style={styles.commentAvatar} />
              <View>
                <Text style={styles.commentUser}>{comment.user?.name}</Text>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noComments}>No comments yet.</Text>
        )}
      </View>
    </ScrollView>
  );
};

export default PostDetails;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fff",
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 18,
    color: "red",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  avatar: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: "#ddd",
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  email: {
    fontSize: 13,
    color: "gray",
  },
  postImage: {
    width: "100%",
    height: 250,
    borderRadius: 12,
    marginVertical: 15,
  },
  caption: {
    fontSize: 16,
    marginBottom: 10,
  },
  reactions: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  likeText: {
    marginLeft: 8,
    fontSize: 15,
  },
  commentSection: {
    marginTop: 10,
  },
  commentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  commentItem: {
    flexDirection: "row",
    marginBottom: 12,
  },
  commentAvatar: {
    height: 35,
    width: 35,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#ccc",
  },
  commentUser: {
    fontWeight: "600",
  },
  commentText: {
    fontSize: 14,
  },
  noComments: {
    fontSize: 14,
    color: "gray",
  },
});
