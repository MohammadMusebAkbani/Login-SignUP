// TextInputComponent - WORKING VERSION
import { StyleSheet, TextInput, View, TouchableOpacity } from "react-native";
import React, { useState, forwardRef } from "react";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import LabelComponent from "./Label";

const TextInputComponent = forwardRef(
  ({ label, labelStyle, style, secureTextEntry = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    // Add this debug log to see what props are received
    console.log(`${label} - Props received:`, {
      onSubmitEditing: !!props.onSubmitEditing,
      returnKeyType: props.returnKeyType,
      blurOnSubmit: props.blurOnSubmit,
    });
    return (
      <View>
        <LabelComponent style={labelStyle}>{label}</LabelComponent>
        <View style={{ position: "relative" }}>
          <TextInput
            ref={ref}
            {...props}
            secureTextEntry={secureTextEntry && !showPassword}
            style={[
              {
                borderWidth: 0.5,
                paddingVertical: 13,
                paddingLeft: 10,
                paddingRight: secureTextEntry ? 25 : 15,
                marginBottom: 10,
                alignSelf: "stretch",
                borderRadius: 8,
                borderColor: "#ccc",
                fontSize: 15,
              },
              style,
            ]}
          />
        
          {secureTextEntry && (
            <TouchableOpacity
              onPress={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: 5,
                top: 15,
                padding: 5,
              }}
            >
              <FontAwesome5
                name={showPassword ? "eye" : "eye-slash"}
                size={18}
                color="#666"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }
);

export default TextInputComponent;
