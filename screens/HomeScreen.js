import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';


const HomeScreen = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  // Load user data when component mounts
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log('User loaded:', parsedUser);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      await AsyncStorage.removeItem('userData');
      navigation.replace('Login'); // Navigate back to login
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.welcomeText}>{user.organization}</Text>
        {user && (
          <Text style={styles.userName}>{user.name}</Text>
          
        )}
        <Text style={styles.emailText}>{user?.email}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.contentTitle}>Dashboard</Text>
        <Text style={styles.contentText}>
          You are successfully logged in as {user?.name}
        </Text>
      </View>

      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
      >
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 5,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  emailText: {
    fontSize: 14,
    color: '#e6f2ff',
  },
  content: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  contentText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  logoutButton: {
    backgroundColor: '#ff4444',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 'auto',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default HomeScreen;