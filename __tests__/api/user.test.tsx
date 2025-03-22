/**
 * @jest-environment node
 */

import { POST } from "../../app/(api)/user+api"; // Adjust the path to your API file
import { neon } from "@neondatabase/serverless";

// Mock neon from "@neondatabase/serverless"
jest.mock("@neondatabase/serverless", () => ({
  neon: jest.fn(),
}));

describe("POST create user and routes API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DATABASE_URL = "test-database-url";
  });

  it("returns 400 if required fields are missing", async () => {
    // Arrange: Missing 'clerkId' (for example)
    const requestBody = { name: "Test User", email: "test@example.com" };
    // Even though the API first creates the table, we can simulate that call.
    const sqlMock = jest.fn().mockResolvedValue(undefined);
    (neon as jest.Mock).mockReturnValue(sqlMock);

    const request = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    });

    // Act.
    const response = await POST(request);
    const data = await response.json();

    // Assert.
    expect(response.status).toBe(400);
    expect(data).toEqual({ error: "Missing required fields" });
  });

  it("returns 500 if user creation fails", async () => {
    // Arrange:
    // First call: CREATE TABLE (simulate with undefined)
    // Second call: INSERT INTO users returns an empty array
    const sqlMock = jest.fn();
    sqlMock.mockResolvedValueOnce(undefined); // For the CREATE TABLE call.
    sqlMock.mockResolvedValueOnce([]); // For the INSERT INTO users call.
    (neon as jest.Mock).mockReturnValue(sqlMock);

    const requestBody = { name: "Test User", email: "test@example.com", clerkId: "clerk123" };
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
    expect(data).toEqual({ error: "Failed to create user" });
  });

  it("creates user and routes successfully", async () => {
    // Arrange:
    // There are three SQL calls expected:
    // 1. CREATE TABLE (result is not used, so we can return undefined)
    // 2. INSERT INTO users (should return an array with a clerk_id)
    // 3. INSERT INTO running_routes (one call per route in the routes constant; our routes array has one item)
    const sqlMock = jest.fn();
    sqlMock.mockResolvedValueOnce(undefined); // CREATE TABLE
    sqlMock.mockResolvedValueOnce([{ clerk_id: "clerk123" }]); // INSERT INTO users
    sqlMock.mockResolvedValueOnce(undefined); // INSERT INTO running_routes
    (neon as jest.Mock).mockReturnValue(sqlMock);

    const requestBody = { name: "Test User", email: "test@example.com", clerkId: "clerk123" };
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    });

    // Act.
    const response = await POST(request);
    const data = await response.json();

    // Assert.
    expect(response.status).toBe(201);
    expect(data).toEqual({ message: "User and routes created successfully", clerkId: "clerk123" });
    // Verify that sql was called three times.
    expect(sqlMock).toHaveBeenCalledTimes(3);

    // Optionally, check the INSERT INTO users call.
    const insertUserCall = sqlMock.mock.calls[1];
    const userTemplateParts = insertUserCall[0];
    const userSubstitutions = insertUserCall.slice(1);
    const userSQL = userTemplateParts.join(" ");
    expect(userSQL).toMatch(/INSERT INTO users/);
    expect(userSQL).toMatch(/RETURNING clerk_id/);
    expect(userSubstitutions[0]).toBe("Test User");
    expect(userSubstitutions[1]).toBe("test@example.com");
    expect(userSubstitutions[2]).toBe("clerk123");

    // Optionally, check the route insertion call.
    const insertRouteCall = sqlMock.mock.calls[2];
    const routeTemplateParts = insertRouteCall[0];
    const routeSubstitutions = insertRouteCall.slice(1);
    const routeSQL = routeTemplateParts.join(" ");
    expect(routeSQL).toMatch(/INSERT INTO running_routes/);
    expect(routeSQL).toMatch(/VALUES/);
    // The first substitution for route insertion should be the clerk_id returned from user insert.
    expect(routeSubstitutions[0]).toBe("clerk123");
    // Next substitutions come from the first (and only) route in the routes array.
    // The route constant defined in the module has:
    //   route_title: "Test",
    //   difficulty: "easy",
    //   directions: <a long string>,
    //   elevationGain: 28.37733078002933,
    //   length: 3.921,
    //   waypoints: [ [1,2], [3,4], [5,6], [7,8] ],
    //   is_saved: false,
    //   is_scheduled: new Date(),
    //   is_deleted: true
    expect(routeSubstitutions[1]).toBe("Test");
    expect(routeSubstitutions[2]).toBe("easy");
    // For directions and waypoints, the API calls JSON.stringify.
    expect(typeof routeSubstitutions[3]).toBe("string");
    expect(routeSubstitutions[4]).toBe(28.37733078002933);
    expect(routeSubstitutions[5]).toBe(3.921);
    expect(typeof routeSubstitutions[6]).toBe("string");
    expect(routeSubstitutions[7]).toBe(false);
    // is_scheduled is a Date which will be JSON-stringified; we can verify it's a string.
    if (routeSubstitutions[8] !== null) {
      expect(routeSubstitutions[8]).toBeInstanceOf(Date);
    } else {
      expect(routeSubstitutions[8]).toBeNull();
    }

    expect(routeSubstitutions[9]).toBe(true);
  });

  it("returns 500 and logs error when an exception occurs", async () => {
    // Arrange: simulate an error during one of the SQL calls.
    const error = new Error("Test error");
    const sqlMock = jest.fn().mockRejectedValue(error);
    (neon as jest.Mock).mockReturnValue(sqlMock);

    const requestBody = { name: "Test User", email: "test@example.com", clerkId: "clerk123" };
    const request = new Request("http://localhost/api", {
      method: "POST",
      body: JSON.stringify(requestBody),
      headers: { "Content-Type": "application/json" },
    });

    const consoleSpy = jest.spyOn(console, "log").mockImplementation(() => {});

    // Act.
    const response = await POST(request);
    const data = await response.json();

    // Assert.
    expect(response.status).toBe(500);
    expect(data).toEqual({ error: "Internal Server Error" });
    expect(consoleSpy).toHaveBeenCalledWith("Error creating user and routes:", error);

    consoleSpy.mockRestore();
  });

  //   it("creates a route with default is_saved = false", async () => {
  //     const mockSql = jest.fn();
  //     (neon as jest.Mock).mockReturnValue(mockSql);

  //     const requestBody = { name: "John Doe", email: "john@example.com", clerkId: "clerk123" };
  //     const request = new Request("http://localhost/api", {
  //       method: "POST",
  //       body: JSON.stringify(requestBody),
  //       headers: { "Content-Type": "application/json" },
  //     });

  //     mockSql.mockResolvedValueOnce([{ clerk_id: "clerk123" }]); // Mock user creation
  //     mockSql.mockResolvedValueOnce([]); // Mock route insertion

  //     const response = await POST(request);
  //     expect(response.status).toBe(201);

  //     const sqlCalls = mockSql.mock.calls;
  //     const insertedRoute = sqlCalls[sqlCalls.length - 1][0];

  //     expect(insertedRoute).toContain("is_saved");
  //     expect(insertedRoute).toContain("false");
  //   });

  //   it("creates a route with default is_scheduled = null", async () => {
  //     const mockSql = jest.fn();
  //     (neon as jest.Mock).mockReturnValue(mockSql);

  //     const requestBody = { name: "Jane Doe", email: "jane@example.com", clerkId: "clerk456" };
  //     const request = new Request("http://localhost/api", {
  //       method: "POST",
  //       body: JSON.stringify(requestBody),
  //       headers: { "Content-Type": "application/json" },
  //     });

  //     mockSql.mockResolvedValueOnce([{ clerk_id: "clerk456" }]); // Mock user creation
  //     mockSql.mockResolvedValueOnce([]); // Mock route insertion

  //     const response = await POST(request);
  //     expect(response.status).toBe(201);

  //     const sqlCalls = mockSql.mock.calls;
  //     const insertedRoute = sqlCalls[sqlCalls.length - 1][0];

  //     expect(insertedRoute).toContain("is_scheduled");
  //     expect(insertedRoute).toContain("null");
  //   });

  //   it("creates a route with default is_deleted = false", async () => {
  //     const mockSql = jest.fn();
  //     (neon as jest.Mock).mockReturnValue(mockSql);

  //     const requestBody = { name: "Alice", email: "alice@example.com", clerkId: "clerk789" };
  //     const request = new Request("http://localhost/api", {
  //       method: "POST",
  //       body: JSON.stringify(requestBody),
  //       headers: { "Content-Type": "application/json" },
  //     });

  //     mockSql.mockResolvedValueOnce([{ clerk_id: "clerk789" }]); // Mock user creation
  //     mockSql.mockResolvedValueOnce([]); // Mock route insertion

  //     const response = await POST(request);
  //     expect(response.status).toBe(201);

  //     const sqlCalls = mockSql.mock.calls;
  //     const insertedRoute = sqlCalls[sqlCalls.length - 1][0];

  //     expect(insertedRoute).toContain("is_deleted");
  //     expect(insertedRoute).toContain("false");
  //   });
});
