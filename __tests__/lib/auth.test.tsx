import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";
import { fetchAPI } from "@/lib/fetch";
import { tokenCache, googleOAuth } from "../../lib/auth";

// Mock Linking.createURL to return a fixed URL
jest.mock("expo-linking", () => ({
  createURL: jest.fn(() => "exp://dummy-url/(root)/(tabs)/home"),
}));

// Mock SecureStore functions
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock fetchAPI
jest.mock("@/lib/fetch", () => ({
  fetchAPI: jest.fn(),
}));

describe("tokenCache", () => {
  const key = "token_key";
  const tokenValue = "abc123";

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("getToken returns token when SecureStore returns a value", async () => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce(tokenValue);

    const result = await tokenCache.getToken(key);

    expect(SecureStore.getItemAsync).toHaveBeenCalledWith(key);
    expect(result).toEqual(tokenValue);
  });

  it("getToken deletes token and returns null when SecureStore.getItemAsync throws an error", async () => {
    const error = new Error("failure");
    (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(error);

    const result = await tokenCache.getToken(key);

    expect(SecureStore.getItemAsync).toHaveBeenCalledWith(key);
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith(key);
    expect(result).toBeNull();
  });

  it("saveToken calls SecureStore.setItemAsync and returns its result", async () => {
    (SecureStore.setItemAsync as jest.Mock).mockResolvedValueOnce(null);

    const result = await tokenCache.saveToken(key, tokenValue);

    expect(SecureStore.setItemAsync).toHaveBeenCalledWith(key, tokenValue);
    expect(result).toBeNull();
  });

  it("saveToken returns undefined when SecureStore.setItemAsync throws an error", async () => {
    (SecureStore.setItemAsync as jest.Mock).mockImplementationOnce(() => {
      throw new Error("failure");
    });

    const result = await tokenCache.saveToken(key, tokenValue);

    expect(result).toBeUndefined();
  });
});

describe("googleOAuth", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns success when session and signUp details are provided", async () => {
    const dummySessionId = "session123";
    const dummyUserId = "user123";
    const startSSOFlow = jest.fn().mockResolvedValue({
      createdSessionId: dummySessionId,
      setActive: jest.fn().mockResolvedValue(null),
      signIn: {},
      signUp: {
        createdUserId: dummyUserId,
        firstName: "John",
        lastName: "Doe",
        emailAddress: "john.doe@example.com",
      },
    });

    // Mock fetchAPI to simulate user creation
    (fetchAPI as jest.Mock).mockResolvedValueOnce({});

    const result = await googleOAuth(startSSOFlow);

    // Ensure startSSOFlow is called with the proper arguments.
    expect(startSSOFlow).toHaveBeenCalledWith({
      strategy: "oauth_google",
      redirectUrl: "exp://dummy-url/(root)/(tabs)/home",
    });

    // Retrieve the setActive function from the resolved value
    const { setActive } = await startSSOFlow.mock.results[0].value;
    expect(setActive).toHaveBeenCalledWith({ session: dummySessionId });

    // Verify that fetchAPI is called with the correct parameters.
    expect(fetchAPI).toHaveBeenCalledWith("/(api)/user", {
      method: "POST",
      body: JSON.stringify({
        name: "John Doe",
        email: "john.doe@example.com",
        clerkId: dummyUserId,
      }),
    });

    expect(result).toEqual({
      success: true,
      code: "success",
      message: "You have successfully signed in with Google",
    });
  });

  it("returns error when createdSessionId is missing", async () => {
    const startSSOFlow = jest.fn().mockResolvedValue({
      createdSessionId: null,
      setActive: jest.fn(),
      signIn: {},
      signUp: {},
    });

    const result = await googleOAuth(startSSOFlow);

    expect(result).toEqual({
      success: false,
      message: "An error occurred while signing in with Google",
    });
  });

  it("returns error when setActive is missing", async () => {
    const startSSOFlow = jest.fn().mockResolvedValue({
      createdSessionId: "session123",
      setActive: null,
      signIn: {},
      signUp: {},
    });

    const result = await googleOAuth(startSSOFlow);

    expect(result).toEqual({
      success: false,
      message: "An error occurred while signing in with Google",
    });
  });

  it("returns error details when an exception is thrown", async () => {
    const error = { code: "ERR_CODE", errors: [{ longMessage: "An error occurred" }] };
    const startSSOFlow = jest.fn().mockRejectedValue(error);

    const result = await googleOAuth(startSSOFlow);

    expect(result).toEqual({
      success: false,
      code: "ERR_CODE",
      message: "An error occurred",
    });
  });
});
