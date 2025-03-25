import Page from "@/app/index"; // Adjust the import path as needed
import React from "react";
import { render, screen } from "@testing-library/react-native"; // Use react-native version
import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";

// Mocking the `useAuth` hook from `@clerk/clerk-expo`
jest.mock("@clerk/clerk-expo", () => ({
  useAuth: jest.fn(),
}));

jest.mock("expo-router", () => ({
  Redirect: jest.fn(() => null),
}));

describe("Page Component", () => {
  it("should redirect to home if user is signed in", () => {
    // Mocking `useAuth` to simulate the user being signed in
    (useAuth as jest.Mock).mockReturnValue({
      isSignedIn: true,
    });

    render(<Page />);

    // Expecting a Redirect to home
    expect(Redirect).toHaveBeenCalledWith(expect.objectContaining({ href: "./(root)/(tabs)/home" }), {});
  });

  it("should redirect to welcome if user is not signed in", () => {
    // Mocking `useAuth` to simulate the user being not signed in
    (useAuth as jest.Mock).mockReturnValue({
      isSignedIn: false,
    });

    render(<Page />);

    // Expecting a Redirect to welcome page
    expect(Redirect).toHaveBeenCalledWith(expect.objectContaining({ href: "./(auth)/wellcome" }), {});
  });
});
