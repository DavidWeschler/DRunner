import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Map from "@/components/Map";
import { useLocationStore } from "@/store";
import * as Location from "expo-location";

jest.mock("expo-location", () => ({
  requestForegroundPermissionsAsync: jest.fn(() => Promise.resolve({ status: "granted", expires: "never", granted: true, canAskAgain: true })) as jest.MockedFunction<typeof Location.requestForegroundPermissionsAsync>,
}));

jest.mock("@/store", () => ({
  useLocationStore: jest.fn(() => ({
    startPoint: null,
    endPoint: null,
    setStartPointInput: jest.fn(),
    setEndPointInput: jest.fn(),
    startAddress: "",
    setStartAddress: jest.fn(),
    endAddress: "",
    setEndAddress: jest.fn(),
  })),
}));

describe("Map Component", () => {
  const mockPins = [
    { latitude: 37.7749, longitude: -122.4194 },
    { latitude: 34.0522, longitude: -118.2437 },
  ];
  const mockDirections = ["_p~iF~ps|U_ulLnnqC_mqNvxq`@"];

  it("renders correctly", () => {
    const { getByTestId } = render(<Map theme="standard" pins={mockPins} directions={mockDirections} />);
    expect(getByTestId("map-view")).toBeTruthy();
  });

  it("displays markers for start and end locations", () => {
    const { getByTestId } = render(<Map theme="standard" pins={mockPins} directions={mockDirections} />);
    expect(getByTestId("marker-start")).toBeTruthy();
    expect(getByTestId("marker-end")).toBeTruthy();
  });

  it("requests location permissions on long press", async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: "granted" });

    const { getByTestId } = render(<Map theme="standard" pins={mockPins} directions={mockDirections} />);
    const mapView = getByTestId("map-view");

    fireEvent(mapView, "longPress", { nativeEvent: { coordinate: { latitude: 40.7128, longitude: -74.006 } } });

    await waitFor(() => {
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
    });
  });

  it("does not proceed if location permission is denied", async () => {
    (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValueOnce({ status: "denied" });

    const { getByTestId } = render(<Map theme="standard" pins={mockPins} directions={mockDirections} />);
    const mapView = getByTestId("map-view");

    fireEvent(mapView, "longPress", { nativeEvent: { coordinate: { latitude: 40.7128, longitude: -74.006 } } });

    await waitFor(() => {
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
    });
  });
});
