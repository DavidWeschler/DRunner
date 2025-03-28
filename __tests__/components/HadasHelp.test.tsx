import React from "react";
import { render } from "@testing-library/react-native";
import HadasHelp from "@/components/HadasHelp";
import { useLocationStore, useaiModelStore, useHadasStore } from "@/store";

// Mock store hooks
jest.mock("@/store", () => ({
  useLocationStore: jest.fn(),
  useaiModelStore: jest.fn(),
  useHadasStore: jest.fn(),
}));

// Mock CustomButton component
jest.mock("@/components/CustomButton", () => ({
  __esModule: true,
  default: ({ title, onPress }: { title: string; onPress: () => void }) => <button onClick={onPress}>{title}</button>,
}));

describe("HadasHelp Component", () => {
  const mockClose = jest.fn();
  const mockSetChatReset = jest.fn();

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    (useLocationStore as unknown as jest.Mock).mockReturnValue({
      length: 5,
      startAddress: "Test Start",
      endAddress: "Test End",
      difficulty: "Medium",
    });
    (useaiModelStore as unknown as jest.Mock).mockReturnValue({
      model: { name: "AI Model" },
    });
    (useHadasStore as unknown as jest.Mock).mockReturnValue({
      setChatReset: mockSetChatReset,
    });
  });

  it("renders correctly", () => {
    const { getByText, getByTestId } = render(<HadasHelp visible={true} onClose={mockClose} />);

    // Verify modal contents
    expect(getByText("How to use Hadas?")).toBeTruthy();
    expect(getByText("Current model: AI Model")).toBeTruthy();
    expect(getByText("5")).toBeTruthy();
    expect(getByText("Test Start")).toBeTruthy();
    expect(getByText("Test End")).toBeTruthy();
    expect(getByText("Medium")).toBeTruthy();
  });

  it("displays 'Not set' for empty inputs", () => {
    (useLocationStore as unknown as jest.Mock).mockReturnValue({
      length: 0,
      startAddress: "",
      endAddress: "",
      difficulty: "",
    });

    const { getByText } = render(<HadasHelp visible={true} onClose={mockClose} />);

    // Verify that 'Not set' is displayed for empty inputs
    expect(getByText("Running route length:")).toBeTruthy();
    expect(getByText("Start location:")).toBeTruthy();
    expect(getByText("End location:")).toBeTruthy();
    expect(getByText("Difficulty level:")).toBeTruthy();
  });

  it("matches snapshot", () => {
    const tree = render(<HadasHelp visible={true} onClose={mockClose} />).toJSON();

    expect(tree).toMatchSnapshot();
  });
});
