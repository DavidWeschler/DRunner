import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import GoogleTextInput from "@/components/GoogleTextInput"; // Adjust according to the path
import { icons } from "@/constants";
import { GoogleInputProps } from "@/types/type";
import { Text, View, TextInput } from "react-native";

// Mock GooglePlacesAutocomplete
jest.mock("react-native-google-places-autocomplete", () => ({
  __esModule: true,
  GooglePlacesAutocomplete: jest.fn().mockImplementation(({ onPress, textInputProps }) => {
    return (
      <View>
        <TextInput {...textInputProps} testID="search-input" />
        <Text onPress={() => onPress({ description: "Mock Address" }, { geometry: { location: { lat: 10, lng: 20 } } })}>Mock Google Places Input</Text>
      </View>
    );
  }),
}));

describe("GoogleTextInput Component", () => {
  const handlePressMock = jest.fn();
  const iconMock = icons.search;
  const initialLocationMock = "Test Location";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with the given props", () => {
    const { getByPlaceholderText, getByText } = render(<GoogleTextInput icon={iconMock} initialLocation={initialLocationMock} containerStyle="bg-gray-100" textInputBackgroundColor="lightblue" handlePress={handlePressMock} />);

    // Verify placeholder text
    expect(getByPlaceholderText("Test Location")).toBeTruthy();

    // Verify icon is rendered
    expect(getByText("Mock Google Places Input")).toBeTruthy();
  });

  it("calls handlePress when a location is selected", async () => {
    const { getByText } = render(<GoogleTextInput icon={iconMock} initialLocation={initialLocationMock} containerStyle="bg-gray-100" textInputBackgroundColor="lightblue" handlePress={handlePressMock} />);

    const mockAddress = "Mock Address";

    // Simulate pressing the mock Google Places Input text
    const mockPlace = getByText("Mock Google Places Input");
    fireEvent.press(mockPlace);

    await waitFor(() => {
      // Check if handlePress is called with correct data
      expect(handlePressMock).toHaveBeenCalledWith({
        latitude: 10,
        longitude: 20,
        address: mockAddress,
      });
    });
  });

  it("renders with a default placeholder when initialLocation is not passed", () => {
    const { getByPlaceholderText } = render(<GoogleTextInput icon={iconMock} handlePress={handlePressMock} containerStyle="bg-gray-100" textInputBackgroundColor="lightblue" />);

    // Check if the default placeholder is shown
    expect(getByPlaceholderText("Where do you want to run?")).toBeTruthy();
  });

  it("snapshot test for GoogleTextInput", () => {
    const tree = render(<GoogleTextInput icon={iconMock} initialLocation={initialLocationMock} containerStyle="bg-gray-100" textInputBackgroundColor="lightblue" handlePress={handlePressMock} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
