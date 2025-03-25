import { fetchAPI, useFetch } from "../../lib/fetch"; // Adjust the import path
import { renderHook, act } from "@testing-library/react";

// Mock global fetch
// global.fetch = jest.fn();
jest.spyOn(global, "fetch").mockImplementation(jest.fn());

describe.skip("useFetch hook", () => {
  const mockUrl = "https://api.example.com/data";
  const mockData = { data: { message: "Success" } };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("fetches data successfully", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useFetch(mockUrl));

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockData.data);
    expect(result.current.error).toBe(null);
  });

  it("handles fetch error", async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));

    const { result } = renderHook(() => useFetch(mockUrl));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe("Network error");
  });

  it("supports manual refetch", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useFetch(mockUrl));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.data).toEqual(mockData.data);

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { message: "Updated" } }),
    });

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.data).toEqual({ message: "Updated" });
  });
});
