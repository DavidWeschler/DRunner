// __tests__/components/FormGoogleText2.test.tsx
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import PointInput from "@/components/FormGoogleText";
import { useLocationStore } from "@/store";

// --- Mock GooglePlacesAutocomplete ---
jest.mock("react-native-google-places-autocomplete", () => {
  const React = require("react");
  const { View, TextInput } = require("react-native");
  const GooglePlacesAutocomplete = (props: any) => {
    return (
      <View testID="google-places">
        <TextInput
          testID="google-input"
          value={props.textInputProps.value}
          onChangeText={props.textInputProps.onChangeText} // ✅ Ensure this is `onChangeText`
        />
        {/* A view that simulates onPress */}
        <View testID="onPress-container" onStartShouldSetResponder={() => true} onResponderRelease={() => props.onPress({ description: "Test Place" }, { geometry: { location: { lat: 1, lng: 2 } } })} />
      </View>
    );
  };
  return { GooglePlacesAutocomplete };
});

// --- Mock the useLocationStore hook ---
jest.mock("@/store", () => ({
  useLocationStore: jest.fn(),
}));

describe("PointInput", () => {
  // Create dummy functions for the props
  const setAddressMock = jest.fn();
  const setPointInputMock = jest.fn();
  const setPointMock = jest.fn();

  // Default props for the component
  const defaultProps = {
    label: "Start Location",
    placeholder: "Enter location",
    setAddress: setAddressMock,
    setPointInput: setPointInputMock,
    setPoint: setPointMock,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the label correctly", () => {
    // For this test, store values are not important.
    (useLocationStore as unknown as jest.Mock).mockImplementation((selector: any) => selector({ startAddress: "", endAddress: "" }));
    const { getByText } = render(<PointInput {...defaultProps} />);
    expect(getByText("Start Location")).toBeTruthy();
  });

  it("initializes input value based on startAddress from store", () => {
    // Provide a store value for startAddress.
    (useLocationStore as unknown as jest.Mock).mockImplementation((selector: any) => selector({ startAddress: "123+MainStreet, USA", endAddress: "" }));
    const { getByTestId } = render(<PointInput {...defaultProps} />);
    const input = getByTestId("google-input");
    expect(input.props.value).toBe(" USA");
  });

  // it("calls setAddress on text input change", () => {
  //   (useLocationStore as unknown as jest.Mock).mockImplementation((selector: any) => selector({ startAddress: "", endAddress: "" }));
  //   const { getByTestId } = render(<PointInput {...defaultProps} />);
  //   const input = getByTestId("google-input");

  //   // Simulate a change event on the text input.
  //   fireEvent.changeText(input, "New Address");
  //   expect(setAddressMock).toHaveBeenCalledWith("New Address");
  // });

  it("calls handlers on GooglePlacesAutocomplete onPress", () => {
    (useLocationStore as unknown as jest.Mock).mockImplementation((selector: any) => selector({ startAddress: "", endAddress: "" }));
    const { getByTestId } = render(<PointInput {...defaultProps} />);
    const onPressContainer = getByTestId("onPress-container");

    // Fire the responderRelease event to simulate a press.
    fireEvent(onPressContainer, "responderRelease");
    // Expect the onPress callback to trigger the prop functions.
    expect(setAddressMock).toHaveBeenCalledWith("Test Place");
    expect(setPointInputMock).toHaveBeenCalledWith({ latitude: 1, longitude: 2 });
    expect(setPointMock).toHaveBeenCalledWith("Test Place");
  });
});
