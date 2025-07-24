import { Audio } from 'expo-av';

let currentSound = null;

export const playSound = async (url) => {
  try {
    if (currentSound) {
      await currentSound.unloadAsync();
      currentSound = null;
    }

    const { sound } = await Audio.Sound.createAsync({ uri: url });
    currentSound = sound;
    await sound.playAsync();
    return sound; // ✅ return sound so PostCard can control it
  } catch (error) {
    console.error("Sound play error:", error);
    return null;
  }
};

export const stopCurrentSound = async () => {
  try {
    if (currentSound) {
      await currentSound.unloadAsync();
      currentSound = null;
    } else {
      console.warn("Sound is not loaded yet");
    }
  } catch (error) {
    console.error("Error stopping sound:", error);
  }
};
