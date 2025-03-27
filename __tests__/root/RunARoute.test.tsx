// RunARoute.test.tsx
import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import RunRoute from "@/app/(root)/run-a-route";
import { useLocationStore } from "@/store";
import { useRouter } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";

// --- Mocks ---

// Mock constants.
jest.mock("@/constants", () => ({
  icons: { backArrow: "mocked-back-arrow" },
}));

// Mock Expo Router.
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));

// Mock zustand store.
jest.mock("@/store", () => ({
  useLocationStore: jest.fn(),
}));

// Mock react-native-gesture-handler.
jest.mock("react-native-gesture-handler", () => {
  const Actual = jest.requireActual("react-native-gesture-handler");
  return {
    ...Actual,
    GestureHandlerRootView: ({ children }: { children: React.ReactNode }) => children,
    State: { ...Actual.State, UNDETERMINED: "UNDETERMINED" },
    default: { install: jest.fn() },
  };
});

// Mock Map component (used in RunRoute) to a simple view.
jest.mock("@/components/Map", () => {
  return () => <View testID="mock-map" />;
});

// Mock CustomButton component.
jest.mock("@/components/CustomButton", () => {
  return ({ title, onPressIn }: { title: string; onPressIn: () => void }) => (
    <TouchableOpacity onPressIn={onPressIn}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
});

// Mock BottomSheet and its sub-component View using forwardRef.
jest.mock("@gorhom/bottom-sheet", () => {
  const React = require("react");
  const BottomSheet = React.forwardRef(({ children }: { children: React.ReactNode }, ref: React.Ref<any>) => <>{children}</>);
  BottomSheet.displayName = "BottomSheet";
  BottomSheet.View = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  return BottomSheet;
});

// --- Tests ---

describe("RunRoute", () => {
  let storeState: any;
  let router: any;

  beforeEach(() => {
    jest.useFakeTimers();

    // Set up a default store state.
    storeState = {
      mapTheme: "standard",
      routeDetalis: {
        pins: [],
        directions: [],
        difficulty: "medium",
        length: 5,
        elevationGain: 100,
      },
      callReset: false,
      setCallReset: jest.fn(),
      setRouteDetails: jest.fn(),
      setMode: jest.fn(),
      setUserLocation: jest.fn(),
      setDestinationLocation: jest.fn(),
      setMapTheme: jest.fn(),
      setLengthInput: jest.fn(),
      setStartPointInput: jest.fn(),
      setStartAddress: jest.fn(),
      setEndPointInput: jest.fn(),
      setEndAddress: jest.fn(),
      setDifficultyInput: jest.fn(),
      setHadasInp: jest.fn(),
    };
    (useLocationStore as unknown as jest.Mock).mockReturnValue(storeState);

    // Create a fake router that includes a toString method.
    router = {
      back: jest.fn(),
      push: jest.fn(),
      replace: jest.fn(),
      toString: () => "router",
    };
    (useRouter as jest.Mock).mockReturnValue(router);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  //   test("renders route details and default lap text", () => {
  //     const { getByText } = render(<RunRoute />);
  //     expect(getByText("Diff: medium")).toBeTruthy();
  //     expect(getByText("Length: 5 km")).toBeTruthy();
  //     expect(getByText("Elev: 100 m")).toBeTruthy();
  //     expect(getByText("No laps recorded")).toBeTruthy();
  //   });

  //   test("navigates back when 'Go Back' is pressed", () => {
  //     const { getByText } = render(<RunRoute />);
  //     const goBackButton = getByText("Go Back");
  //     fireEvent.press(goBackButton);
  //     expect(router.back).toHaveBeenCalled();
  //   });

  //   test("start, pause and resume button toggles correctly", () => {
  //     const { getByText } = render(<RunRoute />);
  //     // Initially, the "Start" button is visible.
  //     const startButton = getByText("Start");
  //     fireEvent.press(startButton);
  //     // After starting, the button should display "Pause".
  //     expect(getByText("Pause")).toBeTruthy();

  //     // Press "Pause" to pause the run.
  //     fireEvent.press(getByText("Pause"));
  //     expect(getByText("Resume")).toBeTruthy();

  //     // Press "Resume" to restart the timer.
  //     fireEvent.press(getByText("Resume"));
  //     expect(getByText("Pause")).toBeTruthy();
  //   });

  //   test("records lap when Lap button is pressed while running", () => {
  //     const { getByText, queryByText } = render(<RunRoute />);
  //     // Start the run.
  //     fireEvent.press(getByText("Start"));
  //     // Advance time by 2 seconds.
  //     act(() => {
  //       jest.advanceTimersByTime(2000);
  //     });
  //     // The second button should show "Lap" when running.
  //     const lapButton = getByText("Lap");
  //     fireEvent.press(lapButton);
  //     // Verify that a lap entry (e.g., "Lap 1:") is rendered.
  //     expect(queryByText(/Lap 1:/)).toBeTruthy();
  //   });

  //   test("resets the run when Reset button is pressed while paused", () => {
  //     const { getByText } = render(<RunRoute />);
  //     fireEvent.press(getByText("Start"));
  //     act(() => {
  //       jest.advanceTimersByTime(2000);
  //     });
  //     // Pause the run.
  //     fireEvent.press(getByText("Pause"));
  //     expect(getByText("Resume")).toBeTruthy();
  //     // Now the second button should show "Reset".
  //     fireEvent.press(getByText("Reset"));
  //     // After reset, the timer should display "00:00:00".
  //     expect(getByText("00:00:00")).toBeTruthy();
  //   });

  //   test("calls setCallReset and navigates home when End Run is pressed", () => {
  //     const { getByText } = render(<RunRoute />);
  //     const endRunButton = getByText("End Run");
  //     fireEvent(endRunButton, "pressIn");
  //     expect(storeState.setCallReset).toHaveBeenCalledWith(true);
  //     expect(router.push).toHaveBeenCalledWith("/home");
  //   });
});
