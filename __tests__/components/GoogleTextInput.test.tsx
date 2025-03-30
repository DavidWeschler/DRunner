import React from "react";
import { render } from "@testing-library/react-native";
import GoogleTextInput from "@/components/GoogleTextInput";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

// Mock the GooglePlacesAutocomplete component.
// Note: Importing required modules inside the factory function.
jest.mock("react-native-google-places-autocomplete", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    GooglePlacesAutocomplete: jest.fn(({ onPress, textInputProps }) => {
      return (
        <View testID="google-places-autocomplete">
          <Text>{textInputProps.placeholder}</Text>
        </View>
      );
    }),
  };
});

// Cast to jest.Mock to access mock properties
const MockGooglePlacesAutocomplete = GooglePlacesAutocomplete as unknown as jest.Mock;

describe("GoogleTextInput Component", () => {
  const mockHandlePress = jest.fn();
  const mockIcon = require("@/constants").icons.search;
  const initialLocation = "New York";
  const containerStyle = "bg-gray-200";
  const textInputBackgroundColor = "#fff";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with the provided initial location placeholder", () => {
    const { getByText } = render(<GoogleTextInput icon={mockIcon} initialLocation={initialLocation} containerStyle={containerStyle} textInputBackgroundColor={textInputBackgroundColor} handlePress={mockHandlePress} />);

    // Check that the placeholder text is rendered
    expect(getByText(initialLocation)).toBeTruthy();
  });

  it("calls handlePress with correct location data on selection", () => {
    render(<GoogleTextInput icon={mockIcon} initialLocation={initialLocation} containerStyle={containerStyle} textInputBackgroundColor={textInputBackgroundColor} handlePress={mockHandlePress} />);

    // Retrieve the props passed to the mocked GooglePlacesAutocomplete component
    const mockProps = MockGooglePlacesAutocomplete.mock.calls[0][0];
    const mockData = { description: "Los Angeles, CA" };
    const mockDetails = {
      geometry: { location: { lat: 34.0522, lng: -118.2437 } },
    };

    // Simulate selecting a location by calling the onPress callback
    mockProps.onPress(mockData, mockDetails);

    expect(mockHandlePress).toHaveBeenCalledWith({
      latitude: 34.0522,
      longitude: -118.2437,
      address: "Los Angeles, CA",
    });
  });
});
