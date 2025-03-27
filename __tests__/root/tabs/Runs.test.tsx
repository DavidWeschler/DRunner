import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import Runs from "@/app/(root)/(tabs)/runs";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";

jest.mock("@clerk/clerk-expo", () => ({
  useUser: jest.fn(),
  useAuth: jest.fn(),
}));

jest.mock("expo-router", () => ({ router: { replace: jest.fn() } }));

jest.mock("@/components/MyDatePicker", () => "MyDateTimePicker");

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe("Runs Component", () => {
  beforeEach(() => {
    (useUser as jest.Mock).mockReturnValue({
      user: { id: "test-user-id" },
    });
    (useAuth as jest.Mock).mockReturnValue({ signOut: jest.fn() });

    mockFetch.mockResolvedValue({ json: jest.fn().mockResolvedValue([]) });
  });

  it("renders correctly", async () => {
    const { getByText } = render(<Runs />);
    await waitFor(() => getByText("Manage Your Routes 📝"));
    expect(getByText("Manage Your Routes 📝")).toBeTruthy();
  });

  it("triggers sign out and redirects", async () => {
    const { getByTestId } = render(<Runs />);
    const signOutButton = getByTestId("signOutButton");

    fireEvent.press(signOutButton);
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/(auth)/sign-in"));
  });

  //   it("opens modal on long press", () => {
  //     const { getByText, getByTestId } = render(<Runs />);
  //     fireEvent.press(getByText("Recent"));
  //     fireEvent(getByTestId("runCard"), "onLongPress");
  //     expect(getByText("Choose an action")).toBeTruthy();
  //   });

  //   it("deletes a route", async () => {
  //     const { getByText, getByTestId } = render(<Runs />);
  //     fireEvent.press(getByText("Recent"));
  //     fireEvent(getByTestId("runCard"), "onLongPress");
  //     fireEvent.press(getByText("🗑️   Delete this item"));
  //     await waitFor(() => expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/delete_route"), expect.any(Object)));
  //   });

  //   it("toggles save route", async () => {
  //     const { getByText, getByTestId } = render(<Runs />);
  //     fireEvent.press(getByText("Recent"));
  //     fireEvent(getByTestId("runCard"), "onLongPress");
  //     fireEvent(getByTestId("saveSwitch"), "onValueChange");
  //     await waitFor(() => expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/toggle_save_route"), expect.any(Object)));
  //   });

  //   it("edits route title", async () => {
  //     const { getByText, getByPlaceholderText, getByTestId } = render(<Runs />);
  //     fireEvent.press(getByText("Recent"));
  //     fireEvent(getByTestId("runCard"), "onLongPress");
  //     fireEvent.changeText(getByPlaceholderText("Enter new title"), "New Title");
  //     fireEvent.press(getByText("Edit"));
  //     await waitFor(() => expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/edit_title_route"), expect.any(Object)));
  //   });

  //   it("schedules a route", async () => {
  //     const { getByText, getByTestId } = render(<Runs />);
  //     fireEvent.press(getByText("Recent"));
  //     fireEvent(getByTestId("runCard"), "onLongPress");
  //     fireEvent.press(getByText("Schedule route"));
  //     await waitFor(() => expect(fetch).toHaveBeenCalledWith(expect.stringContaining("/edit_schedule_route"), expect.any(Object)));
  //   });
});
