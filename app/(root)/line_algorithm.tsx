import { distance as turfDistance } from "@turf/turf";

type Coord = [number, number]; // [lng, lat]

const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

interface AlgorithmParams {
  routeLengthKm: number | null;
  startPoint: Coord; // [lng, lat]
  endPoint: Coord; // [lng, lat]
}

interface DirectionLeg {
  distance: {
    value: number; // distance in meters
    text: string;
  };
  // ... other leg properties
}

interface GoogleRoute {
  legs: DirectionLeg[];
  overview_polyline: {
    points: string;
  };
}

interface DirectionsResponse {
  routes: GoogleRoute[];
  // ... other response properties
}

// Helper function to format a coordinate to "lat,lng" (as required by Google)
function formatCoord(coord: Coord): string {
  return `${coord[1]},${coord[0]}`;
}

// Helper function to fetch directions from Google
async function fetchDirections(startPoint: Coord, endPoint: Coord): Promise<DirectionsResponse> {
  const originStr = formatCoord(startPoint);
  const destinationStr = formatCoord(endPoint);
  const googleUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${originStr}&destination=${destinationStr}&mode=walking&key=${API_KEY}`;
  const response = await fetch(googleUrl);
  if (!response.ok) {
    throw new Error("Failed to fetch directions from Google API");
  }
  return await response.json();
}

async function Line_Algorithm({ routeLengthKm, startPoint, endPoint }: AlgorithmParams) {
  // Fetch the actual route from Google Directions
  const directionsData: DirectionsResponse = await fetchDirections(startPoint, endPoint);
  if (directionsData.routes.length === 0) {
    throw new Error("No routes found by Google Directions API");
  }

  // Sum up the distances for the first route
  const totalDistanceMeters = directionsData.routes[0].legs.reduce((sum, leg) => sum + leg.distance.value, 0);
  const totalDistanceKm = totalDistanceMeters / 1000;

  console.log(`Actual route distance: ${totalDistanceKm} km`); // THIS IS IMPORTANT - WE SHOULD SHOW THIS TO THE USER

  // Now check: if no routeLengthKm is provided, or if the actual route is long enough, use it.
  if (!routeLengthKm || totalDistanceKm >= routeLengthKm) {
    console.log(`Actual route distance: ${totalDistanceKm} km meets desired ${routeLengthKm} km`);
    // Return the start and end as waypoints, and the overview polyline from Google.
    return {
      waypoints: [startPoint, endPoint],
      directions: directionsData.routes[0].overview_polyline.points,
      //   directions: directionsData,
    };
  } else {
    // If the actual route is shorter than the desired length, you can add alternative logic here.
    throw new Error("Actual route is shorter than the desired route length. Implement alternative route generation logic.");
  }
}

export default Line_Algorithm;
