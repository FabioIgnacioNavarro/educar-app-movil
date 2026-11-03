import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ErrorMessageProps {
  message: string;
  testID?: string;
}

export function ErrorMessage({ message, testID }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <View testID={testID} style={styles.banner}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#FEE2E2",
    borderColor: "#EF4444",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  text: {
    color: "#B91C1C",
    fontSize: 14,
    fontWeight: "500",
  },
});
