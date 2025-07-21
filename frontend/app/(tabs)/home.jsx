import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PostCard from '../../component/home/PostCard';
import AllUsers from '../../component/home/UserPofile';

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
      <StatusBar backgroundColor="#f4f6f8" barStyle="dark-content" />
      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loaderText}>Loading feed...</Text>
        </View>
      ) : posts.length === 0 ? (
        <View style={styles.noPostsContainer}>
          <Text style={styles.noPosts}>
            No posts available. Try following more people!
          </Text>
        </View>
      ) : (
        <ScrollView
          nestedScrollEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.scrollContent}
        >
           <AllUsers />
          {posts.map((post) => (
            <PostCard key={post._id} post={post} />
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
    backgroundColor: '#f4f6f8', // soft light gray background
    paddingTop: 10,
  },
  scrollContent: {
    paddingBottom: 20,
    paddingHorizontal: 12,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  noPostsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noPosts: {
    textAlign: 'center',
    fontSize: 16,
    color: '#999',
    fontStyle: 'italic',
    paddingHorizontal: 20,
  },
});
