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
    const offsetInMs = 3 * 60 * 60 * 1000;
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
