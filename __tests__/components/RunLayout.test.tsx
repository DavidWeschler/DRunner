// __tests__/RunLayout.test.tsx
import React from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { render, fireEvent } from "@testing-library/react-native";
import RunLayout from "@/components/RunLayout";
import { router } from "expo-router";

// --- Gesture Handler Mock ---
jest.mock("react-native-gesture-handler", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => <View>{children}</View>,
  };
});

// --- Router Mock ---
jest.mock("expo-router", () => ({
  router: {
    back: jest.fn(),
  },
}));

// --- Map Component Mock ---
jest.mock("@/components/Map", () => {
  const React = require("react");
  const { View } = require("react-native");
  return () => <View testID="map" />;
});

// --- Icons Mock ---
jest.mock("@/constants", () => ({
  icons: {
    backArrow: "backArrow.png", // dummy image source
  },
}));

// --- Bottom Sheet Mock ---
// Here we return a default export that is a component and attach the named exports.
jest.mock("@gorhom/bottom-sheet", () => {
  const React = require("react");
  const { View } = require("react-native");

  const BottomSheet = React.forwardRef((props: React.PropsWithChildren<{}>, ref: React.Ref<View>) => {
    return (
      <View testID="bottom-sheet" ref={ref} {...props}>
        {props.children}
      </View>
    );
  });
  BottomSheet.displayName = "BottomSheet";

  const BottomSheetView = (props: React.PropsWithChildren<{}>) => <View {...props}>{props.children}</View>;
  const BottomSheetScrollView = (props: React.PropsWithChildren<{}>) => <View {...props}>{props.children}</View>;

  // Return a default export (the component) with the named exports attached.
  return Object.assign(BottomSheet, {
    BottomSheetView,
    BottomSheetScrollView,
  });
});

describe("RunLayout", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the title and children correctly", () => {
    const title = "Test Title";
    const childText = "Child content";

    const { getByText } = render(
      <RunLayout title={title}>
        <Text>{childText}</Text>
      </RunLayout>
    );

    // Verify the title is rendered.
    expect(getByText(title)).toBeTruthy();
    // Verify the children content is rendered.
    expect(getByText(childText)).toBeTruthy();
  });

  it("calls router.back when the back button is pressed", () => {
    const title = "Test Title";

    const { getByTestId } = render(
      <RunLayout title={title}>
        <Text>Content</Text>
      </RunLayout>
    );

    // The TouchableOpacity has a testID "back-button".
    const backButton = getByTestId("back-button");
    fireEvent.press(backButton);
    expect(router.back).toHaveBeenCalled();
  });

  it("passes default snapPoints when none are provided", () => {
    const { getByTestId } = render(
      <RunLayout title="Test Title">
        <Text>Content</Text>
      </RunLayout>
    );

    // Grab the BottomSheet component from the rendered output.
    const bottomSheet = getByTestId("bottom-sheet");
    expect(bottomSheet.props.snapPoints).toEqual(["18%", "68%"]);
    // Also check the initial index is 0.
    expect(bottomSheet.props.index).toBe(0);
  });

  it("passes custom snapPoints when provided", () => {
    const customSnapPoints = ["25%", "75%"];

    const { getByTestId } = render(
      <RunLayout title="Test Title" snapPoints={customSnapPoints}>
        <Text>Content</Text>
      </RunLayout>
    );

    const bottomSheet = getByTestId("bottom-sheet");
    expect(bottomSheet.props.snapPoints).toEqual(customSnapPoints);
  });
});
