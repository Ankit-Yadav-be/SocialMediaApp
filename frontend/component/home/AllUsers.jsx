import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AllUsers() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchAllUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) throw new Error('No token found');

      const res = await axios.get(
        'https://social-media-app-six-nu.vercel.app/api/users/all',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredUsers([]);
      return;
    }

    const filtered = users.filter((user) =>
      user.name.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredUsers(filtered);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/(screens)/${item._id}`)}>
      <Image
        source={{
          uri: item.profilePic || 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
        }}
        style={styles.avatar}
      />
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{item.name}</Text>
        <View style={styles.followRow}>
          <Ionicons name="people" size={16} color="#aaa" />
          <Text style={styles.followText}>
            {'  '}
            {item.followers?.length || 0} Followers · {item.following?.length || 0} Following
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* 🔍 Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#bbb" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users by name"
          value={searchQuery}
          onChangeText={handleSearch}
          placeholderTextColor="#888"
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#999" style={{ marginTop: 50 }} />
      ) : searchQuery.trim() === '' ? (
        null
      ) : filteredUsers.length === 0 ? (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>No users found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredUsers}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f1f24ff',
    marginHorizontal: 16,
    borderRadius: 14,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginBottom: 12,
     borderWidth:1,
    borderColor:'#dededeff',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#f0f0f0',
    fontFamily: 'Outfit-Regular',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#1f1f24ff',
    marginBottom: 14,
    padding: 14,
    borderRadius: 16,
    elevation: 2,
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginRight: 14,
    backgroundColor: '#2a2a2a',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontFamily: 'Outfit-Bold',
    color: '#ffffff',
    marginBottom: 6,
  },
  followRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  followText: {
    fontSize: 13,
    color: '#ccc',
    fontFamily: 'Outfit-Regular',
  },
  infoBox: {
    alignItems: 'center',
    marginTop: 60,
  },
  infoText: {
    fontSize: 16,
    color: '#aaa',
    fontFamily: 'Outfit-Regular',
  },
});
