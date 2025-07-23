import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Video } from 'expo-av';
import axios from 'axios';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';

const { height, width } = Dimensions.get('window');

export default function Reel() {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likedReels, setLikedReels] = useState({});
  const [isPlaying, setIsPlaying] = useState({});
  const videoRefs = useRef([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchReels = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) return;

      const res = await axios.get('https://social-media-app-six-nu.vercel.app/api/reels', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReels(res.data);
    } catch (error) {
      console.error('Error fetching reels:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReels();
  }, []);

  const handleLikeToggle = async (reelId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      await axios.put(
        `https://social-media-app-six-nu.vercel.app/api/reels/${reelId}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setReels((prevReels) =>
        prevReels.map((reel) =>
          reel._id === reelId
            ? {
                ...reel,
                likes: likedReels[reelId]
                  ? reel.likes.filter((id) => id !== 'self') // remove dummy
                  : [...reel.likes, 'self'], // add dummy id
              }
            : reel
        )
      );

      setLikedReels((prev) => ({
        ...prev,
        [reelId]: !prev[reelId],
      }));
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleComment = async (reelId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const commentText = '🔥🔥'; // Replace with modal input later

      await axios.post(
        `https://social-media-app-six-nu.vercel.app/api/reels/${reelId}/comment`,
        { text: commentText },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setReels((prevReels) =>
        prevReels.map((reel) =>
          reel._id === reelId
            ? { ...reel, comments: [...reel.comments, { text: commentText }] }
            : reel
        )
      );
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const togglePlayPause = async (index) => {
    const currentVideo = videoRefs.current[index];
    if (currentVideo) {
      const status = await currentVideo.getStatusAsync();
      if (status.isPlaying) {
        await currentVideo.pauseAsync();
        setIsPlaying((prev) => ({ ...prev, [index]: false }));
      } else {
        await currentVideo.playAsync();
        setIsPlaying((prev) => ({ ...prev, [index]: true }));
      }
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      const index = viewableItems[0].index;
      setCurrentIndex(index);

      videoRefs.current.forEach((video, i) => {
        if (video) {
          if (i === index) {
            video.playAsync();
            setIsPlaying((prev) => ({ ...prev, [i]: true }));
          } else {
            video.pauseAsync();
            setIsPlaying((prev) => ({ ...prev, [i]: false }));
          }
        }
      });
    }
  }).current;

  const renderReel = ({ item, index }) => (
    <View style={styles.reelContainer}>
      <TouchableWithoutFeedback onPress={() => togglePlayPause(index)}>
        <Video
          ref={(ref) => (videoRefs.current[index] = ref)}
          source={{ uri: item.video }}
          style={{ width: 350, height: 735 }}
          resizeMode="cover"
          isLooping
          shouldPlay={index === currentIndex}
          useNativeControls={false}
        />
      </TouchableWithoutFeedback>

      <View style={styles.overlay}>
        <View style={styles.infoWrapper}>
          <View style={styles.userInfo}>
            <TouchableOpacity onPress={() => router.push(`/(screens)/${item.user._id}`)}>
              <Image source={{ uri: item.user.profilePic }} style={styles.avatar} />
            </TouchableOpacity>
            <Text style={styles.username}>{item.user.name}</Text>
          </View>
          <Text style={styles.caption}>{item.caption}</Text>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleLikeToggle(item._id)}
          >
            <Ionicons
              name={likedReels[item._id] ? 'heart' : 'heart-outline'}
              size={30}
              color={likedReels[item._id] ? 'red' : '#fff'}
            />
            <Text style={styles.actionText}>
              {item.likes.length}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleComment(item._id)}
          >
            <Ionicons name="chatbubble-outline" size={28} color="#fff" />
            <Text style={styles.actionText}>{item.comments.length}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton}>
            <FontAwesome name="share" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#fdfdfdff" />
      </View>
    );
  }

  return (
    <FlatList
      data={reels}
      renderItem={renderReel}
      keyExtractor={(item) => item._id}
      pagingEnabled
      showsVerticalScrollIndicator={false}
      onViewableItemsChanged={onViewableItemsChanged}
      viewabilityConfig={{ viewAreaCoveragePercentThreshold: 95 }}
      getItemLayout={(_, index) => ({
        length: height,
        offset: height * index,
        index,
      })}
    />
  );
}

const styles = StyleSheet.create({
  reelContainer: {
    height: height,
    width: width,
    backgroundColor: '#121212',
  },
  overlay: {
    position: 'absolute',
    bottom: 95,
    left: 25,
    right: 25,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  infoWrapper: {
    flex: 1,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 50,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#fff',
  },
  username: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  caption: {
    color: '#fff',
    fontSize: 15,
  },
  actions: {
    alignItems: 'center',
    marginBottom: 20,
  },
  iconButton: {
    alignItems: 'center',
    marginBottom: 18,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
  },
});
