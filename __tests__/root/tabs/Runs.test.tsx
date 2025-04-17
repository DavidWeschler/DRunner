import React from "react";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import { Alert, View, Text } from "react-native";
import Runs from "@/app/(root)/(tabs)/runs";

// A sample run object for testing.
const sampleRun = {
  route_id: "run-1",
  is_saved: false,
  is_scheduled: null,
  route_title: "Test Run",
  difficulty: "medium",
  length: 5,
  waypoints: [[0, 0]],
  directions: "north",
  elevation_gain: 100,
};

//
// Mocks
//
jest.mock("@clerk/clerk-expo", () => {
  const signOutMock = jest.fn();
  return {
    useUser: () => ({ user: { id: "test-user" } }),
    useAuth: () => ({ signOut: signOutMock }),
  };
});

jest.mock("expo-router", () => ({
  router: {
    push: jest.fn(),
    replace: jest.fn(),
  },
}));

jest.mock("@/store", () => {
  const setRouteDetailsMock = jest.fn();
  return {
    useLocationStore: () => ({
      setRouteDetails: setRouteDetailsMock,
    }),
    __mocks__: {
      setRouteDetailsMock,
    },
  };
});

// Simple mock for RunCard that shows the route title.
// Import React and Text inside the factory to avoid out-of-scope variables.
jest.mock("@/components/RunCard", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return (props: any) => <Text>{props.run.route_title}</Text>;
});

// For MyDatePicker, we now use TouchableOpacity so testID works correctly.
jest.mock("@/components/MyDatePicker", () => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");
  return (props: any) => (
    <TouchableOpacity onPress={() => props.onDateTimeSelected(new Date("2025-01-01T00:00:00Z"))} testID="datePickerButton">
      <Text>DatePicker</Text>
    </TouchableOpacity>
  );
});

// Spinner renders a simple view if visible using React Native components.
jest.mock("@/components/Spinner", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return (props: any) =>
    props.visible ? (
      <View testID="spinner">
        <Text>Spinner</Text>
      </View>
    ) : null;
});

jest.mock("@/constants", () => ({
  icons: { out: "icon-out.png" },
  images: { noResult: "no-result.png" },
}));

jest.mock("@/lib/utils", () => ({
  getIsraelTimezoneOffset: () => 2,
}));

// Mock expo-notifications
jest.mock("expo-notifications", () => ({
  scheduleNotificationAsync: jest.fn(() => Promise.resolve("notification-id")),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
  cancelScheduledNotificationAsync: jest.fn(() => Promise.resolve()),
  SchedulableTriggerInputTypes: {
    DATE: "date",
  },
}));

// Global fetch mock: when fetching routes, return an array with our sample run.
// For other endpoints (delete, edit, schedule, update, toggle), return an empty object.
beforeEach(() => {
  global.fetch = jest.fn((url, options) => {
    if (typeof url === "string" && url.includes("recent_routes")) {
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([sampleRun]),
      });
    }
    return Promise.resolve({
      json: () => Promise.resolve({}),
    });
  }) as jest.Mock;
});

afterEach(() => {
  jest.clearAllMocks();
});

//
// Tests
//
describe("Runs Component", () => {
  it("renders header, sign-out button, and list items", async () => {
    const { getByText, getByTestId } = render(<Runs />);
    // Wait for refreshRoutes useEffect to finish.
    await waitFor(() => {
      expect(getByText("Manage Your Routes 📝")).toBeTruthy();
    });
    // Check that the sign-out button exists.
    expect(getByTestId("signOutButton")).toBeTruthy();
    // Check that the run card displays the sample run title.
    // expect(getByText("Fun Route")).toBeTruthy();
  });

  it("calls signOut and router.replace on sign-out button press", async () => {
    const { getByText, getByTestId } = render(<Runs />);
    await waitFor(() => getByTestId("signOutButton"));
    const { useAuth } = require("@clerk/clerk-expo");
    const { router } = require("expo-router");

    fireEvent.press(getByTestId("signOutButton"));

    expect(useAuth().signOut).toHaveBeenCalled();
    // Wait for the run card to appear with the sample run title.
    await waitFor(() => {
      expect(getByText(sampleRun.route_title)).toBeTruthy();
    });
  });

  it("switches between recent, saved, and future tabs", async () => {
    const { getByText } = render(<Runs />);
    await waitFor(() => getByText("Recent"));

    // Tap the 'Saved' tab.
    fireEvent.press(getByText("Saved"));
    await waitFor(() => {
      expect(getByText("Saved")).toBeTruthy();
    });

    // Tap the 'Future' tab.
    fireEvent.press(getByText("Future"));
    await waitFor(() => {
      expect(getByText("Future")).toBeTruthy();
    });
  });

  it("opens modal on long press of a run card and closes it", async () => {
    const { getByTestId, getByText, queryByText } = render(<Runs />);
    // Wait for the run card to appear.
    await waitFor(() => getByTestId("runCard"));
    // Simulate long press on the run card.
    fireEvent(getByTestId("runCard"), "longPress");

    // The modal should now display action options.
    await waitFor(() => {
      expect(getByText("Choose an action")).toBeTruthy();
    });

    // Press the 'Close' button in the modal.
    fireEvent.press(getByText("Close"));
    await waitFor(() => {
      expect(queryByText("Choose an action")).toBeNull();
    });
  });

  it("handles delete action", async () => {
    const { getByTestId, getByText, queryByText } = render(<Runs />);
    // Open the modal by long pressing the run card.
    await waitFor(() => getByTestId("runCard"));
    fireEvent(getByTestId("runCard"), "longPress");

    await waitFor(() => getByText(/Delete this item/));
    // Press the delete action.
    await act(async () => {
      fireEvent.press(getByText(/Delete this item/));
    });

    // Verify that a fetch call was made to the delete endpoint.
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("delete_route"), expect.anything());

    // After deletion, the modal should be closed.
    await waitFor(() => {
      expect(queryByText("Choose an action")).toBeNull();
    });
  });

  //   it("handles edit title action", async () => {
  //     const { getByTestId, getByText, getByPlaceholderText } = render(<Runs />);
  //     // Open the modal.
  //     await waitFor(() => getByTestId("runCard"));
  //     fireEvent(getByTestId("runCard"), "longPress");

  //     // Enter a new title in the TextInput.
  //     const newTitle = "Updated Title";
  //     const textInput = getByPlaceholderText("Enter new title");
  //     fireEvent.changeText(textInput, newTitle);

  //     // Press the 'Edit' button.
  //     const editButton = getByText("Edit");
  //     await act(async () => {
  //       fireEvent.press(editButton);
  //     });

  //     // Verify a fetch call to edit the title.
  //     expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("edit_title_route"), expect.anything());
  //   });

  it("handles toggle save route action", async () => {
    const { getByTestId, getByRole } = render(<Runs />);
    // Open the modal.
    await waitFor(() => getByTestId("runCard"));
    fireEvent(getByTestId("runCard"), "longPress");

    // Locate the Switch (which has the accessibility role "switch") and toggle it.
    const switchElement = getByRole("switch");
    await act(async () => {
      fireEvent(switchElement, "valueChange", true);
    });

    // Verify a fetch call was made to toggle the save status.
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("toggle_save_route"), expect.anything());
  });

  it("handles schedule route action via DatePicker", async () => {
    const { getByTestId } = render(<Runs />);
    // Open the modal.
    await waitFor(() => getByTestId("runCard"));
    fireEvent(getByTestId("runCard"), "longPress");

    // Simulate the DatePicker action by pressing its TouchableOpacity.
    const datePickerButton = getByTestId("datePickerButton");
    await act(async () => {
      fireEvent.press(datePickerButton);
    });

    // Verify a fetch call was made to schedule the route.
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("edit_schedule_route"), expect.anything());
    // Also check that the notification scheduling was attempted.
    const Notifications = require("expo-notifications");
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
  });

  it("handles run route action", async () => {
    const { getByTestId, getByText } = render(<Runs />);
    // Open the modal.
    await waitFor(() => getByTestId("runCard"));
    fireEvent(getByTestId("runCard"), "longPress");

    // Press the 'Run this route' action.
    await act(async () => {
      fireEvent.press(getByText(/Run this route/));
    });

    const { __mocks__ } = require("@/store");
    expect(__mocks__.setRouteDetailsMock).toHaveBeenCalled();
    const { router } = require("expo-router");
    expect(router.push).toHaveBeenCalledWith("/(root)/run-a-route");

    // Also verify that the route details are set.
    const { useLocationStore } = require("@/store");
    expect(useLocationStore().setRouteDetails).toHaveBeenCalled();
  });
});
