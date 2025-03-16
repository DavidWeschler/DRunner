import { POST } from "../../app/(api)/future_routes+api"; // Adjust the path accordingly
import { neon } from "@neondatabase/serverless";

// Mock neon from "@neondatabase/serverless"
jest.mock("@neondatabase/serverless", () => ({
  neon: jest.fn(),
}));

describe("POST Get Recent Routes API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DATABASE_URL = "test-database-url";
  });

  it("returns 400 if clerkId is missing", async () => {
    const requestBody = {
      maxNumOfRoutes: 3,
      // clerkId is missing
    };

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

  it("fetches recent routes and returns 200 on success", async () => {
    // Set up a mock SQL function that simulates a successful SELECT.
    const fakeResult = [{ route_id: "1", clerk_id: "123", is_deleted: false }];
    const mockSql = jest.fn().mockResolvedValue(fakeResult);
    (neon as jest.Mock).mockReturnValue(mockSql);

    const requestBody = {
      clerkId: "123",
      maxNumOfRoutes: 3,
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
    // Check that the query string includes "SELECT * FROM running_routes"
    expect(callArgs[0][0]).toContain("SELECT * FROM running_routes");
    // The interpolated values should be in the order: clerkId, then maxNumOfRoutes.
    expect(callArgs[1]).toBe("123");
    expect(callArgs[2]).toBe(3);
  });

  it("returns 500 if an error occurs", async () => {
    const error = new Error("Test error");
    (neon as jest.Mock).mockImplementation(() => {
      throw error;
    });

    const requestBody = {
      clerkId: "123",
      maxNumOfRoutes: 3,
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
