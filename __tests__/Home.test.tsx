import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Home from "@/app/(root)/(tabs)/home";
import { useUser, useAuth } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import * as Notifications from "expo-notifications";
import { router } from "expo-router";

// documentation: https://docs.expo.dev/develop/unit-testing/

// Mock dependencies
jest.mock("@clerk/clerk-expo");
jest.mock("expo-location");
jest.mock("expo-notifications");
jest.mock("expo-router");

const mockUser = { firstName: "John", id: "123" };
const mockSignOut = jest.fn();

(useUser as jest.Mock).mockReturnValue({ user: mockUser });
(useAuth as jest.Mock).mockReturnValue({ signOut: mockSignOut });
(Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: "granted" });
(Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({ coords: { latitude: 32.009444, longitude: 34.882778 } });
(Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([{ name: "Test Street", region: "Test Region", formattedAddress: "Test Street, Test Region" }]);
(Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({ status: "granted" });

describe("Home Component", () => {
  // Test if the Home component renders correctly
  it("renders correctly", () => {
    const { getByText } = render(<Home />);
    expect(getByText("Welcome John👋")).toBeTruthy();
  });

  // Test if the weather information is displayed
  it("displays weather information", async () => {
    const { getByText } = render(<Home />);
    await waitFor(() => expect(getByText(/Now's weather in/)).toBeTruthy());
  });

  // Test if the sign-out button works
  it("signs out the user when sign-out button is pressed", () => {
    const { getByTestId } = render(<Home />);
    fireEvent.press(getByTestId("signOutButton"));
    expect(mockSignOut).toHaveBeenCalled();
  });

  // Test if the generator function works
  it("generates a route when the generate button is pressed", async () => {
    const { getByPlaceholderText, getByText } = render(<Home />);
    fireEvent.changeText(getByPlaceholderText("numbers only"), "5");
    fireEvent.press(getByText("Generate"));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/(root)/choose-run"));
  });

  // Test if the kind state changes when tabs are pressed
  it("changes kind state when tabs are pressed without saved", () => {
    const { getByText } = render(<Home />);
    fireEvent.press(getByText("Saved"));
    expect(getByText("No saved runs found")).toBeTruthy();
    fireEvent.press(getByText("Future"));
    expect(getByText("No future runs found")).toBeTruthy();
  });
});
