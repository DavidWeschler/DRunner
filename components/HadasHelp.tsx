import React, { useEffect, useState } from "react";
import { Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { AboutModalProps } from "@/types/type";
import { useLocationStore, useaiModelStore } from "@/store";

const HadasHelp = ({ visible, onClose }: AboutModalProps) => {
  const { length, startAddress, endAddress, difficulty } = useLocationStore();
  const { model } = useaiModelStore();
  const [currentInputs, setCurrentInputs] = useState({
    "Running route length": length,
    "Start location": startAddress,
    "End location": endAddress,
    "Difficulty level": difficulty,
  });

  useEffect(() => {
    setCurrentInputs({
      "Running route length": length,
      "Start location": startAddress,
      "End location": endAddress,
      "Difficulty level": difficulty,
    });
  }, [length, startAddress, endAddress, difficulty]);

  return (
    <Modal animationType="slide" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        <View style={styles.alertContainer}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Text style={styles.title} className="text-md font-JakartaBold">
              How to use Hadas?
            </Text>
            <Text style={styles.bodyText}>Hadas is your AI assistant to help you plan your next running route or give you useful advice on how to create the best route for your needs!</Text>

            <Text style={styles.title} className="text-md font-JakartaBold">
              How to write to Hadas?
            </Text>
            <Text style={styles.bodyText}>You can ask Hadas in natural language, for example:</Text>
            <Text style={styles.exampleText}>
              - "I would like to run 3km starting from where I am and also end here. Make it easy."{"\n"}- "I'm not sure how long my running route should be. Any advice?"{"\n"}- "I haven't run in a while, should I go for a long run or a short one?"{"\n"}
            </Text>
            <Text style={styles.bodyText}>
              Hadas will ask you for more details if needed. The more details you provide, the better the recommendations will be!{"\n"}
              When the Generate button appears, you can see matching routes! 🏃‍♂️‍➡️
            </Text>

            <Text style={[styles.title]} className="text-md font-JakartaBold">
              Current model: <Text className="text-md font-JakartaBold text-blue-700">{model.name}</Text>
            </Text>

            <Text style={styles.title} className="text-md font-JakartaBold">
              Current features:
            </Text>
            <View style={styles.currentInputsContainer}>
              {Object.entries(currentInputs).map(([key, value]) => (
                <View key={key} style={{ flexDirection: "row", marginBottom: 1 }}>
                  <Text style={styles.bodyText} className="text-md font-JakartaMedium text-gray-500">
                    {key}:
                  </Text>
                  <Text style={styles.bodyText} className="text-md font-JakartaBold text-blue-700">
                    {value ?? "Not set"}
                  </Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.closeButton} onPress={onClose} accessibilityRole="button">
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
    width: "85%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  title: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  bodyText: {
    fontSize: 14,
    marginBottom: 10,
    textAlign: "left",
  },
  exampleText: {
    fontSize: 14,
    fontStyle: "italic",
    color: "#555",
    marginBottom: 10,
  },
  currentInputsContainer: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 2,
    width: "100%",
  },
  closeButton: {
    marginTop: 10,
    backgroundColor: "#0286FF",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  closeText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default HadasHelp;
