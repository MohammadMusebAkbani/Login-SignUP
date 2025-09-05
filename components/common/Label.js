import { StyleSheet, Text, View } from "react-native";
import React from "react";

const LabelComponent = ({ children, style }) => {
  return (
    <Text style={style}>
      {children}
    </Text>
  );
};

export default LabelComponent;

const styles = StyleSheet.create({});
