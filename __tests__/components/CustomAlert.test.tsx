import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import CustomAlert from "@/components/CustomAlert";

describe("CustomAlert", () => {
  const mockOnClose = jest.fn();
  const mockOnSetStart = jest.fn();
  const mockOnSetEnd = jest.fn();

  it("renders correctly when visible", () => {
    const { getByText } = render(<CustomAlert visible={true} onClose={mockOnClose} onSetStart={mockOnSetStart} onSetEnd={mockOnSetEnd} />);

    expect(getByText("Select Location")).toBeTruthy();
    expect(getByText("What do you want to do with this location?")).toBeTruthy();
    expect(getByText("Set as Start Location")).toBeTruthy();
    expect(getByText("Set as End Location")).toBeTruthy();
    expect(getByText("Cancel")).toBeTruthy();
  });

  it("does not render when not visible", () => {
    const { queryByText } = render(<CustomAlert visible={false} onClose={mockOnClose} onSetStart={mockOnSetStart} onSetEnd={mockOnSetEnd} />);

    expect(queryByText("Select Location")).toBeNull();
  });

  it("calls onSetStart when 'Set as Start Location' is pressed", () => {
    const { getByText } = render(<CustomAlert visible={true} onClose={mockOnClose} onSetStart={mockOnSetStart} onSetEnd={mockOnSetEnd} />);

    fireEvent.press(getByText("Set as Start Location"));
    expect(mockOnSetStart).toHaveBeenCalled();
  });

  it("calls onSetEnd when 'Set as End Location' is pressed", () => {
    const { getByText } = render(<CustomAlert visible={true} onClose={mockOnClose} onSetStart={mockOnSetStart} onSetEnd={mockOnSetEnd} />);

    fireEvent.press(getByText("Set as End Location"));
    expect(mockOnSetEnd).toHaveBeenCalled();
  });

  it("calls onClose when 'Cancel' is pressed", () => {
    const { getByText } = render(<CustomAlert visible={true} onClose={mockOnClose} onSetStart={mockOnSetStart} onSetEnd={mockOnSetEnd} />);

    fireEvent.press(getByText("Cancel"));
    expect(mockOnClose).toHaveBeenCalled();
  });
});
