import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Image, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./screens/Authentication/Login";
import SignUp from "./screens/Authentication/SignUp";
import TabNavigation from "./navigation/TabNavigation";
import Toast, { BaseToast, ErrorToast } from "react-native-toast-message";
import { useEffect } from "react";
// Redux imports
import { Provider, useDispatch, useSelector } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { store, persistor } from "./store/store";
import { checkAuthState } from "./store/authSlice";

const Stack = createStackNavigator();

// App Navigator Component (needs to be inside Provider)
const AppNavigator = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, isInitialized } = useSelector((state) => state.auth);

  // Check auth state on app startup
  useEffect(() => {
    dispatch(checkAuthState());
  }, [dispatch]);

  // Show loading screen while checking auth state
  if (!isInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <Image
          source={require("./assets/splash-icon.png")}
          style={{ width: 400, height: 150, resizeMode: "cover" }}
        />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? "TabNavigation" : "Login"}
        screenOptions={{
          headerShown: false,
        }}
      >
        {isAuthenticated ? (
          // Authenticated user screens
          <>
            <Stack.Screen name="TabNavigation" component={TabNavigation} />
          </>
        ) : (
          // Unauthenticated user screens
          <>
            <Stack.Screen
              name="Login"
              component={Login}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUp}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>

      {/* Toast Configuration */}
      <Toast
        config={{
          success: (internalState) => (
            <BaseToast
              {...internalState}
              text1Style={{
                fontWeight: "700",
              }}
              text2Style={{
                fontWeight: "900",
              }}
            />
          ),
          error: (internalState) => (
            <ErrorToast
              {...internalState}
              text1Style={{
                fontWeight: "700",
              }}
              text2Style={{
                fontWeight: "900",
              }}
            />
          ),
        }}
      />
    </NavigationContainer>
  );
};

// Main App Component
export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppNavigator />
        <StatusBar style="auto" />
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
});
