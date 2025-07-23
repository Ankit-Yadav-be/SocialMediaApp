import React, { useEffect, useState } from 'react';
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
} from 'react-native';
import axios from 'axios';
import { FontAwesome, Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PostCard = ({ post, fetchFeed }) => {
  const [liked, setLiked] = useState(post.likes.includes(post.user._id));
  const [commentText, setCommentText] = useState('');
  const [showAllComments, setShowAllComments] = useState(false);
  const [shareText, setShareText] = useState('');
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [shareCount, setShareCount] = useState(0);
  const router = useRouter();

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
      console.log('Error liking post', err.message);
    }
  };

  const handleShare = async () => {
    if (!shareText.trim()) return;
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.put(
        `https://social-media-app-six-nu.vercel.app/api/posts/share/${post._id}`,
        { shareText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShareText('');
      setShareModalVisible(false);
      fetchFeed();
    } catch (err) {
      console.log('Error sharing post', err.message);
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
        <TouchableOpacity onPress={() => router.push(`/(screens)/${post.user._id}`)}>
          <Image source={{ uri: post.user.profilePic }} style={styles.avatar} />
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.username}>{post.user.name}</Text>
          <Text style={styles.dateText}>
            {new Date(post.createdAt).toDateString()}
          </Text>
        </View>

        {/* Share Icon */}
        <TouchableOpacity
          onPress={() => setShareModalVisible(true)}
          style={styles.shareIcon}
        >

          <Ionicons name="share-social-outline" size={28} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Post Image */}
      <Image source={{ uri: post.image }} style={styles.postImage} />

      {/* Caption */}
      <Text style={styles.caption}>{post.caption}</Text>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike} style={styles.iconBtn}>
          {liked ? (
            <FontAwesome name="heart" size={22} color="#ef4444" />
          ) : (
            <FontAwesome name="heart-o" size={22} color="#ccc" />
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

      {/* Comment List */}
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
                <TouchableOpacity onPress={() => { router.push(`/(screens)/${c.user._id}`) }}>
                  <Image
                    source={{ uri: c.user?.profilePic || 'https://i.pravatar.cc/300' }}
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
              <Pressable onPress={() => setShareModalVisible(false)} style={modalStyles.cancelButton}>
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
    backgroundColor: '#121212',
    marginVertical: 12,
    marginHorizontal: 0,
    padding: 9,
    borderRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#383636ff"
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    borderColor: "#585757ff",
    padding: 8,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 24,
    marginRight: 12,
    borderWidth: 3,
    borderColor: '#f1f1f1',
  },
  username: {
    fontFamily: 'Outfit-Bold',
    fontSize: 16,
    color: '#f1f1f1',
  },
  dateText: {
    fontFamily: 'Outfit-Regular',
    fontSize: 12,
    color: '#888',
  },
  postImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginVertical: 12,
    backgroundColor: '#2c2c3e',
  },
  caption: {
    fontFamily: 'Outfit-Regular',
    fontSize: 15,
    color: '#ddd',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  actionText: {
    fontFamily: 'Outfit-Regular',
    fontSize: 14,
    color: '#bbb',
    marginRight: 16,
  },
  iconBtn: {
    marginRight: 8,
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f1f24ff',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Outfit-Regular',
    color: '#fff',
  },
  sendIcon: {
    paddingLeft: 10,
  },
  commentSection: {
    borderTopWidth: 1,
    borderColor: '#333',
    paddingTop: 10,
  },
  commentScrollContainer: {
    maxHeight: 200,
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
    backgroundColor: '#1f1f24ff',
    borderRadius: 6,
    padding: 8,
  },
  commentText: {
    fontSize: 14,
    fontFamily: 'Outfit-Regular',
    color: '#e5e5e5',
  },
  commentUsername: {
    fontWeight: 'bold',
    fontFamily: 'Outfit-Bold',
    color: '#ffffff',
  },
  shareIcon: {
    padding: 6,
    backgroundColor: '#121212',
    borderRadius: 8,
  },
});

const modalStyles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1c1c1e',
    width: '85%',
    borderRadius: 14,
    padding: 20,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#888',
  },
  modalTitle: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Outfit-Bold',
    marginBottom: 12,
  },
  modalInput: {
    backgroundColor: '#2a2a2d',
    color: '#fff',
    fontFamily: 'Outfit-Regular',
    padding: 10,
    borderRadius: 10,
    fontSize: 14,
    marginBottom: 16,
    minHeight: 80,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 10,
    backgroundColor: '#444',
    borderRadius: 6,
  },
  sendButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#4f46e5',
    borderRadius: 6,
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'Outfit-Bold',
  },
});
