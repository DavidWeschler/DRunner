import SignIn from "@/app/(auth)/sign-in";

// SignIn.test.tsx
import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Alert } from "react-native";

// --- Mock external modules ---

// Mock Clerk hooks including a dummy useSSO implementation
jest.mock("@clerk/clerk-expo", () => ({
  useSignIn: jest.fn(),
  useSSO: jest.fn(),
}));

// Mock expo-router to provide both useRouter and Link
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Updated mock for CustomButton that passes testID prop
jest.mock("@/components/CustomButton", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return (props: any) => (
    <Text onPress={props.onPress} testID={props.testID}>
      {props.title}
    </Text>
  );
});
jest.mock("@/components/InputField", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return (props: any) => (
    <Text accessibilityLabel={props.placeholder} onPress={() => {}} testID={props.placeholder}>
      {props.label}
    </Text>
  );
});
jest.mock("@/components/OAuth", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return () => <Text>OAuth Component</Text>;
});

// Mock constants
jest.mock("@/constants", () => ({
  icons: { email: "email-icon", lock: "lock-icon" },
  images: { signUpCar: "sign-up-car.png" },
}));

import { useSignIn } from "@clerk/clerk-expo";
import { useRouter } from "expo-router";

describe("SignIn component", () => {
  // Create reusable mocks for signIn.create, setActive, and router.replace
  const mockSignInCreate = jest.fn();
  const mockSetActive = jest.fn();
  const mockRouterReplace = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // By default, assume isLoaded is true
    (useSignIn as jest.Mock).mockReturnValue({
      signIn: { create: mockSignInCreate },
      setActive: mockSetActive,
      isLoaded: true,
    });
    (useRouter as jest.Mock).mockReturnValue({
      replace: mockRouterReplace,
    });
  });

  it("calls signIn.create and navigates when sign in is complete", async () => {
    // Simulate a successful sign in attempt
    mockSignInCreate.mockResolvedValueOnce({
      status: "complete",
      createdSessionId: "session-id",
    });

    const { getByTestId } = render(<SignIn />);

    // Fill in the email and password fields by simulating text change
    fireEvent.changeText(getByTestId("Enter your email"), "test@example.com");
    fireEvent.changeText(getByTestId("Enter your password"), "password");

    // Press the sign in button using testID "signInButton"
    fireEvent.press(getByTestId("signInButton"));

    await waitFor(() => {
      expect(mockSignInCreate).toHaveBeenCalledWith({
        identifier: "test@example.com",
        password: "password",
      });
      expect(mockSetActive).toHaveBeenCalledWith({ session: "session-id" });
      expect(mockRouterReplace).toHaveBeenCalledWith("/(root)/(tabs)/home");
    });
  });

  it("alerts error when sign in status is not complete", async () => {
    // Simulate an incomplete sign in attempt
    mockSignInCreate.mockResolvedValueOnce({
      status: "incomplete",
    });
    const alertSpy = jest.spyOn(Alert, "alert");

    const { getByTestId } = render(<SignIn />);

    fireEvent.changeText(getByTestId("Enter your email"), "test@example.com");
    fireEvent.changeText(getByTestId("Enter your password"), "password");
    fireEvent.press(getByTestId("signInButton"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Error", "Log in failed. Please try again.");
    });
  });

  it("alerts error when sign in throws an error", async () => {
    // Simulate an error during sign in
    const error = { errors: [{ longMessage: "Invalid credentials" }] };
    mockSignInCreate.mockRejectedValueOnce(error);
    const alertSpy = jest.spyOn(Alert, "alert");

    const { getByTestId } = render(<SignIn />);

    fireEvent.changeText(getByTestId("Enter your email"), "test@example.com");
    fireEvent.changeText(getByTestId("Enter your password"), "password");
    fireEvent.press(getByTestId("signInButton"));

    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith("Error", "Invalid credentials");
    });
  });

  it("does not call signIn.create when isLoaded is false", async () => {
    // Override the default to simulate isLoaded being false
    (useSignIn as jest.Mock).mockReturnValueOnce({
      signIn: { create: mockSignInCreate },
      setActive: mockSetActive,
      isLoaded: false,
    });

    const { getByTestId } = render(<SignIn />);
    fireEvent.press(getByTestId("signInButton"));

    await waitFor(() => {
      expect(mockSignInCreate).not.toHaveBeenCalled();
    });
  });
});
