import React, { useState } from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { AboutModalProps } from "@/types/type";

const ScrollableAlert = ({ visible, onClose }: AboutModalProps) => {
  return (
    <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.alertContainer}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.title}>About Run App</Text>
            <Text style={styles.bodyText}>Welcome to **Run App** – your ultimate companion for planning and discovering the best running routes! Whether you're a casual jogger or a seasoned marathoner, we provide tools to find, create, and customize routes that fit your specific preferences.</Text>
            <Text style={styles.bodyText}>Our mission is to make running more enjoyable and accessible for everyone. We believe that running is not just about fitness – it's about exploring the world, pushing your limits, and experiencing the joy of movement. Our app is designed to help you discover new routes, stay motivated, and track your progress, all while fostering a supportive running community.</Text>
            <Text style={styles.bodyText}>
              Features include:
              {"\n"}- Route Generator: Find routes tailored to your preferred starting and ending points, route length, and difficulty level.
              {"\n"}- Route Suggestions: Browse through a curated list of suggested running routes based on your preferences and location.
              {"\n"}- Map Themes: Customize the appearance of your map with multiple themes, including Dark, Aubergine, Retro, and more.
            </Text>
            <Text style={styles.bodyText}>
              Why Run App?
              {"\n"}- Easy to Use: Our user-friendly interface makes it easy to search, customize, and save routes.
              {"\n"}- Smart Features: Whether you prefer short jogs, long-distance runs, or specific terrain, our app adapts to your needs.
              {"\n"}- Community-Focused: We’re not just about running; we’re about building a community of runners who share their experiences, challenges, and victories.
            </Text>
            <Text style={styles.bodyText}>Get in touch with us for any questions or feedback at: support@runapp.com</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
  },
  alertContainer: {
    width: "80%",
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
});

export default ScrollableAlert;
