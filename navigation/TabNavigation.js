import React from "react";
import { View, Text } from "react-native"; // Now we actually use these
import { Ionicons } from "@expo/vector-icons";
import Feeds from "../screens/BottomTab/Feeds";
import Post from "../screens/BottomTab/Post";
import Profile from "../screens/BottomTab/Profile";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const TabNavigation = () => {
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          let iconSize = focused ? 28 : 25;

          if (route.name === "Feeds") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Post") {
            iconName = focused ? "add-circle" : "add-circle-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          }

          return (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <Ionicons name={iconName} size={iconSize} color={color} />
              {focused && (
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "bold",
                    color: color,
                  }}
                >
                  {route.name}
                </Text>
              )}
            </View>
          );
        },
        tabBarShowLabel: false, // Hide default labels since we're handling them
        tabBarActiveTintColor: "#6366f1",
        tabBarInactiveTintColor: "darkblue",
        tabBarStyle: {
          height: 80,
          paddingBottom: 20,
          paddingTop: 10,
        },
      })}
    >
      <Tab.Screen
        name="Feeds"
        component={Feeds}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Post"
        component={Post}
        options={{ headerShown: false }}
      />
      <Tab.Screen
        name="Profile"
        component={Profile}
      />
    </Tab.Navigator>
  );
};

export default TabNavigation;
