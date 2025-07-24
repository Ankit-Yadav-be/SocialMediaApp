import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Dimensions,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  ScrollView,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import {
  uploadToCloudinary,
  uploadVideoToCloudinary,
} from "../../utils/uploadToCloudinary";

const windowWidth = Dimensions.get("window").width;

const StatusScreen = () => {
  const [stories, setStories] = useState([]);
  const [musicList, setMusicList] = useState([]);
  const [createModal, setCreateModal] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState(null);
  const [preview, setPreview] = useState(null);
  const [fileType, setFileType] = useState("image");
  const [caption, setCaption] = useState("");

  const openCreateModal = () => setCreateModal(true);
  const closeModal = () => {
    setCreateModal(false);
    setPreview(null);
    setCaption("");
    setSelectedMusic(null);
  };

  const fetchStories = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get("https://social-media-app-six-nu.vercel.app/api/story",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setStories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMusic = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get("https://social-media-app-six-nu.vercel.app/api/music",
         {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setMusicList(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStories();
    fetchMusic();
  }, []);

  const pickMedia = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      setPreview(asset.uri);
      setFileType(asset.type || "image");
    }
  };

 const submitStory = async () => {
  try {
    if (!preview) return Alert.alert("Select image or video first");

    let uploadedUrl;
    if (fileType === "image") {
      uploadedUrl = await uploadToCloudinary({ uri: preview });
    } else {
      uploadedUrl = await uploadVideoToCloudinary(preview);
    }

    if (!uploadedUrl) return Alert.alert("Upload failed", "Try again");

    const token = await AsyncStorage.getItem("token");
    const res = await axios.post(
      "https://social-media-app-six-nu.vercel.app/api/story",
      {
        media: uploadedUrl,
        mediaType: fileType, // either 'image' or 'video'
        caption,
        musicId: selectedMusic,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setStories([res.data.story, ...stories]);
    closeModal();
  } catch (err) {
    console.error("Story Submit Error:", err);
    Alert.alert("Error", "Something went wrong while submitting your story.");
  }
};

  const renderItem = ({ item }) => (
    <View style={styles.storyCard}>
      <Image source={{ uri: item.video }} style={styles.image} />
      <Text style={styles.caption}>{item.caption}</Text>
      <Text style={styles.song}>{item.music ? item.music.title : "No Song"}</Text>
      <Text style={styles.date}>{moment(item.createdAt).fromNow()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={stories}
        keyExtractor={(item) => item._id}
        numColumns={2}
        ListHeaderComponent={() => (
          <TouchableOpacity onPress={openCreateModal} style={styles.newStoryCard}>
            <Ionicons name="add" size={40} color="#fff" />
            <Text style={styles.newStoryText}>Add Story</Text>
          </TouchableOpacity>
        )}
        renderItem={renderItem}
      />

      <Modal visible={createModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Create Story</Text>
            <Picker selectedValue={selectedMusic} onValueChange={setSelectedMusic}>
              <Picker.Item label="No music" value={null} />
              {musicList.map((m) => (
                <Picker.Item key={m._id} label={m.title} value={m._id} />
              ))}
            </Picker>
            <Button title="Pick Image/Video" onPress={pickMedia} />
            {preview && <Image source={{ uri: preview }} style={styles.preview} />}
            <TextInput
              placeholder="Caption..."
              value={caption}
              onChangeText={setCaption}
              style={styles.captionInput}
            />
            <Button title="Submit" onPress={submitStory} />
            <Button title="Cancel" onPress={closeModal} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  newStoryCard: {
    width: windowWidth / 2 - 20,
    height: 180,
    backgroundColor: "#888",
    margin: 5,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  newStoryText: { color: "#fff", marginTop: 10 },
  storyCard: {
    width: windowWidth / 2 - 20,
    height: 180,
    backgroundColor: "#eee",
    margin: 5,
    borderRadius: 15,
    overflow: "hidden",
  },
  image: { width: "100%", height: 100 },
  caption: { padding: 5, fontWeight: "bold" },
  song: { paddingLeft: 5, fontStyle: "italic", color: "#666" },
  date: { paddingLeft: 5, fontSize: 12, color: "#999" },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  modalCard: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 15,
    borderRadius: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  preview: { width: "100%", height: 150, marginTop: 10 },
  captionInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginVertical: 10,
    padding: 8,
    borderRadius: 5,
  },
});

export default StatusScreen;