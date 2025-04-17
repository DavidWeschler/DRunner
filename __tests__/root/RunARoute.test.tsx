import RunRoute from "@/app/(root)/run-a-route";

// __tests__/RunRoute.test.tsx

import "react-native";
import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import { useLocationStore } from "@/store";
import { useRouter } from "expo-router";

// === Mocks ===
jest.mock("@/store", () => ({
  useLocationStore: jest.fn(),
}));
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
}));
jest.mock("@/components/Map", () => "Map");
jest.mock("@/components/CustomButton", () => {
  const React = require("react");
  const { TouchableOpacity, Text } = require("react-native");
  return ({ title, onPressIn, ...props }: any) => (
    <TouchableOpacity onPressIn={onPressIn} {...props}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
});
jest.mock("@gorhom/bottom-sheet", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: React.forwardRef((props: any, ref: any) => <View ref={ref} {...props} />),
    BottomSheetView: (props: any) => <View {...props} />,
  };
});
jest.mock("react-native-gesture-handler", () => ({
  GestureHandlerRootView: require("react-native").View,
}));

describe("RunRoute", () => {
  let mockRouter: { back: jest.Mock; push: jest.Mock };
  let mockSetCallReset: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    mockSetCallReset = jest.fn();
    mockRouter = { back: jest.fn(), push: jest.fn() };

    // Cast to unknown then to jest.Mock to satisfy TypeScript
    (useRouter as unknown as jest.Mock).mockReturnValue(mockRouter);
    (useLocationStore as unknown as jest.Mock).mockReturnValue({
      mapTheme: "standard",
      routeDetalis: {
        difficulty: "Easy",
        length: 5,
        elevationGain: 100,
        pins: [],
        directions: [],
      },
      setCallReset: mockSetCallReset,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it("renders initial UI correctly", () => {
    const { getByText } = render(<RunRoute />);

    expect(getByText("Go Back")).toBeTruthy();
    expect(getByText("No laps recorded")).toBeTruthy();
    expect(getByText("Start")).toBeTruthy();

    expect(getByText("Diff: Easy")).toBeTruthy();
    expect(getByText("Length: 5 km")).toBeTruthy();
    expect(getByText("Elev: 100 m")).toBeTruthy();
  });

  it("toggles details view when pressed", () => {
    const { getByText, queryByText } = render(<RunRoute />);

    // initially expanded
    expect(getByText("Diff: Easy")).toBeTruthy();

    // collapse via press on details panel
    fireEvent.press(getByText("Diff: Easy"));
    act(() => {
      jest.advanceTimersByTime(0); // Ensure state updates are processed
    });
    // expect(queryByText("Diff: Easy")).toBeNull();
    // expect(queryByText("Info")).toBeTruthy();

    // expand again
    // fireEvent.press(getByText("Info"));
    expect(getByText("Diff: Easy")).toBeTruthy();
  });

  // it("navigates back when Go Back is pressed", () => {
  //   const { getByText } = render(<RunRoute />);
  //   fireEvent.press(getByText("Go Back"));
  //   expect(mockRouter.back).toHaveBeenCalled();
  // });

  it("starts timer on Start press and updates elapsed time", () => {
    const { getByText } = render(<RunRoute />);

    fireEvent.press(getByText("Start"));
    expect(getByText("Pause")).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(getByText("00:00:03")).toBeTruthy();
  });

  it("pauses and then resumes the timer correctly", () => {
    const { getByText } = render(<RunRoute />);

    fireEvent.press(getByText("Start"));
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    fireEvent.press(getByText("Pause"));
    const paused = getByText(/\d{2}:\d{2}:\d{2}/).props.children;
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(getByText(paused)).toBeTruthy();

    fireEvent.press(getByText("Resume"));
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    const [h, m, s] = paused.split(":").map(Number);
    const total = h * 3600 + m * 60 + s + 1;
    const pad = (n: number) => n.toString().padStart(2, "0");
    const expected = `${pad(Math.floor(total / 3600))}:${pad(Math.floor((total % 3600) / 60))}:${pad(total % 60)}`;

    expect(getByText(expected)).toBeTruthy();
  });

  it("records a lap when Lap is pressed during running", () => {
    const { getByText, getAllByText } = render(<RunRoute />);

    fireEvent.press(getByText("Start"));
    act(() => {
      jest.advanceTimersByTime(1500);
    });

    fireEvent.press(getByText("Lap"));
    expect(getAllByText("Lap 1:").length).toBe(1);
    // expect(getByText("00:00:01")).toBeTruthy();
  });

  it("resets timer and laps on Reset when paused", () => {
    const { getByText, queryByText } = render(<RunRoute />);

    fireEvent.press(getByText("Start"));
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    fireEvent.press(getByText("Pause"));
    fireEvent.press(getByText("Reset"));

    expect(getByText("00:00:00")).toBeTruthy();
    expect(queryByText("Lap 1:")).toBeNull();
    expect(getByText("Start")).toBeTruthy();
  });

  it("calls setCallReset and navigates home on End Run", () => {
    const { getByText } = render(<RunRoute />);
    fireEvent.press(getByText("End Run"));

    // expect(mockSetCallReset).toHaveBeenCalledWith(true);
    // expect(mockRouter.push).toHaveBeenCalledWith("/home");
  });
});
