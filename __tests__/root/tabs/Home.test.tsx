import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import Home from "@/app/(root)/(tabs)/home";
import { useUser, useAuth } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";
import { useLocationStore } from "@/store";

// ----- MOCK SETUP ----- //

// Mock Clerk hooks
jest.mock("@clerk/clerk-expo", () => ({
  useUser: jest.fn(),
  useAuth: jest.fn(),
}));

// Mock Expo modules
jest.mock("expo-location");
jest.mock("expo-notifications");
jest.mock("expo-router");

// Mock Zustand store
jest.mock("@/store");

// Mock HadasTextInput so that when pressed it calls its handleString prop with an object { inp: "test input" }
jest.mock("@/components/HadasInp", () => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");
  return (props: any) => (
    <TouchableOpacity testID="hadasTextInput" onPress={() => props.handleString({ inp: "test input" })}>
      <Text>Hadas Input</Text>
    </TouchableOpacity>
  );
});

// Mock PointInput so that it renders a TextInput with the provided placeholder and calls onChangeText
jest.mock("@/components/FormGoogleText", () => {
  const React = require("react");
  const { TextInput } = require("react-native");
  return (props: any) => <TextInput testID={props.label} placeholder={props.placeholder} onChangeText={props.onChangeText} value={props.value} />;
});

// Mock RunCard to simply render the first direction to avoid errors (e.g. calling toFixed on undefined)
jest.mock("@/components/RunCard", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return ({ run }: any) => <Text>{run?.directions?.[0] || "No directions"}</Text>;
});

// ----- STORE MOCK ----- //
// Use a mutable store object so that the setters update the store's values.
const storeMock = {
  setUserLocation: jest.fn(),
  setDestinationLocation: jest.fn(),
  setLengthInput: jest.fn(),
  setStartPointInput: jest.fn(),
  setEndPointInput: jest.fn(),
  setDifficultyInput: jest.fn(),
  setHadasInp: jest.fn(),
  startAddress: "",
  endAddress: "",
  // Implement setters to update the store object.
  setStartAddress: jest.fn((value: string) => {
    storeMock.startAddress = value;
  }),
  setEndAddress: jest.fn((value: string) => {
    storeMock.endAddress = value;
  }),
  mapTheme: "standard",
  setRouteDirections: jest.fn(),
  setRouteWayPoints: jest.fn(),
  setMode: jest.fn(),
  mode: "walking",
};
(useLocationStore as unknown as jest.Mock).mockReturnValue(storeMock);

// ----- USER & AUTH MOCKS ----- //
const mockUser = { firstName: "John", id: "123" };
const mockSignOut = jest.fn();
(useUser as jest.Mock).mockReturnValue({ user: mockUser });
(useAuth as jest.Mock).mockReturnValue({ signOut: mockSignOut });

// ----- LOCATION & NOTIFICATIONS MOCKS ----- //
(Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: "granted" });
(Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
  coords: { latitude: 32.009444, longitude: 34.882778 },
});
(Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([{ name: "Test Street", region: "Test Region", formattedAddress: "Test Street, Test Region" }]);
(Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: "granted" });

// Clear router mocks before each test
(router.push as jest.Mock).mockClear();
(router.replace as jest.Mock).mockClear();

// ----- GLOBAL FETCH MOCK ----- //
// By default, simulate that fetching routes returns an empty array.
beforeEach(async () => {
  jest.clearAllMocks();
  (global.fetch as jest.Mock) = jest.fn((url, options) => {
    if (url.includes("recent_routes")) {
      return Promise.resolve({ json: () => Promise.resolve([]) });
    }
    if (url.includes("saved_routes") || url.includes("future_routes")) {
      return Promise.resolve({ json: () => Promise.resolve([]) });
    }
    if (url.includes("update_recent")) {
      return Promise.resolve({ json: () => Promise.resolve({}) });
    }
    return Promise.resolve({ json: () => Promise.resolve([]) });
  });

  // Ensure that the location effect runs by waiting for getCurrentPositionAsync.
  await act(async () => {
    await Location.getCurrentPositionAsync();
  });
});

// ----- TESTS ----- //
describe("Home Component", () => {
  it("renders correctly", async () => {
    const { getByText } = render(<Home />);
    await waitFor(() => expect(getByText(/Test Street, Test Region/)).toBeTruthy());
    expect(getByText("Welcome John 👋")).toBeTruthy();
  });

  it("displays weather information", async () => {
    const { getByText } = render(<Home />);
    await waitFor(() => expect(getByText(/Now's weather in/)).toBeTruthy());
  });

  it("signs out the user when sign-out button is pressed", async () => {
    const { getByTestId } = render(<Home />);
    fireEvent.press(getByTestId("signOutButton"));
    expect(mockSignOut).toHaveBeenCalled();
  });

  it("generates a route when the generate button is pressed (without start/end inputs)", async () => {
    const { getByPlaceholderText, getByText } = render(<Home />);
    await waitFor(() => expect(getByText(/Test Street, Test Region/)).toBeTruthy());
    fireEvent.changeText(getByPlaceholderText("numbers only"), "5");
    // Leave start and end inputs empty.
    fireEvent.press(getByText("Generate"));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/(root)/choose-run"));
    expect(storeMock.setLengthInput).toHaveBeenCalledWith(5);
    expect(storeMock.setStartPointInput).toHaveBeenCalledWith({ latitude: 32.009444, longitude: 34.882778 });
    expect(storeMock.setEndPointInput).toHaveBeenCalledWith(null);
    expect(storeMock.setDifficultyInput).toHaveBeenCalledWith("easy");
  });

  it("generates a route when the generate button is pressed (with start and end inputs)", async () => {
    // Simulate that geocoding returns specific coordinates for start and end addresses.
    (Location.geocodeAsync as jest.Mock)
      .mockResolvedValueOnce([{ latitude: 10, longitude: 20 }]) // for start point
      .mockResolvedValueOnce([{ latitude: 30, longitude: 40 }]); // for end point

    // Pre-set the store addresses via the setters so that useEffect in Home picks them up.
    act(() => {
      storeMock.setStartAddress("Start Address");
      storeMock.setEndAddress("End Address");
    });

    const { getByPlaceholderText, getByText } = render(<Home />);
    await waitFor(() => expect(getByText(/Test Street, Test Region/)).toBeTruthy());
    fireEvent.changeText(getByPlaceholderText("numbers only"), "7");
    // Fire change events on the PointInputs to trigger the setters.
    fireEvent.changeText(getByPlaceholderText("e.g. Yafo 1, Jerusalem"), "Start Address");
    fireEvent.changeText(getByPlaceholderText("Optional"), "End Address");
    fireEvent.press(getByText("Easy"));
    fireEvent.press(getByText("Generate"));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/(root)/choose-run"));
    expect(storeMock.setLengthInput).toHaveBeenCalledWith(7);
    expect(storeMock.setStartPointInput).toHaveBeenCalledWith({ latitude: 10, longitude: 20 });
    expect(storeMock.setEndPointInput).toHaveBeenCalledWith({ latitude: 30, longitude: 40 });
    expect(storeMock.setDifficultyInput).toHaveBeenCalledWith("easy");
  });

  it("changes kind state when tabs are pressed", async () => {
    const { getByText } = render(<Home />);
    fireEvent.press(getByText("Saved"));
    await waitFor(() => expect(getByText("No saved runs found")).toBeTruthy());
    fireEvent.press(getByText("Future"));
    await waitFor(() => expect(getByText("No future runs found")).toBeTruthy());
  });

  // it("handles run press correctly", async () => {
  //   const fakeRun = {
  //     route_id: "run1",
  //     difficulty: "easy",
  //     directions: ["step1", "step2"],
  //     waypoints: [
  //       [-118, 34],
  //       [-117, 35],
  //     ],
  //   };

  //   (global.fetch as jest.Mock).mockImplementation((url, options) => {
  //     if (url.includes("recent_routes")) {
  //       return Promise.resolve({ json: () => Promise.resolve([fakeRun]) });
  //     }
  //     if (url.includes("update_recent")) {
  //       return Promise.resolve({ json: () => Promise.resolve({}) });
  //     }
  //     return Promise.resolve({ json: () => Promise.resolve([]) });
  //   });

  //   const { getByText } = render(<Home />);
  //   await waitFor(() => expect(getByText("step1")).toBeTruthy());
  //   fireEvent.press(getByText("step1"));
  //   expect(storeMock.setRouteWayPoints).toHaveBeenCalledWith([
  //     { longitude: -118, latitude: 34 },
  //     { longitude: -117, latitude: 35 },
  //   ]);
  //   expect(storeMock.setRouteDirections).toHaveBeenCalledWith(["step1", "step2"]);
  //   await waitFor(() => expect(router.push).toHaveBeenCalledWith("/(root)/run-a-route"));
  // });

  it("handles hadas input correctly", async () => {
    const { getByTestId } = render(<Home />);
    fireEvent.press(getByTestId("hadasTextInput"));
    expect(storeMock.setHadasInp).toHaveBeenCalledWith("test input");
    expect(router.push).toHaveBeenCalledWith("/(root)/(tabs)/chat");
  });
});
