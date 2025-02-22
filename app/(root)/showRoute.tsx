import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Button, StyleSheet } from "react-native";
import Algorithm from "./algorithm";
import Line_Algorithm from "./line_algorithm";
import Map from "../../components/Map";
import { useLocationStore } from "../../store/index";
import { Coord } from "@turf/turf";

const ShowRun = () => {
  const { setUserLocation, setDestinationLocation, setMapTheme } = useLocationStore();
  const mapTheme = useLocationStore((state) => state.mapTheme);
  // Retrieve map theme from store
  const inpLength = useLocationStore((state) => state.length);
  const inpStartPoint = useLocationStore((state) => state.startPoint);
  const inpEndPoint = useLocationStore((state) => state.endPoint);
  const inpDifficulty = useLocationStore((state) => state.difficulty);

  const [routePins, setRoutePins] = useState<{ latitude: number; longitude: number }[]>([]);
  const [routeDirections, setRouteDirections] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoute = async () => {
      try {
        if (inpLength === null || inpStartPoint === null || inpDifficulty === null) {
          throw new Error("Invalid input values");
        }

        // non circular route
        if (inpEndPoint !== null) {
          const inputsLine = {
            routeLengthKm: inpLength,
            startPoint: [inpStartPoint.longitude, inpStartPoint.latitude] as [number, number],
            endPoint: [inpEndPoint.longitude, inpEndPoint.latitude] as [number, number],
            // difficulty: inpDifficulty,
          };

          console.log("inps start: ", inputsLine.startPoint);
          console.log("inps end: ", inputsLine.endPoint);

          const result = await Line_Algorithm(inputsLine);
          if (Array.isArray(result)) {
            throw new Error("Unexpected result format from Algorithm");
          }
          const { waypoints, directions } = result;

          // Assuming Coord has properties `geometry.coordinates`
          const formattedWaypoints = waypoints.map((wp: [number, number]) => ({
            latitude: wp[1],
            longitude: wp[0],
          }));

          setRoutePins(formattedWaypoints);
          setRouteDirections(directions.split("\n"));

          setLoading(false); // wtf is this
          return;
        }

        // circular route
        const inputs = {
          routeLengthKm: inpLength,
          startPoint: [inpStartPoint.longitude, inpStartPoint.latitude] as [number, number],
          // endPoint: inpEndPoint,
          // difficulty: inpDifficulty,
        };

        const result = await Algorithm(inputs);
        if (Array.isArray(result)) {
          throw new Error("Unexpected result format from Algorithm");
        }
        const { adjustedPins, directions } = result;
        setRoutePins(adjustedPins);
        setRouteDirections(directions);
      } catch (error) {
        console.error("Error calculating route:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* Map Component */}
      <Map theme={mapTheme || "standard"} pins={routePins} directions={routeDirections} />

      {/* Button Wrapper */}
      <View style={styles.buttonContainer}>
        <Button title="Start Run" onPress={() => console.log("Start Run")} />
      </View>
    </View>
  );
};

export default ShowRun;

const styles = StyleSheet.create({
  buttonContainer: {
    position: "absolute", // Ensures the button overlays the map
    bottom: 20, // Distance from the bottom
    left: "50%", // Center horizontally
    transform: [{ translateX: -50 }], // Adjust for centering
    backgroundColor: "white", // Ensure visibility
    padding: 10,
    borderRadius: 10,
    elevation: 5, // Add shadow for Android
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
