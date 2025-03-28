import React from "react";
import { render } from "@testing-library/react-native";
import RunCard from "@/components/RunCard"; // Assuming the file is in the components directory
import { formatDate, formatTime } from "@/lib/utils"; // Mocking these
import { Run } from "@/types/type"; // Mock the types as well

// Mocking the required components
jest.mock("@expo/vector-icons/AntDesign", () => "AntDesign");
jest.mock("@expo/vector-icons/MaterialIcons", () => "MaterialIcons");

// Mocking the formatDate and formatTime functions
jest.mock("@/lib/utils", () => ({
  formatDate: jest.fn().mockReturnValue("Formatted Date"),
  formatTime: jest.fn().mockReturnValue("Formatted Time"),
}));

describe("RunCard Component", () => {
  const run: Run = {
    created_at: "2025-03-28T12:00:00Z",
    difficulty: "medium",
    elevation_gain: 500,
    length: 10,
    route_title: "Mountain Trail",
    address: "123 Trail Street",
    waypoints: [[10.0, 20.0]],
    is_scheduled: "2025-04-01T08:00:00Z",
    clerk_id: "12345",
    directions: "Head north and follow the trail.",
    is_deleted: false,
    is_saved: true,
    route_id: 123,
  };

  it("renders correctly with given run data", () => {
    const { getByText, getByTestId } = render(<RunCard run={run} />);

    // Check route title and address
    expect(getByText("Mountain Trail")).toBeTruthy();
    expect(getByText("123 Trail Street")).toBeTruthy();

    // Check formatted date
    expect(getByTestId("formatted-date")).toBeTruthy();

    // Check difficulty
    expect(getByText("medium")).toBeTruthy();

    // Check route length and elevation
    expect(getByText("10.00 Km")).toBeTruthy();
    expect(getByText("500 m")).toBeTruthy();

    // Check if the icons are rendered (just by testing the icon names)
    expect(getByTestId("AntDesign")).toBeTruthy();
    expect(getByTestId("MaterialIcons")).toBeTruthy();
  });

  it("handles scheduled runs correctly", () => {
    const { getByTestId } = render(<RunCard run={run} />);

    // Check for scheduled date text
    expect(getByTestId("formatted-date")).toBeTruthy();
  });

  it("renders correctly with missing scheduled date", () => {
    const runWithoutSchedule = { ...run, is_scheduled: "" };

    const { queryByTestId } = render(<RunCard run={runWithoutSchedule} />);

    // Check that scheduled date text does not appear
    expect(queryByTestId("formatted-date")).toBeNull();
  });
});
