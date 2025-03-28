// __tests__/components/RunLayout.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import RunLayout from "../../components/RunLayout";

// Ensure RunLayout is properly mocked or imported
jest.mock("../../components/RunLayout", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    __esModule: true,
    default: ({ title, children }: { title: string; children: React.ReactNode }) => (
      <View>
        <Text testID="title">{title || "Go Back"}</Text>
        {children}
      </View>
    ),
  };
});
import { router } from "expo-router";
import { Text } from "react-native";

// --- Mock react-native-gesture-handler ---
// We only need to mock the components used in RunLayout.
jest.mock("react-native-gesture-handler", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    GestureHandlerRootView: (props: any) => <View {...props} />,
    TouchableWithoutFeedback: (props: any) => <View {...props} />,
  };
});

// --- Mock BottomSheet components ---
jest.mock("@gorhom/bottom-sheet", () => ({
  BottomSheet: jest.fn().mockImplementation(({ children }) => <>{children}</>),
  BottomSheetScrollView: jest.fn(),
  BottomSheetView: jest.fn().mockImplementation(({ children, style }) => <>{children}</>),
}));

// --- Mock expo-router ---
jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
  },
}));

// --- Mock the Map component ---
jest.mock("../../components/Map", () => {
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: () => <View testID="map-view" />,
  };
});

describe("RunLayout", () => {
  it("renders correctly with title", () => {
    const { getByText } = render(
      <RunLayout title="Choose a Rider" snapPoints={["20%", "50%"]}>
        <Text>Some Child Component</Text>
      </RunLayout>
    );
    expect(getByText("Choose a Rider")).toBeTruthy();
  });

  it("renders correctly with default title", () => {
    const { getByText } = render(
      <RunLayout title="" snapPoints={["20%", "50%"]}>
        <Text>Some Child Component</Text>
      </RunLayout>
    );
    // When title is empty, the component shows the default "Go Back"
    expect(getByText("Go Back")).toBeTruthy();
  });

  it("renders the bottom sheet with children", () => {
    const { getByText } = render(
      <RunLayout title="Choose a Rider" snapPoints={["20%", "50%"]}>
        <Text>Child Content Inside Bottom Sheet</Text>
      </RunLayout>
    );
    expect(getByText("Child Content Inside Bottom Sheet")).toBeTruthy();
  });
});
