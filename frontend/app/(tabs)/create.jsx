import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary"; // ✅ same as register

export default function CreatePostScreen() {
  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!granted) {
      Alert.alert("Permission Required", "Please allow access to media library.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage({ uri: result.assets[0].uri });
    }
  };

  const getToken = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      return token;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  };

  const handlePost = async () => {
    if (!caption || !image) {
      return Alert.alert("Error", "Caption and image are required.");
    }

    setUploading(true);

    try {
      // 1. Upload image to Cloudinary
      const imageUrl = await uploadToCloudinary(image);
      if (!imageUrl) {
        setUploading(false);
        return Alert.alert("Error", "Image upload failed.");
      }

      // 2. Get token from AsyncStorage
      const token = await getToken();
      if (!token) {
        setUploading(false);
        return Alert.alert("Error", "User not authenticated.");
      }

      // 3. Send post data to backend
      const payload = { caption, image: imageUrl };

      const res = await axios.post(
        "https://social-media-app-six-nu.vercel.app/api/posts",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Success", "Post created successfully!");
      setCaption("");
      setImage(null);
    } catch (error) {
      console.error("Post error:", error);
      Alert.alert("Error", "Failed to create post.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a New Post</Text>

      <TextInput
        style={styles.input}
        placeholder="Write a caption..."
        value={caption}
        onChangeText={setCaption}
        multiline
      />

      <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
        <Ionicons name="image" size={22} color="#444" />
        <Text style={styles.pickText}>
          {image ? "Change Image" : "Pick an Image"}
        </Text>
      </TouchableOpacity>

      {image && <Image source={{ uri: image.uri }} style={styles.imagePreview} />}

      <TouchableOpacity
        style={[styles.postButton, uploading && { backgroundColor: "#aaa" }]}
        onPress={handlePost}
        disabled={uploading}
      >
        {uploading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.postText}>Post</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#f4f4f4",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: "top",
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 16,
  },
  imagePicker: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e5e5e5",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  pickText: {
    fontSize: 16,
    marginLeft: 10,
    color: "#444",
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginBottom: 16,
  },
  postButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  postText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
