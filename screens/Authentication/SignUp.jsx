import {
  StyleSheet,
  Image,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import LabelComponent from "../../components/common/Label";
import TextInputComponent from "../../components/common/TextInput";
import PrimaryButton from "../../components/common/PrimaryButton";
import SecondaryButton from "../../components/common/SecondaryButton";
import { useNavigation } from "@react-navigation/native";

const SignUp = () => {
  const navigation = useNavigation();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [organization, setOrganization] = useState("");
  const [password, setPassword] = useState("");
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
          label="Your Name"
          labelStyle={{ fontWeight: "400", fontSize: 15 }}
          placeholder="Enter your full name"
          value={name}
          onChangeText={setName}
        />
        <TextInputComponent
          label="Your Email"
          labelStyle={{ fontWeight: "400", fontSize: 15 }}
          placeholder="Enter your email-id"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <View>
          <LabelComponent style={{ fontWeight: "400", fontSize: 15 }}>
            Your Organization's Name
          </LabelComponent>
          <TextInputComponent
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
          />
        </View>
        <View>
          <LabelComponent style={{ fontWeight: "400", fontSize: 15 }}>
            Set Password
          </LabelComponent>
          <TextInputComponent
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
        onPress={() => console.log("Login pressed " + email + " " + password)}
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
