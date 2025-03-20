import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { AboutModalProps } from "@/types/type";

const ScrollableAlert = ({ visible, onClose }: AboutModalProps) => {
  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.alertContainer}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.title}>About R&D Route Generator</Text>

            <Text style={styles.bodyText}>Our running route app helps runners find the best paths that fit their needs. Whether you’re looking for a specific distance, a certain difficulty, or a preferred starting point, the app’s smart chatbot—powered by six AI APIs—creates the perfect route for you. </Text>

            <Text style={styles.bodyText}>It’s integrated with Google Maps for accurate and easy-to-follow directions, making it a must-have tool for runners of any level. You can also ask the chatbot for advice on where to run, how long, or any other running tips. Plus, you can save and schedule routes for later and view your running history to track past runs.</Text>

            <Text style={styles.bodyText}>
              <Text style={styles.boldText}>Why Use This App?</Text>
              {"\n"}• Personalized Routes – Get paths based on your distance, difficulty, and location.
              {"\n"}• Smart Chatbot – Ask for running tips and advice.
              {"\n"}• Accurate & Reliable – Routes adjust to real roads with Google Maps.
              {"\n"}• Save & Schedule – Store routes or plan them for later.
              {"\n"}• Running History – Track past runs and stats.
              {"\n"}• Easy to Use – Simple design for quick route planning.
            </Text>

            <Text style={styles.bodyText}>
              <Text style={styles.boldText}>How to Use the App:</Text>
              {"\n"}1. Open the app and chat with the bot to create a running route.
              {"\n"}2. Chat with the bot to create a running route.
              {"\n"}3. The bot will generate a route for you to follow.
              {"\n"}4. Alternatively - Enter your some or all of your preferences in the form.
              {"\n"}5. Choose the route you like from the 3 generated options.
              {"\n"}6. Save the route for later or start running immediately.
              {"\n"}7. View the route on Google Maps and start running!
            </Text>

            <Text style={styles.bodyText}>
              <Text style={styles.boldText}>About the Developers:</Text>
              {"\n"}This app was built by a developer who loves both AI and fitness. By combining advanced chatbot technology with a simple design, the team works hard to make running more fun and accessible for everyone.
            </Text>
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  alertContainer: {
    width: "95%",
    height: "85%",
    backgroundColor: "white",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  bodyText: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: "left",
    color: "#333",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#0286FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeText: {
    color: "white",
    fontWeight: "bold",
  },
  boldText: {
    fontWeight: "bold",
  },
});

export default ScrollableAlert;
