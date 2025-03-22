import { getIsraelTimezoneOffset, formatTime, formatDate } from "../../lib/utils"; // Adjust path if necessary

// Mocking Date to simulate different times of the year using jest.spyOn
const mockDate = (date: string) => {
  const mockedDate = new Date(date);
  jest.spyOn(global, "Date").mockImplementation(() => mockedDate as unknown as Date); // Mock the Date constructor
};

describe("Time Utility Functions", () => {
  describe("getIsraelTimezoneOffset", () => {
    test("should return 3 during daylight saving time (DST)", () => {
      // Simulate a date in DST (between March 25 and October 25)
      mockDate("2025-06-01T12:00:00Z"); // June is within DST range in Israel
      expect(getIsraelTimezoneOffset()).toBe(2);
    });

    test("should return 2 outside daylight saving time (DST)", () => {
      // Simulate a date outside DST (before March 25 or after October 25)
      mockDate("2025-12-01T12:00:00Z"); // December is outside DST range in Israel
      expect(getIsraelTimezoneOffset()).toBe(2);
    });
  });

  describe("formatTime", () => {
    test("should format minutes less than 60 correctly", () => {
      expect(formatTime(45)).toBe("45 min");
      expect(formatTime(0)).toBe("0 min");
      expect(formatTime(59.99)).toBe("1h 0m"); // Tests rounding behavior
    });

    test("should format hours and minutes correctly", () => {
      expect(formatTime(120)).toBe("2h 0m");
      expect(formatTime(150)).toBe("2h 30m");
      expect(formatTime(75)).toBe("1h 15m");
    });

    test("should round to nearest whole minute", () => {
      expect(formatTime(59.5)).toBe("1h 0m");
      expect(formatTime(59.4)).toBe("59.4 min");
    });
  });

  describe("formatDate", () => {
    test("should format the date correctly without future flag", () => {
      mockDate("2025-03-01T12:00:00Z");
      expect(formatDate("2025-03-01T12:00:00Z")).toBe("March 1 , 14:00");
    });

    test("should format the date correctly with future flag", () => {
      mockDate("2025-03-01T12:00:00Z");
      expect(formatDate("2025-03-01T12:00:00Z", true)).toBe("March 1 2025, 14:00");
    });

    test("should format the date with the correct timezone offset (DST)", () => {
      mockDate("2025-06-01T12:00:00Z"); // DST
      expect(formatDate("2025-06-01T12:00:00Z")).toBe("June 1 , 15:00"); // Add 3 hours for DST offset
    });

    test("should format the date with the correct timezone offset (non-DST)", () => {
      mockDate("2025-12-01T12:00:00Z"); // Non-DST
      expect(formatDate("2025-12-01T12:00:00Z")).toBe("December 1 , 14:00"); // Add 2 hours for non-DST offset
    });

    test("should not show the year 2025 if it is in the future", () => {
      mockDate("2025-03-01T12:00:00Z");
      expect(formatDate("2025-03-01T12:00:00Z", true)).toBe("March 1 2025, 14:00");
    });

    test("should handle times with leading zeros", () => {
      mockDate("2025-06-01T08:09:00Z"); // 8:09 AM should have leading zero for hour
      expect(formatDate("2025-06-01T08:09:00Z")).toBe("June 1 , 11:09"); // +3 for DST offset
    });

    test("should handle daylight saving transition correctly", () => {
      mockDate("2025-03-25T01:00:00Z"); // Transition into daylight saving time
      expect(formatDate("2025-03-25T01:00:00Z")).toBe("March 25 , 03:00"); // +3 hours for DST offset
    });

    test("should handle date with a different year correctly", () => {
      mockDate("2025-12-01T12:00:00Z"); // Non-DST
      expect(formatDate("2025-12-01T12:00:00Z")).toBe("December 1 , 14:00"); // +2 hours for non-DST offset
    });
  });
});
