import { View, Text } from 'react-native'
import React from 'react'
import UserProfileScreen from '../../component/home/UserPofile'
import SongUpload  from "../../component/SongUploadComponent"
const profile = () => {
  return (
    
      <View>
        <UserProfileScreen/>
      <SongUpload/>
      </View>
    
  )
}

export default profile