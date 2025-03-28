import React from "react";
import { render } from "@testing-library/react-native";
import TypingDots from "@/components/AiThinking";

jest.mock("moti", () => {
  const { View } = require("react-native"); // Import inside the mock function
  return {
    MotiView: ({ children, testID }: { children: React.ReactNode; testID: string }) => <View testID={testID}>{children}</View>,
  };
});

describe("TypingDots", () => {
  it("renders three animated dots", async () => {
    const { findAllByTestId } = render(<TypingDots />);

    // Find all dots
    const dots = await findAllByTestId(/typing-dot-/);

    // Expect three dots to exist
    expect(dots.length).toBe(3);
  });
});
