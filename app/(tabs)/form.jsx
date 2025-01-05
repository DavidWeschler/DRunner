// app/form.js
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Button, TextInput, ActivityIndicator, Card, useTheme } from "react-native-paper";
import Slider from "@react-native-community/slider";
import { useRouter } from "expo-router"; // This is used for navigation

const Form = () => {
  const router = useRouter();
  const { colors } = useTheme();
  const [length, setLength] = useState("");
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [difficulty, setDifficulty] = useState(0); // 0 = low, 1 = mid, 2 = high
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    console.log({
      length,
      startPoint,
      endPoint,
      difficulty: difficulty === 0 ? "Low" : difficulty === 1 ? "Mid" : "Hard",
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={[styles.title, styles.whiteText]}>Make A Route</Text>

      <Card style={[styles.card, { marginBottom: 20, backgroundColor: colors.primary }]}>
        <Card.Content>
          <Text style={[styles.label, styles.whiteText]}>Length (int)</Text>
          <TextInput
            label="Enter a number"
            value={length}
            onChangeText={setLength}
            keyboardType="numeric"
            style={[styles.input, styles.whiteText]}
            theme={{ colors: { primary: "white", text: "white" } }} // White input text
            placeholder="Enter length"
            placeholderTextColor="white"
          />
        </Card.Content>
      </Card>

      <Card style={[styles.card, { marginBottom: 20, backgroundColor: colors.primary }]}>
        <Card.Content>
          <Text style={[styles.label, styles.whiteText]}>Start Point (float)</Text>
          <TextInput
            label="Enter a number"
            value={startPoint}
            onChangeText={setStartPoint}
            keyboardType="numeric"
            style={[styles.input, styles.whiteText]}
            theme={{ colors: { primary: "white", text: "white" } }} // White input text
            placeholder="Enter start point"
            placeholderTextColor="white"
          />
        </Card.Content>
      </Card>

      <Card style={[styles.card, { marginBottom: 20, backgroundColor: colors.primary }]}>
        <Card.Content>
          <Text style={[styles.label, styles.whiteText]}>End Point (float)</Text>
          <TextInput
            label="Enter a number"
            value={endPoint}
            onChangeText={setEndPoint}
            keyboardType="numeric"
            style={[styles.input, styles.whiteText]}
            theme={{ colors: { primary: "white", text: "white" } }} // White input text
            placeholder="Enter end point"
            placeholderTextColor="white"
          />
        </Card.Content>
      </Card>

      <Text style={[styles.label, styles.whiteText]}>Difficulty</Text>
      <Slider style={styles.slider} minimumValue={0} maximumValue={2} step={1} value={difficulty} onValueChange={(value) => setDifficulty(value)} minimumTrackTintColor="#FF5733" maximumTrackTintColor="#d3d3d3" />
      <Text style={[styles.difficultyText, styles.whiteText]}>{difficulty === 0 ? "Low" : difficulty === 1 ? "Mid" : "Hard"}</Text>

      <Button mode="contained" onPress={handleSubmit} style={styles.submitButton} disabled={loading}>
        {loading ? <ActivityIndicator animating={true} color="#fff" /> : "Submit"}
      </Button>

      {/* Link component for navigating to Login Page */}
      <Button
        mode="outlined"
        onPress={() => router.push("/login")} // Navigate to login screen
        style={{ marginTop: 20, alignSelf: "center", width: "100%" }}
      >
        Go to Login
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#333333",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  link: {
    alignItems: "center", // Center the button inside the Link
    justifyContent: "center",
  },
  card: {
    backgroundColor: "transparent", // Color will be handled by theme
    marginBottom: 20,
  },
  input: {
    marginBottom: 10,
    backgroundColor: "transparent", // To make the input field background transparent
    borderColor: "white", // White frame for input
    borderWidth: 1,
  },
  whiteText: {
    color: "white",
  },
  label: {
    marginBottom: 10,
  },
  slider: {
    width: "100%",
    height: 40,
    marginBottom: 10,
  },
  difficultyText: {
    textAlign: "center",
    marginBottom: 10,
  },
  submitButton: {
    marginBottom: 10,
  },
  loginButton: {
    marginTop: 10,
  },
});

export default Form;
