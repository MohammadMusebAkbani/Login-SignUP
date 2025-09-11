import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { Formik } from "formik";
import * as Yup from "yup";

import Icon from "react-native-vector-icons/MaterialIcons";

// Redux imports
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, updateUserProfile } from "../../store/authSlice";
import TextInputComponent from "../../components/common/TextInput";
import PrimaryButton from "../../components/common/PrimaryButton";
import { ScrollView } from "react-native-gesture-handler";

// Validation schema
const validationSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: Yup.string()
    .trim()
    .email("Please enter a valid email address")
    .required("Email is required"),
  organization: Yup.string()
    .trim()
    .required("Organization is required")
    .min(2, "Organization must be at least 2 characters"),
});

const Profile = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [imageLoading, setImageLoading] = useState(false);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const organizationRef = useRef(null);

  // Get user data from Redux
  const { user, isAuthenticated, isLoading } = useSelector(
    (state) => state.auth
  );

  // Initial form values
  const initialValues = {
    name: user?.name || "",
    email: user?.email || "",
    organization: user?.organization || "",
  };

  useEffect(() => {
    requestPermission();
  }, []);

  // Request camera/gallery permissions
  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant permission to access photos"
      );
    }
  };

  // Handle form submission
  // Handle form submission - CORRECTED
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setSubmitting(true);

      // Dispatch update profile action
      await dispatch(
        updateUserProfile({
          userId: Number(user.id),
          ...values,
          profileImage: user.profileImage, // Keep existing image
        })
      ).unwrap();

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Profile updated successfully!",
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      Toast.show({
        type: "error",
        text1: "Update Failed",
        text2: "Failed to update profile",
        visibilityTime: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Show image picker options
  const showImagePicker = () => {
    Alert.alert(
      "Select Profile Photo",
      "Choose from where you want to select a photo",
      [
        { text: "Camera", onPress: openCamera },
        { text: "Gallery", onPress: openGallery },
        { text: "Cancel", style: "cancel" },
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
      Alert.alert("Error", "Failed to open camera");
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
      Alert.alert("Error", "Failed to open gallery");
    }
  };

  // Upload profile image
  const uploadProfileImage = async (imageAsset) => {
    try {
      setImageLoading(true);

      // Convert image to base64
      const base64 = await FileSystem.readAsStringAsync(imageAsset.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const base64Image = `data:image/jpeg;base64,${base64}`;

      // Dispatch update profile action with image only
      await dispatch(
        updateUserProfile({
          userId: Number(user.id),
          profileImage: base64Image,
        })
      ).unwrap();

      Toast.show({
        type: "success",
        text1: "Success",
        text2: "Profile photo updated successfully!",
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
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

  // If no user data, show error
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
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 10}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize={true} // Reinitialize when user data changes
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
            resetForm,
            dirty,
          }) => (
            <>
              {/* Profile Image Section */}
              <View style={styles.profileImageSection}>
                <TouchableOpacity
                  onPress={showImagePicker}
                  style={styles.imageContainer}
                >
                  {imageLoading ? (
                    <View style={styles.imageLoadingContainer}>
                      <ActivityIndicator size="large" color="black" />
                    </View>
                  ) : user.profileImage ? (
                    <Image
                      source={{ uri: user.profileImage }}
                      style={styles.profileImage}
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Text style={styles.placeholderText}>Add Photo</Text>
                    </View>
                  )}

                  {/* Vector Icon in absolute position */}
                  <View style={styles.iconContainer}>
                    <Icon name="camera-alt" size={30} color="white" />
                  </View>
                </TouchableOpacity>
              </View>
              {/* Profile Information Form */}
              <View style={styles.formContainer}>
                {/* Name Field */}
                <View style={styles.inputContainer}>
                  <TextInputComponent
                    ref={nameRef}
                    label="Your Name"
                    labelStyle={{ fontWeight: "400", fontSize: 13 }}
                    placeholder="Enter your full name"
                    value={values.name}
                    onChangeText={handleChange("name")}
                    onBlur={handleBlur("name")}
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                  {touched.name && errors.name && (
                    <Text style={styles.errorText}>{errors.name}</Text>
                  )}
                </View>

                {/* Email Field */}
                <View style={styles.inputContainer}>
                  <TextInputComponent
                    ref={emailRef}
                    label="Email Address"
                    labelStyle={{ fontWeight: "400", fontSize: 13 }}
                    placeholder="Enter your email address"
                    value={values.email}
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    returnKeyType="next"
                    onSubmitEditing={() => organizationRef.current?.focus()}
                    blurOnSubmit={false}
                  />
                  {touched.email && errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}
                </View>

                {/* Organization Field */}
                <View style={styles.inputContainer}>
                  <TextInputComponent
                    ref={organizationRef}
                    label="Organization"
                    labelStyle={{ fontWeight: "400", fontSize: 13 }}
                    placeholder="Enter your organization"
                    value={values.organization}
                    onChangeText={handleChange("organization")}
                    onBlur={handleBlur("organization")}
                    returnKeyType="done"
                  />
                  {touched.organization && errors.organization && (
                    <Text style={styles.errorText}>{errors.organization}</Text>
                  )}
                </View>

                {/* Action Buttons */}
                <PrimaryButton
                  title="Save Changes"
                  titleStyle={{ color: "white", fontWeight: "bold" }}
                  disabled={!dirty || isSubmitting}
                  loading={isSubmitting}
                  onPress={handleSubmit} //  Use Formik's handleSubmit
                  style={{
                    backgroundColor: "darkblue",
                    padding: 10,
                    borderRadius: 5,
                    alignItems: "center",
                    marginTop: 10,
                    width: "100%",
                  }}
                />
              </View>
            </>
          )}
        </Formik>

        {/* Logout Button */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>

        {/* Small Loading Bar
        {isLoading && (
          <View style={styles.smallLoadingContainer}>
            <View style={styles.loadingBar}>
              <ActivityIndicator size="small" color="black" />
              <Text style={styles.loadingBarText}>Loading...</Text>
            </View>
          </View>
        )} */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImageSection: {
    alignItems: "center",
    marginVertical: 10,
  },
  imageContainer: {
    width: 250,
    height: 250,
    position: "relative",
    borderRadius: 140,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  iconContainer: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  profileImage: {
    width: 250,
    height: 250,
    borderRadius: 140,
  },
  placeholderImage: {
    height: 250,
    width: 250,
    borderRadius: 140,
    backgroundColor: "#e8e8e8",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "black",
  },
  placeholderText: {
    color: "black",
    fontSize: 16,
    fontWeight: "500",
  },
  imageLoadingContainer: {
    width: 250,
    height: 250,
    borderRadius: 140,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 12,
    color: "#FF3B30",
    marginLeft: 5,
  },
  logoutButton: {
    backgroundColor: "#FF3B30",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Full Screen Loading Overlay Styles

  smallLoadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingBar: {
    flexDirection: "row",
    height: 70,
    width: "85%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  loadingBarText: {
    marginLeft: 25,
    fontSize: 20,
    color: "black",
    fontWeight: "bold",
  },
});

export default Profile;
