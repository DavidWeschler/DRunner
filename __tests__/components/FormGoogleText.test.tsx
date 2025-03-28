import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import PointInput from "@/components/FormGoogleText";
import { useLocationStore } from "@/store"; // Adjust according to the path
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { Text, TextInput } from "react-native";

// Mocking the GooglePlacesAutocomplete component
jest.mock("react-native-google-places-autocomplete", () => ({
  __esModule: true,
  GooglePlacesAutocomplete: jest.fn().mockImplementation(({ onPress }) => {
    return <Text onPress={() => onPress({ description: "Mock Address" }, { geometry: { location: { lat: 10, lng: 20 } } })}>Mock Google Places Input</Text>;
  }),
}));

// Mocking the useLocationStore hook
jest.mock("@/store", () => ({
  useLocationStore: jest.fn(),
}));

describe("PointInput Component", () => {
  const setAddress = jest.fn();
  const setPointInput = jest.fn();
  const setPoint = jest.fn();

  beforeEach(() => {
    // Mocking the return values from useLocationStore
    (useLocationStore as unknown as jest.Mock).mockReturnValue({
      startAddress: "Start Address",
      endAddress: "End Address",
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly and displays the label", () => {
    const { getByText } = render(<PointInput label="Start Location" placeholder="Enter start location" setAddress={setAddress} setPointInput={setPointInput} setPoint={setPoint} />);

    expect(getByText("Start Location")).toBeTruthy();
  });

  it("displays the correct initial value based on the start or end address", () => {
    const { getByText } = render(<PointInput label="Start Location" placeholder="Enter start location" setAddress={setAddress} setPointInput={setPointInput} setPoint={setPoint} />);

    // Check if "Mock Google Places Input" text is rendered
    expect(getByText("Mock Google Places Input")).toBeTruthy();
  });

  it("updates input value when typing", () => {
    const { getByPlaceholderText } = render(<PointInput label="Start Location" placeholder="Enter start location" setAddress={setAddress} setPointInput={setPointInput} setPoint={setPoint} />);

    const input = getByPlaceholderText("Enter start location");
    fireEvent.changeText(input, "New Input");

    // Ensure the address setter function is called with "New Input"
    expect(setAddress).toHaveBeenCalledWith("New Input");
  });

  it("fires onPress when selecting a place from GooglePlacesAutocomplete", async () => {
    const { getByText } = render(<PointInput label="Start Location" placeholder="Enter start location" setAddress={setAddress} setPointInput={setPointInput} setPoint={setPoint} />);

    const googlePlacesInput = getByText("Mock Google Places Input");
    fireEvent.press(googlePlacesInput);

    await waitFor(() => {
      expect(setAddress).toHaveBeenCalledWith("Mock Address");
      expect(setPointInput).toHaveBeenCalledWith({
        latitude: 10,
        longitude: 20,
      });
      expect(setPoint).toHaveBeenCalledWith("Mock Address");
    });
  });

  it("doesn't call onPress if details are missing in GooglePlacesAutocomplete", async () => {
    // Adjust the mock to simulate missing details
    jest.mock("react-native-google-places-autocomplete", () => ({
      __esModule: true,
      GooglePlacesAutocomplete: jest.fn().mockImplementation(({ onPress }) => {
        return <Text onPress={() => onPress({ description: "Mock Address" }, null)}>Mock Google Places Input</Text>;
      }),
    }));

    const { getByText } = render(<PointInput label="Start Location" placeholder="Enter start location" setAddress={setAddress} setPointInput={setPointInput} setPoint={setPoint} />);

    const googlePlacesInput = getByText("Mock Google Places Input");
    fireEvent.press(googlePlacesInput);

    await waitFor(() => {
      expect(setAddress).not.toHaveBeenCalled();
      expect(setPointInput).not.toHaveBeenCalled();
      expect(setPoint).not.toHaveBeenCalled();
    });
  });
});
