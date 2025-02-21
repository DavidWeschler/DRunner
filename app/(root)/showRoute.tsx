// import BottomSheet, { BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet";
// import { router } from "expo-router";
// import React, { useRef } from "react";
// import { Image, Text, TouchableOpacity, View } from "react-native";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import { useLocationStore } from "@/store";

// import Map from "@/components/Map";
// import { icons } from "@/constants";

// import { Algorithm, decodePolyline, getDirectionsBetweenPins } from "./algorithm";

// const showRun = async () => {
//   const { setUserLocation, setDestinationLocation, setMapTheme } = useLocationStore();

//   // retriee map theme from store
//   const mapTheme = useLocationStore((state) => state.mapTheme);

//   console.log("mapTheme", mapTheme);

//   // this is temporarally hardcoded
//   const inputs = {
//     length: 10,
//     startPoint: { latitude: 32.144065, longitude: 34.876698 },
//     difficulty: "easy",
//   };

//   const routePins = await Algorithm(inputs);
//   console.log("routePins", routePins);

//   // const routeDirections = await getDirectionsBetweenPins(routePins);
//   const routeDirections = null;

//   return <Map theme={mapTheme || "standard"} pins={routePins} directions={routeDirections} />;
// };

// export default showRun;
//-------------------------------------------------------------------------------------------------------------------------

import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Button, StyleSheet } from "react-native";
import { Algorithm, decodePolyline, getDirectionsBetweenPins } from "./algorithm";
import Map from "../../components/Map";
import { useLocationStore } from "../../store/index";

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

        const inputs = {
          length: inpLength,
          startPoint: inpStartPoint,
          endPoint: inpEndPoint,
          difficulty: inpDifficulty,
        };

        const pins = await Algorithm(inputs);
        setRoutePins(pins);

        const directions = await getDirectionsBetweenPins(pins);
        // const directions = null;
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
