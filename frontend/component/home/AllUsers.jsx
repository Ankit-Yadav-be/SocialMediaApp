import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import axios from 'axios';
import { SafeAreaView } from 'react-native-safe-area-context';
import {useAuth} from "../../context/authContext"
const AllUsers = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const fetchUserProfile = async () => {
    try {
      const res = await axios.get('http://localhost:8000/api/user/profile', {
        headers: {
          Authorization: `${token}`, // Replace with real token
        },
      });
      setUserData(res.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const renderFollower = ({ item }) => (
    <View style={styles.followerContainer}>
      <Image source={{ uri: item.profilePic }} style={styles.avatar} />
      <Text style={styles.name}>{item.name}</Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {loading ? (
        <ActivityIndicator size="large" color="#000" />
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.header}>My Profile</Text>
          <Image source={{ uri: userData.profilePic }} style={styles.mainAvatar} />
          <Text style={styles.mainName}>{userData.name}</Text>
          <Text style={styles.email}>{userData.email}</Text>

          <Text style={styles.sectionTitle}>Followers</Text>
          <FlatList
            data={userData.followers}
            keyExtractor={(item) => item._id}
            renderItem={renderFollower}
            horizontal
            showsHorizontalScrollIndicator={false}
          />

          {/* You can add nested follower rendering here if you deeply populate */}
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  mainAvatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginVertical: 10,
  },
  mainName: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  email: {
    fontSize: 16,
    color: 'gray',
    textAlign: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 10,
  },
  followerContainer: {
    alignItems: 'center',
    marginRight: 15,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  name: {
    marginTop: 5,
    fontSize: 14,
  },
});

export default AllUsers;
