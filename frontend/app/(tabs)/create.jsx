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
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";
import { router } from "expo-router";

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
      return await AsyncStorage.getItem("token");
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
      const imageUrl = await uploadToCloudinary(image);
      if (!imageUrl) {
        setUploading(false);
        return Alert.alert("Error", "Image upload failed.");
      }

      const token = await getToken();
      if (!token) {
        setUploading(false);
        return Alert.alert("Error", "User not authenticated.");
      }

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
      router.push(`/(screens)/${res.data.user}`);
    } catch (error) {
      console.error("Post error:", error);
      Alert.alert("Error", "Failed to create post.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Post</Text>

      <View style={styles.card}>
        <TextInput
          style={styles.input}
          placeholder="Write a caption..."
          placeholderTextColor="#aaa"
          value={caption}
          onChangeText={setCaption}
          multiline
        />

        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          <Ionicons name="image-outline" size={22} color="#ccc" />
          <Text style={styles.pickText}>
            {image ? "Change Image" : "Pick an Image"}
          </Text>
        </TouchableOpacity>

        {image ? (
          <Image source={{ uri: image.uri }} style={styles.imagePreview} />
        ) : (
          <View style={styles.placeholder}>
            <MaterialCommunityIcons
              name="image-off-outline"
              size={60}
              color="#555"
            />
            <Text style={{ color: "#777" }}>No Image Selected</Text>
          </View>
        )}

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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
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
    shadowColor: "#020507ff",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0,
    shadowRadius: 6,
    borderColor:'#5e5e60ff',
    borderWidth:2,
    elevation: 5,
  },
  postText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});
