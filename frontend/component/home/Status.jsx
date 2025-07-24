import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const dummyStatuses = [
  {
    id: '1',
    username: 'ankit_yadav',
    profilePic: 'https://i.pravatar.cc/300?img=12',
    song: 'Stay - The Kid LAROI, Justin Bieber',
    time: '2 hours ago',
    viewers: [
      { id: 'v1', name: 'Rahul', avatar: 'https://i.pravatar.cc/300?img=11' },
      { id: 'v2', name: 'Priya', avatar: 'https://i.pravatar.cc/300?img=22' },
    ],
    likes: [
      { id: 'l1', name: 'Ravi', avatar: 'https://i.pravatar.cc/300?img=24' },
    ],
    comments: [
      {
        id: 'c1',
        name: 'Kajal',
        avatar: 'https://i.pravatar.cc/300?img=26',
        text: 'Awesome vibe!',
      },
    ],
  },
  {
    id: '2',
    username: 'dark_knight',
    profilePic: 'https://i.pravatar.cc/300?img=20',
    song: 'Unstoppable - Sia',
    time: 'Just now',
    viewers: [],
    likes: [],
    comments: [],
  },
];

export default function Status() {
  const [selectedStory, setSelectedStory] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('viewers');

  const openModal = (story) => {
    setSelectedStory(story);
    setActiveTab('viewers');
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedStory(null);
  };

  const renderUserRow = (user) => (
    <View key={user.id} style={styles.viewerRow}>
      <Image source={{ uri: user.avatar }} style={styles.viewerAvatar} />
      <Text style={styles.viewerName}>{user.name}</Text>
    </View>
  );

 const renderCommentRow = (comment) => (
  <View key={comment.id} style={styles.viewerRow}>
    <Image source={{ uri: comment.avatar }} style={styles.viewerAvatar} />
    <View>
      <Text style={[styles.viewerName, { fontWeight: '600', fontSize: 15 }]}>
        {comment.name}
      </Text>
      <Text style={styles.commentText}>“{comment.text}”</Text>
    </View>
  </View>
);


  return (
    <View style={styles.container}>
      <Text style={styles.header}>Stories</Text>

      <FlatList
        data={dummyStatuses}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => openModal(item)} style={styles.storyCard}>
            <Image source={{ uri: item.profilePic }} style={styles.bigAvatar} />
            <View style={styles.overlay} />
            <View style={styles.details}>
              <Text style={styles.username}>{item.username}</Text>
              <View style={styles.songRow}>
                <FontAwesome5 name="music" size={14} color="#ccc" />
                <Text style={styles.song}>{item.song}</Text>
              </View>
              <Text style={styles.time}>{item.time}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={closeModal}>
  <View style={styles.modalContainer}>
    <View style={styles.modalCard}>
      <LinearGradient colors={['rgba(31,31,31,0.8)', 'rgba(0,0,0,0.95)']} style={styles.modalHeaderGradient}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            <Text style={{ color: '#a78bfa' }}>{selectedStory?.username}</Text>
            <Text style={{ color: '#fff' }}>’s Story</Text>
          </Text>
          <TouchableOpacity onPress={closeModal} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.tabBar}>
        {['viewers', 'likes', 'comments'].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tabButton,
              activeTab === tab && styles.activeTabButton,
            ]}
            onPress={() => setActiveTab(tab)}
          >
            <Ionicons
              name={
                tab === 'viewers' ? 'eye' : tab === 'likes' ? 'heart' : 'chatbubble'
              }
              size={16}
              color="#fff"
              style={{ marginBottom: 4 }}
            />
            <Text style={styles.tabText}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scrollArea}>
        {activeTab === 'viewers' &&
          (selectedStory?.viewers.length > 0 ? (
            selectedStory.viewers.map(renderUserRow)
          ) : (
            <Text style={styles.noViewer}>No viewers yet 👀</Text>
          ))}
        {activeTab === 'likes' &&
          (selectedStory?.likes.length > 0 ? (
            selectedStory.likes.map(renderUserRow)
          ) : (
            <Text style={styles.noViewer}>No likes yet ❤️</Text>
          ))}
        {activeTab === 'comments' &&
          (selectedStory?.comments.length > 0 ? (
            selectedStory.comments.map(renderCommentRow)
          ) : (
            <Text style={styles.noViewer}>No comments yet 💬</Text>
          ))}
      </ScrollView>
    </View>
  </View>
</Modal>

    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#111',
    paddingVertical: 20,
  },
  header: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  storyCard: {
    width: width * 0.6,
    height: 300,
    backgroundColor: '#1f1f1f',
    borderRadius: 20,
    marginRight: 16,
    overflow: 'hidden',
    shadowColor: '#6b21a8',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  bigAvatar: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  details: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
  },
  username: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  song: {
    color: '#ccc',
    fontSize: 13,
    marginLeft: 6,
  },
  time: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: width * 0.9,
    backgroundColor: '#1a1a1a',
    borderRadius: 18,
    overflow: 'hidden',
    paddingBottom: 10,
    maxHeight: '80%',
  },
  modalHeaderGradient: {
    padding: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 12,
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#2d2d2d',
  },
  activeTabButton: {
    backgroundColor: '#9333ea',
  },
  tabText: {
    color: '#fff',
    fontWeight: '600',
  },
  viewerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    paddingHorizontal: 14,
  },
  viewerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  viewerName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  commentText: {
    color: '#ccc',
    fontSize: 14,
    marginTop: 2,
  },
  noViewer: {
    color: '#888',
    textAlign: 'center',
    marginTop: 30,
    fontSize: 15,
  },
  scrollArea: {
    paddingBottom: 20,
  },
  modalContainer: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.85)',
  justifyContent: 'flex-end',
},

modalCard: {
  backgroundColor: '#1e1e1f',
  borderTopLeftRadius: 26,
  borderTopRightRadius: 26,
  overflow: 'hidden',
  maxHeight: '82%',
  width: '100%',
  shadowColor: '#000',
  shadowOpacity: 0.25,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: -2 },
},

modalHeaderGradient: {
  paddingTop: 18,
  paddingHorizontal: 20,
  paddingBottom: 12,
  borderTopLeftRadius: 26,
  borderTopRightRadius: 26,
},

modalHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
},

modalTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#fff',
},

closeBtn: {
  backgroundColor: 'rgba(255,255,255,0.1)',
  borderRadius: 20,
  padding: 6,
},

tabBar: {
  flexDirection: 'row',
  justifyContent: 'space-around',
  paddingVertical: 10,
  borderTopWidth: 1,
  borderTopColor: '#2f2f2f',
  borderBottomWidth: 1,
  borderBottomColor: '#2f2f2f',
  backgroundColor: '#181818',
},

tabButton: {
  alignItems: 'center',
  flex: 1,
  paddingVertical: 10,
  marginHorizontal: 6,
  borderRadius: 14,
  backgroundColor: '#2b2b2b',
},

activeTabButton: {
  backgroundColor: '#7c3aed',
  shadowColor: '#7c3aed',
  shadowOpacity: 0.35,
  shadowRadius: 6,
},

tabText: {
  color: '#fff',
  fontSize: 12,
  fontWeight: '600',
},

noViewer: {
  textAlign: 'center',
  color: '#999',
  fontSize: 15,
  paddingVertical: 40,
  fontStyle: 'italic',
},

});
