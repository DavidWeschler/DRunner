import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import OAuth from "@/components/OAuth";
import { Alert } from "react-native";
import { router } from "expo-router";
import { useSSO } from "@clerk/clerk-expo";
import { googleOAuth } from "@/lib/auth";

// Mock useSSO to return a mock startSSOFlow function
jest.mock("@clerk/clerk-expo", () => ({
  useSSO: jest.fn(),
}));

// Mock router.replace from expo-router
jest.mock("expo-router", () => ({
  router: {
    replace: jest.fn(),
  },
}));

// Mock googleOAuth from our auth library
jest.mock("@/lib/auth", () => ({
  googleOAuth: jest.fn(),
}));

// Mock CustomButton to render a simple touchable element that calls the onPress callback
jest.mock("@/components/CustomButton", () => {
  const React = require("react");
  const { Text, TouchableOpacity } = require("react-native");
  return (props: any) => (
    <TouchableOpacity onPress={props.onPress} testID="custom-button">
      <Text>{props.title}</Text>
    </TouchableOpacity>
  );
});

describe("OAuth Component", () => {
  const mockStartSSOFlow = jest.fn();

  beforeEach(() => {
    // Set up the useSSO hook to return our mock startSSOFlow
    (useSSO as jest.Mock).mockReturnValue({ startSSOFlow: mockStartSSOFlow });
    jest.clearAllMocks();
  });

  it("renders correctly", () => {
    const { getByText, getByTestId } = render(<OAuth />);
    expect(getByText("Or")).toBeTruthy();
    expect(getByText("Log In with Google")).toBeTruthy();
    expect(getByTestId("custom-button")).toBeTruthy();
  });

  it("handles session_exists case", async () => {
    // Spy on Alert.alert
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    (googleOAuth as jest.Mock).mockResolvedValue({
      code: "session_exists",
      success: true,
      message: "Session exists. Redirecting to home screen.",
    });

    const { getByTestId } = render(<OAuth />);
    fireEvent.press(getByTestId("custom-button"));

    await waitFor(() => {
      expect(googleOAuth).toHaveBeenCalledWith(mockStartSSOFlow);
      expect(alertSpy).toHaveBeenCalledWith("Success", "Session exists. Redirecting to home screen.");
      expect(router.replace).toHaveBeenCalledWith("/(root)/(tabs)/home");
    });

    alertSpy.mockRestore();
  });

  it("handles successful login case without session_exists code", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    (googleOAuth as jest.Mock).mockResolvedValue({
      code: "other",
      success: true,
      message: "Logged in successfully.",
    });

    const { getByTestId } = render(<OAuth />);
    fireEvent.press(getByTestId("custom-button"));

    await waitFor(() => {
      expect(googleOAuth).toHaveBeenCalledWith(mockStartSSOFlow);
      expect(alertSpy).toHaveBeenCalledWith("Success", "Logged in successfully.");
      expect(router.replace).not.toHaveBeenCalled();
    });

    alertSpy.mockRestore();
  });

  it("handles error case", async () => {
    const alertSpy = jest.spyOn(Alert, "alert").mockImplementation(() => {});
    (googleOAuth as jest.Mock).mockResolvedValue({
      code: "error",
      success: false,
      message: "An error occurred.",
    });

    const { getByTestId } = render(<OAuth />);
    fireEvent.press(getByTestId("custom-button"));

    await waitFor(() => {
      expect(googleOAuth).toHaveBeenCalledWith(mockStartSSOFlow);
      expect(alertSpy).toHaveBeenCalledWith("Error", "An error occurred.");
      expect(router.replace).not.toHaveBeenCalled();
    });

    alertSpy.mockRestore();
  });
});
