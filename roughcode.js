// import React, { useState, useEffect } from "react";
// import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import { useNavigation } from "@react-navigation/native";
// import Toast from "react-native-toast-message";
// // Redux imports
// import { useDispatch, useSelector } from "react-redux";
// import { logoutUser } from '../../store/authSlice';

// const Profile = () => {
//   const navigation = useNavigation();
//   const dispatch = useDispatch();

//   // Get user data from Redux instead of AsyncStorage
//   const { user, isAuthenticated, isLoading } = useSelector(
//     (state) => state.auth
//   );

//   // Debug log to see what's in Redux
//   console.log("Profile Redux State:", { user, isAuthenticated, isLoading });

//   const handleLogout = async () => {
//     Alert.alert("Confirm Logout", "Are you sure you want to logout?", [
//       {
//         text: "Cancel",
//         style: "cancel",
//       },
//       {
//         text: "Logout",
//         style: "destructive",
//         onPress: async () => {
//           try {
//             await dispatch(logoutUser()).unwrap();
//             navigation.navigate("Login");

//             Toast.show({
//               type: "success",
//               text1: "Logged Out",
//               text2: "You have been successfully logged out",
//               visibilityTime: 2000,
//             });

//             // Navigation will be handled automatically by App.js
//             // since isAuthenticated will become false
//           } catch (error) {
//             console.error("Logout error:", error);
//             Toast.show({
//               type: "error",
//               text1: "Logout Failed",
//               text2: error || "Failed to logout. Please try again.",
//               visibilityTime: 3000,
//             });
//           }
//         },
//       },
//     ]);
//   };


//   // Show loading screen while processing
//   if (isLoading) {
//     return (
//       <View style={styles.loadingContainer}>
//         <Text style={styles.loadingText}>Loading...</Text>
//       </View>
//     );
//   }

//   // If no user data, show error (shouldn't happen with proper auth flow)
//   if (!user) {
//     return (
//       <View style={styles.container}>
//         <Text style={styles.errorText}>No user data found</Text>
//         <Text style={styles.errorSubText}>
//           There seems to be an issue with your session.
//         </Text>
//         <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//           <Text style={styles.logoutButtonText}>Refresh Session</Text>
//         </TouchableOpacity>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       <View style={styles.header}>
//         <Text style={styles.welcomeText}>Welcome back!</Text>
//         <Text style={styles.organizationText}>{user.organization}</Text>
//         <Text style={styles.userName}>{user.name}</Text>
//         <Text style={styles.emailText}>{user.email}</Text>
//       </View>

//       <View style={styles.content}>
//         <Text style={styles.contentTitle}>Dashboard</Text>
//         <Text style={styles.contentText}>
//           You are successfully logged in as {user.name}
//         </Text>
//         <Text style={styles.contentText}>
//           Organization: {user.organization}
//         </Text>
//         <Text style={styles.contentText}>User ID: {user.id}</Text>
//       </View>

//       <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
//         <Text style={styles.logoutButtonText}>Logout</Text>
//       </TouchableOpacity>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: "#f5f5f5",
//     padding: 20,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: "center",
//     alignItems: "center",
//     backgroundColor: "#f5f5f5",
//   },
//   loadingText: {
//     fontSize: 16,
//     color: "#666",
//     marginTop: 10,
//   },
//   header: {
//     backgroundColor: "#007AFF",
//     borderRadius: 10,
//     padding: 20,
//     marginBottom: 20,
//     alignItems: "center",
//   },
//   welcomeText: {
//     fontSize: 16,
//     color: "#fff",
//     marginBottom: 5,
//   },
//   organizationText: {
//     fontSize: 18,
//     color: "#fff",
//     fontWeight: "600",
//     marginBottom: 5,
//   },
//   userName: {
//     fontSize: 24,
//     fontWeight: "bold",
//     color: "#fff",
//     marginBottom: 5,
//   },
//   emailText: {
//     fontSize: 14,
//     color: "#e6f2ff",
//   },
//   content: {
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     padding: 20,
//     marginBottom: 20,
//     shadowColor: "blue",
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 3.84,
//     elevation: 5,
//   },
//   contentTitle: {
//     fontSize: 20,
//     fontWeight: "bold",
//     marginBottom: 15,
//     color: "#333",
//   },
//   contentText: {
//     fontSize: 16,
//     color: "#666",
//     lineHeight: 22,
//     marginBottom: 8,
//   },
//   errorText: {
//     fontSize: 18,
//     color: "red",
//     textAlign: "center",
//     marginTop: 50,
//     fontWeight: "600",
//   },
//   errorSubText: {
//     fontSize: 14,
//     color: "#666",
//     textAlign: "center",
//     marginTop: 10,
//     marginBottom: 30,
//   },
//   actionContainer: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     marginBottom: 20,
//     gap: 10,
//   },
//   actionButton: {
//     flex: 1,
//     backgroundColor: "#007AFF",
//     borderRadius: 8,
//     padding: 15,
//     alignItems: "center",
//   },
//   secondaryButton: {
//     backgroundColor: "#f0f0f0",
//     borderWidth: 1,
//     borderColor: "#007AFF",
//   },
//   actionButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "600",
//   },
//   secondaryButtonText: {
//     color: "#007AFF",
//   },
//   logoutButton: {
//     backgroundColor: "#ff4444",
//     borderRadius: 8,
//     padding: 15,
//     alignItems: "center",
//     marginTop: "auto",
//   },
//   logoutButtonText: {
//     color: "#fff",
//     fontSize: 16,
//     fontWeight: "bold",
//   },
// });

// export default Profile;
import React, { useState, useEffect } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Image, 
  ActivityIndicator,
  Animated,
  TextInput,
  ScrollView
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

// Redux imports
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, updateUserProfile } from '../../store/authSlice';

const Profile = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [imageLoading, setImageLoading] = useState(false);
  const [uploadProgress] = useState(new Animated.Value(0));
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    organization: ''
  });

  // Get user data from Redux instead of AsyncStorage
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );

  useEffect(() => {
    requestPermission();
    // Initialize profile data when user data is available
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        organization: user.organization || ''
      });
    }
  }, [user]);

  // Request camera/gallery permissions
  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please grant permission to access photos');
    }
  };

  // Animate progress bar
  const animateProgress = () => {
    uploadProgress.setValue(0);
    Animated.timing(uploadProgress, {
      toValue: 1,
      duration: 5000, // 2 seconds
      useNativeDriver: false,
    }).start();
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save profile changes
  const saveProfile = async () => {
    try {
      setImageLoading(true);
      animateProgress();

      // Validate required fields
      if (!profileData.name.trim() || !profileData.email.trim() || !profileData.organization.trim()) {
        Toast.show({
          type: "error",
          text1: "Validation Error",
          text2: "All fields are required",
          visibilityTime: 3000,
        });
        setImageLoading(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(profileData.email)) {
        Toast.show({
          type: "error",
          text1: "Invalid Email",
          text2: "Please enter a valid email address",
          visibilityTime: 3000,
        });
        setImageLoading(false);
        return;
      }

      // Dispatch update profile action
      await dispatch(updateUserProfile({ 
        userId: user.id, 
        ...profileData,
        profileImage: user.profileImage // Keep existing image
      })).unwrap();

      setIsEditing(false);
      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Profile updated successfully!",
        visibilityTime: 2000,
      });

    } catch (error) {
      console.error('Error updating profile:', error);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "Failed to update profile",
        visibilityTime: 3000,
      });
    } finally {
      setImageLoading(false);
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setProfileData({
      name: user.name || '',
      email: user.email || '',
      organization: user.organization || ''
    });
    setIsEditing(false);
  };

  // Show image picker options
  const showImagePicker = () => {
    Alert.alert(
      'Select Profile Photo',
      'Choose from where you want to select a photo',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  // Open camera
  const openCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        uploadProfileImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open camera');
    }
  };

  // Open gallery
  const openGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        uploadProfileImage(result.assets[0]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to open gallery');
    }
  };

  // Upload profile image
  const uploadProfileImage = async (imageAsset) => {
    setImageLoading(true);
    animateProgress(); // Start progress animation
    
    try {
      // Convert image to base64
      const base64 = await FileSystem.readAsStringAsync(imageAsset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      const base64Image = `data:image/jpeg;base64,${base64}`;

      // Dispatch update profile action with image only
      await dispatch(updateUserProfile({ 
        userId: user.id, 
        profileImage: base64Image 
      })).unwrap();

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Profile photo updated successfully!",
        visibilityTime: 2000,
      });

    } catch (error) {
      console.error('Error uploading image:', error);
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2: "Failed to update profile photo",
        visibilityTime: 3000,
      });
    } finally {
      setImageLoading(false);
    }
  };

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

  // Show loading overlay on top of profile content instead of replacing it

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

  const progressWidth = uploadProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <ScrollView style={styles.container}>
      {/* Loading Bar - Only shows when uploading/updating */}
      {imageLoading && (
        <View style={styles.loadingBarContainer}>
          <Text style={styles.loadingBarText}>
            {isEditing ? 'Updating profile...' : 'Uploading photo...'}
          </Text>
          <View style={styles.progressBarBackground}>
            <Animated.View 
              style={[styles.progressBarFill, { width: progressWidth }]}
            />
          </View>
        </View>
      )}

      {/* Profile Image Section */}
      <View style={styles.profileImageSection}>
        <TouchableOpacity onPress={showImagePicker} style={styles.imageContainer}>
          {user.profileImage ? (
            <Image source={{ uri: user.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>Add Photo</Text>
            </View>
          )}
          {imageLoading && !isEditing && (
            <View style={styles.imageLoadingOverlay}>
              <ActivityIndicator size="small" color="#007AFF" />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={showImagePicker} style={styles.changePhotoButton}>
          <Text style={styles.changePhotoText}>
            {user.profileImage ? 'Change Photo' : 'Add Photo'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Profile Information */}
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        
        {isEditing ? (
          <View style={styles.editContainer}>
            <Text style={styles.inputLabel}>Organization</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.organization}
              onChangeText={(value) => handleInputChange('organization', value)}
              placeholder="Enter organization"
              placeholderTextColor="#999"
            />
            
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              placeholder="Enter your name"
              placeholderTextColor="#999"
            />
            
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.textInput}
              value={profileData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              placeholder="Enter your email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        ) : (
          <>
            <Text style={styles.organizationText}>{user.organization || 'Loading...'}</Text>
            <Text style={styles.userName}>{user.name || 'Loading...'}</Text>
            <Text style={styles.emailText}>{user.email || 'Loading...'}</Text>
          </>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        {isEditing ? (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, styles.saveButton]} 
              onPress={saveProfile}
              disabled={imageLoading}
            >
              <Text style={styles.actionButtonText}>Save Changes</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, styles.cancelButton]} 
              onPress={cancelEdit}
              disabled={imageLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => setIsEditing(true)}
          >
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Dashboard Content */}
      <View style={styles.content}>
        <Text style={styles.contentTitle}>Dashboard</Text>
        <Text style={styles.contentText}>
          You are successfully logged in as {user.name || 'Loading...'}
        </Text>
        <Text style={styles.contentText}>
          Organization: {user.organization || 'Loading...'}
        </Text>
        <Text style={styles.contentText}>User ID: {user.id || 'Loading...'}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>

      {/* Full Screen Loading Overlay - Shows over the profile content */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingOverlayText}>Loading...</Text>
          </View>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  // Full Screen Loading Overlay Styles
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent dark background
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000, // Ensure it's on top
  },
  loadingContent: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  loadingOverlayText: {
    fontSize: 16,
    color: "#333",
    marginTop: 15,
    fontWeight: '500',
  },
  // Loading Bar Styles
  loadingBarContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  loadingBarText: {
    fontSize: 14,
    color: "#007AFF",
    marginBottom: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 3,
  },
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dotted',
  },
  placeholderText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  imageLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  changePhotoButton: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#007AFF',
    borderRadius: 20,
  },
  changePhotoText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
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
    marginBottom: 15,
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
  // Edit Mode Styles
  editContainer: {
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    color: "#fff",
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  // Action Buttons
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
  saveButton: {
    backgroundColor: "#28a745",
  },
  cancelButton: {
    backgroundColor: "#6c757d",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  cancelButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
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
  logoutButton: {
    backgroundColor: "#ff4444",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Profile;