import Line_Algorithm from "../../lib/line_algorithm";
import axios from "axios";
import polyline from "polyline";

// Mocking external dependencies
jest.mock("axios");
jest.mock("polyline");

const mockedAxios = axios as jest.Mocked<typeof axios>;

beforeEach(() => {
  // Resetting mocks before each test
  mockedAxios.get.mockReset();
  (polyline.decode as jest.MockedFunction<typeof polyline.decode>).mockReset();

  // Mock the Google Directions API response
  mockedAxios.get.mockImplementation((url) => {
    if (url.includes("directions")) {
      return Promise.resolve({
        data: {
          routes: [
            {
              overview_polyline: { points: "mock_polyline_string" },
              legs: [{ distance: { value: 5000, text: "5 km" } }],
            },
          ],
        },
      });
    }

    // Mock the Google Elevation API response
    if (url.includes("elevation")) {
      return Promise.resolve({
        data: {
          results: [{ elevation: 10 }, { elevation: 20 }, { elevation: 30 }],
        },
      });
    }

    return Promise.resolve({ data: {} });
  });

  // Mocking polyline.decode to return dummy coordinates
  (polyline.decode as jest.MockedFunction<typeof polyline.decode>).mockImplementation(() => [
    [37.7749, -122.4194], // San Francisco
    [34.0522, -118.2437], // Los Angeles
  ]);
});

describe("Line_Algorithm", () => {
  test("should generate three routes with difficulty levels", async () => {
    const mockRouteLengthKm = 10; // Example route length
    const mockStartPoint: [number, number] = [-122.4194, 37.7749]; // San Francisco
    const mockEndPoint: [number, number] = [-122.42377736084397, 37.77585824231618]; // San Francisco
    const mode = "walking"; // Mode of transportation

    const routes = await Line_Algorithm({
      routeLengthKm: mockRouteLengthKm,
      startPoint: mockStartPoint,
      endPoint: mockEndPoint,
      mode,
    });

    // Inspecting the routes
    console.log(routes);

    // Ensure the function returns 3 routes
    expect(routes.length).toBe(3);

    // Check that the routes are correctly labeled by difficulty
    expect(routes[0].difficulty).toBe("easy");
    expect(routes[1].difficulty).toBe("medium");
    expect(routes[2].difficulty).toBe("hard");

    // Check if elevation gains are in the expected order
    expect(routes[0].elevationGain).toBeLessThanOrEqual(routes[1].elevationGain);
    expect(routes[1].elevationGain).toBeLessThanOrEqual(routes[2].elevationGain);

    // Check if the returned routes' length is not zero or negative
    expect(routes[0].length).toBeGreaterThan(0);
    expect(routes[1].length).toBeGreaterThan(0);
    expect(routes[2].length).toBeGreaterThan(0);

    // Check if each route has the correct number of waypoints
    expect(routes[0].waypoints.length).toBe(3); // Start + End points
    expect(routes[1].waypoints.length).toBe(3); // Start + Detour + End points
    expect(routes[2].waypoints.length).toBe(3); // Start + Detour + End points
  });

  test("should return a single route when routeLengthKm is less than or equal to direct distance", async () => {
    const mockRouteLengthKm = 3; // Shorter route length than direct distance
    const mockStartPoint: [number, number] = [-122.4194, 37.7749]; // San Francisco
    const mockEndPoint: [number, number] = [-118.2437, 34.0522]; // Los Angeles

    const routes = await Line_Algorithm({
      routeLengthKm: mockRouteLengthKm,
      startPoint: mockStartPoint,
      endPoint: mockEndPoint,
      mode: "walking",
    });

    // Test that only one route is returned
    expect(routes.length).toBe(1);

    // Check that the returned route is labeled as "easy"
    expect(routes[0].difficulty).toBe("easy");

    // Check if the returned route has the correct number of waypoints (only start and end)
    expect(routes[0].waypoints.length).toBe(2); // Start + End points
  });
});
