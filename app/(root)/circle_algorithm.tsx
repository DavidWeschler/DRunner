// Import the necessary Turf.js functions and axios for HTTP requests
import { circle, destination, lineIntersect, distance, Coord, Units } from "@turf/turf";
import axios from "axios";
import polyline from "polyline";

// Google API Key from environment variables.
const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

// -------------------
// Existing Interfaces
// -------------------
interface Pin {
  latitude: number;
  longitude: number;
}

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface DirectionsResponse {
  routes: {
    overview_polyline: {
      points: string;
    };
    legs: {
      distance: { value: number; text: string };
    }[];
  }[];
}

interface SnappedPoint {
  location: Coordinate;
}

interface NearestRoadsResponse {
  snappedPoints: SnappedPoint[];
}

// -------------------
// Existing Helper Functions
// -------------------

/**
 * Fetches directions between an array of pins (adjusted coordinates) using the Google Directions API.
 */
const getDirectionsBetweenPins = async (pins: Pin[]): Promise<string[]> => {
  console.log(`Setting directions between pins... Calling Google API ${pins.length} times`);
  const directions: string[] = [];

  for (let i = 0; i < pins.length; i++) {
    const start = pins[i];
    const end = pins[(i + 1) % pins.length]; // Ensures the last pin connects back to the first pin
    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&mode=walking&key=${API_KEY}`;
    try {
      const response = await axios.get<DirectionsResponse>(url);
      const data = response.data;
      if (data.routes.length > 0) {
        directions.push(data.routes[0].overview_polyline.points);
      }
    } catch (error) {
      console.error(`Error fetching directions between pin ${i} and pin ${(i + 1) % pins.length}:`, error);
    }
  }
  return directions;
};

/**
 * Adjusts a single coordinate to the nearest road using the Google Roads API.
 */
const adjustPinToRoad = async (coord: Coordinate): Promise<Coordinate> => {
  const { latitude, longitude } = coord;
  const url = `https://roads.googleapis.com/v1/nearestRoads?points=${encodeURIComponent(latitude)},${encodeURIComponent(longitude)}&key=${API_KEY}`;
  try {
    console.log("using api key..");
    const response = await axios.get<NearestRoadsResponse>(url);
    if (response.data.snappedPoints) {
      const { location } = response.data.snappedPoints[0];
      return { latitude: location.latitude, longitude: location.longitude };
    }
  } catch (error) {
    console.error("Unexpected error:", error);
  }
  console.log("failed to adjust a coordinate. bad url: ", url);
  return coord; // Return original coordinate if snapping fails
};

/**
 * Adjusts an array of pins (coordinates) to streets.
 */
const adjustPinsToStreetsWithGoogleAPI = async (pins: Coordinate[]): Promise<Coordinate[]> => {
  const adjustedPins: Coordinate[] = await Promise.all(pins.map((pin) => adjustPinToRoad(pin)));
  return adjustedPins;
};

// -------------------
// New Code: Circular Routes with Difficulty Based on Elevation Gain
// -------------------

/**
 * A helper polyline decoder.
 * This function uses the 'polyline' npm package to decode the encoded polyline string
 * into an array of [lat, lng] pairs.
 */
function decodePolyline(polylineStr: string): number[][] {
  return polyline.decode(polylineStr);
}

// Interfaces for route results
interface RouteResult {
  waypoints: number[][]; // Array of coordinates in [lng, lat] format.
  directions: string; // Encoded polyline from Google Directions.
  elevationGain: number; // Total positive elevation gain in meters.
  length: number; // Actual route length in kilometers.
}

type Difficulty = "easy" | "medium" | "hard";

interface RouteWithDifficulty extends RouteResult {
  difficulty: Difficulty;
}

/**
 * Parameters for the algorithm.
 */
interface AlgorithmParams {
  routeLengthKm: number;
  startPoint: Coord; // [lng, lat]
}

/**
 * Generates a single circular route based on the start point and desired route length.
 * Uses Turf.js to compute two stops (firstStop and secondStop) that form a loop.
 * Then it queries the Google Directions API to get the route's encoded polyline,
 * computes the total positive elevation gain, and calculates the actual route length.
 */
async function generateCircularRoute(startPoint: Coord, routeLengthKm: number): Promise<RouteResult> {
  // Divide the route into three segments.
  const segmentLength = routeLengthKm / 3;

  // Step 1: Choose a random bearing and compute the first stop.
  const randomBearing = Math.random() * 360; // Random angle between 0 and 360 degrees.
  const firstStopPoint = destination(startPoint, segmentLength, randomBearing, { units: "kilometers" });
  const firstStop = firstStopPoint.geometry.coordinates; // [lng, lat]

  // Step 2: Create two circles (polygons) centered at startPoint and firstStop.
  const circleOptions: { steps: number; units: Units } = { steps: 64, units: "kilometers" };
  const circleFromStart = circle(startPoint, segmentLength, circleOptions);
  const circleFromFirst = circle(firstStop, segmentLength, circleOptions);

  // Step 3: Find intersection points between the two circles.
  const intersections = lineIntersect(circleFromStart, circleFromFirst);
  if (!intersections.features || intersections.features.length === 0) {
    throw new Error("No intersections found between the circles. Try again with a different bearing.");
  }

  // Step 4: Choose the intersection whose distance from firstStop is closest to segmentLength.
  const secondStopFeature = intersections.features.reduce((closest, feature) => {
    const currDist = distance(firstStop, feature.geometry.coordinates, { units: "kilometers" });
    const bestDist = closest ? distance(firstStop, closest.geometry.coordinates, { units: "kilometers" }) : Infinity;
    return Math.abs(currDist - segmentLength) < Math.abs(bestDist - segmentLength) ? feature : closest;
  }, intersections.features[0]);
  const secondStop = secondStopFeature.geometry.coordinates;

  // Construct the waypoint loop: start → firstStop → secondStop → start.
  const waypoints: number[][] = [startPoint, firstStop, secondStop, startPoint].map((point) => {
    if (Array.isArray(point)) {
      return point as number[];
    } else if (point.type === "Feature" && point.geometry.type === "Point") {
      return point.geometry.coordinates as number[];
    }
    throw new Error("Invalid coordinate format");
  });

  // Convert waypoints to an array of Coordinate objects for snapping to roads.
  const coordinateWaypoints: Coordinate[] = waypoints.map(([longitude, latitude]) => ({ latitude, longitude }));
  const adjustedPins = await adjustPinsToStreetsWithGoogleAPI(coordinateWaypoints);
  // Convert the adjusted pins back to [lng, lat] format.
  const finalWaypoints = adjustedPins.map((pin) => [pin.longitude, pin.latitude]);

  // Build a Google Directions API URL for the entire loop.
  const formatCoord = (coord: number[]): string => `${coord[1]},${coord[0]}`;
  const originStr = formatCoord(startPoint as number[]);
  const destinationStr = originStr; // Loop route: ends where it starts.
  const waypointStr = [firstStop, secondStop].map(formatCoord).join("|");
  const googleUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&waypoints=${waypointStr}&mode=walking&key=${API_KEY}`;

  // Query Google Directions.
  const response = await axios.get<DirectionsResponse>(googleUrl);
  if (!response.data.routes || response.data.routes.length === 0) {
    throw new Error("No routes found from Google Directions API");
  }
  const finalPolyline = response.data.routes[0].overview_polyline.points;

  // Compute the route length: sum the distances from each leg.
  const routeDistanceMeters = response.data.routes[0].legs.reduce((sum, leg) => sum + leg.distance.value, 0);
  const routeDistanceKm = routeDistanceMeters / 1000;

  // Compute elevation gain for this route.
  const elevationGain = await getElevationGain(finalPolyline);

  return {
    waypoints: finalWaypoints,
    directions: finalPolyline,
    elevationGain,
    length: routeDistanceKm,
  };
}

/**
 * Given an encoded polyline, decodes it into coordinates, then queries the Google Elevation API
 * to retrieve elevation data for the route. It then calculates the total positive elevation gain.
 */
async function getElevationGain(polylineStr: string): Promise<number> {
  // Decode the polyline into an array of [lat, lng] coordinates.
  const decoded: number[][] = decodePolyline(polylineStr);
  if (decoded.length === 0) return 0;

  // Google Elevation API expects locations in "lat,lng" format separated by pipes.
  const locationsParam = decoded.map((coord) => `${coord[0]},${coord[1]}`).join("|");
  const elevationUrl = `https://maps.googleapis.com/maps/api/elevation/json?locations=${locationsParam}&key=${API_KEY}`;
  const response = await axios.get(elevationUrl);
  const data = response.data;
  if (!data.results || data.results.length === 0) {
    return 0;
  }
  let totalGain = 0;
  for (let i = 1; i < data.results.length; i++) {
    const diff = data.results[i].elevation - data.results[i - 1].elevation;
    if (diff > 0) {
      totalGain += diff;
    }
  }
  return totalGain;
}

/**
 * Generates three circular routes (using the above logic), calculates the elevation gain for each,
 * sorts them (lowest gain = easiest, highest gain = hardest), and assigns difficulty labels accordingly.
 * Each route object also contains the actual route length (in kilometers).
 */
async function CircularAlgorithm({ routeLengthKm, startPoint }: AlgorithmParams): Promise<RouteWithDifficulty[]> {
  const routes: RouteResult[] = [];
  for (let i = 0; i < 3; i++) {
    try {
      const route = await generateCircularRoute(startPoint, routeLengthKm * 0.6);
      routes.push(route);
    } catch (error) {
      console.error("Error generating route:", error);
      console.log("start poiny in circular algorithm: ", startPoint);
      i--; // Try again if a route fails to generate.
    }
  }

  // Sort routes by elevation gain (ascending: lowest gain first).
  routes.sort((a, b) => a.elevationGain - b.elevationGain);

  // Assign difficulty labels based on sorted order.
  const difficulties: Difficulty[] = ["easy", "medium", "hard"];
  const routesWithDifficulty: RouteWithDifficulty[] = routes.map((route, index) => ({
    ...route,
    difficulty: difficulties[index],
  }));

  return routesWithDifficulty;
}

// -------------------
// Export
// -------------------
export default CircularAlgorithm;
