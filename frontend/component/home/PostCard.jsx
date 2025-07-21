import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useAuth } from '../../context/authContext';
import axios from 'axios';
import { FontAwesome, Feather } from '@expo/vector-icons';

const PostCard = ({ post, fetchFeed }) => {
  const [liked, setLiked] = useState(post.likes.includes(post.user._id));
  const [commentText, setCommentText] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const { token } = useAuth();

  const handleLike = async () => {
    try {
      await axios.put(
        `https://social-media-app-six-nu.vercel.app/api/posts/like/${post._id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
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
        { headers: { Authorization: `Bearer ${token}` } }
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
            <FontAwesome name="heart" size={22} color="#e63946" />
          ) : (
            <FontAwesome name="heart-o" size={22} color="#333" />
          )}
        </TouchableOpacity>
        <Text style={styles.actionText}>{post.likes.length} Likes</Text>

        <TouchableOpacity
          onPress={() => setShowAllComments(!showAllComments)}
          style={styles.iconBtn}
        >
          <Feather name="message-circle" size={22} color="#333" />
        </TouchableOpacity>
        <Text style={styles.actionText}>{post.comments.length} Comments</Text>
      </View>

      {/* Comment Input */}
      <View style={styles.commentInputContainer}>
        <TextInput
          placeholder="Write a comment..."
          placeholderTextColor="#aaa"
          style={styles.input}
          value={commentText}
          onChangeText={setCommentText}
        />
        <TouchableOpacity onPress={handleComment} style={styles.sendIcon}>
          <Feather name="send" size={20} color="#4f46e5" />
        </TouchableOpacity>
      </View>

      {/* Comment List */}
      {showAllComments && (
        <View style={styles.commentSection}>
          <View style={styles.commentScrollContainer}>
            <ScrollView
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {post.comments.map((c, i) => (
                <View key={i} style={styles.commentItem}>
                  <Image
                    source={{
                      uri: c.user?.profilePic || 'https://i.pravatar.cc/300',
                    }}
                    style={styles.commentAvatar}
                  />
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
    marginHorizontal: 10,
    padding: 14,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
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
    fontWeight: '700',
    fontSize: 16,
    color: '#1d1d1f',
  },
  dateText: {
    fontSize: 12,
    color: '#888',
  },
  postImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginVertical: 12,
    backgroundColor: '#eee',
  },
  caption: {
    fontSize: 15,
    color: '#444',
    marginBottom: 12,
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
    borderColor: '#e0e0e0',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
    backgroundColor: '#fafafa',
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    color: '#111',
  },
  sendIcon: {
    paddingLeft: 10,
  },
  commentSection: {
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 10,
  },
  commentScrollContainer: {
    maxHeight: 200,
    paddingVertical: 5,
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    backgroundColor: '#afa9ba43',
    borderRadius: 3,
    padding: 8,
  },
  commentText: {
    fontSize: 14,
    color: '#444',
  },
  commentUsername: {
    fontWeight: 'bold',
    color: '#222',
  },
});
