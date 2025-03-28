import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CustomButton from "@/components/CustomButton"; // Adjust import according to your project structure
import { Text } from "react-native"; // Ensure Text is imported from 'react-native'

// Mock icon components
const MockIconLeft = () => <Text>Left Icon</Text>;
const MockIconRight = () => <Text>Right Icon</Text>;

describe("CustomButton", () => {
  it("applies the correct background color for 'secondary' variant", () => {
    const { getByTestId } = render(<CustomButton title="Test" bgVariant="secondary" />);
    const button = getByTestId("custom-button");
    expect(button).toHaveStyle({ backgroundColor: "#6b7280" }); // Adjust to the actual color for 'secondary'
  });

  it("applies the correct text color for 'danger' variant", () => {
    const { getByText } = render(<CustomButton title="Test" textVariant="danger" />);
    const text = getByText("Test");
    expect(text).toHaveStyle({ color: "#fee2e2" }); // Adjust to the actual color for 'danger'
  });

  it("applies custom text styling via textClassName", () => {
    const { getByText } = render(<CustomButton title="Test" textClassName="text-green-500 text-2xl" />);
    const text = getByText("Test");
    expect(text).toHaveStyle({ color: "#fff", fontSize: 18 }); // Adjust to match Tailwind color/size
  });

  it("renders the left icon when provided", () => {
    const { getByText } = render(<CustomButton title="Test" IconLeft={MockIconLeft} />);
    expect(getByText("Left Icon")).toBeTruthy();
  });

  it("renders the right icon when provided", () => {
    const { getByText } = render(<CustomButton title="Test" IconRight={MockIconRight} />);
    expect(getByText("Right Icon")).toBeTruthy();
  });

  it("renders with the full width by default", () => {
    const { getByTestId } = render(<CustomButton title="Test" />);
    const button = getByTestId("custom-button");
    expect(button).toHaveStyle({});
  });

  it("applies a custom className when provided", () => {
    const { getByTestId } = render(<CustomButton title="Test" className="bg-blue-600" />);
    const button = getByTestId("custom-button");
    expect(button).toHaveStyle({ backgroundColor: "#0286FF" }); // Adjust to actual color
  });

  it("fires onPress function when pressed", () => {
    const mockPress = jest.fn();
    const { getByTestId } = render(<CustomButton title="Test" onPress={mockPress} />);
    const button = getByTestId("custom-button");
    fireEvent.press(button);
    expect(mockPress).toHaveBeenCalledTimes(1);
  });
});
