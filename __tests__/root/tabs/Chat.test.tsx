// __tests__/Chat2.test.tsx

import "react-native";
import React from "react";
import { render, fireEvent, act, waitFor } from "@testing-library/react-native";
import Chat from "@/app/(root)/(tabs)/chat";
import { useLocationStore, useHadasStore, useaiModelStore } from "@/store";
import * as Location from "expo-location";
import { router } from "expo-router";
import { View, TouchableOpacity, Text, TextInput, Platform } from "react-native";

// --- Mocks ---
jest.mock("@/store", () => {
  const useLocationStore = jest.fn();
  (useLocationStore as any).getState = jest.fn();
  const useHadasStore = jest.fn();
  (useHadasStore as any).getState = jest.fn();
  const useaiModelStore = jest.fn();
  (useaiModelStore as any).getState = jest.fn();
  return { useLocationStore, useHadasStore, useaiModelStore };
});

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  reverseGeocodeAsync: jest.fn(),
  geocodeAsync: jest.fn(),
}));

jest.mock("expo-router", () => ({
  router: { push: jest.fn() },
}));

jest.mock("react-native-safe-area-context", () => {
  const { View } = require("react-native");
  return { SafeAreaView: View };
});

jest.mock("@/components/HadasInp", () => {
  const React = require("react");
  const { TextInput } = require("react-native");
  return (props: any) => <TextInput testID="hadas-input" onSubmitEditing={(e) => props.handleString({ inp: e.nativeEvent.text })} />;
});

jest.mock("@/components/CustomButton", () => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");
  return (props: any) => {
    const { title, onPress, onPressIn, ...rest } = props;
    return (
      <TouchableOpacity {...rest} onPress={onPress || onPressIn}>
        <Text>{title}</Text>
      </TouchableOpacity>
    );
  };
});

jest.mock("@/components/HadasHelp", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return ({ visible }: any) => (visible ? <Text testID="hadas-help">Help</Text> : null);
});

jest.mock("@/components/AiThinking", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return () => <Text testID="typing-dots">...</Text>;
});

// force iOS for keyboard events
Platform.OS = "ios";

describe("Chat Component", () => {
  const mockSetUserLocation = jest.fn();
  const mockSetHadasInp = jest.fn();
  const mockSetLengthInput = jest.fn();
  const mockSetStartAddress = jest.fn();
  const mockSetEndAddress = jest.fn();
  const mockSetDifficultyInput = jest.fn();
  const mockSetStartPointInput = jest.fn();
  const mockSetEndPointInput = jest.fn();
  const mockSetChatReset = jest.fn();

  beforeEach(() => {
    jest.resetAllMocks();

    // Location mocks
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: "granted" });
    (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: 1, longitude: 2 } });
    (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([{ name: "Place", region: "Region", formattedAddress: "Formatted Addr" }]);
    (Location.geocodeAsync as jest.Mock).mockResolvedValue([{ latitude: 3, longitude: 4 }]);

    // Store hooks
    (useLocationStore as unknown as jest.Mock).mockReturnValue({
      inp: "",
      setUserLocation: mockSetUserLocation,
      setHadasInp: mockSetHadasInp,
      setLengthInput: mockSetLengthInput,
      setStartAddress: mockSetStartAddress,
      setEndAddress: mockSetEndAddress,
      setDifficultyInput: mockSetDifficultyInput,
      setStartPointInput: mockSetStartPointInput,
      setEndPointInput: mockSetEndPointInput,
    });
    (useLocationStore as any).getState.mockReturnValue({
      length: 0,
      startAddress: "",
      endAddress: "",
      difficulty: "",
    });

    (useHadasStore as unknown as jest.Mock).mockReturnValue({
      chatReset: false,
      setChatReset: mockSetChatReset,
    });

    (useaiModelStore as unknown as jest.Mock).mockReturnValue({
      model: { host: "test-model" },
    });
  });

  it("renders header and toggles help modal", async () => {
    const { getByText, queryByTestId } = render(<Chat />);
    expect(getByText("Hadas AI 🤖")).toBeTruthy();

    fireEvent.press(getByText("?"));
    expect(queryByTestId("hadas-help")).toBeTruthy();

    fireEvent.press(getByText("?"));
    await waitFor(() => {
      expect(queryByTestId("hadas-help")).toBeNull();
    });
  });

  it("back button navigates home", () => {
    const { getAllByTestId } = render(<Chat />);
    const tbs = getAllByTestId("back-button");
    fireEvent.press(tbs[0]);
    expect(router.push).toHaveBeenCalledWith("/home");
  });

  it("requests and sets user location on mount", async () => {
    const { unmount } = render(<Chat />);
    await act(async () => {
      // Wait for all asynchronous operations to complete
      await waitFor(() => expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled());
      await waitFor(() => expect(Location.getCurrentPositionAsync).toHaveBeenCalled());
      await waitFor(() => expect(Location.reverseGeocodeAsync).toHaveBeenCalled());
    });
    unmount(); // Clean up after the test

    expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
    expect(Location.getCurrentPositionAsync).toHaveBeenCalled();
    expect(Location.reverseGeocodeAsync).toHaveBeenCalled();
    expect(mockSetUserLocation).toHaveBeenCalledWith({
      latitude: 1,
      longitude: 2,
      address: "Place, Region",
    });
  });

  it("does not show Generate button initially", () => {
    const { queryByText } = render(<Chat />);
    expect(queryByText("Generate")).toBeNull();
  });

  it("shows Generate and runs generateRoute correctly", async () => {
    (useLocationStore as any).getState.mockReturnValue({
      length: 10,
      startAddress: "Start",
      endAddress: "End",
      difficulty: "medium",
    });

    const { getByText } = render(<Chat />);
    const genBtn = await waitFor(() => getByText("Generate"));

    await act(async () => {
      fireEvent.press(genBtn);
    });

    expect(Location.geocodeAsync).toHaveBeenCalledWith("Start");
    expect(mockSetStartPointInput).toHaveBeenCalledWith({ latitude: 3, longitude: 4 });
    expect(Location.geocodeAsync).toHaveBeenCalledWith("End");
    expect(mockSetEndPointInput).toHaveBeenCalledWith({ latitude: 3, longitude: 4 });
    expect(mockSetLengthInput).toHaveBeenCalledWith(10);
    expect(mockSetDifficultyInput).toHaveBeenCalledWith("medium");
    expect(router.push).toHaveBeenCalledWith("/(root)/choose-run");
  });
});
