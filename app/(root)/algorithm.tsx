import { point, circle, bearingToAzimuth, destination, Units } from "@turf/turf";
import * as turf from "@turf/turf";
import Constants from "expo-constants";
import axios from "axios";

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

// pins is an array of points, in the form of: {latitude, longitude}
interface Pin {
  latitude: number;
  longitude: number;
}

interface DirectionsResponse {
  routes: {
    overview_polyline: {
      points: string;
    };
  }[];
}

const getDirectionsBetweenPins = async (pins: Pin[]): Promise<string[]> => {
  console.log(`Setting directions between pins... Calling Google API ${pins.length} times`);

  const directions: string[] = [];

  for (let i = 0; i < pins.length; i++) {
    const start = pins[i];
    const end = pins[(i + 1) % pins.length]; // Ensures last pin connects to first pin

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

// Function to decode the polyline response
interface Coordinate {
  latitude: number;
  longitude: number;
}

const decodePolyline = (encoded: string): Coordinate[] => {
  let polyline: Coordinate[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let byte: number;
    let shift = 0;
    let result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    let dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    let dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    polyline.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return polyline;
};

const dummy = [
  { latitude: 31.747829999999997, longitude: 35.2297785640655 },
  { latitude: 31.742684601665083, longitude: 35.22840393440912 },
  { latitude: 31.73950298030056, longitude: 35.22482800719663 },
  { latitude: 31.739507156912385, longitude: 35.22040692259369 },
  { latitude: 31.74269421104715, longitude: 35.21683447028687 },
  { latitude: 31.747841037066735, longitude: 35.21546587891893 },
  { latitude: 31.752983541427767, longitude: 35.21684522552989 },
  { latitude: 31.75616029080586, longitude: 35.22042392267836 },
  { latitude: 31.756149575063443, longitude: 35.224845008300804 },
  { latitude: 31.752957644691733, longitude: 35.22841469115308 },
  { latitude: 31.74783, longitude: 35.222622 }, // My home location
];

// Function to adjust a single pin to the nearest road - using Google Roads API
interface Coordinate {
  latitude: number;
  longitude: number;
}

interface SnappedPoint {
  location: Coordinate;
}

interface NearestRoadsResponse {
  snappedPoints: SnappedPoint[];
}

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
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("Error response from API:", error.response.data);
        console.error("Status code:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error in setting up the request:", error.message);
      }
    } else {
      console.error("Unexpected error:", error);
    }
  }
  console.log("failed to adjust a coordinate");
  return coord; // Return original coordinate if snapping fails
};

const adjustPinsToStreetsWithGoogleAPI = async (pins: Coordinate[]): Promise<Coordinate[]> => {
  const adjustedPins: Coordinate[] = await Promise.all(pins.map((pin) => adjustPinToRoad(pin)));
  return adjustedPins;
};

// right now this calculates a circle around the starting point
interface AlgorithmParams {
  length: number;
  startPoint: Coordinate;
  endPoint: Coordinate | null;
  difficulty: string;
}

const Algorithm = async ({ length, startPoint, endPoint, difficulty }: AlgorithmParams) => {
  console.log("Starting to calculate route...");

  if (!length || !startPoint || !difficulty) {
    console.error("Missing input parameters");
    return [];
  }

  const sLatitude = startPoint.latitude;
  const sLongitude = startPoint.longitude;
  const lengthKM = length;

  const startingPoint = turf.point([sLongitude, sLatitude]);

  // Convert length to radius for circular path calculation
  const radius = lengthKM / (2 * Math.PI); // Convert perimeter to radius
  const options = { steps: 64, units: "kilometers" as Units };
  const circle = turf.circle(startingPoint, radius, options);

  // Get the coordinates of the circle's perimeter
  const coordinates = circle.geometry.coordinates[0];

  // Number of waypoints to generate
  const numPins = lengthKM <= 3 ? 3 : lengthKM <= 5 ? 4 : 5;
  const step = Math.floor(coordinates.length / numPins);
  const pins = [];

  // Add the start point as the first pin
  pins.push({ latitude: sLatitude, longitude: sLongitude });

  // Select points from the perimeter for a loop
  for (let i = 1; i < numPins; i++) {
    const coord = coordinates[i * step];
    pins.push({ latitude: coord[1], longitude: coord[0] });
  }

  pins.forEach((pin, index) => {
    console.log(`Pin ${index + 1}: ${pin.latitude}, ${pin.longitude}`);
  });

  const adjustedPins = await adjustPinsToStreetsWithGoogleAPI(pins);
  return adjustedPins;
};

export { Algorithm, decodePolyline, getDirectionsBetweenPins };
