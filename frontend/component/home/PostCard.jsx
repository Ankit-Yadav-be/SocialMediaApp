import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { useAuth } from '../../context/authContext';
import axios from 'axios';
import { FontAwesome, FontAwesome5, Feather } from '@expo/vector-icons';

const PostCard = ({ post, fetchFeed }) => {
  const [liked, setLiked] = useState(post.likes.includes(post.user._id));
  const [commentText, setCommentText] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const { token, user } = useAuth();

  const handleLike = async () => {
    try {
      await axios.put(
        `https://social-media-app-six-nu.vercel.app/api/posts/like/${post._id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setLiked(!liked);
      fetchFeed();
    } catch (err) {
      console.log('Error liking post', err.message);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      await axios.put(
        `https://social-media-app-six-nu.vercel.app/api/posts/comment/${post._id}`,
        { text: commentText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCommentText('');
      fetchFeed();
    } catch (err) {
      console.log('Error adding comment', err.message);
    }
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: post.user.profilePic }} style={styles.avatar} />
        <View>
          <Text style={styles.username}>{post.user.name}</Text>
          <Text style={styles.dateText}>
            {new Date(post.createdAt).toDateString()}
          </Text>
        </View>
      </View>

      {/* Post Image */}
      <Image source={{ uri: post.image }} style={styles.postImage} />

      {/* Caption */}
      <Text style={styles.caption}>{post.caption}</Text>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike} style={styles.iconBtn}>
          {liked ? (
            <FontAwesome name="heart" size={22} color="#ff4d4f" />
          ) : (
            <FontAwesome name="heart-o" size={22} color="#333" />
          )}
        </TouchableOpacity>

        <Text style={styles.actionText}>{post.likes.length} Likes</Text>

        <TouchableOpacity
          onPress={() => setShowAllComments(!showAllComments)}
          style={styles.iconBtn}
        >
          <Feather name="message-circle" size={22} color="#555" />
        </TouchableOpacity>

        <Text style={styles.actionText}>{post.comments.length} Comments</Text>
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

      {/* Comments (toggle visibility) */}
      {showAllComments && (
        <View style={styles.commentSection}>
          {post.comments.map((c, i) => (
            <Text key={i} style={styles.commentText}>
              <Text style={{ fontWeight: 'bold' }}>{c.user.name}: </Text>
              {c.text}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
};

export default PostCard;
const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    marginVertical: 12,
    marginHorizontal: 16,
    padding: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  dateText: {
    fontSize: 12,
    color: '#888',
  },
  postImage: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    marginVertical: 10,
  },
  caption: {
    fontSize: 15,
    color: '#444',
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  actionText: {
    fontSize: 14,
    color: '#555',
    marginRight: 16,
  },
  iconBtn: {
    marginRight: 8,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    color: '#222',
  },
  sendIcon: {
    paddingLeft: 10,
  },
  commentSection: {
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 8,
  },
  commentText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 4,
  },
});
