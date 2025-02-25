import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, Button, StyleSheet, Text, TouchableOpacity } from "react-native";
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

  const { setLengthInput, setStartPointInput, setEndPointInput, setDifficultyInput } = useLocationStore();

  // easy route:
  const [routePinsE, setRoutePinsE] = useState<{ latitude: number; longitude: number }[]>([]);
  const [routeDirectionsE, setRouteDirectionsE] = useState<string[] | null>(null);
  const [easyMap, setEasyMap] = useState(false);

  // medium route:
  const [routePinsM, setRoutePinsM] = useState<{ latitude: number; longitude: number }[]>([]);
  const [routeDirectionsM, setRouteDirectionsM] = useState<string[] | null>(null);
  const [mediumMap, setMediumMap] = useState(false);
  const [hardMap, setHardMap] = useState(false);

  // hard route:
  const [routePinsH, setRoutePinsH] = useState<{ latitude: number; longitude: number }[]>([]);
  const [routeDirectionsH, setRouteDirectionsH] = useState<string[] | null>(null);

  const [loading, setLoading] = useState(true);
  const [hideHeader, setHideHeader] = useState(false);
  const [hideButton, setHideButton] = useState(false);

  const [actualRouteLength, setActualRouteLength] = useState({ easy: 0, medium: 0, hard: 0 });
  const [routeElevation, setRouteElevation] = useState({ easy: 0, medium: 0, hard: 0 });

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

      setActualRouteLength({
        easy: parseFloat(easyRoute.length.toFixed(2)),
        medium: parseFloat(mediumRoute.length.toFixed(2)),
        hard: parseFloat(hardRoute.length.toFixed(2)),
      });
      setRouteElevation({
        easy: parseFloat(easyRoute.elevationGain.toFixed(2)),
        medium: parseFloat(mediumRoute.elevationGain.toFixed(2)),
        hard: parseFloat(hardRoute.elevationGain.toFixed(2)),
      });

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

      setActualRouteLength({
        easy: parseFloat(easyRoute.length.toFixed(2)),
        medium: parseFloat(mediumRoute.length.toFixed(2)),
        hard: parseFloat(hardRoute.length.toFixed(2)),
      });
      setRouteElevation({
        easy: parseFloat(easyRoute.elevationGain.toFixed(2)),
        medium: parseFloat(mediumRoute.elevationGain.toFixed(2)),
        hard: parseFloat(hardRoute.elevationGain.toFixed(2)),
      });

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

        // set inpLength, inpStartPoint, inpEndPoint, inpDifficulty to null after the route is calculated
        setLengthInput(0);
        setStartPointInput(null);
        setEndPointInput(null);
        setDifficultyInput("easy");
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
            <TouchableOpacity
              style={[styles.button, easyMap && styles.selectedButton]}
              onPress={() => {
                setEasyMap(true);
                setMediumMap(false);
                setHardMap(false);
              }}
            >
              <Text style={styles.buttonText}>Easy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, mediumMap && styles.selectedButton]}
              onPress={() => {
                setEasyMap(false);
                setMediumMap(true);
                setHardMap(false);
              }}
            >
              <Text style={styles.buttonText}>Medium</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, hardMap && styles.selectedButton]}
              onPress={() => {
                setEasyMap(false);
                setMediumMap(false);
                setHardMap(true);
              }}
            >
              <Text style={styles.buttonText}>Hard</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Display the length and elevation of the route */}
      {!hideButton && (
        <View style={styles.infoContainer} className="mb-3 p-4 bg-white rounded-lg shadow-md">
          <Text className="text-lg font-JakartaSemiBold text-gray-800" style={styles.infoText}>
            Route Length: {actualRouteLength[easyMap ? "easy" : mediumMap ? "medium" : "hard"]} km
          </Text>
          <Text className="text-lg font-JakartaSemiBold text-blue-800" style={styles.infoText}>
            Elevation Gain: {routeElevation[easyMap ? "easy" : mediumMap ? "medium" : "hard"]} m
          </Text>
        </View>
      )}

      {/* Map Component */}
      {easyMap && <Map theme={mapTheme || "standard"} pins={routePinsE} directions={routeDirectionsE} />}
      {mediumMap && <Map theme={mapTheme || "standard"} pins={routePinsM} directions={routeDirectionsM} />}
      {hardMap && <Map theme={mapTheme || "standard"} pins={routePinsH} directions={routeDirectionsH} />}

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
    position: "absolute",
    bottom: 20,
    left: "50%",
    transform: [{ translateX: -50 }],
    backgroundColor: "white",
    padding: 10,
    borderRadius: 10,
    elevation: 5,
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
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
    marginHorizontal: 5,
  },
  selectedButton: {
    backgroundColor: "#FF8000",
  },
  buttonText: {
    color: "#000",
    fontWeight: "bold",
  },
  infoContainer: {
    flexDirection: "column",
    justifyContent: "space-around",
    marginTop: 10,
  },
  infoText: {
    fontSize: 16,
  },
});
