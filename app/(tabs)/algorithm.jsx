import Constants from "expo-constants";
import { point, circle, bearingToAzimuth, destination } from "@turf/turf";
import axios from "axios";

// const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_API_KEY = "DEMO";

// Function to adjust a single pin to the nearest road - using Google Roads API
const adjustPinToRoad = async (coord) => {
  const { latitude, longitude } = coord;
  const url = `https://roads.googleapis.com/v1/nearestRoads?points=${encodeURIComponent(latitude)},${encodeURIComponent(longitude)}&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await axios.get(url);
    if (response.data.snappedPoints) {
      const { location } = response.data.snappedPoints[0];
      return { latitude: location.latitude, longitude: location.longitude };
    }
  } catch (error) {
    if (error.response) {
      console.error("Error response from API:", error.response.data);
      console.error("Status code:", error.response.status);
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error in setting up the request:", error.message);
    }
  }
  console.log("failed to asjust a coordinate");
  return coord; // Return original coordinate if snapping fails
};

const adjustPinsToStreetsWithGoogleAPI = async (pins) => {
  const adjustedPins = await Promise.all(pins.map((pin) => adjustPinToRoad(pin)));
  return adjustedPins;
};

// Algorithm to generate a circular route of pins
const Algorithm = async (startLocation, lengthKm) => {
  const { latitude, longitude } = startLocation;
  const numPins = Math.min(5, Math.max(3, Math.ceil(lengthKm / 2)));
  const radiusKm = lengthKm / (2 * Math.PI);
  const center = point([longitude, latitude]);

  // Calculate the angle increment for each pin
  const angleIncrement = 360 / numPins;

  // Generate pins by calculating destinations at equal angles starting from the given location
  const pins = [{ latitude, longitude }]; // Start with the initial location
  for (let i = 1; i < numPins; i++) {
    const angle = i * angleIncrement;

    // Use Turf.js destination method to calculate the new point
    const destinationPoint = destination(center, radiusKm, angle, { units: "kilometers" });

    // Extract latitude and longitude from the destination point
    const [destLongitude, destLatitude] = destinationPoint.geometry.coordinates;
    pins.push({ latitude: destLatitude, longitude: destLongitude });
  }

  // COMMENT OUT these 2 lines of code to save API calls in debugging!!!!!! API_KEY_1
  //   adjustedPins = await adjustPinsToStreetsWithGoogleAPI(pins);
  //   return adjustedPins;

  return pins;
};

export default Algorithm;

//------------------------------------------------------- for debbuging uses -------------------------------------------

//   const dummy =  [
//     { latitude: 31.747829999999997, longitude: 35.2297785640655 },
//     { latitude: 31.742684601665083, longitude: 35.22840393440912 },
//     { latitude: 31.73950298030056, longitude: 35.22482800719663 },
//     { latitude: 31.739507156912385, longitude: 35.22040692259369 },
//     { latitude: 31.74269421104715, longitude: 35.21683447028687 },
//     { latitude: 31.747841037066735, longitude: 35.21546587891893 },
//     { latitude: 31.752983541427767, longitude: 35.21684522552989 },
//     { latitude: 31.75616029080586, longitude: 35.22042392267836 },
//     { latitude: 31.756149575063443, longitude: 35.224845008300804 },
//     { latitude: 31.752957644691733, longitude: 35.22841469115308 },
//     { latitude: 31.74783, longitude: 35.222622 }, // My home location
//   ];
