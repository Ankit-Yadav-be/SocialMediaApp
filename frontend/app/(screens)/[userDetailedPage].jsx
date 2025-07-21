import React from 'react';
import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UserDetailedPage() {
  const { userDetailedPage } = useLocalSearchParams();
  
  return (
    <SafeAreaView>
      <View>
        <Text>{userDetailedPage}</Text>
      </View>
    </SafeAreaView>
  );
}
