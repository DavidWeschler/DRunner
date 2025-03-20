import React, { useState, useEffect } from "react";
import { View, Image, Text, TouchableOpacity, ScrollView, Alert, StyleSheet } from "react-native";
import Swiper from "react-native-swiper";
import Map from "@/components/Map";
import { useLocationStore } from "@/store";
import { icons, images } from "@/constants";
import { useRouter } from "expo-router";
import CircularAlgorithm from "../../lib/circle_algorithm";
import Line_Algorithm from "../../lib/line_algorithm";
import { useUser } from "@clerk/clerk-react";
import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";
import { A } from "@clerk/clerk-react/dist/useAuth-BQT424bY";
import MyDateTimePicker from "@/components/MyDatePicker";
import Spinner from "@/components/Spinner";
import Entypo from "@expo/vector-icons/Entypo";

const ChooseRun = () => {
  const router = useRouter();
  const { mapTheme, setRouteDetails, mode } = useLocationStore();
  const inpLength = useLocationStore((state) => state.length);
  const inpStartPoint = useLocationStore((state) => state.startPoint);
  const inpEndPoint = useLocationStore((state) => state.endPoint);
  const inpDifficulty = useLocationStore((state) => state.difficulty);
  const { setLengthInput, setStartPointInput, setEndPointInput, setDifficultyInput } = useLocationStore();
  const { user } = useUser();

  // this puts the user input difficulty in the correct order
  const difficulties = ["easy", "medium", "hard"].sort((a, b) => (a === inpDifficulty ? -1 : b === inpDifficulty ? 1 : 0));

  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");

  const [actualRouteLength, setActualRouteLength] = useState({ easy: 0, medium: 0, hard: 0 });
  const [routeElevation, setRouteElevation] = useState({ easy: 0, medium: 0, hard: 0 });

  // easy route:
  const [routePinsE, setRoutePinsE] = useState<{ latitude: number; longitude: number }[]>([]);
  const [routeDirectionsE, setRouteDirectionsE] = useState<string[] | null>(null);

  // medium route:
  const [routePinsM, setRoutePinsM] = useState<{ latitude: number; longitude: number }[]>([]);
  const [routeDirectionsM, setRouteDirectionsM] = useState<string[] | null>(null);

  // hard route:
  const [routePinsH, setRoutePinsH] = useState<{ latitude: number; longitude: number }[]>([]);
  const [routeDirectionsH, setRouteDirectionsH] = useState<string[] | null>(null);

  // date and time:
  const [selectedDateTime, setSelectedDateTime] = useState<string | null>(null);

  const [easySaved, setEasySaved] = useState(false);
  const [mediumSaved, setMediumSaved] = useState(false);
  const [hardSaved, setHardSaved] = useState(false);

  const [easyScheduled, setEasyScheduled] = useState(false);
  const [mediumScheduled, setMediumScheduled] = useState(false);
  const [hardScheduled, setHardScheduled] = useState(false);

  // spinner
  const [loading, setLoading] = useState(false);

  // banner
  const [showBanner, setShowBanner] = useState(false);
  const [bannerText, setBannerText] = useState("");

  const straightRoute = async () => {
    if (inpStartPoint === null || inpEndPoint === null) {
      throw new Error("Invalid input values");
    }

    if (inpStartPoint.longitude == inpEndPoint.longitude && inpStartPoint.latitude === inpEndPoint.latitude) {
      return await circularRoute();
    }

    const inputsLine = {
      routeLengthKm: inpLength || 0,
      startPoint: [inpStartPoint.longitude, inpStartPoint.latitude] as [number, number],
      endPoint: [inpEndPoint.longitude, inpEndPoint.latitude] as [number, number],
      mode: mode,
    };

    const results = await Line_Algorithm(inputsLine);
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
      throw new Error("Invalid input values");
    }

    const inputs = {
      routeLengthKm: inpLength <= 0 || inpLength > 100 ? 5 : inpLength,
      startPoint: [inpStartPoint.longitude, inpStartPoint.latitude] as [number, number],
      mode: mode,
    };

    const results = await CircularAlgorithm(inputs);

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
      setLoading(true);

      inpEndPoint ? await straightRoute() : await circularRoute();
    } catch (error) {
      Alert.alert("We couldn't generate your route", "Please try again later. 😶‍🌫️");
      router.push("/home");
    } finally {
      setLoading(false);
      setLengthInput(0);
      setStartPointInput(null);
      setEndPointInput(null);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await fetchRoute();
    };
    fetchData();
  }, []);

  const getAddressFromPoint = async (point: { latitude: number; longitude: number }) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${point.latitude}&lon=${point.longitude}`;
      const response = await fetch(url, {
        headers: {
          "User-Agent": "MyRunningApp/1.0 (contact@example.com)", // Change this to your app name & email
          "Accept-Language": "en", // Optional: Get responses in English
        },
      });

      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status}`);
      }

      const data = await response.json();
      return `${data.address.road || "Unknown Road"}, ${data.address.city || "Unknown City"}`;
    } catch (error) {
      console.log("Error fetching address:", error);
      return "Planet Earth";
    }
  };

  const addRunToDatabase = async (difficulty: string, future: Date | null, save = false, recent = false) => {
    const clerkId = user?.id;
    const startAddress = await getAddressFromPoint(routePinsE[0]);

    const route = {
      clerkId,
      route_title: "Fun Route",
      address: startAddress,
      difficulty: difficulty,
      directions: difficulty === "easy" ? routeDirectionsE : difficulty === "medium" ? routeDirectionsM : routeDirectionsH,
      elevationGain: difficulty === "easy" ? routeElevation.easy : difficulty === "medium" ? routeElevation.medium : routeElevation.hard,
      length: difficulty === "easy" ? actualRouteLength.easy : difficulty === "medium" ? actualRouteLength.medium : actualRouteLength.hard,
      waypoints: (difficulty === "easy" ? routePinsE : difficulty === "medium" ? routePinsM : routePinsH).map((pin) => [pin.longitude, pin.latitude]),
      is_recent: recent,
      is_saved: save,
      is_scheduled: future || null,
      is_deleted: false,
    };

    try {
      const response = await fetch("/(api)/add_route", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(route),
      });

      if (response.ok) {
        return true;
      } else {
        const errorData = await response.json();
        Alert.alert("Error adding route", "Please try again later.");
        return false;
      }
    } catch (error) {
      console.log("Error adding route:", error);
      Alert.alert("Error adding route", "Please try again later.");
      return false;
    }
  };

  const setNotification = async (date: Date) => {
    const notification = {
      title: "It's time to run! 🏃‍♂️",
      body: "Don't forget to run the route you scheduled for today.",
      data: { data: "goes here" },
    };

    const trigger: Notifications.DateTriggerInput = {
      type: SchedulableTriggerInputTypes.DATE,
      date: date,
    };

    try {
      const id = await Notifications.scheduleNotificationAsync({ content: notification, trigger });
    } catch (error) {
      Alert.alert("Error scheduling notification", "Please try again later.");
    }
  };

  const handleSaveRoute = async (level: string) => {
    const isScheduledAlready = level === "easy" ? easyScheduled : level === "medium" ? mediumScheduled : hardScheduled;
    const isSavedAlready = level === "easy" ? easySaved : level === "medium" ? mediumSaved : hardSaved;

    if (isSavedAlready) return Alert.alert("Route already saved", "You have already saved this route.");

    setLoading(true);
    const status = isScheduledAlready ? await updateRunRoute(level, null, true) : await addRunToDatabase(level, null, true);
    setLoading(false);

    if (status) {
      if (level === "easy") setEasySaved(true);
      if (level === "medium") setMediumSaved(true);
      if (level === "hard") setHardSaved(true);

      setBannerText("Route saved successfully!");
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 5000);
    }
  };

  // Function to receive date from MyDateTimePicker
  const handleDateTimeSelection = async (date: Date, level: string) => {
    const isScheduledAlready = level === "easy" ? easyScheduled : level === "medium" ? mediumScheduled : hardScheduled;
    const isSavedAlready = level === "easy" ? easySaved : level === "medium" ? mediumSaved : hardSaved;

    if (isScheduledAlready) return Alert.alert("Route already scheduled!", "You Can See Your Scheduled Routes In The Manage Section.");

    setSelectedDateTime(date.toLocaleString()); // Store formatted date

    setLoading(true);
    const status = isSavedAlready ? await updateRunRoute(level, date, null) : await addRunToDatabase(level, date, false);
    setLoading(false);

    if (status) {
      await setNotification(date);
      if (level === "easy") setEasyScheduled(true);
      if (level === "medium") setMediumScheduled(true);
      if (level === "hard") setHardScheduled(true);

      setBannerText("Route scheduled successfully!");
      setShowBanner(true);
      setTimeout(() => setShowBanner(false), 5000);
    }
  };

  const handleError = (error: any) => {
    console.log("Error updating route:", error);
    Alert.alert("Error updating route", "Please try again later.");
    return false;
  };

  const updateRunRoute = async (level: string, future: Date | null, save: boolean | null) => {

    let url = "";
    const params: { clerkId: string | undefined; difficulty: string; scheduled?: Date; saved?: boolean } = { clerkId: user?.id, difficulty: level };
    if (future) {
      url = "/(api)/update_route_scheduled";
      params["scheduled"] = future;
    } else if (save) {
      url = "/(api)/update_route_saved";
      params["saved"] = save;
    } else {
      return false;
    }

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      if (response.ok) {

        if (level === "easy") save ? setEasySaved(true) : setEasyScheduled(true);
        if (level === "medium") save ? setMediumSaved(true) : setMediumScheduled(true);
        if (level === "hard") save ? setHardSaved(true) : setHardScheduled(true);

        return true;
      } else {
        const errorData = await response.json();
        return handleError(errorData);
      }
    } catch (error) {
      return handleError(error);
    }
  };

  const updateRecentRoute = async () => {
    try {
      const response = await fetch("/(api)/update_recent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clerkId: user?.id, difficulty, is_recent: true }),
      });

      if (response.ok) {
        return true;
      } else {
        const errorData = await response.json();
        return handleError(errorData);
      }
    } catch (error) {
      return handleError(error);
    }
  };

  return (
    <>
      {/* Banner */}
      {showBanner && (
        <View
          style={{
            position: "absolute",
            top: 50,
            left: "10%",
            right: "10%",
            zIndex: 30,
            alignItems: "center",
          }}
          className="bg-green-500/80 p-2 rounded-full items-center justify-center mb-4"
        >
          <Text className="text-white text-lg font-bold text-center">{bannerText}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 bg-white">
        <Spinner visible={loading} />

        <View className="flex flex-row items-center justify-between my-2">
          <Text className="text-2xl font-JakartaExtraBold ml-12">Select a route 🏃‍♂️‍➡️</Text>
          <TouchableOpacity
            onPress={() => {
              router.push("/home");
            }}
            className="justify-center items-center w-10 h-10 rounded-full absolute left-0"
          >
            <Image source={icons.backArrow} className="w-6 h-6" />
          </TouchableOpacity>
        </View>
        <View className="border-t border-gray-300 w-[95%] mx-auto my-0" />
        <Swiper
          style={{ height: 650 }}
          containerStyle={{ flex: 1, marginTop: -20 }}
          loop={false}
          showsPagination={true}
          dotColor="gray"
          activeDotColor="black"
          onIndexChanged={(index) => {
            const levels = ["easy", "medium", "hard"];
            setDifficulty((levels[index] as "easy" | "medium" | "hard") || "easy");
          }}
        >
          {difficulties.map((level, index) => (
            <View key={index} className="items-center justify-center flex-1">
              <Text className={`text-xl font-bold mt-10 ${level === "easy" ? "text-blue-500" : level === "medium" ? "text-yellow-500" : "text-red-500"}`}>{level.charAt(0).toUpperCase() + level.slice(1)} Route</Text>

              {/* Map Component */}
              <View className="flex flex-row items-center bg-transparent h-[400px] w-[90%] mx-auto mt-4">
                {level === "easy" && <Map theme={mapTheme || "standard"} pins={routePinsE} directions={routeDirectionsE} />}
                {level === "medium" && <Map theme={mapTheme || "standard"} pins={routePinsM} directions={routeDirectionsM} />}
                {level === "hard" && <Map theme={mapTheme || "standard"} pins={routePinsH} directions={routeDirectionsH} />}
              </View>

              {/* Save and Schedule Buttons */}
              <View className="flex-row justify-end items-center space-x-4 w-[90%] mx-auto">
                <TouchableOpacity style={styles.button} onPress={async () => await handleSaveRoute(level)}>
                  <Entypo name="save" size={24} color={(level === "easy" && easySaved) || (level === "medium" && mediumSaved) || (level === "hard" && hardSaved) ? "#C0C0C0" : "#balck"} />
                </TouchableOpacity>
                <MyDateTimePicker alreadyChoseDate={level === "easy" ? easyScheduled : level === "medium" ? mediumScheduled : hardScheduled} onDateTimeSelected={async (date) => await handleDateTimeSelection(date, level)} />
              </View>

              {/* Route Details */}
              <View className="bg-gray-100 rounded-2xl p-4 w-[90%] mx-auto mb-10">
                <Text className="text-lg font-semibold text-gray-700">Route Length: {actualRouteLength[difficulty]} km</Text>
                <Text className="text-lg font-semibold text-gray-700">Elevation Gain: {routeElevation[difficulty]} m</Text>
              </View>
              <View className="mb-5"></View>
            </View>
          ))}
        </Swiper>

        {/* <View className="border-t border-gray-300 w-[95%] mx-auto my-0" /> */}

        {/* Start Run Button */}
        <TouchableOpacity
          className="w-[95%] p-4 bg-blue-500 rounded-full items-center mx-auto mb-4"
          onPress={async () => {
            const route = {
              difficulty,
              pins: difficulty === "easy" ? routePinsE : difficulty === "medium" ? routePinsM : routePinsH,
              directions: difficulty === "easy" ? routeDirectionsE : difficulty === "medium" ? routeDirectionsM : routeDirectionsH,
              elevationGain: difficulty === "easy" ? routeElevation.easy : difficulty === "medium" ? routeElevation.medium : routeElevation.hard,
              length: difficulty === "easy" ? actualRouteLength.easy : difficulty === "medium" ? actualRouteLength.medium : actualRouteLength.hard,
            };
            setRouteDetails(route);

            const routeAlreadySaved = difficulty === "easy" ? easySaved : difficulty === "medium" ? mediumSaved : hardSaved;
            const routeAlreadyScheduled = difficulty === "easy" ? easyScheduled : difficulty === "medium" ? mediumScheduled : hardScheduled;

            if (!routeAlreadySaved && !routeAlreadyScheduled) {
              setLoading(true);
              const status = await addRunToDatabase(difficulty, null, false, true);

              setLoading(false);
            } else {
              await updateRecentRoute();
            }

            router.push("/run-a-route");
          }}
        >
          <Text className="text-white text-lg font-bold">Start Run</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
  },
});

export default ChooseRun;
