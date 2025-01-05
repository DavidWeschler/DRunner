import React from "react";
import { Text, View, StyleSheet } from "react-native";
import { Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Button, useTheme } from "react-native-paper";

export default function App() {
  const { colors } = useTheme(); // Using the theme to get primary color

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Route Generator</Text>
      <StatusBar style="auto" />
      <Link href="/form" style={styles.link}>
        <Button
          mode="contained"
          style={[styles.linkButton, { backgroundColor: colors.primary }]}
          contentStyle={{ height: 50, justifyContent: "center" }} // Ensures proper alignment and button height
          labelStyle={[styles.buttonText, { fontSize: 16 }]}
        >
          Go to Form
        </Button>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#333333", // Deep gray background color
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    color: "#fff", // White text for the title
  },
  link: {
    alignItems: "center", // Center the button inside the Link
    justifyContent: "center",
  },
  linkButton: {
    borderRadius: 14,
  },
  buttonText: {
    color: "#fff", // Explicitly setting the button text color to white
    fontSize: 18, // Ensuring the font size stays larger
  },
});
