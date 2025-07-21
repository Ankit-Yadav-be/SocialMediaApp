import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Dimensions,
} from 'react-native';
import axios from 'axios';
import { Avatar } from 'react-native-paper';
import { AntDesign } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PostById ({ userDetailedPage }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
 const token =  AsyncStorage.getItem('token');
  const fetchPosts = async () => {
    try {
      const res = await axios.get(
        `https://social-media-app-six-nu.vercel.app/api/posts/getpost/${userDetailedPage}`,
         {headers: { Authorization: `Bearer ${token}` }
    });
      setPosts(res.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <View style={styles.loader}>
        <Text style={{ color: '#555' }}>No posts found for this user.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {posts.map((post, index) => (
        <View style={styles.card} key={post._id || index}>
          {/* User Info */}
          


          {/* Post Image */}
         <TouchableOpacity onPress={()=>router.push(`/(postscreen)/${post._id}`)}>
             {post.image && (
            <Image
              source={{ uri: post.image }}
              style={styles.postImage}
              resizeMode="cover"
            />
          )}
         </TouchableOpacity>

         
          {/* Comments */}
        
        </View>
      ))}
    </ScrollView>
  );
}

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#ffffff',
    margin: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 3,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    fontWeight: '700',
    fontSize: 16,
    color: '#1A1A1A',
  },
  postDate: {
    color: '#888',
    fontSize: 12,
    marginTop: 2,
  },
  postImage: {
    width: '100%',
    height: screenWidth * 0.6,
    borderRadius: 12,
    marginVertical: 12,
  },
  caption: {
    fontSize: 15,
    fontStyle: 'italic',
    color: '#333',
    marginBottom: 12,
  },
  likesSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  likeCount: {
    marginLeft: 6,
    fontWeight: '500',
    fontSize: 14,
    color: '#444',
  },
  commentSection: {
    marginTop: 14,
    borderTopWidth: 1,
    borderColor: '#eee',
    paddingTop: 10,
  },
  commentHeader: {
    fontWeight: '600',
    fontSize: 16,
    color: '#4A90E2',
    marginBottom: 10,
  },
  commentBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  commentContent: {
    backgroundColor: '#F5F7FA',
    borderRadius: 10,
    padding: 10,
    marginLeft: 10,
    flex: 1,
  },
  commentAuthor: {
    fontWeight: '600',
    fontSize: 14,
    marginBottom: 2,
    color: '#222',
  },
  commentText: {
    fontSize: 13,
    color: '#555',
  },
  noComment: {
    color: '#999',
    fontStyle: 'italic',
  },
});
