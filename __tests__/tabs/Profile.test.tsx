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

    const gemmaButton = getByTestId("ai-model-gemma");
    fireEvent.press(gemmaButton);
    expect(setAiModelMock).toHaveBeenCalledWith({
      name: "google gemma 3",
      host: "google/gemma-3-4b-it:free",
    });

    const deepSeekButton = getByTestId("ai-model-deepseek");
    fireEvent.press(deepSeekButton);
    expect(setAiModelMock).toHaveBeenCalledWith({
      name: "deepSeek",
      host: "deepseek/deepseek-r1-distill-llama-70b:free",
    });

    const qwenButton = getByTestId("ai-model-qwen");
    fireEvent.press(qwenButton);
    expect(setAiModelMock).toHaveBeenCalledWith({
      name: "Qwen QwQ 32B",
      host: "qwen/qwq-32b:free",
    });

    const hermesButton = getByTestId("ai-model-hermes");
    fireEvent.press(hermesButton);
    expect(setAiModelMock).toHaveBeenCalledWith({
      name: "Nous DeepHermes 3 Llama 3 8B",
      host: "nousresearch/deephermes-3-llama-3-8b-preview:free",
    });

    const geminiButton = getByTestId("ai-model-gemini");
    fireEvent.press(geminiButton);
    expect(setAiModelMock).toHaveBeenCalledWith({
      name: "Google Gemini Flash Lite 2.0",
      host: "google/gemini-2.0-flash-lite-preview-02-05:free",
    });

    const metaButton = getByTestId("ai-model-meta");
    fireEvent.press(metaButton);
    expect(setAiModelMock).toHaveBeenCalledWith({
      name: "Meta Llama 3.3 70B",
      host: "meta-llama/llama-3.3-70b-instruct:free",
    });
  });

  it("updates map theme selection", () => {
    const { getByTestId } = render(<Profile />);

    const darkThemeButton = getByTestId("map-theme-dark");
    fireEvent.press(darkThemeButton);
    expect(setMapThemeMock).toHaveBeenCalledWith("dark");

    const aubergineThemeButton = getByTestId("map-theme-aubergine");
    fireEvent.press(aubergineThemeButton);
    expect(setMapThemeMock).toHaveBeenCalledWith("aubergine");

    const nightThemeButton = getByTestId("map-theme-night");
    fireEvent.press(nightThemeButton);
    expect(setMapThemeMock).toHaveBeenCalledWith("night");

    const retroThemeButton = getByTestId("map-theme-retro");
    fireEvent.press(retroThemeButton);
    expect(setMapThemeMock).toHaveBeenCalledWith("retro");

    const silverThemeButton = getByTestId("map-theme-silver");
    fireEvent.press(silverThemeButton);
    expect(setMapThemeMock).toHaveBeenCalledWith("silver");

    const standardThemeButton = getByTestId("map-theme-standard");
    fireEvent.press(standardThemeButton);
    expect(setMapThemeMock).toHaveBeenCalledWith("standard");
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
