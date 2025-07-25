import { Audio } from 'expo-av';

let currentSound = null;

let isSoundLoading = false;

export const playSound = async (url) => {
  try {
    if (isSoundLoading) return;

    isSoundLoading = true;

    if (currentSound) {
      await currentSound.unloadAsync();
      currentSound = null;
    }

    const { sound } = await Audio.Sound.createAsync({ uri: url });
    currentSound = sound;
    await sound.playAsync();

    isSoundLoading = false;
    return sound;
  } catch (error) {
    isSoundLoading = false;
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
