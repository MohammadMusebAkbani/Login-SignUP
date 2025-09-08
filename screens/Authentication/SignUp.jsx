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
import Toast from "react-native-toast-message";
import { Formik } from "formik";
import * as Yup from "yup";
// Redux imports
import { useDispatch, useSelector } from "react-redux";
import { signupUser, clearError } from "../../store/authSlice";
import { useEffect } from "react";

// Validation Schema
const SignUpValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(3, "Name must be at least 3 characters")
    .required("Name is required"),
  email: Yup.string()
    .email("Invalid email format")
    .required("Email is required"),
  organization: Yup.string()
    .min(3, "Organization must be at least 3 characters")
    .required("Organization is required"),
  password: Yup.string()
    .min(6, "Password must be at least 12 characters")
    .required("Password is required"),
});

const SignUp = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated, user } = useSelector(
    (state) => state.auth
  );
  // Clear errors when component loads
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Navigate to home if signup successful and authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigation.navigate("HomeScreen"); // or wherever you want to redirect
    }
  }, [isAuthenticated, navigation]);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const organizationRef = useRef(null);
  const passwordRef = useRef(null);

  // const handleSignUp = async (values, { setSubmitting, setFieldError }) => {
  //   try {
  //     const result = await authAPI.signup({
  //       name: values.name,
  //       email: values.email,
  //       organization: values.organization,
  //       password: values.password,
  //     });
  //     console.log("SignUp successful:", result);

  //     //  Success toast
  //     Toast.show({
  //       type: "success",
  //       text1: "Account Created Successfully!",
  //       text2: `Hello ${values.name}! Please login to continue.`,
  //       visibilityTime: 5000,
  //     });
  //     // Optional processing time
  //     await new Promise((resolve) => setTimeout(resolve, 1000));
  //     // Navigate to Login
  //     navigation.goBack();
  //   } catch (error) {
  //     console.error("SignUp error:", error);
  //     // ✅ Error toast instead of alert
  //     Toast.show({
  //       type: "error",
  //       text1: "SignUp Failed",
  //       text2: error.message || "Please check your credentials and try again",
  //       visibilityTime: 5000,
  //     });
  //     // Set field-specific errors
  //     if (error.message.includes("Invalid credentials")) {
  //       setFieldError("email", "Invalid email or password");
  //       setFieldError("password", "Invalid email or password");
  //     } else {
  //       setFieldError("email", error.message);
  //     }
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };

  const handleSignUp = async (values, { setSubmitting, setFieldError }) => {
    try {
      // Clear any previous errors
      dispatch(clearError());
      const result = await dispatch(
        signupUser({
          name: values.name,
          email: values.email,
          organization: values.organization,
          password: values.password,
        })
      ).unwrap();

      Toast.show({
        type: "success",
        text1: "Account Created Successfully!",
        text2: `Hello ${values.name}! Please login to continue.`,
        visibilityTime: 5000,
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // navigation.goBack();
      navigation.replace("Login");
    } catch (error) {
      console.error("SignUp error:", error);
      // Handle specific error types
      if (error.includes("email") || error.includes("Email")) {
        setFieldError("email", error);
      } else if (error.includes("password") || error.includes("Password")) {
        setFieldError("password", error);
      } else {
        setFieldError("email", error); // General error on email field
      }
      Toast.show({
        type: "error",
        text1: "SignUp Failed",
        text2: "Something went wrong",
        visibilityTime: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <KeyboardAvoidingView
      style={styles.rootContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 10}
    >
      {/* Formik integration */}
      <Formik
        initialValues={{
          name: "Museb",
          email: "akb@gmail.com",
          organization: "MB Timber",
          password: "12345678912",
        }}
        validationSchema={SignUpValidationSchema}
        onSubmit={handleSignUp}
      >
        {({
          handleChange,
          handleBlur,
          handleSubmit,
          values,
          errors,
          touched,
          isSubmitting,
          isValid,
          dirty,
        }) => (
          <>
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
                value={values.name} // Use Formik value
                onChangeText={handleChange("name")} // Use Formik handler
                onBlur={handleBlur("name")} // Use Formik handler
                returnKeyType="next" // Show "Next" on keyboard
                onSubmitEditing={() => emailRef.current.focus()} // Focus password input when "Next" is pressed
                blurOnSubmit={false}
              />
              {touched.name && errors.name && (
                <LabelComponent style={styles.errorText}>
                  {errors.name}
                </LabelComponent>
              )}
              <TextInputComponent
                ref={emailRef} // Attach reference
                label="Your Email"
                labelStyle={{ fontWeight: "400", fontSize: 15 }}
                placeholder="Enter your email-id"
                autoCapitalize="none"
                keyboardType="email-address"
                value={values.email}
                onChangeText={handleChange("email")}
                onBlur={handleBlur("email")}
                returnKeyType="next" // Show "Next" on keyboard
                onSubmitEditing={() => organizationRef.current.focus()} // Focus password input when "Next" is pressed
                blurOnSubmit={false}
              />
              {touched.email && errors.email && (
                <LabelComponent style={styles.errorText}>
                  {errors.email}
                </LabelComponent>
              )}
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
                  value={values.organization}
                  onChangeText={handleChange("organization")}
                  onBlur={handleBlur("organization")}
                  returnKeyType="next" // Show "Next" on keyboard
                  onSubmitEditing={() => passwordRef.current.focus()} // Focus password input when "Next" is pressed
                  blurOnSubmit={false}
                />
                {touched.organization && errors.organization && (
                  <LabelComponent style={styles.errorText}>
                    {errors.organization}
                  </LabelComponent>
                )}
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
                  value={values.password}
                  onChangeText={handleChange("password")}
                  onBlur={handleBlur("password")}
                  returnKeyType="done"
                />
                {touched.password && errors.password && (
                  <LabelComponent style={styles.errorText}>
                    {errors.password}
                  </LabelComponent>
                )}
              </View>
            </View>

            {/* SignUp Button Component (PrimaryButton) */}

            <PrimaryButton
              title="Create your account"
              titleStyle={{ color: "white", fontWeight: "bold" }}
              // disabled={!isFormValid} // Disable work on true and isFormValid is false so we use ! to turn to false to true.
              // loading={loading}
              disabled={!isValid || isSubmitting}
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

            {/* Or Container */}
            <View style={styles.OrContainer}>
              <View
                style={{ flex: 1, height: 1, backgroundColor: "#d1d5db" }}
              />
              <LabelComponent
                style={{ marginHorizontal: 10, color: "#6b7280" }}
              >
                Or
              </LabelComponent>
              <View
                style={{ flex: 1, height: 1, backgroundColor: "#d1d5db" }}
              />
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
          </>
        )}
      </Formik>
      {/* <Toast /> */}
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
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 10,
    marginLeft: 5,
  },
});
