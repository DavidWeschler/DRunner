/**
 * @jest-environment node
 */

import { POST } from "../../app/(api)/update_recent+api";
import { neon } from "@neondatabase/serverless";
import { getIsraelTimezoneOffset } from "@/lib/utils";

// Mock neon from "@neondatabase/serverless"
jest.mock("@neondatabase/serverless", () => ({
  neon: jest.fn(),
}));

// Mock getIsraelTimezoneOffset from "@/lib/utils"
jest.mock("@/lib/utils", () => ({
  getIsraelTimezoneOffset: jest.fn(),
}));

describe("POST recent update API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DATABASE_URL = "test-database-url";
    // Set a fixed timezone offset for testing.
    (getIsraelTimezoneOffset as jest.Mock).mockReturnValue(3);
  });

  it("updates using route_id when provided", async () => {
    // Arrange: simulate a valid SQL update when route_id exists.
    const fakeResult = [{ id: 1, route_id: "123", is_recent: true }];
    const sqlMock = jest.fn().mockResolvedValue(fakeResult);
    (neon as jest.Mock).mockReturnValue(sqlMock);

    const requestBody = {
      clerkId: "123",
      difficulty: "easy",
      is_recent: true,
      route_id: "123",
    };
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    });

    // Act.
    const response = await POST(request);
    const data = await response.json();

    // Assert on response.
    expect(response.status).toBe(200);
    expect(data).toEqual(fakeResult);
    expect(sqlMock).toHaveBeenCalledTimes(1);

    // Check that the tagged template was called with the correct values.
    // For a tagged template, the first argument is an array of strings,
    // and the following arguments are the substitution values.
    const templateParts = sqlMock.mock.calls[0][0];
    const [sub_isRecent, sub_offset, sub_routeId] = sqlMock.mock.calls[0].slice(1);
    // Check that the static SQL includes "WHERE route_id"
    expect(templateParts.join(" ")).toMatch(/WHERE route_id =/);
    // Verify that the substitution values are correct.
    expect(sub_isRecent).toBe(true);
    expect(sub_offset).toBe(3);
    expect(sub_routeId).toBe("123");
  });

  it("updates using clerkId and difficulty when route_id is not provided", async () => {
    // Arrange: simulate a valid SQL update when route_id is omitted.
    const fakeResult = [{ id: 2, clerk_id: "123", is_recent: false }];
    const sqlMock = jest.fn().mockResolvedValue(fakeResult);
    (neon as jest.Mock).mockReturnValue(sqlMock);

    const requestBody = {
      clerkId: "123",
      difficulty: "medium",
      is_recent: false,
      // route_id is not provided
    };
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    });

    // Act.
    const response = await POST(request);
    const data = await response.json();

    // Assert on response.
    expect(response.status).toBe(200);
    expect(data).toEqual(fakeResult);
    expect(sqlMock).toHaveBeenCalledTimes(1);

    // Check that the SQL query uses clerkId, difficulty and subquery for MAX(created_at).
    const templateParts = sqlMock.mock.calls[0][0];
    const [sub_isRecent, sub_offset, sub_clerkId, sub_difficulty] = sqlMock.mock.calls[0].slice(1);
    expect(templateParts.join(" ")).toMatch(/WHERE clerk_id =/);
    expect(templateParts.join(" ")).toMatch(/AND difficulty =/);
    expect(templateParts.join(" ")).toMatch(/SELECT MAX\(created_at\)/);
    expect(templateParts.join(" ")).toMatch(/NOW\(\) \+ make_interval\(hours =>/);
    expect(sub_isRecent).toBe(false);
    expect(sub_offset).toBe(3);
    expect(sub_clerkId).toBe("123");
    expect(sub_difficulty).toBe("medium");
  });

  it("returns 500 and logs error when an exception occurs", async () => {
    // Arrange: simulate an error in the SQL call.
    const error = new Error("Test error");
    const sqlMock = jest.fn().mockRejectedValue(error);
    (neon as jest.Mock).mockReturnValue(sqlMock);

    // Spy on console.log to verify the error is logged.
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    const requestBody = {
      clerkId: "123",
      difficulty: "hard",
      is_recent: true,
      route_id: "789",
    };
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    });

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
