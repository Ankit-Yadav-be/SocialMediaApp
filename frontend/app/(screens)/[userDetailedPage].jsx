import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

const UserDetailedPage = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const {userDetailedPage} = useLocalSearchParams();
  const fetchUserProfile = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');

      if (!storedToken) {
        console.error('No token found in storage');
        return;
      }

      const res = await axios.get(
        `https://social-media-app-six-nu.vercel.app/api/users/${userDetailedPage}`,
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        }
      );

      setUserData(res.data);
    } catch (error) {
      console.error('Error fetching profile:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const renderFollower = ({ item }) => {
    if (!item) return null;

    return (
      <View style={styles.followerContainer}>
        <Image
          source={{
            uri: item.profilePic || 'https://via.placeholder.com/60',
          }}
          style={styles.avatar}
        />
        <Text style={styles.name}>{item.name || 'No Name'}</Text>
      </View>
    );
  };

  if (loading || !userData) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9F9F9' }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>My Profile</Text>

        <Image
          source={{
            uri: userData.profilePic || 'https://via.placeholder.com/120',
          }}
          style={styles.mainAvatar}
        />
        <Text style={styles.mainName}>{userData.name || 'No Name'}</Text>
        <Text style={styles.email}>{userData.email || 'No Email'}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <FontAwesome5 name="users" size={18} color="#4A90E2" />
            <Text style={styles.statNumber}>{userData.followers?.length || 0}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statBox}>
            <MaterialIcons name="person-add" size={20} color="#4A90E2" />
            <Text style={styles.statNumber}>{userData.following?.length || 0}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Followers</Text>
        <FlatList
          data={userData.followers || []}
          keyExtractor={(item) => item._id}
          renderItem={renderFollower}
          horizontal
          showsHorizontalScrollIndicator={false}
        />

        <Text style={styles.sectionTitle}>Following</Text>
        <FlatList
          data={userData.following || []}
          keyExtractor={(item) => item._id}
          renderItem={renderFollower}
          horizontal
          showsHorizontalScrollIndicator={false}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 15,
  },
  mainAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginVertical: 10,
    borderWidth: 3,
    borderColor: '#4A90E2',
  },
  mainName: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    color: '#1a1a1a',
  },
  email: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
    paddingHorizontal: 10,
  },
  statBox: {
    alignItems: 'center',
    backgroundColor: '#E8F0FE',
    padding: 12,
    borderRadius: 12,
    width: 130,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 5,
    color: '#4A90E2',
  },
  statLabel: {
    fontSize: 14,
    color: '#333',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  followerContainer: {
    alignItems: 'center',
    marginRight: 15,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#ccc',
    shadowOpacity: 0.3,
    shadowOffset: { width: 1, height: 2 },
    shadowRadius: 3,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  name: {
    marginTop: 6,
    fontSize: 14,
    maxWidth: 80,
    textAlign: 'center',
    color: '#444',
    fontWeight: '500',
  },
});

export default UserDetailedPage;
