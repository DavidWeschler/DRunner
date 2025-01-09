import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import * as Location from "expo-location";
import axios from "axios";
import Algorithm from "./algorithm";
import Constants from "expo-constants";

// const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY;
const GOOGLE_MAPS_API_KEY = "Demo";

const generatePins = async (location) => {
  const pins = await Algorithm(location, 10);
  return pins;
};

const getDirections = async (origin, destination) => {
  const directionsUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&mode=walking&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const response = await axios.get(directionsUrl);
    if (response.data.routes.length > 0) {
      // Get the polyline points from the API response
      const points = response.data.routes[0].overview_polyline.points;
      return points;
    } else {
      console.error("No routes found");
    }
  } catch (error) {
    console.error("Error fetching directions:", error);
  }
  return null;
};

const MapWithPins = () => {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [runningRoutePins, setRunningRoutePins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [directions, setDirections] = useState(null);

  const isCircular = true; // Set this to `true` for a circular route

  // Set the current location
  useEffect(() => {
    const fetchLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        let location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location.coords);
      } else {
        console.error("Permission to access location was denied");
      }
    };

    fetchLocation();
  }, []);

  // Generate pins when the location is available
  useEffect(() => {
    if (currentLocation) {
      const fetchPins = async () => {
        setLoading(true);
        const pins = await generatePins(currentLocation);
        setRunningRoutePins(pins);
        setLoading(false);

        // Fetch directions for each pin and set them to state API_KEY_3
        const directionsPromises = [];
        for (let i = 0; i < pins.length - 1; i++) {
          directionsPromises.push(getDirections(pins[i], pins[i + 1]));
        }

        // If the route is circular, also get the directions from the last pin back to the first
        if (isCircular && pins.length > 1) {
          directionsPromises.push(getDirections(pins[pins.length - 1], pins[0]));
        }

        const allDirections = await Promise.all(directionsPromises);
        setDirections(allDirections.filter(Boolean)); // Filter out null responses
      };

      fetchPins();
    }
  }, [currentLocation]);

  if (loading || !currentLocation) {
    return <Text>Loading...</Text>;
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* Markers for the runningRoutePins */}
        {runningRoutePins.map((pin, index) => (
          <Marker key={index} coordinate={{ latitude: pin.latitude, longitude: pin.longitude }} title={`Pin ${index + 1}`} />
        ))}

        {/* Draw the polyline for directions API_KEY_2 */}
        {/* {directions &&
          directions.map((points, index) => (
            <Polyline
              key={index}
              coordinates={decodePolyline(points)}
              strokeColor="#000" // Customize color
              strokeWidth={4} // Customize width
            />
          ))} */}
      </MapView>
    </View>
  );
};

// Function to decode the polyline response
const decodePolyline = (encoded) => {
  let polyline = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let byte;
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default MapWithPins;
