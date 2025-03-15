import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { useUser } from "@clerk/clerk-expo";
import { useLocationStore, useaiModelStore } from "@/store";
import Profile from "@/app/(root)/(tabs)/profile";

// Mock Clerk's useUser hook
jest.mock("@clerk/clerk-expo", () => ({
  useUser: jest.fn(),
}));

// Mock Zustand stores
jest.mock("@/store", () => ({
  useLocationStore: jest.fn(),
  useaiModelStore: jest.fn(),
}));

describe("Profile Component", () => {
  let setMapThemeMock: jest.Mock;
  let setAiModelMock: jest.Mock;

  beforeEach(() => {
    // Mock the user object returned from useUser
    (useUser as jest.Mock).mockReturnValue({
      user: {
        firstName: "John",
        lastName: "Doe",
        primaryEmailAddress: { emailAddress: "john.doe@example.com" },
        imageUrl: "https://example.com/avatar.png",
        externalAccounts: [],
      },
    });

    // Create new mocks for each test
    setMapThemeMock = jest.fn();
    setAiModelMock = jest.fn();

    // Cast Zustand hooks to unknown then to jest.Mock to avoid type conversion issues.
    (useLocationStore as unknown as jest.Mock).mockReturnValue({
      setMapTheme: setMapThemeMock,
    });

    (useaiModelStore as unknown as jest.Mock).mockReturnValue({
      setAiModel: setAiModelMock,
    });
  });

  it("renders user information correctly", () => {
    // Destructure getByText and getByPlaceholderText from render result
    const { getByText, getByPlaceholderText } = render(<Profile />);

    // Check for profile title and labels
    expect(getByText("My profile")).toBeTruthy();
    expect(getByText("First name")).toBeTruthy();
    expect(getByText("Last name")).toBeTruthy();
    expect(getByText("Email")).toBeTruthy();

    // Verify that placeholders in the input fields match the mocked user data
    expect(getByPlaceholderText("John")).toBeTruthy();
    expect(getByPlaceholderText("Doe")).toBeTruthy();
    expect(getByPlaceholderText("john.doe@example.com")).toBeTruthy();
  });

  it("updates AI model selection", () => {
    const { getByTestId } = render(<Profile />);

    // Ensure your Profile component has testID="ai-model-gemma" on the TouchableOpacity for google gemma 3
    const gemmaButton = getByTestId("ai-model-gemma");
    fireEvent.press(gemmaButton);

    expect(setAiModelMock).toHaveBeenCalledWith({
      name: "google gemma 3",
      host: "google/gemma-3-4b-it:free",
    });
  });

  it("updates map theme selection", () => {
    const { getByTestId } = render(<Profile />);

    // Ensure your Profile component has testID="map-theme-dark" on the TouchableOpacity for dark theme
    const darkThemeButton = getByTestId("map-theme-dark");
    fireEvent.press(darkThemeButton);

    expect(setMapThemeMock).toHaveBeenCalledWith("dark");
  });

  it("toggles the About modal", () => {
    const { getByText, queryByText } = render(<Profile />);

    // The About button should be labeled "About"
    const aboutButton = getByText("About");

    // Open the modal
    fireEvent.press(aboutButton);

    // Check for text that is rendered in the modal, e.g. the title
    expect(queryByText("About Running Route Generator")).toBeTruthy();

    // Simulate closing the modal by pressing the "Close" button inside it
    fireEvent.press(getByText("Close"));

    // Verify that the modal content is no longer rendered
    expect(queryByText("About Running Route Generator")).toBeNull();
  });
});
