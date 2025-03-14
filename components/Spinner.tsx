import React from "react";
import { View, ActivityIndicator, Modal, StyleSheet } from "react-native";

interface SpinnerProps {
  visible: boolean;
}

const Spinner: React.FC<SpinnerProps> = ({ visible }) => {
  return (
    <Modal transparent={true} animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.spinnerContainer}>
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // Semi-transparent background
    justifyContent: "center",
    alignItems: "center",
  },
  spinnerContainer: {
    width: 80,
    height: 80,
    // backgroundColor: "rgba(0,0,0,0.7)", // Darker box for spinner
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default Spinner;
