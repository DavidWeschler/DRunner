// // Import the necessary Turf.js functions
// import { circle, destination, lineIntersect, distance, Coord, Units } from "@turf/turf";
// import axios from "axios";

// const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

// // depricated (?)

// interface Pin {
//   latitude: number;
//   longitude: number;
// }

// interface Coordinate {
//   latitude: number;
//   longitude: number;
// }
// interface DirectionsResponse {
//   routes: {
//     overview_polyline: {
//       points: string;
//     };
//   }[];
// }

// interface Coordinate {
//   latitude: number;
//   longitude: number;
// }

// interface SnappedPoint {
//   location: Coordinate;
// }

// interface NearestRoadsResponse {
//   snappedPoints: SnappedPoint[];
// }

// const getDirectionsBetweenPins = async (pins: Pin[]): Promise<string[]> => {
//   console.log(`Setting directions between pins... Calling Google API ${pins.length} times`);

//   const directions: string[] = [];

//   for (let i = 0; i < pins.length; i++) {
//     const start = pins[i];
//     const end = pins[(i + 1) % pins.length]; // Ensures last pin connects to first pin

//     const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${start.latitude},${start.longitude}&destination=${end.latitude},${end.longitude}&mode=walking&key=${API_KEY}`;

//     try {
//       const response = await axios.get<DirectionsResponse>(url);
//       const data = response.data;
//       if (data.routes.length > 0) {
//         directions.push(data.routes[0].overview_polyline.points);
//       }
//     } catch (error) {
//       console.error(`Error fetching directions between pin ${i} and pin ${(i + 1) % pins.length}:`, error);
//     }
//   }

//   return directions;
// };

// const adjustPinToRoad = async (coord: Coordinate): Promise<Coordinate> => {
//   const { latitude, longitude } = coord;
//   const url = `https://roads.googleapis.com/v1/nearestRoads?points=${encodeURIComponent(latitude)},${encodeURIComponent(longitude)}&key=${API_KEY}`;

//   try {
//     console.log("using api key..");
//     const response = await axios.get<NearestRoadsResponse>(url);
//     if (response.data.snappedPoints) {
//       const { location } = response.data.snappedPoints[0];
//       return { latitude: location.latitude, longitude: location.longitude };
//     }
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       if (error.response) {
//         console.error("Error response from API:", error.response.data);
//         console.error("Status code:", error.response.status);
//       } else if (error.request) {
//         console.error("No response received:", error.request);
//       } else {
//         console.error("Error in setting up the request:", error.message);
//       }
//     } else {
//       console.error("Unexpected error:", error);
//     }
//   }
//   console.log("failed to adjust a coordinate");
//   return coord; // Return original coordinate if snapping fails
// };

// const adjustPinsToStreetsWithGoogleAPI = async (pins: Coordinate[]): Promise<Coordinate[]> => {
//   const adjustedPins: Coordinate[] = await Promise.all(pins.map((pin) => adjustPinToRoad(pin)));
//   return adjustedPins;
// };

// interface AlgorithmParams {
//   routeLengthKm: number;
//   startPoint: Coord;
//   //   difficulty: string;
// }

// // async function Algorithm(startPoint: Coord, routeLengthKm: number): Promise<{ waypoints: Array<Array<number>>; directions: object }> {
// async function Algorithm({ routeLengthKm, startPoint }: AlgorithmParams) {
//   // Divide the route length into three segments.
//   const segmentLength = routeLengthKm / 3;

//   // Step 1: Compute the first stop by projecting from the startPoint a random distance.
//   // Turf's destination takes [lng, lat], a distance, and a bearing (in degrees).
//   const randomBearing = Math.random() * 360; // Random angle between 0 and 360 degrees.
//   const firstStopPoint = destination(startPoint, segmentLength, randomBearing, { units: "kilometers" });
//   const firstStop = firstStopPoint.geometry.coordinates; // [lng, lat]

//   // Step 2: Create two circles (polygons) centered at startPoint and firstStop.
//   const circleOptions: { steps: number; units: Units } = { steps: 64, units: "kilometers" };
//   const circleFromStart = circle(startPoint, segmentLength, circleOptions);
//   const circleFromFirst = circle(firstStop, segmentLength, circleOptions);

//   // Step 3: Compute the intersection points between the two circles.
//   const intersections = lineIntersect(circleFromStart, circleFromFirst);

//   if (!intersections.features || intersections.features.length === 0) {
//     throw new Error("No intersections found between the circles. Try again with a different bearing.");
//   }

//   // Step 4: Choose the intersection whose distance from firstStop is closest to segmentLength.
//   const secondStopFeature = intersections.features.reduce((closest, feature) => {
//     const currDist = distance(firstStop, feature.geometry.coordinates, { units: "kilometers" });
//     const bestDist = closest ? distance(firstStop, closest.geometry.coordinates, { units: "kilometers" }) : Infinity;
//     return Math.abs(currDist - segmentLength) < Math.abs(bestDist - segmentLength) ? feature : closest;
//   }, intersections.features[0]);
//   const secondStop = secondStopFeature.geometry.coordinates;

//   // Construct the waypoint array as a loop: start, first stop, second stop, then back to start.
//   const waypoints: number[][] = [startPoint, firstStop, secondStop, startPoint].map((point) => {
//     if (Array.isArray(point)) {
//       return point as number[];
//     } else if (point.type === "Feature" && point.geometry.type === "Point") {
//       return point.geometry.coordinates as number[];
//     }
//     throw new Error("Invalid coordinate format");
//   });

//   const coordinateWaypoints: Coordinate[] = waypoints.map(([longitude, latitude]) => ({ latitude, longitude }));
//   const adjustedPins = await adjustPinsToStreetsWithGoogleAPI(coordinateWaypoints);
//   const directions = await getDirectionsBetweenPins(adjustedPins);
//   return { adjustedPins, directions };
// }

// export default Algorithm;
