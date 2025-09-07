import {
  StyleSheet,
  Image,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useRef, useState } from "react";
import LabelComponent from "../../components/common/Label";
import TextInputComponent from "../../components/common/TextInput";
import PrimaryButton from "../../components/common/PrimaryButton";
import SecondaryButton from "../../components/common/SecondaryButton";
import { useNavigation } from "@react-navigation/native";
import { authAPI } from "../../services/api";

const SignUp = () => {
  const navigation = useNavigation();

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const organizationRef = useRef(null);
  const passwordRef = useRef(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if form is valid
  const isFormValid =
    name.trim() !== "" &&
    email.trim() !== "" &&
    organization.trim() !== "" &&
    password.trim() !== "";
  console.log("isFormValid:", isFormValid);

  const handleSignUp = async () => {
    try {
      setLoading(true);
      const result = await authAPI.signup({
        name,
        email,
        organization,
        password,
      });
      console.log("SignUp successful:", result);

      // Optional processing time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Navigate to Login
      // navigation.replace("Login");
      navigation.goBack();
    } catch (error) {
      console.error("SignUp error:", error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.rootContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 10}
    >
      {/* Header Section with Image and Text */}
      <View style={styles.header}>
        <Image
          source={require("../../assets/splash-icon.png")}
          style={{ width: 400, height: 150, resizeMode: "cover" }}
        />
        <LabelComponent style={{ fontWeight: "900", fontSize: 16 }}>
          Try{" "}
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
          <LabelComponent style={{ fontWeight: "900", fontSize: 16 }}>
            {" "}
            for free
          </LabelComponent>
        </LabelComponent>

        <LabelComponent>
          No credit card required - Cancel anytime
        </LabelComponent>
      </View>

      {/* Text Input Fields */}
      <View style={{ marginTop: 25, width: "100%" }}>
        <TextInputComponent
          ref={nameRef} // Attach reference
          label="Your Name"
          labelStyle={{ fontWeight: "400", fontSize: 15 }}
          placeholder="Enter your full name"
          value={name}
          onChangeText={setName}
          returnKeyType="next" // Show "Next" on keyboard
          onSubmitEditing={() => emailRef.current.focus()} // Focus password input when "Next" is pressed
          blurOnSubmit={false}
        />
        <TextInputComponent
          ref={emailRef} // Attach reference
          label="Your Email"
          labelStyle={{ fontWeight: "400", fontSize: 15 }}
          placeholder="Enter your email-id"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          returnKeyType="next" // Show "Next" on keyboard
          onSubmitEditing={() => organizationRef.current.focus()} // Focus password input when "Next" is pressed
          blurOnSubmit={false}
        />
        <View>
          <LabelComponent style={{ fontWeight: "400", fontSize: 15 }}>
            Your Organization's Name
          </LabelComponent>
          <TextInputComponent
            ref={organizationRef} // Attach reference
            label="Enter a unique name for your organization"
            labelStyle={{
              fontWeight: "400",
              fontSize: 13,
              color: "gray",
              paddingLeft: 5,
            }}
            style={{ marginTop: 3 }}
            placeholder="Enter your organization's name"
            value={organization}
            onChangeText={setOrganization}
            returnKeyType="next" // Show "Next" on keyboard
            onSubmitEditing={() => passwordRef.current.focus()} // Focus password input when "Next" is pressed
            blurOnSubmit={false}
          />
        </View>
        <View>
          <LabelComponent style={{ fontWeight: "400", fontSize: 15 }}>
            Set Password
          </LabelComponent>
          <TextInputComponent
            ref={passwordRef} // Attach reference
            label="Minimum 12 characters required"
            labelStyle={{
              fontWeight: "400",
              fontSize: 13,
              color: "gray",
              paddingLeft: 5,
            }}
            style={{ marginTop: 3 }}
            placeholder="Create new password"
            secureTextEntry={true}
            value={password}
            onChangeText={setPassword}
          />
        </View>
      </View>

      {/* SignUp Button Component (PrimaryButton) */}

      <PrimaryButton
        title="Create your account"
        titleStyle={{ color: "white", fontWeight: "bold" }}
        disabled={!isFormValid} // Disable work on true and isFormValid is false so we use ! to turn to false to true.
        loading={loading}
        onPress={handleSignUp}
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

      {/* Support Link */}
      <View style={{ flexDirection: "row", marginTop: 20 }}>
        <LabelComponent>Questions? </LabelComponent>
        <PrimaryButton
          title="Support can help."
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

      {/* Sign Up Link */}
      <View style={{ flexDirection: "row", marginTop: 5 }}>
        <LabelComponent>Already have an account? </LabelComponent>
        <PrimaryButton
          title="Log In"
          titleStyle={{
            color: "#6366f1",
            textDecorationLine: "underline",
          }}
          onPress={() => {
            console.log("Sign Up pressed!");
            navigation.navigate("Login");
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

export default SignUp;

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
