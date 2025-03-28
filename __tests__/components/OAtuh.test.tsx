// __tests__/components/OAuth.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import OAuth from "@/components/OAuth";
import { Alert } from "react-native";
import { useSSO } from "@clerk/clerk-expo";

// --- Nativewind Mocks ---
// These mocks override nativewind modules to prevent errors related to getColorScheme and related functions.
jest.mock("nativewind/dist/style-sheet/color-scheme", () => ({
  getColorScheme: jest.fn().mockReturnValue("light"),
}));
jest.mock("nativewind/dist/style-sheet/index.js", () => ({}));
jest.mock("nativewind/dist/styled/use-tailwind", () => ({}));
jest.mock("nativewind/dist/styled/with-styled-props", () => ({}));

// --- Other Mocks ---
jest.mock("@clerk/clerk-expo", () => ({
  useSSO: jest.fn(),
}));
jest.mock("@/lib/auth", () => ({
  googleOAuth: jest.fn(),
}));
jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
  },
}));
// For simplicity, mock basic React Native components.
jest.mock("react-native", () => ({
  ...jest.requireActual("react-native"),
  Alert: {
    alert: jest.fn(),
  },
  Image: "Image",
  Text: "Text",
  View: "View",
}));

describe("OAuth Component", () => {
  const mockStartSSOFlow = jest.fn();

  beforeEach(() => {
    (useSSO as jest.Mock).mockReturnValue({ startSSOFlow: mockStartSSOFlow });
  });

  it("renders correctly", () => {
    const { getByText } = render(<OAuth />);
    expect(getByText("Or")).toBeTruthy();
    expect(getByText("Log In with Google")).toBeTruthy();
  });

  it("handles Google sign-in button press", () => {
    const { getByText } = render(<OAuth />);

    // Simulate button press
    fireEvent.press(getByText("Log In with Google"));

    // Check if Alert.alert was called (as a simple proxy for the sign-in flow)
    expect(Alert.alert).toHaveBeenCalled();
  });
});
