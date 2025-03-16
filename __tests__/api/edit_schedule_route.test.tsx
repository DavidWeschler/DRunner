import { POST } from "../../app/(api)/edit_schedule_route+api"; // Adjust this path accordingly
import { neon } from "@neondatabase/serverless";

// Mock neon from "@neondatabase/serverless"
jest.mock("@neondatabase/serverless", () => ({
  neon: jest.fn(),
}));

describe("POST Schedule API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DATABASE_URL = "test-database-url";
  });

  it("returns 400 if routeId is missing", async () => {
    const requestBody = {
      clerkId: "123",
      scheduleDate: "2023-03-10",
      // routeId is missing
    };
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

  it("updates the route schedule and returns 200 on success", async () => {
    // Set up a mock SQL function that simulates a successful update.
    const fakeResult = { affectedRows: 1 };
    const mockSql = jest.fn().mockResolvedValue(fakeResult);
    (neon as jest.Mock).mockReturnValue(mockSql);

    const requestBody = {
      clerkId: "123",
      routeId: "abc",
      scheduleDate: "2023-03-10",
    };

    const request = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual(fakeResult);

    // Verify that the SQL tagged template literal was called with the expected query and parameters.
    expect(mockSql).toHaveBeenCalledTimes(1);
    const callArgs = mockSql.mock.calls[0];
    // callArgs[0] is the array of template strings.
    expect(callArgs[0][0]).toContain("UPDATE running_routes");
    // The interpolated values should appear in the order: scheduleDate, clerkId, routeId.
    expect(callArgs[1]).toBe(requestBody.scheduleDate);
    expect(callArgs[2]).toBe(requestBody.clerkId);
    expect(callArgs[3]).toBe(requestBody.routeId);
  });

  it("returns 500 if an error occurs", async () => {
    const error = new Error("Test error");
    (neon as jest.Mock).mockImplementation(() => {
      throw error;
    });

    const requestBody = {
      clerkId: "123",
      routeId: "abc",
      scheduleDate: "2023-03-10",
    };

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
