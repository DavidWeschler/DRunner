/**
 * @jest-environment node
 */

import { POST } from "../../app/(api)/update_route_scheduled+api"; // adjust the import path as needed
import { neon } from "@neondatabase/serverless";

// Mock neon from "@neondatabase/serverless"
jest.mock("@neondatabase/serverless", () => ({
  neon: jest.fn(),
}));

describe("POST update scheduled API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DATABASE_URL = "test-database-url";
  });

  it("updates the route with is_scheduled set correctly", async () => {
    // Arrange: simulate a valid SQL update.
    const fakeResult = [{ id: 1, clerk_id: "123", difficulty: "medium", is_scheduled: true }];
    const sqlMock = jest.fn().mockResolvedValue(fakeResult);
    (neon as jest.Mock).mockReturnValue(sqlMock);

    const requestBody = { clerkId: "123", difficulty: "medium", scheduled: true };
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    });

    // Act.
    const response = await POST(request);
    const data = await response.json();

    // Assert: verify response.
    expect(response.status).toBe(200);
    expect(data).toEqual(fakeResult);
    expect(sqlMock).toHaveBeenCalledTimes(1);

    // For a tagged template, the first argument is an array of strings,
    // and the subsequent arguments are the substitution values.
    const templateParts = sqlMock.mock.calls[0][0];
    const substitutions = sqlMock.mock.calls[0].slice(1);
    const staticSQL = templateParts.join(" ");

    // Verify that the static SQL parts are as expected.
    expect(staticSQL).toMatch(/UPDATE running_routes/);
    expect(staticSQL).toMatch(/SET is_scheduled =/);
    expect(staticSQL).toMatch(/WHERE clerk_id =/);
    expect(staticSQL).toMatch(/AND difficulty =/);
    expect(staticSQL).toMatch(/SELECT MAX\(created_at\)/);
    expect(staticSQL).toMatch(/RETURNING \*/);

    // Check substitution values.
    // They should be: [scheduled, clerkId, difficulty, clerkId, difficulty]
    expect(substitutions.length).toBe(5);
    expect(substitutions[0]).toBe(true);
    expect(substitutions[1]).toBe("123");
    expect(substitutions[2]).toBe("medium");
    expect(substitutions[3]).toBe("123");
    expect(substitutions[4]).toBe("medium");
  });

  it("returns 500 and logs error when an exception occurs", async () => {
    // Arrange: simulate an error during SQL execution.
    const error = new Error("Test error");
    const sqlMock = jest.fn().mockRejectedValue(error);
    (neon as jest.Mock).mockReturnValue(sqlMock);

    const requestBody = { clerkId: "123", difficulty: "medium", scheduled: false };
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    });

    // Spy on console.log to verify that the error is logged.
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    // Act.
    const response = await POST(request);
    const data = await response.json();

    // Assert.
    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Internal Server Error" });
    expect(consoleSpy).toHaveBeenCalledWith("Error updating route:", error);

    consoleSpy.mockRestore();
  });
});
