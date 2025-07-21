import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList
} from 'react-native';
import { useAuth } from '../../context/authContext';
import axios from 'axios';
import { FontAwesome, FontAwesome5 } from '@expo/vector-icons';

const PostCard = ({ post, fetchFeed }) => {
  const [liked, setLiked] = useState(post.likes.includes(post.user._id));
  const [commentText, setCommentText] = useState('');
  const { token, user } = useAuth();

  const handleLike = async () => {
    try {
      await axios.put(`https://social-media-app-six-nu.vercel.app/api/posts/like/${post._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLiked(!liked);
      fetchFeed();
    } catch (err) {
      console.log('Error liking post', err.message);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      await axios.put(`https://social-media-app-six-nu.vercel.app/api/posts/comment/${post._id}`, {
        text: commentText
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommentText('');
      fetchFeed();
    } catch (err) {
      console.log('Error adding comment', err.message);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Image source={{ uri: post.user.profilePic }} style={styles.avatar} />
        <Text style={styles.username}>{post.user.name}</Text>
      </View>

      <Image source={{ uri: post.image }} style={styles.postImage} />

      <Text style={styles.caption}>{post.caption}</Text>

      <View style={styles.actions}>
        <TouchableOpacity onPress={handleLike}>
          {liked ? (
            <FontAwesome name="heart" size={20} color="red" />
          ) : (
            <FontAwesome name="heart-o" size={20} color="black" />
          )}
        </TouchableOpacity>
        <Text style={styles.actionText}>{post.likes.length} Likes</Text>
        <FontAwesome5 name="comment-alt" size={18} />
        <Text style={styles.actionText}>{post.comments.length} Comments</Text>
      </View>

      <TextInput
        placeholder="Add a comment..."
        style={styles.input}
        value={commentText}
        onChangeText={setCommentText}
      />
      <TouchableOpacity style={styles.button} onPress={handleComment}>
        <Text style={styles.buttonText}>Post</Text>
      </TouchableOpacity>

      <View style={styles.commentSection}>
        {post.comments.slice(-2).map((c, i) => (
          <Text key={i} style={styles.commentText}>
            <Text style={{ fontWeight: 'bold' }}>{c.user.name}: </Text>{c.text}
          </Text>
        ))}
      </View>
    </View>
  );
};

export default PostCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    marginVertical: 10,
    padding: 10,
    borderRadius: 10,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10
  },
  username: {
    fontWeight: 'bold',
    fontSize: 16
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginVertical: 10
  },
  caption: {
    marginBottom: 6
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8
  },
  actionText: {
    marginHorizontal: 8
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 8
  },
  button: {
    backgroundColor: '#3182CE',
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 6,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  commentSection: {
    marginTop: 10
  },
  commentText: {
    fontSize: 14,
    marginTop: 4
  }
});
