import { distance, bearing, destination } from "@turf/turf";
import axios from "axios";
import polyline from "polyline";

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

type Coord = [number, number];

interface AlgorithmParams {
  routeLengthKm: number;
  startPoint: Coord; // [lng, lat]
  endPoint: Coord; // [lng, lat]
  mode: string;
}

interface DirectionLeg {
  distance: { value: number; text: string };
}

interface GoogleRoute {
  legs: DirectionLeg[];
  overview_polyline: { points: string };
}

interface DirectionsResponse {
  routes: GoogleRoute[];
}

export interface RouteObject {
  difficulty: "easy" | "medium" | "hard";
  directions: string;
  elevationGain: number;
  waypoints: Coord[];
  length: number;
}

// Formats a coordinate [lng, lat] as a "lat,lng" string required by Google APIs.
const formatCoord = (coord: number[]): string => `${coord[1]},${coord[0]}`;

// Fetch directions from Google using origin, destination, and an optional waypoint.
async function fetchDirectionsWithWaypoint(mode: string, origin: number[], destination: number[], waypoint?: number[]): Promise<DirectionsResponse> {
  const originStr = formatCoord(origin);
  const destinationStr = formatCoord(destination);
  let url = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&mode=${mode}&key=${API_KEY}`;
  if (waypoint) {
    const waypointStr = formatCoord(waypoint);
    url += `&waypoints=${waypointStr}`;
  }
  const response = await axios.get<DirectionsResponse>(url);
  return response.data;
}

// Decodes an encoded polyline string into an array of [lat, lng] coordinates.
function decodePolyline(polylineStr: string): number[][] {
  return polyline.decode(polylineStr);
}

/**
 * Given an encoded polyline, this function queries the Google Elevation API,
 * decodes the polyline into coordinates, and computes the total positive elevation gain.
 */
async function getElevationGain(polyline: string): Promise<number> {
  const decoded: number[][] = decodePolyline(polyline);
  if (decoded.length === 0) return 0;

  const locationsParam = decoded.map((coord) => `${coord[0]},${coord[1]}`).join("|");
  const elevationUrl = `https://maps.googleapis.com/maps/api/elevation/json?locations=${locationsParam}&key=${API_KEY}`;
  const response = await axios.get(elevationUrl);
  const data = response.data;
  if (!data.results || data.results.length === 0) return 0;

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
 * Generates three routes between startPoint and endPoint.
 * Each route uses a randomly generated detour waypoint to (try to) achieve the desired routeLengthKm.
 * The returned routes are sorted by elevation gain (lowest gain → "easy", then "medium", then "hard").
 */
async function Line_Algorithm({ routeLengthKm, startPoint, endPoint, mode = "walking" }: AlgorithmParams): Promise<RouteObject[]> {
  const routes: RouteObject[] = [];

  // Compute the direct (straight-line) distance for reference.
  const directDistance = distance(startPoint, endPoint, { units: "kilometers" });

  // If the desired route length is less than or equal to the direct distance, return a direct route.
  if (routeLengthKm <= directDistance) {
    // make a route that goes directly from start to end without any waypoints, calculate the elevation and actuall length, and return it as the only route
    const directionsData: DirectionsResponse = await fetchDirectionsWithWaypoint(mode, startPoint, endPoint);
    if (directionsData.routes.length === 0) {
      throw new Error("No routes found by Google Directions API for direct route");
    }
    const polylineStr = directionsData.routes[0].overview_polyline.points;
    const routeDistanceMeters = directionsData.routes[0].legs.reduce((sum, leg) => sum + leg.distance.value, 0);
    const routeDistanceKm = routeDistanceMeters / 1000;
    const elevationGain = await getElevationGain(polylineStr);
    const routeObj: RouteObject = {
      difficulty: "easy",
      directions: polylineStr,
      elevationGain,
      waypoints: [startPoint, endPoint],
      length: routeDistanceKm,
    };
    return [routeObj];
  }

  // Generate 3 routes with randomized detour waypoints.
  for (let i = 0; i < 3; i++) {
    // --- DETOUR WAYPOINT CALCULATION ---
    // Compute the midpoint between start and end.
    const midPoint: number[] = [(startPoint[0] + endPoint[0]) / 2, (startPoint[1] + endPoint[1]) / 2];

    // Nominal perpendicular offset (dNominal) needed to reach the desired length in a symmetric scenario.
    const halfDesired = (0.7 * routeLengthKm) / 2;
    const halfDirect = directDistance / 2;
    const dNominal = Math.sqrt(halfDesired * halfDesired - halfDirect * halfDirect);

    // Vary the detour distance with a random factor (e.g., between 0.7 and 1.3).
    const randomFactor = 0.7 + 0.6 * Math.random();
    const dRandom = dNominal * randomFactor; // in kilometers

    // Compute the base bearing from start to end.
    const baseBearing = bearing(startPoint, endPoint);
    // Compute a random offset angle between -15 and +15 degrees.
    const randomOffset = (Math.random() - 0.5) * 30;
    // Randomly choose left or right by applying ±90°.
    const sign = Math.random() < 0.5 ? 1 : -1;
    const detourBearing = baseBearing + sign * (90 + randomOffset);

    // Compute the detour waypoint using the midpoint, the random detour distance, and the detour bearing.
    const detourPoint: Coord = destination(midPoint, dRandom, detourBearing, { units: "kilometers" }).geometry.coordinates as Coord; // [lng, lat]

    // --- FETCH DIRECTIONS FOR THE DETOUR ROUTE ---
    const directionsData: DirectionsResponse = await fetchDirectionsWithWaypoint(mode, startPoint, endPoint, detourPoint);
    if (directionsData.routes.length === 0) {
      throw new Error("No routes found by Google Directions API for detour route");
    }
    const polylineStr = directionsData.routes[0].overview_polyline.points;

    // Compute the actual route length (sum of legs).
    const routeDistanceMeters = directionsData.routes[0].legs.reduce((sum, leg) => sum + leg.distance.value, 0);
    const routeDistanceKm = routeDistanceMeters / 1000;

    // Compute total positive elevation gain along the route.
    const elevationGain = await getElevationGain(polylineStr);

    // Build the route object.
    const routeObj: RouteObject = {
      difficulty: "easy", // temporary assignment; will update after sorting
      directions: polylineStr,
      elevationGain,
      waypoints: [startPoint, detourPoint, endPoint],
      length: routeDistanceKm,
    };

    routes.push(routeObj);
  }

  // Sort the routes by elevation gain (lowest gain first).
  routes.sort((a, b) => a.elevationGain - b.elevationGain);

  // Assign difficulty labels based on sorted order.
  const difficulties: ("easy" | "medium" | "hard")[] = ["easy", "medium", "hard"];
  for (let i = 0; i < routes.length; i++) {
    routes[i].difficulty = difficulties[i];
  }

  return routes;
}

export default Line_Algorithm;

/*
Above is a complete TypeScript implementation that generates three routes between a start and end point. 
Each route is built by adding a random detour waypoint between the start and end. The code then fetches walking 
directions via the Google Directions API, computes the actual route length and its total positive elevation gain 
(via the Google Elevation API), and finally returns an array of three route objects. Each object contains:

difficulty: Assigned based on elevation gain (lowest gain → "easy", next → "medium", highest → "hard").
directions: The encoded polyline returned by Google.
elevationGain: The total positive elevation gain (in meters) along the route.
waypoints: An array of three coordinates (start, detour, end) in [lng, lat] format.
length: The actual route length (in kilometers) as returned by Google.


How It Works
1.Random Detour Waypoint Generation:
  For each route, we compute the midpoint of the straight line from start to end. We then calculate a nominal perpendicular offset (based on the desired route length and direct distance) and vary it randomly (by a factor between 0.7 and 1.3). We also randomize the detour angle by adding a random offset (±15°) to a perpendicular bearing (base bearing ±90°). This produces a detour waypoint that varies between route generations.

2.Fetching Directions and Calculations:
  Using the start, detour, and end points, the algorithm calls the Google Directions API. It computes the route length (summing the leg distances) and then calculates the route’s total positive elevation gain (via the Google Elevation API after decoding the polyline).

3.Sorting and Difficulty Assignment:
  Three routes are generated and stored. They are then sorted in ascending order of elevation gain. The route with the lowest elevation gain is labeled "easy," the next "medium," and the one with the highest gain is labeled "hard."

4.Return Value:
  The function returns an array of three route objects containing the required keys: difficulty, directions (encoded polyline), elevationGain, waypoints, and actual length.

*/
