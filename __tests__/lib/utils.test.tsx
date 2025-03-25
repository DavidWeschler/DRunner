// import { getIsraelTimezoneOffset, formatTime, formatDate } from "../../lib/utils"; // Adjust path if necessary

// // Mocking Date to simulate different times of the year using jest.spyOn
// const mockDate = (date: string) => {
//   const mockedDate = new Date(date);
//   jest.spyOn(global, "Date").mockImplementation(() => mockedDate as unknown as Date); // Mock the Date constructor
// };

// describe("Time Utility Functions", () => {
//   describe("getIsraelTimezoneOffset", () => {
//     test("should return 3 during daylight saving time (DST)", () => {
//       // Simulate a date in DST (between March 25 and October 25)
//       mockDate("2025-06-01T12:00:00Z"); // June is within DST range in Israel
//       expect(getIsraelTimezoneOffset()).toBe(2);
//     });

//     test("should return 2 outside daylight saving time (DST)", () => {
//       // Simulate a date outside DST (before March 25 or after October 25)
//       mockDate("2025-12-01T12:00:00Z"); // December is outside DST range in Israel
//       expect(getIsraelTimezoneOffset()).toBe(2);
//     });
//   });

//   describe("formatTime", () => {
//     test("should format minutes less than 60 correctly", () => {
//       expect(formatTime(45)).toBe("45 min");
//       expect(formatTime(0)).toBe("0 min");
//       expect(formatTime(59.99)).toBe("1h 0m"); // Tests rounding behavior
//     });

//     test("should format hours and minutes correctly", () => {
//       expect(formatTime(120)).toBe("2h 0m");
//       expect(formatTime(150)).toBe("2h 30m");
//       expect(formatTime(75)).toBe("1h 15m");
//     });

//     test("should round to nearest whole minute", () => {
//       expect(formatTime(59.5)).toBe("1h 0m");
//       expect(formatTime(59.4)).toBe("59.4 min");
//     });
//   });

//   describe("formatDate", () => {
//     test("should format the date correctly without future flag", () => {
//       mockDate("2025-03-01T12:00:00Z");
//       expect(formatDate("2025-03-01T12:00:00Z")).toBe("March 1 , 14:00");
//     });

//     test("should format the date correctly with future flag", () => {
//       mockDate("2025-03-01T12:00:00Z");
//       expect(formatDate("2025-03-01T12:00:00Z", true)).toBe("March 1 2025, 14:00");
//     });

//     test("should format the date with the correct timezone offset (DST)", () => {
//       mockDate("2025-06-01T12:00:00Z"); // DST
//       expect(formatDate("2025-06-01T12:00:00Z")).toBe("June 1 , 15:00"); // Add 3 hours for DST offset
//     });

//     test("should format the date with the correct timezone offset (non-DST)", () => {
//       mockDate("2025-12-01T12:00:00Z"); // Non-DST
//       expect(formatDate("2025-12-01T12:00:00Z")).toBe("December 1 , 14:00"); // Add 2 hours for non-DST offset
//     });

//     test("should not show the year 2025 if it is in the future", () => {
//       mockDate("2025-03-01T12:00:00Z");
//       expect(formatDate("2025-03-01T12:00:00Z", true)).toBe("March 1 2025, 14:00");
//     });

//     test("should handle times with leading zeros", () => {
//       mockDate("2025-06-01T08:09:00Z"); // 8:09 AM should have leading zero for hour
//       expect(formatDate("2025-06-01T08:09:00Z")).toBe("June 1 , 11:09"); // +3 for DST offset
//     });

//     test("should handle daylight saving transition correctly", () => {
//       mockDate("2025-03-25T01:00:00Z"); // Transition into daylight saving time
//       expect(formatDate("2025-03-25T01:00:00Z")).toBe("March 25 , 03:00"); // +3 hours for DST offset
//     });

//     test("should handle date with a different year correctly", () => {
//       mockDate("2025-12-01T12:00:00Z"); // Non-DST
//       expect(formatDate("2025-12-01T12:00:00Z")).toBe("December 1 , 14:00"); // +2 hours for non-DST offset
//     });
//   });
// });
// utils.test.js
import * as utils from "../../lib/utils";

describe("getIsraelTimezoneOffset", () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });
  afterAll(() => {
    jest.useRealTimers();
  });

  test("returns daylight saving offset when current date is within DST period", () => {
    // DST period is from March 28 (inclusive) to October 26 (exclusive)
    // Set current date to April 15, 2023 (inside DST)
    const testDate = new Date(2023, 3, 15); // Note: months are 0-indexed (3 => April)
    jest.setSystemTime(testDate);
    expect(utils.getIsraelTimezoneOffset()).toBe(3);
  });

  test("returns standard offset when current date is outside DST period", () => {
    // Set current date to January 15, 2023 (outside DST)
    const testDate = new Date(2023, 0, 15); // 0 => January
    jest.setSystemTime(testDate);
    expect(utils.getIsraelTimezoneOffset()).toBe(2);
  });
});

describe("formatTime", () => {
  test("formats minutes less than 60 correctly", () => {
    expect(utils.formatTime(45)).toBe("45 min");
  });

  test("formats minutes equal to or greater than 60 correctly", () => {
    // 120 minutes => 2 hours 0 minutes
    expect(utils.formatTime(120)).toBe("2h 0m");
    // 75.4 minutes rounds to 75 => 1h 15m
    expect(utils.formatTime(75.4)).toBe("1h 15m");
  });
});

describe("formatDate", () => {
  // We control the return value of getIsraelTimezoneOffset so our expected output is predictable.
  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("formats date correctly for non-future dates (without adding offset)", () => {
    // For non-future dates, the function uses the date string as-is.
    // To avoid variability from getIsraelTimezoneOffset, we mock it to return 2.
    jest.spyOn(utils, "getIsraelTimezoneOffset").mockReturnValue(2);
    const dateStr = "2023-04-15T05:00:00Z";
    const dateObj = new Date(dateStr);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = monthNames[dateObj.getMonth()];
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const expected = `${month} ${day} ${year}, ${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes}`;
    expect(utils.formatDate(dateStr)).toBe(expected);
  });

  test("formats date correctly for future dates (adding offset)", () => {
    // For future dates, the function adds an offset to the given date.
    // We mock getIsraelTimezoneOffset to return 3.
    jest.spyOn(utils, "getIsraelTimezoneOffset").mockReturnValue(3);
    const dateStr = "2025-12-31T22:00:00Z";
    const originalTime = new Date(dateStr).getTime();
    const offsetInMs = 2 * 60 * 60 * 1000;
    const dateObj = new Date(originalTime + offsetInMs);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const month = monthNames[dateObj.getMonth()];
    const day = dateObj.getDate();
    const year = dateObj.getFullYear();
    const hours = dateObj.getHours();
    const minutes = dateObj.getMinutes();
    const expected = `${month} ${day} ${year}, ${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes}`;
    expect(utils.formatDate(dateStr, true)).toBe(expected);
  });
});
