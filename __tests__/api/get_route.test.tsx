import { POST } from "../../app/(api)/get_route+api"; // Adjust the path accordingly
import { neon } from "@neondatabase/serverless";

// Mock neon from "@neondatabase/serverless"
jest.mock("@neondatabase/serverless", () => ({
  neon: jest.fn(),
}));

describe("POST Get Latest Route API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DATABASE_URL = "test-database-url";
  });

  it("returns 400 if clerkId is missing", async () => {
    const requestBody = {}; // Missing clerkId
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json).toEqual({ error: "Missing required clerkId" });
  });

  it("returns 404 if no route is found", async () => {
    // Set up a mock SQL function that resolves to an empty array.
    const mockSql = jest.fn().mockResolvedValue([]);
    (neon as jest.Mock).mockReturnValue(mockSql);

    const requestBody = { clerkId: "123" };
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(404);
    const json = await response.json();
    expect(json).toEqual({ error: "Route not found" });
  });

  it("returns 200 with waypoints and directions when a route is found", async () => {
    // Create a fake route result
    const fakeRoute = [{ waypoints: "fakeWaypoints", directions: "fakeDirections" }];
    const mockSql = jest.fn().mockResolvedValue(fakeRoute);
    (neon as jest.Mock).mockReturnValue(mockSql);

    const requestBody = { clerkId: "123" };
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({
      waypoints: fakeRoute[0].waypoints,
      directions: fakeRoute[0].directions,
    });

    // Verify that the SQL tagged template literal was called
    expect(mockSql).toHaveBeenCalledTimes(1);
    const callArgs = mockSql.mock.calls[0];
    // The query string should include the expected SQL
    expect(callArgs[0][0]).toContain("SELECT waypoints, directions FROM running_routes");
    // The interpolated value should include clerkId ("123")
    expect(callArgs[1]).toBe("123");
  });

  it("returns 500 if an error occurs", async () => {
    const error = new Error("Test error");
    (neon as jest.Mock).mockImplementation(() => {
      throw error;
    });

    const requestBody = { clerkId: "123" };
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(500);
    const json = await response.json();
    expect(json).toEqual({ error: "Internal Server Error" });
  });
});
