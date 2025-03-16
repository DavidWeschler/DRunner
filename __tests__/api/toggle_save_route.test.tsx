import { POST } from "../../app/(api)/toggle_save_route+api"; // Adjust the import path
import { neon } from "@neondatabase/serverless";

// Mock neon from "@neondatabase/serverless"
jest.mock("@neondatabase/serverless", () => ({
  neon: jest.fn(),
}));

describe("POST Save/Unsave Route API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DATABASE_URL = "test-database-url";
  });

  it("returns 400 if routeId is missing", async () => {
    const requestBody = { clerkId: "123", save: true }; // Missing routeId
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json).toEqual({ error: "Missing routeId" });
  });

  it("returns 200 when a route is successfully saved", async () => {
    const mockSql = jest.fn().mockResolvedValue({ rowCount: 1 });
    (neon as jest.Mock).mockReturnValue(mockSql);

    const requestBody = { clerkId: "123", routeId: "456", save: true };
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({ rowCount: 1 });

    // Ensure SQL query was called with correct parameters
    expect(mockSql).toHaveBeenCalledTimes(1);
    const callArgs = mockSql.mock.calls[0];
    expect(callArgs[0][0]).toContain("UPDATE running_routes");
    expect(callArgs[1]).toBe(true); // save
    expect(callArgs[2]).toBe("123"); // clerkId
    expect(callArgs[3]).toBe("456"); // routeId
  });

  it("returns 200 when a route is successfully unsaved", async () => {
    const mockSql = jest.fn().mockResolvedValue({ rowCount: 1 });
    (neon as jest.Mock).mockReturnValue(mockSql);

    const requestBody = { clerkId: "123", routeId: "456", save: false };
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({ rowCount: 1 });
  });

  it("returns 500 if an error occurs", async () => {
    const error = new Error("Database error");
    (neon as jest.Mock).mockImplementation(() => {
      throw error;
    });

    const requestBody = { clerkId: "123", routeId: "456", save: true };
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
