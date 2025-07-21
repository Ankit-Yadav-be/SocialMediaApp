import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';

import axios from 'axios';
import { Avatar } from 'react-native-paper';
import { AntDesign, Feather } from '@expo/vector-icons';

export default function PostById({userDetailedPage}) {

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPost = async () => {
    try {
      const res = await axios.get(`https://social-media-app-six-nu.vercel.app/api/posts/getpost/${userDetailedPage}`);
      setPost(res.data);
    } catch (err) {
      console.error('Error fetching post:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPost();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        {/* User Info */}
        <View style={styles.userRow}>
          <Avatar.Image
            source={{ uri: post.user.profilePic }}
            size={44}
          />
          <View style={styles.userDetails}>
            <Text style={styles.userName}>{post.user.name}</Text>
            <Text style={styles.postDate}>
              {new Date(post.createdAt).toDateString()}
            </Text>
          </View>
        </View>

        {/* Post Image */}
        <Image
          source={{ uri: post.image }}
          style={styles.postImage}
          resizeMode="cover"
        />

        {/* Caption */}
        {post.caption ? (
          <Text style={styles.caption}>{post.caption}</Text>
        ) : null}

        {/* Likes */}
        <View style={styles.likesSection}>
          <AntDesign name="heart" size={20} color="#e74c3c" />
          <Text style={styles.likeCount}>{post.likes.length} Likes</Text>
        </View>

        {/* Comments */}
        <View style={styles.commentSection}>
          <Text style={styles.commentHeader}>Comments</Text>
          {post.comments.map((comment, index) => (
            <View style={styles.commentBox} key={index}>
              <Avatar.Image
                source={{ uri: comment.user.profilePic }}
                size={32}
              />
              <View style={styles.commentTextWrapper}>
                <Text style={styles.commentAuthor}>{comment.user.name}</Text>
                <Text style={styles.commentText}>{comment.text}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F6FA',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: '#fff',
    margin: 16,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userDetails: {
    marginLeft: 10,
  },
  userName: {
    fontWeight: '600',
    fontSize: 16,
  },
  postDate: {
    color: '#777',
    fontSize: 12,
  },
  postImage: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    marginVertical: 10,
  },
  caption: {
    fontSize: 15,
    marginBottom: 10,
    color: '#333',
  },
  likesSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  likeCount: {
    marginLeft: 8,
    fontWeight: '500',
    color: '#333',
  },
  commentSection: {
    marginTop: 12,
  },
  commentHeader: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 8,
    color: '#4A90E2',
  },
  commentBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  commentTextWrapper: {
    marginLeft: 10,
    flex: 1,
  },
  commentAuthor: {
    fontWeight: '600',
    fontSize: 14,
  },
  commentText: {
    fontSize: 13,
    color: '#555',
  },
});
