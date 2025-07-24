import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  FlatList,
} from 'react-native';

import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PostCard from '../../component/home/PostCard';
import AllUsers from '../../component/home/AllUsers';
import Story from "../../component/home/Status"

const HomeScreen = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [visiblePostId, setVisiblePostId] = useState(null);

  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 70 }).current;

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setVisiblePostId(viewableItems[0].item._id);
    }
  }).current;

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
      <StatusBar backgroundColor="#112130ff" barStyle="dark-content" />
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
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListHeaderComponent={
            <>
              {/* <CommentTester/> */}
              <AllUsers />
              <Story />
              <Text style={styles.feedText}>Your Feed</Text>
            </>
          }
          renderItem={({ item }) => (
            <PostCard post={item} fetchFeed={fetchFeed} visiblePostId={visiblePostId} />
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig}
          contentContainerStyle={styles.scrollContent}
        />
      )}
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
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
  feedText: {
    color: "#fff",
    marginLeft: 17,
    fontFamily: "Outfit-Bold",
    fontSize: 18,
    marginBottom: 10
  },
});
