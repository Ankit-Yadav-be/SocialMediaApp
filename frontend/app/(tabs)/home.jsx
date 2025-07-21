import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PostCard from '../../component/home/PostCard';

const HomeScreen = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFeed = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const { data } = await axios.get(
        'https://social-media-app-six-nu.vercel.app/api/posts/feed',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log('Feed Response Data:', data);
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch feed:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFeed();
    setRefreshing(false);
  };

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#555" />
      ) : posts.length === 0 ? (
        <Text style={styles.noPosts}>
          No posts to show. You might not be following anyone yet, or there are no posts.
        </Text>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {posts.map((post) => (
            <PostCard key={post._id} post={post}  />
          ))}
        </ScrollView>
      )}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  noPosts: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#777',
  },
  scrollContent: {
    paddingBottom: 20,
  },
});
