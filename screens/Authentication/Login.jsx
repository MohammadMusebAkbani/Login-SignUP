import {
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import React, { useState, useRef, forwardRef } from "react";
import TextInputComponent from "../../components/common/TextInput";
import LabelComponent from "../../components/common/Label";
import PrimaryButton from "../../components/common/PrimaryButton";
import SecondaryButton from "../../components/common/SecondaryButton";
import { useNavigation } from "@react-navigation/native";
import { authAPI } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Login = () => {
  const navigation = useNavigation();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if form is valid
  const isFormValid = email.trim() !== "" && password.trim() !== "";

  const handleLogin = async () => {
    setLoading(true);
    try {
      const result = await authAPI.login({ email, password });
      console.log("Login successful:", result);
      // Since your API returns the user object directly
      await AsyncStorage.setItem("userToken", result.token);
      await AsyncStorage.setItem(
        "userData",
        JSON.stringify({
          id: result.id,
          name: result.name,
          email: result.email,
          organization: result.organization,
          // Note: Don't store password in AsyncStorage for security
        })
      );
      // Simulate some processing time (optional)
      await new Promise((resolve) => setTimeout(resolve, 2000));
      // Navigate to the main app screen or dashboard
      navigation.navigate("HomeScreen");
    } catch (error) {
      console.error("Login error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.rootContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {/* Header Section with Image and Text */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/splash-icon.png")}
          style={{ width: 400, height: 150, resizeMode: "cover" }}
        />
        <LabelComponent style={{ fontWeight: "900", fontSize: 16 }}>
          Login to{" "}
          <LabelComponent
            style={{
              fontWeight: "900",
              fontSize: 18,
              color: "#6366f1",
              fontStyle: "italic",
            }}
          >
            TrackerOps
          </LabelComponent>
        </LabelComponent>

        <LabelComponent>Welcome Back</LabelComponent>
      </View>

      {/* Text Input Fields */}
      <View style={{ marginTop: 25, width: "100%" }}>
        <TextInputComponent
          ref={emailRef} // Attach ref
          label="Email-Id"
          labelStyle={{ fontWeight: "400", fontSize: 15 }}
          placeholder="akb@example.com"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          returnKeyType="next" // Show "Next" on keyboard
          onSubmitEditing={() => passwordRef.current.focus()} // Focus password input when "Next" is pressed
          blurOnSubmit={false}
        />
        <TextInputComponent
          ref={passwordRef} // Attach ref
          label="Password"
          labelStyle={{ fontWeight: "400", fontSize: 15 }}
          placeholder="********"
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
          returnKeyType="done"
        />
        {/* Forgot Password */}
        <PrimaryButton
          title="Forgot Password?"
          titleStyle={{ color: "#6366f1" }}
          style={{ alignSelf: "flex-end" }}
          onPress={() => {
            console.log("Forgot Password pressed!");
            // navigation.navigate("ForgotPassword");
          }}
        />
      </View>

      {/* Login Button Component (PrimaryButton) */}
      <PrimaryButton
        title="Login"
        titleStyle={{ color: "white", fontWeight: "bold" }}
        onPress={handleLogin}
        disabled={!isFormValid} // Disable work on true and isFormValid is false so we use ! to turn to false to true.
        loading={loading}
        style={{
          backgroundColor: "darkblue",
          padding: 10,
          borderRadius: 5,
          alignItems: "center",
          marginTop: 10,
          width: "100%",
        }}
      />

      {/* Or Container */}
      <View style={styles.OrContainer}>
        <View style={{ flex: 1, height: 1, backgroundColor: "#d1d5db" }} />
        <LabelComponent style={{ marginHorizontal: 10, color: "#6b7280" }}>
          Or
        </LabelComponent>
        <View style={{ flex: 1, height: 1, backgroundColor: "#d1d5db" }} />
      </View>

      {/* Google Login Button (SecondaryButton) */}
      <SecondaryButton
        title="Continue with Google"
        titleStyle={{ color: "#6366f1" }}
        onPress={() => console.log("Login with Google pressed")}
        image={require("../../assets/google.png")}
      />

      {/* Sign Up Link */}
      <View style={{ flexDirection: "row", marginTop: 20 }}>
        <LabelComponent>Don't have an account? </LabelComponent>
        <PrimaryButton
          title="Sign Up"
          titleStyle={{
            color: "#6366f1",
            textDecorationLine: "underline",
          }}
          onPress={() => {
            console.log("Sign Up pressed!");
            navigation.navigate("SignUp");
          }}
        />
      </View>
      {/* </View> */}
    </KeyboardAvoidingView>
  );
};

export default Login;

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  header: {
    justifyContent: "center",
    alignItems: "center",
  },
  OrContainer: {
    alignItems: "center",
    flexDirection: "row",
    marginTop: 10,
    marginHorizontal: 10,
  },
});
