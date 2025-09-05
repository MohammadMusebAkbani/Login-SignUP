import { StyleSheet, Text, TouchableOpacity, Image } from "react-native";
import React from "react";

const SecondaryButton = ({
  title,
  titleStyle,
  style,
  onPress,
  image,
  ...props
}) => {
  return (
    <TouchableOpacity
      style={[
        {
          backgroundColor: "white",
          padding: 10,
          borderRadius: 5,
          alignItems: "center",
          marginTop: 10,
          width: "100%",
          borderWidth: 0.5,
          borderColor: "#6366f1",
          flexDirection: "row",
          justifyContent: "center",
        },
        style,
      ]}
      onPress={onPress}
      {...props}
    >
      <Image
        source={image}
        style={{ width: 20, height: 20, marginRight: 10 }}
      />
      <Text style={titleStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

export default SecondaryButton;

const styles = StyleSheet.create({});
