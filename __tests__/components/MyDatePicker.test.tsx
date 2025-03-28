import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import MyDateTimePicker from "@/components/MyDatePicker";
import { View, TouchableOpacity } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";

jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

describe("MyDateTimePicker", () => {
  it("renders correctly", () => {
    const { getByTestId } = render(<MyDateTimePicker alreadyChoseDate={false} onDateTimeSelected={jest.fn()} />);
    expect(getByTestId("my-datetime-picker")).toBeTruthy();
  });

  it("shows the date picker when button is pressed", async () => {
    const { getByTestId } = render(<MyDateTimePicker alreadyChoseDate={false} onDateTimeSelected={jest.fn()} />);

    const button = getByTestId("date-picker-button");
    fireEvent.press(button);

    await waitFor(() => {
      expect(getByTestId("datetime-picker")).toBeTruthy();
    });
  });

  it("calls onDateTimeSelected when a date is confirmed", async () => {
    const onDateTimeSelected = jest.fn();
    const { getByTestId } = render(<MyDateTimePicker alreadyChoseDate={false} onDateTimeSelected={onDateTimeSelected} />);

    fireEvent.press(getByTestId("date-picker-button"));

    // Simulate the user selecting a date
    const fakeDate = new Date(2025, 1, 1);
    fireEvent(getByTestId("datetime-picker"), "confirm", fakeDate);

    await waitFor(() => {
      expect(onDateTimeSelected).toHaveBeenCalledWith(fakeDate);
    });
  });

  it("does not show the date picker when alreadyChoseDate is true", () => {
    const { queryByTestId } = render(<MyDateTimePicker alreadyChoseDate={true} onDateTimeSelected={jest.fn()} />);

    const button = queryByTestId("date-picker-button");
    fireEvent.press(button);

    // The DateTimePickerModal should not be visible
    expect(queryByTestId("datetime-picker")).toBeNull();
  });

  it("has the correct button color based on alreadyChoseDate", () => {
    const { getByTestId } = render(<MyDateTimePicker alreadyChoseDate={false} onDateTimeSelected={jest.fn()} />);

    const button = getByTestId("date-picker-button");
    const icon = button.props.children[0]; // Assuming MaterialIcons is used as a child in TouchableOpacity

    expect(icon.props.color).toBe("#009900");

    // Test when alreadyChoseDate is true
    const { getByTestId: getByTestId2 } = render(<MyDateTimePicker alreadyChoseDate={true} onDateTimeSelected={jest.fn()} />);

    const button2 = getByTestId2("date-picker-button");
    const icon2 = button2.props.children[0]; // Assuming MaterialIcons is used as a child in TouchableOpacity

    expect(icon2.props.color).toBe("#C0C0C0");
  });
});
