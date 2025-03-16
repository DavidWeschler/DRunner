import { POST } from "../../app/(api)/saved_routes+api"; // Adjust the import path
import { neon } from "@neondatabase/serverless";

// Mock neon from "@neondatabase/serverless"
jest.mock("@neondatabase/serverless", () => ({
  neon: jest.fn(),
}));

describe("POST Get Saved Routes API", () => {
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
    expect(json).toEqual({ error: "Missing clerkId" });
  });

  it("returns 200 with saved routes when data is found", async () => {
    const fakeRoutes = [
      {
        route_id: 1,
        route_title: "Morning Run",
        waypoints: "[{lat:10, lng:20}]",
        created_at: "2025-03-16T10:00:00Z",
        is_deleted: false,
        is_saved: true,
      },
      {
        route_id: 2,
        route_title: "Evening Jog",
        waypoints: "[{lat:15, lng:25}]",
        created_at: "2025-03-15T18:00:00Z",
        is_deleted: false,
        is_saved: true,
      },
    ];
    const mockSql = jest.fn().mockResolvedValue(fakeRoutes);
    (neon as jest.Mock).mockReturnValue(mockSql);

    const requestBody = { clerkId: "123", maxNumOfRoutes: 5 };
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual(fakeRoutes);

    // Ensure SQL query was called with the expected parameters
    expect(mockSql).toHaveBeenCalledTimes(1);
    const callArgs = mockSql.mock.calls[0];
    expect(callArgs[0][0]).toContain("SELECT * FROM running_routes");
    expect(callArgs[1]).toBe("123"); // clerkId
    expect(callArgs[2]).toBe(5); // maxNumOfRoutes
  });

  it("returns 200 with an empty array when no saved routes are found", async () => {
    const mockSql = jest.fn().mockResolvedValue([]);
    (neon as jest.Mock).mockReturnValue(mockSql);

    const requestBody = { clerkId: "123", maxNumOfRoutes: 5 };
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual([]);
  });

  it("returns 500 if an error occurs", async () => {
    const error = new Error("Database connection failed");
    (neon as jest.Mock).mockImplementation(() => {
      throw error;
    });

    const requestBody = { clerkId: "123", maxNumOfRoutes: 5 };
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
