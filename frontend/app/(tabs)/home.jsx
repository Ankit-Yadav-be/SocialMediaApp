import React, { useEffect, useState, useContext } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  StyleSheet,
} from "react-native";
import axios from "axios";
import { AuthContext } from "../../context/authContext";
import PostCard from "../../component/home/PostCard"; // should be a React Native component

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { token } = useContext(AuthContext);
  
  const fetchFeed = async () => {
    try {
      console.log(token);
      const res = await axios.get("https://social-media-app-six-nu.vercel.app/api/posts/feed", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(res.data);
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching posts:", err?.response?.data || err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFeed();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFeed();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.heading}>Home Feed</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#555" />
      ) : posts.length === 0 ? (
        <Text style={styles.noPosts}>No posts to show. Follow someone or create a post!</Text>
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.scrollContent}
        >
          {posts.map((post) => (
            <PostCard key={post._id} post={post} fetchFeed={fetchFeed} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
  },
  noPosts: {
    fontSize: 16,
    color: "gray",
    textAlign: "center",
    marginTop: 20,
  },
  scrollContent: {
    paddingBottom: 20,
  },
});
