import { POST } from "../../app/(api)/update_recent+api"; // Adjust the import path
import { neon } from "@neondatabase/serverless";
import { getIsraelTimezoneOffset } from "@/lib/utils";

// Mock neon and getIsraelTimezoneOffset
jest.mock("@neondatabase/serverless", () => ({
  neon: jest.fn(),
}));
jest.mock("@/lib/utils", () => ({
  getIsraelTimezoneOffset: jest.fn(),
}));

describe("POST Update Recent Route API", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DATABASE_URL = "test-database-url";
  });

  //   it("returns 200 when updating is_recent by route_id", async () => {
  //     const mockSql = jest
  //       .fn()
  //       .mockResolvedValueOnce([{ route_id: "456", is_recent: true }])
  //       .mockResolvedValueOnce("UPDATE running_routes SET is_recent = true WHERE route_id = '456'");
  //     (neon as jest.Mock).mockReturnValue(mockSql);
  //     (getIsraelTimezoneOffset as jest.Mock).mockReturnValue(2); // Mock timezone offset

  //     const requestBody = { route_id: "456", is_recent: true };
  //     const request = new Request("http://localhost/api", {
  //       method: "POST",
  //       body: JSON.stringify(requestBody),
  //       headers: { "Content-Type": "application/json" },
  //     });

  //     const response = await POST(request);
  //     expect(response.status).toBe(200);
  //     const json = await response.json();
  //     expect(json).toEqual([{ route_id: "456", is_recent: true }]);

  //     expect(mockSql).toHaveBeenCalledTimes(1);

  //     // Extract the query string properly
  //     const query = mockSql.mock.calls[0][0][0].trim(); // Trim whitespace to avoid formatting issues
  //     console.log("Executed Query:", query); // Debugging output

  //     // Check if SQL query contains correct values directly
  //     expect(query).toMatch(/UPDATE\s+running_routes/i);
  //     expect(query).toContain(`UPDATE running_routes
  //         SET is_recent =`); // Check for true or 'true' value
  //     expect(query).toMatch(/WHERE\s+route_id\s*=\s*'456'/i); // Check that `route_id` is correctly included
  //   });

  //   it("returns 200 when updating is_recent by clerkId and difficulty", async () => {
  //     const mockSql = jest
  //       .fn()
  //       .mockResolvedValueOnce([{ clerk_id: "123", difficulty: "hard", is_recent: true }])
  //       .mockResolvedValueOnce("UPDATE running_routes SET is_recent = true WHERE clerk_id = '123' AND difficulty = 'hard'");
  //     (neon as jest.Mock).mockReturnValue(mockSql);
  //     (getIsraelTimezoneOffset as jest.Mock).mockReturnValue(2); // Mock timezone offset

  //     const requestBody = { clerkId: "123", difficulty: "hard", is_recent: true };
  //     const request = new Request("http://localhost/api", {
  //       method: "POST",
  //       body: JSON.stringify(requestBody),
  //       headers: { "Content-Type": "application/json" },
  //     });

  //     const response = await POST(request);
  //     expect(response.status).toBe(200);
  //     const json = await response.json();
  //     expect(json).toEqual([{ clerk_id: "123", difficulty: "hard", is_recent: true }]);

  //     expect(mockSql).toHaveBeenCalledTimes(1);
  //     const query = mockSql.mock.calls[0][0][0];
  //     expect(query).toContain("UPDATE running_routes");
  //     expect(query).toMatch(/WHERE\s+clerk_id\s*=\s*'123'/i);
  //     expect(query).toContain("AND difficulty = 'hard'");
  //   });

  it("returns 500 if an error occurs", async () => {
    const error = new Error("Database error");
    (neon as jest.Mock).mockImplementation(() => {
      throw error;
    });

    const requestBody = { clerkId: "123", difficulty: "hard", is_recent: true };
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
