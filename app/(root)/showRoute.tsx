// import React, { useEffect, useState, useRef } from "react";
// import { View, ActivityIndicator, Button, StyleSheet, Text, TouchableOpacity } from "react-native";
// import CircularAlgorithm from "./circle_algorithm";
// import Line_Algorithm from "./line_algorithm";
// import Map from "../../components/Map";
// import { useLocationStore } from "../../store/index";

// import { useUser } from "@clerk/clerk-react";

// const ShowRun = () => {
//   const mapTheme = useLocationStore((state) => state.mapTheme);
//   // Retrieve map theme from store
//   const inpLength = useLocationStore((state) => state.length);
//   const inpStartPoint = useLocationStore((state) => state.startPoint);
//   const inpEndPoint = useLocationStore((state) => state.endPoint);
//   const inpDifficulty = useLocationStore((state) => state.difficulty);

//   const { setLengthInput, setStartPointInput, setEndPointInput, setDifficultyInput } = useLocationStore();

//   // easy route:
//   const [routePinsE, setRoutePinsE] = useState<{ latitude: number; longitude: number }[]>([]);
//   const [routeDirectionsE, setRouteDirectionsE] = useState<string[] | null>(null);
//   const [easyMap, setEasyMap] = useState(false);

//   // medium route:
//   const [routePinsM, setRoutePinsM] = useState<{ latitude: number; longitude: number }[]>([]);
//   const [routeDirectionsM, setRouteDirectionsM] = useState<string[] | null>(null);
//   const [mediumMap, setMediumMap] = useState(false);

//   // hard route:
//   const [routePinsH, setRoutePinsH] = useState<{ latitude: number; longitude: number }[]>([]);
//   const [routeDirectionsH, setRouteDirectionsH] = useState<string[] | null>(null);
//   const [hardMap, setHardMap] = useState(false);

//   const [loading, setLoading] = useState(true);
//   const [hideHeader, setHideHeader] = useState(false);
//   const [hideButton, setHideButton] = useState(false);

//   const [actualRouteLength, setActualRouteLength] = useState({ easy: 0, medium: 0, hard: 0 });
//   const [routeElevation, setRouteElevation] = useState({ easy: 0, medium: 0, hard: 0 });

//   const { user } = useUser();

//   // Stopwatch state
//   const [isRunning, setIsRunning] = useState(false);
//   const [elapsedTime, setElapsedTime] = useState(0);
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);
//   const startTimeRef = useRef<number | null>(null);

//   useEffect(() => {
//     const straightRoute = async () => {
//       if (inpStartPoint === null || inpEndPoint === null) {
//         throw new Error("Invalid input values");
//       }

//       const inputsLine = {
//         routeLengthKm: inpLength || 0,
//         startPoint: [inpStartPoint.longitude, inpStartPoint.latitude] as [number, number],
//         endPoint: [inpEndPoint.longitude, inpEndPoint.latitude] as [number, number],
//       };

//       const results = await Line_Algorithm(inputsLine);

//       console.log("results line route:\n", results);

//       // If the user chose a route that is too short, the algorithm will return the same route for all difficulties
//       // in this case, we will set the same route for all difficulties
//       const [easyRoute, mediumRoute, hardRoute] = results.length === 1 ? [results[0], results[0], results[0]] : results;

//       setActualRouteLength({
//         easy: parseFloat(easyRoute.length.toFixed(2)),
//         medium: parseFloat(mediumRoute.length.toFixed(2)),
//         hard: parseFloat(hardRoute.length.toFixed(2)),
//       });
//       setRouteElevation({
//         easy: parseFloat(easyRoute.elevationGain.toFixed(2)),
//         medium: parseFloat(mediumRoute.elevationGain.toFixed(2)),
//         hard: parseFloat(hardRoute.elevationGain.toFixed(2)),
//       });

//       setRoutePinsE(easyRoute.waypoints.map((wp: number[]) => ({ latitude: wp[1], longitude: wp[0] })));
//       setRouteDirectionsE(easyRoute.directions.split("\n"));

//       setRoutePinsM(mediumRoute.waypoints.map((wp: number[]) => ({ latitude: wp[1], longitude: wp[0] })));
//       setRouteDirectionsM(mediumRoute.directions.split("\n"));

//       setRoutePinsH(hardRoute.waypoints.map((wp: number[]) => ({ latitude: wp[1], longitude: wp[0] })));
//       setRouteDirectionsH(hardRoute.directions.split("\n"));

//       return;
//     };

//     const circularRoute = async () => {
//       if (inpStartPoint === null || inpLength === null) {
//         throw new Error("Invalid input values sdf");
//       }

//       const inputs = {
//         routeLengthKm: inpLength,
//         startPoint: [inpStartPoint.longitude, inpStartPoint.latitude] as [number, number],
//       };

//       const results = await CircularAlgorithm(inputs);

//       console.log("results circular route:\n", results);

//       const easyRoute = results[0];
//       const mediumRoute = results[1];
//       const hardRoute = results[2];

//       setActualRouteLength({
//         easy: parseFloat(easyRoute.length.toFixed(2)),
//         medium: parseFloat(mediumRoute.length.toFixed(2)),
//         hard: parseFloat(hardRoute.length.toFixed(2)),
//       });
//       setRouteElevation({
//         easy: parseFloat(easyRoute.elevationGain.toFixed(2)),
//         medium: parseFloat(mediumRoute.elevationGain.toFixed(2)),
//         hard: parseFloat(hardRoute.elevationGain.toFixed(2)),
//       });

//       setRoutePinsE(easyRoute.waypoints.map((wp: number[]) => ({ latitude: wp[1], longitude: wp[0] })));
//       setRouteDirectionsE(easyRoute.directions.split("\n"));

//       setRoutePinsM(mediumRoute.waypoints.map((wp: number[]) => ({ latitude: wp[1], longitude: wp[0] })));
//       setRouteDirectionsM(mediumRoute.directions.split("\n"));

//       setRoutePinsH(hardRoute.waypoints.map((wp: number[]) => ({ latitude: wp[1], longitude: wp[0] })));
//       setRouteDirectionsH(hardRoute.directions.split("\n"));
//     };

//     const fetchRoute = async () => {
//       try {
//         inpEndPoint ? await straightRoute() : await circularRoute();
//       } catch (error) {
//         console.error("Error calculating route:", error);
//       } finally {
//         setLoading(false);
//         setLengthInput(0);
//         setStartPointInput(null);
//         setEndPointInput(null);
//       }
//     };

//     fetchRoute();
//   }, []);

//   // useEffect to set the difficulty, according the the input stired in the store
//   useEffect(() => {
//     console.log("inpDifficulty:", inpDifficulty);

//     if (inpDifficulty === "easy") {
//       setEasyMap(true);
//       setMediumMap(false);
//       setHardMap(false);
//     } else if (inpDifficulty === "medium") {
//       setEasyMap(false);
//       setMediumMap(true);
//       setHardMap(false);
//     } else if (inpDifficulty === "hard") {
//       setEasyMap(false);
//       setMediumMap(false);
//       setHardMap(true);
//     }
//   }, [inpDifficulty]);

//   useEffect(() => {
//     if (isRunning) {
//       startTimeRef.current = performance.now() - elapsedTime; // Adjust start time for resuming
//       intervalRef.current = setInterval(() => {
//         setElapsedTime(performance.now() - startTimeRef.current!);
//       }, 10);
//     } else if (!isRunning && intervalRef.current) {
//       clearInterval(intervalRef.current);
//     }

//     return () => {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//       }
//     };
//   }, [isRunning]);

//   const handleStartPause = () => {
//     setIsRunning((prev) => !prev);
//   };

//   const handleStop = () => {
//     setIsRunning(false);
//     setElapsedTime(0);
//   };

//   const formatTime = (milliseconds: number) => {
//     const mins = Math.floor(milliseconds / 60000);
//     const secs = Math.floor((milliseconds % 60000) / 1000);
//     const millis = Math.floor((milliseconds % 1000) / 10); // Keep only two digits

//     return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${millis.toString().padStart(2, "0")}`;
//   };

//   const getAddressFromPoint = async (point: { latitude: number; longitude: number }) => {
//     try {
//       const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${point.latitude}&lon=${point.longitude}`;
//       console.log("url:", url);
//       const response = await fetch(url, {
//         headers: {
//           "User-Agent": "MyRunningApp/1.0 (contact@example.com)", // Change this to your app name & email
//           "Accept-Language": "en", // Optional: Get responses in English
//         },
//       });

//       if (!response.ok) {
//         console.log("response:", response);
//         throw new Error(`Network response was not ok: ${response.status}`);
//       }

//       const data = await response.json();
//       return `${data.address.road || "Unknown Road"}, ${data.address.city || "Unknown City"}`;
//     } catch (error) {
//       console.error("Error fetching address:", error);
//       return "Planet Earth";
//     }
//   };

//   const addRunToDatabase = async () => {
//     console.log("Add run to database");
//     const clerkId = user?.id;
//     console.log("clerkId:", clerkId);

//     const startAddress = await getAddressFromPoint(routePinsE[0]);

//     const route = {
//       clerkId,
//       route_title: "Fun Route",
//       address: startAddress,
//       difficulty: easyMap ? "easy" : mediumMap ? "medium" : "hard",
//       directions: easyMap ? routeDirectionsE : mediumMap ? routeDirectionsM : routeDirectionsH,
//       elevationGain: easyMap ? routeElevation.easy : mediumMap ? routeElevation.medium : routeElevation.hard,
//       length: easyMap ? actualRouteLength.easy : mediumMap ? actualRouteLength.medium : actualRouteLength.hard,
//       waypoints: (easyMap ? routePinsE : mediumMap ? routePinsM : routePinsH).map((pin) => [pin.longitude, pin.latitude]),
//       is_saved: true,
//       is_scheduled: null,
//       is_deleted: false,
//     };

//     try {
//       const response = await fetch("/(api)/add_route", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(route),
//       });

//       if (response.ok) {
//         console.log("Route added successfully");
//       } else {
//         const errorData = await response.json();
//         console.error("Failed to add route", errorData);
//       }
//     } catch (error) {
//       console.error("Error adding route", error);
//     }
//   };

//   if (loading) {
//     return <ActivityIndicator size="large" color="#0000ff" />;
//   }

//   return (
//     <View style={{ flex: 1 }}>
//       {!hideHeader && (
//         <View style={styles.radioContainer}>
//           <View style={styles.radioGroup}>
//             <TouchableOpacity
//               style={[styles.button, easyMap && styles.selectedButton]}
//               onPress={() => {
//                 setEasyMap(true);
//                 setMediumMap(false);
//                 setHardMap(false);
//               }}
//             >
//               <Text style={styles.buttonText}>Easy</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.button, mediumMap && styles.selectedButton]}
//               onPress={() => {
//                 setEasyMap(false);
//                 setMediumMap(true);
//                 setHardMap(false);
//               }}
//             >
//               <Text style={styles.buttonText}>Medium</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={[styles.button, hardMap && styles.selectedButton]}
//               onPress={() => {
//                 setEasyMap(false);
//                 setMediumMap(false);
//                 setHardMap(true);
//               }}
//             >
//               <Text style={styles.buttonText}>Hard</Text>
//             </TouchableOpacity>
//           </View>
//         </View>
//       )}

//       {/* Display the length and elevation of the route */}
//       {!hideButton && (
//         <View style={styles.infoContainer} className="mb-3 p-4 bg-white rounded-lg shadow-md">
//           <Text className="text-lg font-JakartaSemiBold text-gray-800" style={styles.infoText}>
//             Route Length: {actualRouteLength[easyMap ? "easy" : mediumMap ? "medium" : "hard"]} km
//           </Text>
//           <Text className="text-lg font-JakartaSemiBold text-blue-800" style={styles.infoText}>
//             Elevation Gain: {routeElevation[easyMap ? "easy" : mediumMap ? "medium" : "hard"]} m
//           </Text>
//         </View>
//       )}

//       {/* Stopwatch */}
//       <View style={styles.stopwatchContainer}>
//         <Text style={styles.stopwatchText}>{formatTime(elapsedTime)}</Text>
//         <View style={styles.stopwatchButtons}>
//           <Button title={isRunning ? "Pause" : "Start"} onPress={handleStartPause} />
//           <Button title="Stop" onPress={handleStop} />
//         </View>
//       </View>

//       {/* Map Component */}
//       {easyMap && <Map theme={mapTheme || "standard"} pins={routePinsE} directions={routeDirectionsE} />}
//       {mediumMap && <Map theme={mapTheme || "standard"} pins={routePinsM} directions={routeDirectionsM} />}
//       {hardMap && <Map theme={mapTheme || "standard"} pins={routePinsH} directions={routeDirectionsH} />}

//       {/* Button Wrapper */}
//       {!hideButton && (
//         <View style={styles.buttonContainer}>
//           <Button
//             title="Start Run"
//             onPress={() => {
//               setHideHeader(true);
//               setHideButton(true);
//               addRunToDatabase();
//               console.log("Start Run");
//             }}
//           />
//         </View>
//       )}
//     </View>
//   );
// };

// export default ShowRun;

// const styles = StyleSheet.create({
//   buttonContainer: {
//     position: "absolute",
//     bottom: 20,
//     left: "50%",
//     transform: [{ translateX: -50 }],
//     backgroundColor: "white",
//     padding: 10,
//     borderRadius: 10,
//     elevation: 5,
//     shadowColor: "#000",
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//   },
//   radioContainer: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginTop: 3,
//     marginBottom: 7,
//   },
//   radioGroup: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     marginTop: 10,
//   },
//   button: {
//     paddingVertical: 10,
//     paddingHorizontal: 20,
//     borderRadius: 10,
//     backgroundColor: "#f0f0f0",
//     marginHorizontal: 5,
//   },
//   selectedButton: {
//     backgroundColor: "#FF8000",
//   },
//   buttonText: {
//     color: "#000",
//     fontWeight: "bold",
//   },
//   infoContainer: {
//     flexDirection: "column",
//     justifyContent: "space-around",
//     marginTop: 10,
//   },
//   infoText: {
//     fontSize: 16,
//   },
//   stopwatchContainer: {
//     alignItems: "center",
//     marginVertical: 10,
//     justifyContent: "center",
//   },
//   stopwatchText: {
//     fontSize: 30,
//     fontWeight: "bold",
//   },
//   stopwatchButtons: {
//     flexDirection: "row",
//     justifyContent: "space-around",
//     width: "60%",
//     marginTop: 10,
//   },
// });
