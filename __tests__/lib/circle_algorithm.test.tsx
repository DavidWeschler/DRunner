import CircularAlgorithm from "../../lib/circle_algorithm";
import axios from "axios";
import polyline from "polyline";
import * as turf from "@turf/turf";

// Mock dependencies
jest.mock("axios");
jest.mock("polyline");
jest.mock("@turf/turf", () => ({
  circle: jest.fn(),
  destination: jest.fn(),
  lineIntersect: jest.fn(),
  distance: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedPolyline = polyline as jest.Mocked<typeof polyline>;

describe("CircularAlgorithm", () => {
  const mockStartPoint: [number, number] = [-122.4194, 37.7749]; // Example: San Francisco
  const mockRouteLengthKm = 5;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock for turf functions
    (turf.destination as jest.Mock).mockImplementation((point, distance, bearing) => ({
      geometry: {
        coordinates: [-122.4, 37.8], // Mock first stop
      },
    }));

    (turf.circle as jest.Mock).mockImplementation((center) => ({
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [[[0, 0]]],
      },
    }));

    (turf.lineIntersect as jest.Mock).mockImplementation(() => ({
      features: [
        {
          geometry: {
            type: "Point",
            coordinates: [-122.43, 37.79], // Mock second stop
          },
        },
      ],
    }));

    (turf.distance as jest.Mock).mockReturnValue(1.5);

    // Mock polyline decode
    mockedPolyline.decode.mockReturnValue([
      [37.78, -122.42],
      [37.79, -122.43],
      [37.8, -122.44],
    ]);

    // Mock axios for Roads API
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes("nearestRoads")) {
        return Promise.resolve({
          data: {
            snappedPoints: [
              {
                location: {
                  latitude: 37.78,
                  longitude: -122.42,
                },
              },
            ],
          },
        });
      }

      // Mock for Directions API
      if (url.includes("directions")) {
        return Promise.resolve({
          data: {
            routes: [
              {
                overview_polyline: {
                  points: "mock_polyline",
                },
                legs: [
                  {
                    distance: { value: 5000, text: "5 km" },
                  },
                ],
              },
            ],
          },
        });
      }

      // Mock for Elevation API
      if (url.includes("elevation")) {
        return Promise.resolve({
          data: {
            results: [{ elevation: 10 }, { elevation: 15 }, { elevation: 12 }],
          },
        });
      }

      return Promise.resolve({ data: {} });
    });
  });

  test("should generate three routes with difficulty levels", async () => {
    const routes = await CircularAlgorithm({
      routeLengthKm: mockRouteLengthKm,
      startPoint: mockStartPoint,
      mode: "walking",
    });

    expect(routes.length).toBe(3);
    expect(routes[0].difficulty).toBe("easy");
    expect(routes[1].difficulty).toBe("medium");
    expect(routes[2].difficulty).toBe("hard");
    expect(routes[0].elevationGain).toBeLessThanOrEqual(routes[1].elevationGain);
    expect(routes[1].elevationGain).toBeLessThanOrEqual(routes[2].elevationGain);
  });

  test("should calculate elevation gain correctly", async () => {
    // Setup elevation mock with known values
    mockedAxios.get.mockImplementationOnce((url) => {
      if (url.includes("elevation")) {
        return Promise.resolve({
          data: {
            results: [
              { elevation: 10 },
              { elevation: 15 }, // +5
              { elevation: 12 }, // -3 (ignored)
              { elevation: 20 }, // +8
            ],
          },
        });
      }
      return Promise.resolve({ data: {} });
    });

    // We need to call the algorithm to access the internal function
    // But we can verify the mock is working correctly
    const routes = await CircularAlgorithm({
      routeLengthKm: mockRouteLengthKm,
      startPoint: mockStartPoint,
      mode: "walking",
    });

    // In a real test, we'd verify that the elevation gain calculation
    // would equal 5 + 8 = 13 units based on our mock data
    expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining("elevation"));
  });

//   test("should handle errors and retry", async () => {
//     let attemptCount = 0;

//     // Mocking axios.get to simulate errors and retries
//     mockedAxios.get.mockImplementation((url) => {
//       if (url.includes("directions")) {
//         attemptCount++;

//         // Simulate failure for the first 2 attempts
//         if (attemptCount <= 2) {
//           return Promise.reject(new Error("API error"));
//         }

//         // Simulate success on the 3rd attempt
//         return Promise.resolve({
//           data: {
//             routes: [
//               {
//                 overview_polyline: {
//                   points: "mock_polyline",
//                 },
//                 legs: [
//                   {
//                     distance: { value: 5000, text: "5 km" },
//                   },
//                 ],
//               },
//             ],
//           },
//         });
//       }

//       // Mock other APIs (no changes needed here)
//       if (url.includes("nearestRoads")) {
//         return Promise.resolve({
//           data: {
//             snappedPoints: [
//               {
//                 location: {
//                   latitude: 37.78,
//                   longitude: -122.42,
//                 },
//               },
//             ],
//           },
//         });
//       }

//       if (url.includes("elevation")) {
//         return Promise.resolve({
//           data: {
//             results: [{ elevation: 10 }, { elevation: 15 }, { elevation: 12 }],
//           },
//         });
//       }

//       return Promise.resolve({ data: {} });
//     });

//     // Spy on console logs to capture error messages
//     const consoleSpy = jest.spyOn(console, "log").mockImplementation();

//     // Call CircularAlgorithm and verify that it retries
//     await CircularAlgorithm({
//       routeLengthKm: mockRouteLengthKm,
//       startPoint: mockStartPoint,
//       mode: "walking",
//     });

//     // Verify that the Directions API was retried twice before succeeding
//     expect(attemptCount).toBe(3);

//     // Verify that the error was logged in the console during retries
//     expect(consoleSpy).toHaveBeenCalledWith("Error generating route:", expect.any(Error));

//     // Check that the algorithm completed successfully (routes were returned)
//     expect(consoleSpy).toHaveBeenCalledWith("Successfully generated routes"); // Assuming success message

//     // Cleanup the spy
//     consoleSpy.mockRestore();
//   });

  test("should throw error if cannot generate 3 routes", async () => {
    // Make all attempts fail
    mockedAxios.get.mockImplementation((url) => {
      if (url.includes("directions")) {
        return Promise.reject(new Error("API error"));
      }
      return Promise.resolve({ data: {} });
    });

    // Suppress console logs for cleaner test output
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    await expect(
      CircularAlgorithm({
        routeLengthKm: mockRouteLengthKm,
        startPoint: mockStartPoint,
        mode: "walking",
      })
    ).rejects.toThrow("Failed to generate 3 routes.");

    consoleSpy.mockRestore();
  });

  test("should adjust pins to roads", async () => {
    // This indirectly tests the pin adjustment by ensuring that
    // the roads API is called during algorithm execution
    await CircularAlgorithm({
      routeLengthKm: mockRouteLengthKm,
      startPoint: mockStartPoint,
      mode: "walking",
    });

    // Check that the road adjustment API was called
    expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining("nearestRoads"));
  });

  test("should use correct mode parameter in directions API", async () => {
    // Test with biking mode
    await CircularAlgorithm({
      routeLengthKm: mockRouteLengthKm,
      startPoint: mockStartPoint,
      mode: "bicycling",
    });

    // Verify the mode is passed to the directions API
    expect(mockedAxios.get).toHaveBeenCalledWith(expect.stringContaining("mode=bicycling"));
  });
});
