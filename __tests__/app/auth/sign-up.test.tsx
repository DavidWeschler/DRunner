import React from "react";
import { fireEvent, render, waitFor } from "@testing-library/react-native";
import SignUp from "@/app/(auth)/sign-up";
import { useSignUp } from "@clerk/clerk-expo";

import { Alert } from "react-native";
import { router } from "expo-router";

jest.spyOn(Alert, "alert");

const mockPush = jest.fn();
jest.mock("expo-router", () => ({
  useRouter: () => ({ push: mockPush }),
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@clerk/clerk-expo", () => ({
  useSignIn: jest.fn(),
  useSignUp: jest.fn(() => ({
    isLoaded: true,
    signUp: {
      create: jest.fn(),
      prepareEmailAddressVerification: jest.fn(),
      attemptEmailAddressVerification: jest.fn(),
    },
    setActive: jest.fn(),
  })),
  useSSO: jest.fn(() => ({
    isLoaded: true,
    startSSOFlow: jest.fn(),
  })),
}));

// Mock expo-router to provide both useRouter and Link
jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("@/lib/fetch", () => ({
  fetchAPI: jest.fn(() => Promise.resolve()),
}));

describe("SignUp Component", () => {
  const mockCreate = jest.fn();
  const mockPrepareVerification = jest.fn();
  const mockAttemptVerification = jest.fn();
  const mockSetActive = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // By default, assume isLoaded is true
    (useSignUp as jest.Mock).mockReturnValue({
      setActive: mockSetActive,
      isLoaded: true,
      signUp: {
        create: mockCreate,
        prepareEmailAddressVerification: mockPrepareVerification,
        attemptEmailAddressVerification: mockAttemptVerification,
      },
    });
  });

  it("shows an alert if sign-up fails", async () => {
    mockCreate.mockRejectedValue({
      errors: [{ longMessage: "Invalid email address" }],
    });

    const { getByPlaceholderText, getByText } = render(<SignUp />);
    fireEvent.changeText(getByPlaceholderText("Enter your email"), "bad-email");
    fireEvent.changeText(getByPlaceholderText("Enter your name"), "John");
    fireEvent.changeText(getByPlaceholderText("Enter your password"), "123456");

    fireEvent.press(getByText("Sign Up"));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Error", "Invalid email address");
    });
  });

  it("shows verification error on failed code", async () => {
    mockCreate.mockResolvedValue({});
    mockPrepareVerification.mockResolvedValue({});
    mockAttemptVerification.mockResolvedValue({ status: "incomplete" });

    const { getByPlaceholderText, getByText, queryByText } = render(<SignUp />);
    fireEvent.changeText(getByPlaceholderText("Enter your email"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("Enter your name"), "John");
    fireEvent.changeText(getByPlaceholderText("Enter your password"), "password123");
    fireEvent.press(getByText("Sign Up"));

    await waitFor(() => expect(queryByText("Verification")).toBeTruthy());

    fireEvent.changeText(getByPlaceholderText("12345"), "000000");
    fireEvent.press(getByText("Verify Email"));

    await waitFor(() => {
      expect(getByText("Verification failed. Please try again.")).toBeTruthy();
    });
  });

  it("handles error thrown during email verification", async () => {
    mockAttemptVerification.mockRejectedValue({
      errors: [{ longMessage: "Code expired" }],
    });

    const { getByPlaceholderText, getByText } = render(<SignUp />);
    fireEvent.press(getByText("Sign Up"));
    await waitFor(() => getByText("Verification"));

    fireEvent.changeText(getByPlaceholderText("12345"), "123456");
    fireEvent.press(getByText("Verify Email"));

    await waitFor(() => {
      expect(getByText("Code expired")).toBeTruthy();
    });
  });

  //   it("navigates to home when clicking success modal button", async () => {
  //     mockAttemptVerification.mockResolvedValue({
  //       status: "complete",
  //       createdUserId: "user123",
  //       createdSessionId: "session123",
  //     });

  //     const { getByText, getByPlaceholderText } = render(<SignUp />);
  //     fireEvent.press(getByText("Sign Up"));

  //     await waitFor(() => getByText("Verification"));
  //     fireEvent.changeText(getByPlaceholderText("12345"), "123456");
  //     fireEvent.press(getByText("Verify Email"));

  //     await waitFor(() => getByText("Verified"));
  //     fireEvent.press(getByText("Browse Home"));

  //     expect(mockPush).toHaveBeenCalledWith(`/(root)/(tabs)/home`);
  //   });

  it("updates verification.code when user types", async () => {
    const { getByText, getByPlaceholderText } = render(<SignUp />);
    fireEvent.press(getByText("Sign Up"));
    await waitFor(() => getByText("Verification"));

    const codeInput = getByPlaceholderText("12345");
    fireEvent.changeText(codeInput, "987654");

    expect(codeInput.props.value).toBe("987654");
  });

  it("renders form fields and button", () => {
    const { getByPlaceholderText, getByText } = render(<SignUp />);
    expect(getByPlaceholderText("Enter your email")).toBeTruthy();
    expect(getByPlaceholderText("Enter your name")).toBeTruthy();
    expect(getByPlaceholderText("Enter your password")).toBeTruthy();
    expect(getByText("Sign Up")).toBeTruthy();
  });

  it("handles user sign-up and shows verification modal", async () => {
    mockCreate.mockResolvedValue({});
    mockPrepareVerification.mockResolvedValue({});

    const { getByPlaceholderText, getByText, queryByText } = render(<SignUp />);
    fireEvent.changeText(getByPlaceholderText("Enter your email"), "test@example.com");
    fireEvent.changeText(getByPlaceholderText("Enter your name"), "John");
    fireEvent.changeText(getByPlaceholderText("Enter your password"), "password123");

    fireEvent.press(getByText("Sign Up"));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith({
        emailAddress: "test@example.com",
        password: "password123",
      });
      expect(queryByText("Verification")).toBeTruthy();
    });
  });

  it("shows success modal after verifying code", async () => {
    mockAttemptVerification.mockResolvedValue({
      status: "complete",
      createdUserId: "user123",
      createdSessionId: "session123",
    });

    const { getByText, getByPlaceholderText } = render(<SignUp />);

    fireEvent.press(getByText("Sign Up"));
    await waitFor(() => expect(getByText("Verification")).toBeTruthy());

    fireEvent.changeText(getByPlaceholderText("12345"), "123456");
    fireEvent.press(getByText("Verify Email"));

    await waitFor(() => {
      expect(mockAttemptVerification).toHaveBeenCalledWith({ code: "123456" });
      expect(mockSetActive).toHaveBeenCalledWith({ session: "session123" });
    });
  });
});
