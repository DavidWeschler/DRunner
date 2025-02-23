// CustomAlert.js
import { AlertProps } from "@/types/type";
import React from "react";
import { Modal, View, Text, TouchableOpacity, StyleSheet } from "react-native";

const CustomAlert = ({ visible, onClose, onSetStart, onSetEnd }: AlertProps) => {
  if (!visible) return null;

  return (
    <Modal transparent={true} animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <Text style={styles.title}>Select Location</Text>
          <Text style={styles.message}>What do you want to do with this location?</Text>

          <TouchableOpacity style={styles.button} onPress={onSetStart}>
            <Text style={styles.buttonText}>Set as Start Location</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={onSetEnd}>
            <Text style={styles.buttonText}>Set as End Location</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  alertContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: 300,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 10,
    marginVertical: 5,
    width: "100%",
    alignItems: "center",
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  cancelButton: {
    padding: 10,
    marginVertical: 5,
    width: "100%",
    alignItems: "center",
    borderRadius: 5,
    backgroundColor: "#f44336",
  },
  cancelText: {
    color: "white",
    fontSize: 16,
  },
});

export default CustomAlert;
