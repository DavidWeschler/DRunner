// ScrollableAlert.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ScrollableAlert from "@/components/AboutModal"; // adjust the import path as needed

describe("ScrollableAlert", () => {
  it("renders correctly when visible is true", () => {
    const onClose = jest.fn();
    const { getByText } = render(<ScrollableAlert visible={true} onClose={onClose} />);

    // Verify title and part of the body text is rendered.
    expect(getByText("About R&D Route Generator")).toBeTruthy();
    expect(getByText(/Our running route app helps runners find the best paths/i)).toBeTruthy();
  });

  it("does not render modal content when visible is false", () => {
    const onClose = jest.fn();
    const { queryByText } = render(<ScrollableAlert visible={false} onClose={onClose} />);

    // Since the modal is not visible, the title should not be rendered.
    expect(queryByText("About R&D Route Generator")).toBeNull();
  });

  it("calls onClose when the Close button is pressed", () => {
    const onClose = jest.fn();
    const { getByText } = render(<ScrollableAlert visible={true} onClose={onClose} />);

    // Simulate a press on the Close button.
    const closeButton = getByText("Close");
    fireEvent.press(closeButton);
    expect(onClose).toHaveBeenCalled();
  });
});
