import {
  StyleSheet,
  Text,
  View,
  Image,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Formik } from "formik";
import * as Yup from "yup";
import React, { useRef } from "react";
import TextInputComponent from "../../components/common/TextInput";
import LabelComponent from "../../components/common/Label";
import PrimaryButton from "../../components/common/PrimaryButton";
import SecondaryButton from "../../components/common/SecondaryButton";
import { useNavigation } from "@react-navigation/native";
import { authAPI } from "../../services/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
//Redux imports
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { clearError, loginUser } from "../../store/authSlice";

// Validation Schema
const loginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email("Please enter a valid email")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

const Login = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated ,user} = useSelector(
    (state) => state.auth
  );

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  // Clear errors when component loads
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Navigate when login successful
  useEffect(() => {
    if (isAuthenticated) {
      Toast.show({
        type: "success",
        text1: `Login Successful!`,
        text2: `Welcome back! ${user.name || "User"}`,
        visibilityTime: 3000,
      });
      navigation.navigate("HomeScreen");
    }
  }, [isAuthenticated, navigation]);

  // Initial values
  const initialValues = {
    email: "akbani@gmail.com", // Remove in production
    password: "123456789122", // Remove in production
  };

  // const handleLogin = async (values, { setSubmitting, setFieldError }) => {
  //   try {
  //     const result = await authAPI.login({
  //       email: values.email,
  //       password: values.password,
  //     });
  //     console.log("Login successful:", result);
  //     // Since your API returns the user object directly
  //     await AsyncStorage.setItem("userToken", result.token);
  //     await AsyncStorage.setItem(
  //       "userData",
  //       JSON.stringify({
  //         id: result.id,
  //         name: result.name,
  //         email: result.email,
  //         organization: result.organization,
  //         // Note: Don't store password in AsyncStorage for security
  //       })
  //     );

  //     // ✅ Success toast
  //     Toast.show({
  //       type: "success",
  //       text1: "Login Successful!",
  //       text2: `Welcome back, ${result.name || "User"}!`,
  //       visibilityTime: 5000,
  //     });
  //     // Simulate some processing time (optional)
  //     await new Promise((resolve) => setTimeout(resolve, 1000));
  //     // Navigate to the main app screen or dashboard
  //     navigation.navigate("HomeScreen");
  //   } catch (error) {
  //     console.error("Login error:", error);
  //     //   alert(error.message);

  //     // ✅ Error toast instead of alert
  //     Toast.show({
  //       type: "error",
  //       text1: "Login Failed",
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
  //     //setLoading(false);
  //     setSubmitting(false); // ✅ Use Formik's setSubmitting instead of setLoading
  //   }
  // };

  const handleLogin = async (values, { setSubmitting, setFieldError }) => {
    try {
      console.log("Starting login...", values); // Debug log

      // Clear any previous errors
      dispatch(clearError());

      // Use .unwrap() to properly handle the async thunk
      const result = await dispatch(
        loginUser({
          email: values.email,
          password: values.password,
        })
      ).unwrap();

      console.log("Login result:", result); // Debug log
    } catch (error) {
      console.error("Login error:", error);
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: error || "Please check your credentials and try again",
        visibilityTime: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };
  // const handleLogin = async (values, { setSubmitting, setFieldError }) => {
  //   try {
  //     const result = await dispatch(
  //       loginUser({
  //         email: values.email,
  //         password: values.password,
  //       })
  //     );
  //     if (loginUser.rejected.match(result)) {
  //       // Handle errors
  //       setFieldError("email", result.payload);
  //       setFieldError("password", result.payload);

  //       Toast.show({
  //         type: "error",
  //         text1: "Login Failed",
  //         text2: result.payload,
  //         visibilityTime: 5000,
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Login error:", error);
  //     Toast.show({
  //       type: "error",
  //       text1: "Login Failed",
  //       text2: "Something went wrong",
  //       visibilityTime: 5000,
  //     });
  //   } finally {
  //     setSubmitting(false);
  //   }
  // };
  return (
    <KeyboardAvoidingView
      style={styles.rootContainer}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      {/* Formik code */}

      <Formik
        initialValues={initialValues}
        validationSchema={loginValidationSchema}
        onSubmit={handleLogin}
      >
        {({
          values,
          errors,
          touched,

          setFieldValue, // ✅ Added setFieldValue
          setFieldTouched, // ✅ Added setFieldTouched
          handleSubmit,
          isSubmitting,
          isValid,
        }) => (
          <>
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
                value={values.email}
                onChangeText={(text) => setFieldValue("email", text)}
                onBlur={() => setFieldTouched("email", true)} // ✅ Added onBlur
                returnKeyType="next" // Show "Next" on keyboard
                onSubmitEditing={() => passwordRef.current?.focus()} // Focus password input when "Next" is pressed
                blurOnSubmit={false}
                error={touched.email && errors.email} //Formik integration
              />
              {/* Show Email Error */}
              {touched.email && errors.email && (
                <LabelComponent style={styles.errorText}>
                  {errors.email}
                </LabelComponent>
              )}
              <TextInputComponent
                ref={passwordRef} // Attach ref
                label="Password"
                labelStyle={{ fontWeight: "400", fontSize: 15 }}
                placeholder="********"
                secureTextEntry={true}
                value={values.password}
                onChangeText={(text) => setFieldValue("password", text)} // ✅ Consistent with email
                onBlur={() => setFieldTouched("password", true)}
                returnKeyType="done"
                onSubmitEditing={handleSubmit} // ✅ Submit on done
                blurOnSubmit={true}
                error={touched.password && errors.password} //Formik integration
              />
              {/* Show Password Error */}
              {touched.password && errors.password && (
                <LabelComponent style={styles.errorText}>
                  {errors.password}
                </LabelComponent>
              )}
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
              // onPress={handleLogin}
              // disabled={!isFormValid} // Disable work on true and isFormValid is false so we use ! to turn to false to true.
              // loading={loading}
              onPress={handleSubmit} //  Use Formik's handleSubmit
              disabled={!isValid || isSubmitting} //  Use Formik's validation
              loading={isSubmitting} //  Use Formik's isSubmitting
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
          </>
        )}
      </Formik>
      {/* <Toast />  */}
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
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: -8,
    marginBottom: 10,
    marginLeft: 5,
  },
});
