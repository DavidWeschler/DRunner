import { POST } from "../../app/(api)/delete_route+api"; // Adjust the path accordingly
import { neon } from "@neondatabase/serverless";

// Mock neon from @neondatabase/serverless
jest.mock("@neondatabase/serverless", () => ({
  neon: jest.fn(),
}));

describe("POST API handler", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DATABASE_URL = "test-database-url";
  });

  it("returns 400 if routeId is missing", async () => {
    const requestBody = { clerkId: "123" };
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

  it("updates the route and returns 200 on success", async () => {
    // Set up the mock sql tag function that resolves to a fake result.
    const fakeResult = { affectedRows: 1 };
    const mockSql = jest.fn().mockResolvedValue(fakeResult);
    (neon as jest.Mock).mockReturnValue(mockSql);

    const requestBody = { clerkId: "123", routeId: "abc" };
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual(fakeResult);

    // Verify that the sql tag function was called with the proper query and parameters.
    expect(mockSql).toHaveBeenCalledTimes(1);
    const callArgs = mockSql.mock.calls[0];
    // The first argument is an array of strings from the tagged template literal.
    expect(callArgs[0][0]).toContain("UPDATE running_routes");
    // The subsequent arguments are the variables (clerkId and routeId).
    expect(callArgs[1]).toBe("123");
    expect(callArgs[2]).toBe("abc");
  });

  it("returns 500 if an error occurs", async () => {
    // Force neon to throw an error.
    const error = new Error("Test error");
    (neon as jest.Mock).mockImplementation(() => {
      throw error;
    });

    const requestBody = { clerkId: "123", routeId: "abc" };
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
