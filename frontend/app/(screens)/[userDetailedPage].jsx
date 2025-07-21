import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import { decode as atob } from 'base-64'; // for decoding JWT
import PostById from '../../component/home/PostById';

const UserDetailedPage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const { userDetailedPage } = useLocalSearchParams();

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('Token not found');

      const res = await axios.get(
        `https://social-media-app-six-nu.vercel.app/api/users/${userDetailedPage}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const decoded = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(decoded.id || decoded._id);

      const isFollowing = res.data.followers?.some(
        (follower) => follower._id === decoded.id || follower._id === decoded._id
      );
      setIsFollowing(isFollowing);

      setUserData(res.data);
    } catch (error) {
      console.error('Error fetching profile:', error?.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFollowToggle = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const endpoint = `https://social-media-app-six-nu.vercel.app/api/users/${userDetailedPage}/${isFollowing ? 'unfollow' : 'follow'}`;
      await axios.put(endpoint, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsFollowing(!isFollowing);
      fetchUserProfile(); // refresh followers count
    } catch (error) {
      console.error('Error toggling follow:', error?.response?.data || error.message);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const renderUserCard = ({ item }) => (
    <TouchableOpacity style={styles.userCard} onPress={() => router.push(`/(screens)/${item._id}`)}>
      <Image
        source={{ uri: item.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
        style={styles.avatar}
      />
      <Text style={styles.name} numberOfLines={1}>{item.name || 'Unknown'}</Text>
    </TouchableOpacity>
  );

  if (loading || !userData) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F4F6F9' }}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image
            source={{ uri: userData.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png' }}
            style={styles.mainAvatar}
          />
          <Text style={styles.mainName}>{userData.name}</Text>
          <Text style={styles.email}>{userData.email}</Text>
          {userData.bio && <Text style={styles.bio}>{userData.bio}</Text>}

          {/* Follow/Unfollow Button */}
          {currentUserId !== userData._id && (
            <TouchableOpacity
              onPress={handleFollowToggle}
              style={{
                backgroundColor: isFollowing ? '#E3E3E3' : '#4A90E2',
                paddingVertical: 10,
                paddingHorizontal: 28,
                borderRadius: 25,
                marginTop: 15,
              }}
            >
              <Text
                style={{
                  color: isFollowing ? '#333' : '#fff',
                  fontFamily: 'Outfit-Bold',
                  fontSize: 16,
                }}
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Stats */}
          <View style={styles.statsContainer}>
            <LinearGradient colors={['#E0ECFF', '#F4F9FF']} style={styles.statBoxEnhanced}>
              <View style={styles.iconWrapper}>
                <Ionicons name="people" size={24} color="#4A90E2" />
              </View>
              <Text style={styles.statNumberEnhanced}>{userData.followers?.length || 0}</Text>
              <Text style={styles.statLabelEnhanced}>Followers</Text>
            </LinearGradient>

            <LinearGradient colors={['#E0ECFF', '#F4F9FF']} style={styles.statBoxEnhanced}>
              <View style={styles.iconWrapper}>
                <Ionicons name="person-add" size={24} color="#4A90E2" />
              </View>
              <Text style={styles.statNumberEnhanced}>{userData.following?.length || 0}</Text>
              <Text style={styles.statLabelEnhanced}>Following</Text>
            </LinearGradient>
          </View>
        </View>

        {/* Followers */}
        <Text style={styles.sectionTitle}>Followers</Text>
        {userData.followers?.length ? (
          <FlatList
            data={userData.followers}
            keyExtractor={(item) => item._id}
            renderItem={renderUserCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 10 }}
          />
        ) : (
          <Text style={styles.emptyText}>No followers yet</Text>
        )}

        {/* Following */}
        <Text style={styles.sectionTitle}>Following</Text>
        {userData.following?.length ? (
          <FlatList
            data={userData.following}
            keyExtractor={(item) => item._id}
            renderItem={renderUserCard}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingLeft: 10 }}
          />
        ) : (
          <Text style={styles.emptyText}>Not following anyone</Text>
        )}

        {/* Posts */}
        <Text style={styles.sectionTitle}>Posts</Text>
        <View style={styles.postsPlaceholder}>
          <PostById userDetailedPage={userDetailedPage}/>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: 30,
    alignItems: 'center',
  },
  mainAvatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  mainName: {
    fontSize: 22,
    fontFamily: 'Outfit-Bold',
    color: '#222',
  },
  email: {
    fontSize: 15,
    color: '#777',
    fontFamily: 'Outfit-Regular',
    marginTop: 4,
  },
  bio: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
    fontFamily: 'Outfit-Regular',
    textAlign: 'center',
    marginTop: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 25,
  },
  statBoxEnhanced: {
    alignItems: 'center',
    backgroundColor: '#F5F9FF',
    padding: 18,
    borderRadius: 20,
    width: 130,
    elevation: 5,
    shadowColor: '#ffffff1c',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    marginHorizontal: 5,
  },
  iconWrapper: {
    backgroundColor: '#D6E7FF',
    paddingTop: 5,
    borderRadius: 50,
    marginBottom: 5,
  },
  statNumberEnhanced: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1a1a1a',
    fontFamily: 'Outfit-Bold',
  },
  statLabelEnhanced: {
    fontSize: 15,
    color: '#555',
    fontFamily: 'Outfit-Regular',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: 'Outfit-Bold',
    marginBottom: 12,
    paddingLeft: 10,
    margin: 10,
    color: '#222',
  },
  userCard: {
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    width: 90,
    elevation: 2,
    shadowColor: '#aaa',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e0e0e0',
  },
  name: {
    marginTop: 6,
    fontSize: 13,
    textAlign: 'center',
    fontFamily: 'Outfit-Regular',
    color: '#333',
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
    fontFamily: 'Outfit-Regular',
    marginBottom: 15,
  },
  postsPlaceholder: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#eee',
    alignItems: 'center',
  },
});

export default UserDetailedPage;
