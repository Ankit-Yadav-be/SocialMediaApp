import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { uploadAudioToCloudinary } from '../utils/uploadToCloudinary';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';


const AudioUploadScreen = () => {
  const [audio, setAudio] = useState(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
      });

      if (result.type === 'success') {
        setAudio(result);
      }
    } catch (error) {
      console.log('❌ Audio Picker Error:', error);
    }
  };

  const handleUpload = async () => {
    if (!title || !audio) {
      return Alert.alert('Error', 'Please provide both title and audio file');
    }

    if (!user?.isAdmin) {
      return Alert.alert('Unauthorized', 'Only admins can upload audio');
    }

    setLoading(true);
    try {
         const token = await AsyncStorage.getItem('token');
      const audioUrl = await uploadAudioToCloudinary(audio);
      if (!audioUrl) throw new Error('Upload to Cloudinary failed');

      const res = await axios.post(
        'https://social-media-app-six-nu.vercel.app/api/api/music/upload',
        { title, url: audioUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('✅ Success', 'Audio uploaded successfully!');
      setTitle('');
      setAudio(null);
    } catch (err) {
      console.log('❌ Upload Error:', err);
      Alert.alert('Error', 'Failed to upload audio');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Upload Music</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter title"
        value={title}
        onChangeText={setTitle}
      />

      <TouchableOpacity style={styles.button} onPress={pickAudio}>
        <Text style={styles.buttonText}>
          {audio ? '🎵 Audio Selected' : '🎵 Pick Audio File'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: 'green' }]}
        onPress={handleUpload}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>⬆️ Upload</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default AudioUploadScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fafafa',
    justifyContent: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 15,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
