// __tests__/root/tabs/Chat.test.tsx
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Chat from "@/app/(root)/(tabs)/chat";
import * as Location from "expo-location";

// 1) Mock out the AiThinking spinner so moti doesn’t break Jest
jest.mock("@/components/AiThinking", () => () => null);

// 2) Mock the HadasTextInput (HadasInp) to expose testIDs
jest.mock("@/components/HadasInp", () => {
  const React = require("react");
  const { View, TextInput, TouchableOpacity, Text } = require("react-native");
  return ({ handleString, testID }: any) => (
    <View>
      <TextInput testID="hadas-input" onChangeText={handleString} />
      <TouchableOpacity testID="hadas-input-button" onPress={() => handleString("Hello")}>
        <Text>Send</Text>
      </TouchableOpacity>
    </View>
  );
});

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: "granted" })),
  getCurrentPositionAsync: jest.fn(() => Promise.resolve({ coords: { latitude: 0, longitude: 0 } })),
  reverseGeocodeAsync: jest.fn(() => Promise.resolve([{ city: "Test City", region: "Test Region" }])),
}));

describe("Chat Component", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders the header", () => {
    const { getByText } = render(<Chat />);
    expect(getByText("Hadas AI 🤖")).toBeTruthy();
  });

  it("requests location permission on mount", async () => {
    const { requestForegroundPermissionsAsync } = Location;
    render(<Chat />);
    await waitFor(() => expect(requestForegroundPermissionsAsync).toHaveBeenCalledTimes(1));
  });
});
