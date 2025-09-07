import { StyleSheet, Text, TouchableOpacity,ActivityIndicator } from "react-native";
import React from "react";

const PrimaryButton = ({
  title,
  titleStyle,
  disabled,
  style,
  onPress,
  loading,
  ...props
}) => {
  return (
    <TouchableOpacity
      style={[style, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
      {...props}
    >
      {
        loading ? (<ActivityIndicator size="small" color="white" />
      ) : (
      
      // <Text style={[titleStyle, disabled && styles.disabledText]}>{title}</Text>
      <Text style={[titleStyle, disabled && styles.disabledText]}>{title}</Text>
  )}
    </TouchableOpacity>
  );
};

export default PrimaryButton;

const styles = StyleSheet.create({
  disabled: {
    opacity: 0.5, // Make button appear faded when disabled
    backgroundColor: "gray", // Optional: change background color
  },
  disabledText: {
    color: "white", // Optional: change text color when disabled
  },
});
