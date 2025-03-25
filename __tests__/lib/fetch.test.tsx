import { fetchAPI, useFetch } from "../../lib/fetch";
import { renderHook, act } from "@testing-library/react-hooks";

// Mock the global fetch function
(global.fetch as jest.Mock) = jest.fn();

describe("fetchAPI", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should fetch data successfully", async () => {
    const mockResponse = { data: "test" };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    const result = await fetchAPI("https://example.com");
    expect(result).toEqual(mockResponse);
    expect(fetch).toHaveBeenCalledWith("https://example.com", undefined);
  });

  it("should throw an error if response is not ok", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      // Simulate a failure in response.json() so that the promise rejects.
      json: jest.fn().mockRejectedValueOnce(new Error("HTTP error! status: 404")),
    });

    await expect(fetchAPI("https://example.com")).rejects.toThrow("HTTP error! status: 404");
  });
});

describe("useFetch hook", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should set loading to true initially and then update data", async () => {
    const mockResponse = { data: "test" };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse),
    });

    const { result, waitForNextUpdate } = renderHook(() => useFetch("https://example.com"));

    // Initially, the hook should be loading.
    expect(result.current.loading).toBe(true);

    // Wait for the state update after fetching.
    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe("test");
    expect(result.current.error).toBe(null);
  });

  it("should handle fetch errors", async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("Network Error"));

    const { result, waitForNextUpdate } = renderHook(() => useFetch("https://example.com"));

    // Initially, loading should be true.
    expect(result.current.loading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe("Network Error");
  });

  it("should allow refetching data", async () => {
    // First fetch call
    const mockResponse1 = { data: "first" };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse1),
    });

    const { result, waitForNextUpdate } = renderHook(() => useFetch("https://example.com"));

    await waitForNextUpdate();
    expect(result.current.data).toBe("first");

    // Second fetch call (refetch)
    const mockResponse2 = { data: "second" };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValueOnce(mockResponse2),
    });

    act(() => {
      result.current.refetch();
    });

    await waitForNextUpdate();
    expect(result.current.data).toBe("second");
  });
});
