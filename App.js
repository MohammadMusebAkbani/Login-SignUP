import "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Login from "./screens/Authentication/Login";
import SignUp from "./screens/Authentication/SignUp";
import SimpleFrameIO from "./screens/Video/SimpleFrameIO";
import HomeScreen from "./screens/HomeScreen";

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
      // initialRouteName="Video"
      // screenOptions={{
      //   headerShown: true,
      //   headerStyle: { backgroundColor: "#2a2a2a" },
      //   headerTintColor: "#fff",
      // }}
      >
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
        <Stack.Screen
          name="Video"
          component={SimpleFrameIO}
          options={{ title: "Frame.io Video Review" }}
        />
        <Stack.Screen
          name="HomeScreen"
          component={HomeScreen}
          options={{ title: "Home Screen" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
