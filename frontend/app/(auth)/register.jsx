// app/screens/RegisterScreen.jsx
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import React, { useState, useContext } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { uploadToCloudinary } from '../../utils/uploadToCloudinary';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../context/authContext'; // 🟡 Make sure this path is correct

export default function RegisterScreen() {
  const [form, setForm] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    bio: '',
  });
  const [image, setImage] = useState(null);
  const router = useRouter();
  const { login } = useContext(AuthContext); // ✅ Use context to auto-login

  const pickImage = async () => {
    console.log('Opening image picker...');
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ Updated (deprecated warning fix)
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        const selectedImageUri = result.assets[0].uri;
        console.log('Image selected:', selectedImageUri);
        setImage({ uri: selectedImageUri });
      } else {
        console.log('Image selection canceled.');
      }
    } catch (error) {
      console.log('Error picking image:', error);
    }
  };

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleRegister = async () => {
    if (!form.email || !form.password || !form.name || !form.username) {
      return Alert.alert('Error', 'Please fill all required fields');
    }

    let profilePic = '';

    if (image) {
      console.log('Uploading image to Cloudinary...');
      profilePic = await uploadToCloudinary(image);
      console.log('Cloudinary upload result:', profilePic);

      if (!profilePic) {
        return Alert.alert('Error', 'Image upload failed');
      }
    }

    try {
      const payload = { ...form, profilePic };
      console.log('Sending registration data:', payload);

      const res = await axios.post(
        'https://social-media-app-six-nu.vercel.app/api/auth/register',
        payload
      );

      console.log('Registration success:', res.data);

      if (res.data.token) {
        await login(res.data.user, res.data.token); // ✅ Set user and token in context + storage
        Alert.alert('Success', 'Registered Successfully');
        router.replace('/login');
      }
    } catch (error) {
      console.log('Registration error:', error.response?.data || error.message);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Registration Failed'
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        style={styles.input}
        placeholder="Name"
        onChangeText={(val) => handleChange('name', val)}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        onChangeText={(val) => handleChange('username', val)}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        onChangeText={(val) => handleChange('email', val)}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        onChangeText={(val) => handleChange('password', val)}
      />
      <TextInput
        style={styles.input}
        placeholder="Bio"
        onChangeText={(val) => handleChange('bio', val)}
      />

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        <Text style={{ color: '#fff' }}>
          {image ? 'Change Profile Picture' : 'Pick Profile Picture'}
        </Text>
      </TouchableOpacity>
      {image && <Image source={{ uri: image.uri }} style={styles.image} />}

      <TouchableOpacity onPress={handleRegister} style={styles.button}>
        <Text style={{ color: '#fff' }}>Register</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginVertical: 8,
    borderRadius: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  imagePicker: {
    backgroundColor: '#555',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 10,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
  },
});
