import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Button, StyleSheet } from "react-native";
import CircularAlgorithm from "./circle_algorithm";
import Line_Algorithm from "./line_algorithm";
import Map from "../../components/Map";
import { useLocationStore } from "../../store/index";

const ShowRun = () => {
  const mapTheme = useLocationStore((state) => state.mapTheme);
  // Retrieve map theme from store
  const inpLength = useLocationStore((state) => state.length);
  const inpStartPoint = useLocationStore((state) => state.startPoint);
  const inpEndPoint = useLocationStore((state) => state.endPoint);
  const inpDifficulty = useLocationStore((state) => state.difficulty);

  // easy route:
  const [routePinsE, setRoutePinsE] = useState<{ latitude: number; longitude: number }[]>([]);
  const [routeDirectionsE, setRouteDirectionsE] = useState<string[] | null>(null);

  // medium route:
  const [routePinsM, setRoutePinsM] = useState<{ latitude: number; longitude: number }[]>([]);
  const [routeDirectionsM, setRouteDirectionsM] = useState<string[] | null>(null);

  // hard route:
  const [routePinsH, setRoutePinsH] = useState<{ latitude: number; longitude: number }[]>([]);
  const [routeDirectionsH, setRouteDirectionsH] = useState<string[] | null>(null);

  const [loading, setLoading] = useState(true);

  const [easyMap, setEasyMap] = useState(false);
  const [mediumMap, setMediumMap] = useState(false);
  const [hardMap, setHardMap] = useState(false);

  const [hideHeader, setHideHeader] = useState(false);
  const [hideButton, setHideButton] = useState(false);

  useEffect(() => {
    const straightRoute = async () => {
      if (inpStartPoint === null || inpEndPoint === null) {
        throw new Error("Invalid input values");
      }

      const inputsLine = {
        routeLengthKm: inpLength || 0,
        startPoint: [inpStartPoint.longitude, inpStartPoint.latitude] as [number, number],
        endPoint: [inpEndPoint.longitude, inpEndPoint.latitude] as [number, number],
      };

      const results = await Line_Algorithm(inputsLine);

      console.log("results line route:\n", results);

      // If the user chose a route that is too short, the algorithm will return the same route for all difficulties
      // in this case, we will set the same route for all difficulties
      const [easyRoute, mediumRoute, hardRoute] = results.length === 1 ? [results[0], results[0], results[0]] : results;

      setRoutePinsE(easyRoute.waypoints.map((wp: number[]) => ({ latitude: wp[1], longitude: wp[0] })));
      setRouteDirectionsE(easyRoute.directions.split("\n"));

      setRoutePinsM(mediumRoute.waypoints.map((wp: number[]) => ({ latitude: wp[1], longitude: wp[0] })));
      setRouteDirectionsM(mediumRoute.directions.split("\n"));

      setRoutePinsH(hardRoute.waypoints.map((wp: number[]) => ({ latitude: wp[1], longitude: wp[0] })));
      setRouteDirectionsH(hardRoute.directions.split("\n"));

      return;
    };

    const circularRoute = async () => {
      if (inpStartPoint === null || inpLength === null) {
        throw new Error("Invalid input values sdf");
      }

      const inputs = {
        routeLengthKm: inpLength,
        startPoint: [inpStartPoint.longitude, inpStartPoint.latitude] as [number, number],
      };

      const results = await CircularAlgorithm(inputs);

      console.log("results circular route:\n", results);

      const easyRoute = results[0];
      const mediumRoute = results[1];
      const hardRoute = results[2];

      setRoutePinsE(easyRoute.waypoints.map((wp: number[]) => ({ latitude: wp[1], longitude: wp[0] })));
      setRouteDirectionsE(easyRoute.directions.split("\n"));

      setRoutePinsM(mediumRoute.waypoints.map((wp: number[]) => ({ latitude: wp[1], longitude: wp[0] })));
      setRouteDirectionsM(mediumRoute.directions.split("\n"));

      setRoutePinsH(hardRoute.waypoints.map((wp: number[]) => ({ latitude: wp[1], longitude: wp[0] })));
      setRouteDirectionsH(hardRoute.directions.split("\n"));
    };

    const fetchRoute = async () => {
      try {
        inpEndPoint ? await straightRoute() : await circularRoute();
      } catch (error) {
        console.error("Error calculating route:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, []);

  // useEffect to set the difficulty, according the the input stired in the store
  useEffect(() => {
    if (inpDifficulty === "easy") {
      setEasyMap(true);
      setMediumMap(false);
      setHardMap(false);
    } else if (inpDifficulty === "medium") {
      setEasyMap(false);
      setMediumMap(true);
      setHardMap(false);
    } else if (inpDifficulty === "hard") {
      setEasyMap(false);
      setMediumMap(false);
      setHardMap(true);
    }
  }, [inpDifficulty]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={{ flex: 1 }}>
      {/* add a header with 3 tabs for the 3 difficulties (easy, medium, hard), and mark the chosen one bu the user. do this using radio*/}
      {!hideHeader && (
        <View style={styles.radioContainer}>
          <View style={styles.radioGroup}>
            <Button
              title="Easy"
              color={easyMap ? "purple" : undefined}
              onPress={() => {
                setEasyMap(true);
                setMediumMap(false);
                setHardMap(false);
              }}
            />
            <Button
              title="Medium"
              color={mediumMap ? "purple" : undefined}
              onPress={() => {
                setEasyMap(false);
                setMediumMap(true);
                setHardMap(false);
              }}
            />
            <Button
              title="Hard"
              color={hardMap ? "purple" : undefined}
              onPress={() => {
                setEasyMap(false);
                setMediumMap(false);
                setHardMap(true);
              }}
            />
          </View>
        </View>
      )}

      {/* Map Component */}
      {easyMap && <Map theme={mapTheme || "standard"} pins={routePinsE} directions={routeDirectionsE} />}
      {mediumMap && <Map theme={mapTheme || "night"} pins={routePinsM} directions={routeDirectionsM} />}
      {hardMap && <Map theme={mapTheme || "silver"} pins={routePinsH} directions={routeDirectionsH} />}

      {/* Button Wrapper */}
      {!hideButton && (
        <View style={styles.buttonContainer}>
          <Button
            title="Start Run"
            onPress={() => {
              setHideHeader(true);
              setHideButton(true);
              console.log("Start Run");
            }}
          />
        </View>
      )}
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
  radioContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 3,
    marginBottom: 7,
  },
  radioGroup: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
});
