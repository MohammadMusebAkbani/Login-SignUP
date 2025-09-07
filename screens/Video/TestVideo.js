import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Video } from 'expo-av';

const VIDEO_URL = "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

export default function TestVideo() {
  const [status, setStatus] = useState({});

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Video Component</Text>
      <View style={styles.videoContainer}>
        <Video
          style={styles.video}
          source={{ uri: VIDEO_URL }}
          useNativeControls
          resizeMode="contain"
          isLooping={false}
          onPlaybackStatusUpdate={setStatus}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  title: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    padding: 16,
  },
  videoContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
});
