import { POST } from "../../app/(api)/add_route+api"; // Adjust the path accordingly
import { neon } from "@neondatabase/serverless";

// Mock neon from "@neondatabase/serverless"
jest.mock("@neondatabase/serverless", () => ({
  neon: jest.fn(),
}));

describe("POST Route Handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DATABASE_URL = "test-database-url";
  });

  it("returns 400 if required fields are missing", async () => {
    // Omit a required field (route_title) from the request body.
    const requestBody = {
      clerkId: "123",
      address: "123 Street",
      difficulty: "medium",
      directions: ["Step1", "Step2"],
      elevationGain: 100,
      length: 5,
      waypoints: [[-118, 34]],
    };

    const request = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json).toEqual({ error: "Missing required fields" });
  });

  it("inserts a route and returns 201 on success", async () => {
    // Set up a mock SQL function that simulates a successful insert.
    const mockSql = jest.fn().mockResolvedValue(undefined);
    (neon as jest.Mock).mockReturnValue(mockSql);

    const requestBody = {
      clerkId: "123",
      route_title: "Morning Run",
      address: "123 Street",
      difficulty: "medium",
      directions: ["Step1", "Step2"],
      elevationGain: 100,
      length: 5,
      waypoints: [[-118, 34]],
      // Optional flags (using default values in the handler if omitted)
      is_recent: false,
      is_saved: false,
      is_scheduled: null,
      is_deleted: false,
    };

    const request = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(201);
    const json = await response.json();
    expect(json).toEqual({ message: "Route added successfully" });

    // Verify that the SQL tagged template was called with the correct query and parameters.
    expect(mockSql).toHaveBeenCalledTimes(1);
    const callArgs = mockSql.mock.calls[0];

    // Check that the SQL query string includes the expected INSERT statement.
    expect(callArgs[0][0]).toContain("INSERT INTO running_routes");

    // The subsequent arguments should match the inserted values.
    expect(callArgs[1]).toBe("123"); // clerkId
    expect(callArgs[2]).toBe("Morning Run"); // route_title
    expect(callArgs[3]).toBe("123 Street"); // address
    expect(callArgs[4]).toBe("medium"); // difficulty
    expect(callArgs[5]).toBe(JSON.stringify(["Step1", "Step2"])); // directions
    expect(callArgs[6]).toBe(100); // elevationGain
    expect(callArgs[7]).toBe(5); // length
    expect(callArgs[8]).toBe(JSON.stringify([[-118, 34]])); // waypoints
    expect(callArgs[9]).toBe(false); // is_recent
    expect(callArgs[10]).toBe(false); // is_saved
    expect(callArgs[11]).toBe(null); // is_scheduled
    expect(callArgs[12]).toBe(false); // is_deleted
  });

  it("returns 500 if an error occurs", async () => {
    // Force neon to throw an error.
    const error = new Error("Test error");
    (neon as jest.Mock).mockImplementation(() => {
      throw error;
    });

    const requestBody = {
      clerkId: "123",
      route_title: "Morning Run",
      address: "123 Street",
      difficulty: "medium",
      directions: ["Step1", "Step2"],
      elevationGain: 100,
      length: 5,
      waypoints: [[-118, 34]],
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
