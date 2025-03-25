import React from "react";
import { render, screen } from "@testing-library/react-native";
import NotFoundScreen from "@/app/+not-found"; // Adjust the path as needed

jest.mock("expo-router", () => ({
  Link: ({ href, children }: { href: string; children: React.ReactNode }) => <a href={href}>{children}</a>,
  Stack: {
    Screen: () => null,
  },
}));

describe("NotFoundScreen", () => {
  it("renders the 'This screen doesn't exist.' message", () => {
    render(<NotFoundScreen />);
    expect(screen.getByText("This screen doesn't exist.")).toBeTruthy();
  });

  it("renders a link to the home screen", () => {
    render(<NotFoundScreen />);
    expect(screen.getByText("Go to home screen!")).toBeTruthy();
  });
});
