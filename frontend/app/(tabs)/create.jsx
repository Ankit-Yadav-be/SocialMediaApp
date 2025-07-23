import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker"; // ✅ install this
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";
import { uploadVideoToCloudinary } from "../../utils/uploadToCloudinary";
import { router } from "expo-router";

export default function CreatePostScreen() {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [video, setVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [musicList, setMusicList] = useState([]);
  const [selectedMusic, setSelectedMusic] = useState("");

  useEffect(() => {
    fetchMusic();
  }, []);

  const fetchMusic = async () => {
    try {
      const res = await axios.get("https://social-media-app-six-nu.vercel.app/api/music");
      setMusicList(res.data); // assume it's an array of { _id, title }
    } catch (err) {
      console.error("Music fetch error:", err.message);
      setMusicList([]);
    }
  };

  const pickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return Alert.alert("Permission Required", "Allow access to media library.");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage({ uri: result.assets[0].uri });
      setVideo(null);
    }
  };

  const pickVideo = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) return Alert.alert("Permission Required", "Allow access to media library.");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      quality: 1,
    });

    if (!result.canceled) {
      setVideo({ uri: result.assets[0].uri });
      setImage(null);
    }
  };

  const getToken = async () => {
    try {
      return await AsyncStorage.getItem("token");
    } catch (error) {
      console.error("Token error:", error);
      return null;
    }
  };

  const handlePost = async () => {
    if (!caption || !image) {
      return Alert.alert("Error", "Caption and image are required.");
    }

    setUploading(true);

    try {
      const imageUrl = await uploadToCloudinary(image);
      if (!imageUrl) throw new Error("Image upload failed");

      const token = await getToken();
      if (!token) throw new Error("User not authenticated");

      const payload = {
        caption,
        image: imageUrl,
        music: selectedMusic || null, // can be null
      };

      const res = await axios.post(
        "https://social-media-app-six-nu.vercel.app/api/posts",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success", "Post created!");
      setCaption("");
      setImage(null);
      setSelectedMusic("");
      router.push(`/(screens)/${res.data.user}`);
    } catch (error) {
      console.error("Post error:", error);
      Alert.alert("Error", error.message || "Failed to create post.");
    } finally {
      setUploading(false);
    }
  };

  const handleReel = async () => {
    if (!caption || !video) return Alert.alert("Error", "Caption and video are required.");
    setUploading(true);

    try {
      const videoUrl = await uploadVideoToCloudinary(video.uri);
      if (!videoUrl) throw new Error("Video upload failed");

      const token = await getToken();
      if (!token) throw new Error("User not authenticated");

      const payload = { caption, video: videoUrl };

      const res = await axios.post(
        "https://social-media-app-six-nu.vercel.app/api/reels",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert("Success", "Reel uploaded!");
      setCaption("");
      setVideo(null);
      router.push(`/(screens)/${res.data.user}`);
    } catch (error) {
      console.error("Reel error:", error);
      Alert.alert("Error", error.message || "Failed to upload reel.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Post / Upload Reel</Text>
      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Write a caption..."
          placeholderTextColor="#aaa"
          value={caption}
          onChangeText={setCaption}
          multiline
        />

        {/* Music Dropdown */}
        <Picker
          selectedValue={selectedMusic}
          onValueChange={(itemValue) => setSelectedMusic(itemValue)}
          style={{ backgroundColor: "#2c2c2e", color: "#fff", marginBottom: 16 }}
          dropdownIconColor="#ccc"
        >
          <Picker.Item label="🎵 Select Music (optional)" value="" />
          {musicList.map((track) => (
            <Picker.Item key={track._id} label={track.title} value={track._id} />
          ))}
        </Picker>

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          <Ionicons name="image-outline" size={22} color="#ccc" />
          <Text style={styles.pickText}>
            {image ? "Change Image" : "Pick an Image"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.imagePicker} onPress={pickVideo}>
          <Ionicons name="videocam-outline" size={22} color="#ccc" />
          <Text style={styles.pickText}>
            {video ? "Change Video" : "Pick a Video"}
          </Text>
        </TouchableOpacity>

        {image ? (
          <Image source={{ uri: image.uri }} style={styles.imagePreview} />
        ) : video ? (
          <View style={styles.placeholder}>
            <MaterialCommunityIcons name="video-outline" size={60} color="#555" />
            <Text style={{ color: "#777" }}>Video selected</Text>
          </View>
        ) : (
          <View style={styles.placeholder}>
            <MaterialCommunityIcons name="image-off-outline" size={60} color="#555" />
            <Text style={{ color: "#777" }}>No Media Selected</Text>
          </View>
        )}

        {image && (
          <TouchableOpacity
            style={[styles.postButton, uploading && { backgroundColor: "#444" }]}
            onPress={handlePost}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.postText}>Post</Text>
            )}
          </TouchableOpacity>
        )}

        {video && (
          <TouchableOpacity
            style={[styles.postButton, uploading && { backgroundColor: "#444", marginTop: 10 }]}
            onPress={handleReel}
            disabled={uploading}
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.postText}>Upload Video for Reel</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 50 : 60,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#1e1e1e",
    borderRadius: 16,
    padding: 20,
  },
  input: {
    backgroundColor: "#2b2b2b",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
    borderColor: "#333",
    borderWidth: 1,
    color: "#fff",
    marginBottom: 16,
  },
  imagePicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2c2c2e",
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  pickText: {
    fontSize: 16,
    marginLeft: 10,
    color: "#ccc",
  },
  imagePreview: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginBottom: 16,
  },
  placeholder: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    borderColor: "#333",
    borderWidth: 1,
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  postButton: {
    backgroundColor: "#2c2c2e",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    borderColor: "#5e5e60ff",
    borderWidth: 2,
  },
  postText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
