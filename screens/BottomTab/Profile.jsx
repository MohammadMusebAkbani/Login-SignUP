import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
// Redux imports
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from '../../store/authSlice';

const Profile = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();

  // Get user data from Redux instead of AsyncStorage
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );

  // Debug log to see what's in Redux
  console.log("Profile Redux State:", { user, isAuthenticated, isLoading });

  const handleLogout = async () => {
    Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await dispatch(logoutUser()).unwrap();
            navigation.navigate("Login");

            Toast.show({
              type: "success",
              text1: "Logged Out",
              text2: "You have been successfully logged out",
              visibilityTime: 2000,
            });

            // Navigation will be handled automatically by App.js
            // since isAuthenticated will become false
          } catch (error) {
            console.error("Logout error:", error);
            Toast.show({
              type: "error",
              text1: "Logout Failed",
              text2: error || "Failed to logout. Please try again.",
              visibilityTime: 3000,
            });
          }
        },
      },
    ]);
  };


  // Show loading screen while processing
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If no user data, show error (shouldn't happen with proper auth flow)
  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No user data found</Text>
        <Text style={styles.errorSubText}>
          There seems to be an issue with your session.
        </Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Refresh Session</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.organizationText}>{user.organization}</Text>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={styles.emailText}>{user.email}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.contentTitle}>Dashboard</Text>
        <Text style={styles.contentText}>
          You are successfully logged in as {user.name}
        </Text>
        <Text style={styles.contentText}>
          Organization: {user.organization}
        </Text>
        <Text style={styles.contentText}>User ID: {user.id}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 10,
  },
  header: {
    backgroundColor: "#007AFF",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  welcomeText: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 5,
  },
  organizationText: {
    fontSize: 18,
    color: "#fff",
    fontWeight: "600",
    marginBottom: 5,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  emailText: {
    fontSize: 14,
    color: "#e6f2ff",
  },
  content: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: "blue",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  contentText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 22,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
    marginTop: 50,
    fontWeight: "600",
  },
  errorSubText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
  },
  secondaryButton: {
    backgroundColor: "#f0f0f0",
    borderWidth: 1,
    borderColor: "#007AFF",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButtonText: {
    color: "#007AFF",
  },
  logoutButton: {
    backgroundColor: "#ff4444",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginTop: "auto",
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Profile;
