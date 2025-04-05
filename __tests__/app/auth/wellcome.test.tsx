// __tests__/components/Onboarding.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import Onboarding from "@/app/(auth)/wellcome";
import { useRouter } from "expo-router";

// Mock the onboarding slides
jest.mock("@/constants/index", () => ({
  onboarding: [
    { id: "1", image: 1, title: "Slide 1", description: "Desc 1" },
    { id: "2", image: 2, title: "Slide 2", description: "Desc 2" },
  ],
}));

// Mock SafeAreaView
jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children }: any) => children,
}));

// Provide a ref-based mock for react-native-swiper
let mockScrollBy: jest.Mock;
jest.mock("react-native-swiper", () => {
  const React = require("react");
  mockScrollBy = jest.fn();
  return React.forwardRef(({ children, onIndexChanged }: any, ref: any) => {
    React.useImperativeHandle(ref, () => ({ scrollBy: mockScrollBy }));
    // we won't auto‐advance slides in this mock
    return <>{children}</>;
  });
});

// Mock the router
jest.mock("expo-router", () => {
  const mockReplace = jest.fn();
  return {
    useRouter: () => ({
      replace: mockReplace,
    }),
    __mockReplace: mockReplace, // Expose the mock for assertions
  };
});

// Simple mock for CustomButton to expose testID
jest.mock("@/components/CustomButton", () => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");
  return ({ title, onPress }: any) => (
    <TouchableOpacity testID="action-button" onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
});

describe("Onboarding Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all slides and Skip/Get Started/Next button", () => {
    const { getByText } = render(<Onboarding />);

    // Skip button
    expect(getByText("Skip")).toBeTruthy();

    // First slide's title
    expect(getByText("Slide 1")).toBeTruthy();

    // Next button on first slide
    expect(getByText("Next")).toBeTruthy();
  });

  it("navigates to sign-up when Skip is pressed", () => {
    const { getByText } = render(<Onboarding />);
    fireEvent.press(getByText("Skip"));
    const mockRouter = useRouter();
    expect(mockRouter.replace).toHaveBeenCalledWith("/(auth)/sign-up");
  });

  it("advances to next slide when Next is pressed", () => {
    const { getByText } = render(<Onboarding />);
    fireEvent.press(getByText("Next"));
    expect(mockScrollBy).toHaveBeenCalledWith(1);
  });

  it("shows 'Get Started' on last slide and navigates", () => {
    // Force activeIndex to last slide via useState mock
    const useStateSpy = jest.spyOn(React, "useState");
    useStateSpy.mockImplementationOnce(() => [1, jest.fn()]); // 1 is last index for 2 slides

    const { getByText, getByTestId } = render(<Onboarding />);
    expect(getByText("Get Started")).toBeTruthy();

    fireEvent.press(getByTestId("action-button"));
    const mockRouter = useRouter();
    expect(mockRouter.replace).toHaveBeenCalledWith("/(auth)/sign-up");

    useStateSpy.mockRestore();
  });
});
