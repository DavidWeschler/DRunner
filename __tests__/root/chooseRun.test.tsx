import React from "react";
import { Alert } from "react-native";
import { render, fireEvent, waitFor, act } from "@testing-library/react-native";
import ChooseRun from "@/app/(root)/choose-run";

// --- Mocks for external dependencies ---

// Avoid errors from expo-font
jest.mock("expo-font", () => ({
  loadAsync: jest.fn(),
}));

// Provide a dummy Swiper that simply renders its children
jest.mock("react-native-swiper", () => {
  const React = require("react");
  const { View } = require("react-native");
  return (props: { children: React.ReactNode }) => <View testID="swiper">{props.children}</View>;
});

// Mock the Map component to render simple text, importing Text inside the factory
jest.mock("@/components/Map", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return ({ theme, pins, directions }: { theme: string; pins: any[]; directions?: string[] }) => (
    <Text testID="map">
      {theme} {pins.length} {directions ? directions.join(",") : ""}
    </Text>
  );
});

// Mock Spinner to render text when visible
jest.mock("@/components/Spinner", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return ({ visible }: { visible: boolean }) => (visible ? <Text testID="spinner">Spinner</Text> : null);
});

// Mock MyDateTimePicker to simulate selecting a date when pressed
jest.mock("@/components/MyDatePicker", () => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");
  return ({ onDateTimeSelected }: { onDateTimeSelected: (date: Date) => void }) => (
    <TouchableOpacity testID="dateTimePicker" onPress={() => onDateTimeSelected(new Date("2023-01-01T00:00:00Z"))}>
      <Text>DatePicker</Text>
    </TouchableOpacity>
  );
});

// Mock Entypo icon component
jest.mock("@expo/vector-icons/Entypo", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return (props: { [key: string]: any }) => (
    <Text testID="entypo" {...props}>
      Icon
    </Text>
  );
});

// Mock constants (e.g. icons)
jest.mock("@/constants", () => ({
  icons: { backArrow: "backArrow" },
}));

// --- Mocks for hooks and algorithms ---

// Instead of using an out-of-scope variable, define defaultStore inside the module factory.
jest.mock("@/store", () => {
  const defaultStore = {
    length: 5,
    startPoint: { latitude: 37.0, longitude: -122.0 },
    endPoint: null, // circular route by default
    difficulty: "easy",
    setLengthInput: jest.fn(),
    setStartPointInput: jest.fn(),
    setEndPointInput: jest.fn(),
    setDifficultyInput: jest.fn(),
    callReset: false,
    setCallReset: jest.fn(),
    mapTheme: "standard",
    setRouteDetails: jest.fn(),
    mode: "walking",
  };
  return {
    useLocationStore: jest.fn((selector) => {
      return selector ? selector(defaultStore) : defaultStore;
    }),
  };
});

// Mock expo-router's useRouter hook
const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock Clerk's useUser hook
jest.mock("@clerk/clerk-react", () => ({
  useUser: () => ({ user: { id: "test-user" } }),
}));

// Mock expo-notifications
jest.mock("expo-notifications", () => ({
  scheduleNotificationAsync: jest.fn(() => Promise.resolve()),
}));

// Mock CircularAlgorithm: returns three routes for circular routing
jest.mock("../../lib/circle_algorithm", () =>
  jest.fn(() =>
    Promise.resolve([
      {
        length: 10,
        elevationGain: 100,
        waypoints: [[-122, 37]],
        directions: "Turn left\nTurn right",
      },
      {
        length: 12,
        elevationGain: 120,
        waypoints: [[-122, 37]],
        directions: "Go straight\nTurn left",
      },
      {
        length: 14,
        elevationGain: 140,
        waypoints: [[-122, 37]],
        directions: "Turn right\nGo straight",
      },
    ])
  )
);

// Mock Line_Algorithm: returns three routes for straight routing
jest.mock("../../lib/line_algorithm", () =>
  jest.fn(() =>
    Promise.resolve([
      {
        length: 5,
        elevationGain: 50,
        waypoints: [[-122, 37]],
        directions: "Start\nFinish",
      },
      {
        length: 5,
        elevationGain: 50,
        waypoints: [[-122, 37]],
        directions: "Start\nFinish",
      },
      {
        length: 5,
        elevationGain: 50,
        waypoints: [[-122, 37]],
        directions: "Start\nFinish",
      },
    ])
  )
);

// --- Helper: Override global.fetch ---
const originalFetch = global.fetch;

describe("ChooseRun Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("renders and fetches a circular route when endPoint is null", async () => {
    // Simulate fetch for getAddressFromPoint
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ address: { road: "Main St", city: "Test City" } }),
    });
    const { queryByText, getByText } = render(<ChooseRun />);
    // Wait for loading to finish (spinner no longer visible)
    await waitFor(() => {
      expect(queryByText("Spinner")).toBeNull();
    });
    // Assert that the component rendered correctly
    expect(getByText("Select a route 🏃‍♂️‍➡️")).toBeTruthy();
  });

  // Test straight route behavior by overriding the store temporarily.
  it("handles straight route when endPoint is provided", async () => {
    // Override store to simulate a straight route (endPoint provided)
    const defaultStore = {
      length: 5,
      startPoint: { latitude: 37.0, longitude: -122.0 },
      endPoint: null,
      difficulty: "easy",
      setLengthInput: jest.fn(),
      setStartPointInput: jest.fn(),
      setEndPointInput: jest.fn(),
      setDifficultyInput: jest.fn(),
      callReset: false,
      setCallReset: jest.fn(),
      mapTheme: "standard",
      setRouteDetails: jest.fn(),
      mode: "walking",
    };
    const straightStore = {
      ...defaultStore,
      endPoint: { latitude: 38.0, longitude: -123.0 },
    };

    // Override the store temporarily
    require("@/store").useLocationStore.mockImplementation((selector: (store: any) => any) => {
      return selector ? selector(straightStore) : straightStore;
    });

    // Simulate fetch for getAddressFromPoint
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ address: { road: "Main St", city: "Test City" } }),
    });

    // Render the component and wait for asynchronous updates
    const rendered = render(<ChooseRun />);
    await waitFor(() => {
      // Check that the spinner is gone, indicating that loading is finished.
      expect(rendered.queryByText("Spinner")).toBeNull();
    });

    // (Optionally, add more assertions about how the component rendered for a straight route.)

    // Reset store to default after this test.
    require("@/store").useLocationStore.mockImplementation((selector: (store: any) => any) => {
      return selector ? selector(defaultStore) : defaultStore;
    });
  });

  it("handles back button press", async () => {
    // The back button is the first TouchableOpacity (with an Image inside)
    const { getAllByRole, getByTestId } = render(<ChooseRun />);
    const backButton = getByTestId("backButton");
    // Press the first button (back arrow)
    await act(async () => {
      fireEvent.press(backButton);
    });
    // defaultStore.setCallReset comes from our store mock
    const store = require("@/store").useLocationStore();
    expect(store.setCallReset).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/home");
  });

  it("handles saving a route (new save)", async () => {
    // Simulate successful addRunToDatabase via fetch for saving
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });
    const { getAllByTestId, getByText } = render(<ChooseRun />);
    const saveButtons = getAllByTestId("entypo");
    // Press the save button for the first route (easy)
    await act(async () => {
      fireEvent.press(saveButtons[0]);
    });
    // Expect banner text to be shown for successful save
    await waitFor(() => {
      expect(getByText("Route saved successfully!")).toBeTruthy();
    });
  });

  it("alerts when trying to save an already saved route", async () => {
    const alertSpy = jest.spyOn(Alert, "alert");
    const { getAllByTestId } = render(<ChooseRun />);
    const saveButtons = getAllByTestId("entypo");
    // First save attempt to mark the route as saved
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });
    await act(async () => {
      fireEvent.press(saveButtons[0]);
    });
    // Second attempt should trigger an alert because it is already saved
    await act(async () => {
      fireEvent.press(saveButtons[0]);
    });
    expect(alertSpy).toHaveBeenCalledWith("Route already saved", "You have already saved this route.");
  });

  // it("handles scheduling a route (new schedule)", async () => {
  //   // Simulate successful addRunToDatabase for scheduling
  //   (global.fetch as jest.Mock).mockResolvedValueOnce({
  //     ok: true,
  //     json: async () => ({}),
  //   });
  //   const { getByTestId, getByText } = render(<ChooseRun />);
  //   const datePicker = getByTestId("dateTimePicker");
  //   await act(async () => {
  //     fireEvent.press(datePicker);
  //     // Wait a tick to flush pending promises (e.g. state updates and timeouts)
  //     await new Promise((resolve) => setTimeout(resolve, 0));
  //   });
  //   await waitFor(() => {
  //     expect(getByText("Route scheduled successfully!")).toBeTruthy();
  //   });
  // });

  // it("alerts when trying to schedule an already scheduled route", async () => {
  //   const alertSpy = jest.spyOn(Alert, "alert");
  //   const { getByTestId } = render(<ChooseRun />);
  //   // First scheduling attempt
  //   (global.fetch as jest.Mock).mockResolvedValueOnce({
  //     ok: true,
  //     json: async () => ({}),
  //   });
  //   const datePicker = getByTestId("dateTimePicker");
  //   await act(async () => {
  //     fireEvent.press(datePicker);
  //   });
  //   // Second attempt should trigger alert for already scheduled route
  //   await act(async () => {
  //     fireEvent.press(datePicker);
  //   });
  //   expect(alertSpy).toHaveBeenCalledWith("Route already scheduled!", "You Can See Your Scheduled Routes In The Manage Section.");
  // });

  it("handles Start Run press", async () => {
    // Simulate that the route is not already saved or scheduled so that addRunToDatabase is called
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });
    const { getByText } = render(<ChooseRun />);
    const startRunButton = getByText("Start Run");
    await act(async () => {
      fireEvent.press(startRunButton);
    });
    const store = require("@/store").useLocationStore();
    expect(store.setRouteDetails).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/run-a-route");
  });

  // it("handles error in fetchRoute and navigates home", async () => {
  //   const alertSpy = jest.spyOn(Alert, "alert");
  //   // Force an error by having CircularAlgorithm reject
  //   jest.doMock("../../lib/circle_algorithm", () => jest.fn(() => Promise.reject(new Error("Test error"))));
  //   // Render the component
  //   const rendered = render(<ChooseRun />);
  //   // Flush pending promises by waiting a tick
  //   await act(async () => {
  //     await new Promise((resolve) => setTimeout(resolve, 0));
  //   });
  //   // Now assert that the error alert and navigation were triggered
  //   await waitFor(() => {
  //     expect(alertSpy).toHaveBeenCalledWith("We couldn't generate your route", "Please try again later. 😶‍🌫️");
  //     expect(mockPush).toHaveBeenCalledWith("/home");
  //   });
  // });
});
