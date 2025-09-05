import { StyleSheet, Text, TouchableOpacity } from "react-native";
import React from "react";

const PrimaryButton = ({ title, titleStyle, style, onPress, ...props }) => {
  return (
    <TouchableOpacity style={style} onPress={onPress} {...props}>
      <Text style={titleStyle}>{title}</Text>
    </TouchableOpacity>
  );
};

export default PrimaryButton;

const styles = StyleSheet.create({});
