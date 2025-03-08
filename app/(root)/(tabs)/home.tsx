import { useUser } from "@clerk/clerk-expo";
import { useAuth } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import * as Notifications from "expo-notifications";
import { Text, View, TouchableOpacity, Image, FlatList, ActivityIndicator, TextInput, StyleSheet, Alert, Platform, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import GoogleTextInput from "@/components/GoogleTextInput";
import HadasTextInput from "@/components/HadasInp";
import Map from "@/components/Map";
import RunCard from "@/components/RunCard";
import { icons, images } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { Run } from "@/types/type";
import React from "react";
import CustomButton from "@/components/CustomButton";
import PointInput from "@/components/FormGoogleText";

import { SchedulableTriggerInputTypes } from "expo-notifications";

const getLatLngFromAddress = async (address: string) => {
  console.log("Getting lat and long from address:", address);
  try {
    const [result] = await Location.geocodeAsync(address);
    console.log("Latitude:", result.latitude);
    console.log("Longitude:", result.longitude);
    return { latitude: result.latitude, longitude: result.longitude };
  } catch (error) {
    throw new Error(`${error}`);
  }
};

// First, set the handler that will cause the notification
// to show the alert
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const Home = () => {
  console.log("Home screen rendered");
  const { user } = useUser();
  const { signOut } = useAuth();
  const loading = false;
  const { setUserLocation, setDestinationLocation, setLengthInput, setStartPointInput, setEndPointInput, setDifficultyInput, setHadasInp, startAddress, endAddress, setStartAddress, setEndAddress, mapTheme } = useLocationStore();

  const [length, setLength] = useState("");
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const [kind, setKind] = useState("recent");

  const [userLocationStr, setUserLocationStr] = useState("");
  const [weather, setWeather] = useState("");
  const [userLatLong, setUserLatLong] = useState<{ latitude: number; longitude: number } | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean>(false);

  const [recentRunRoutes, setRecentRunRoutes] = useState<Run[]>([]);
  const [savedRunsRoutes, setSavedRunsRoutes] = useState<Run[]>([]);
  const [futureRunsRoutes, setFutureRunsRoutes] = useState<Run[]>([]);

  const handleLongPress = (run: Run) => {
    return;
    // if (kind === "recent") {
    //   Alert.alert("Manage Run", "What would you like to do with this run?", [
    //     {
    //       text: "Save",
    //       onPress: () => {
    //         // Add only if not already saved
    //         if (!savedRuns.some((r) => r.created_at === run.created_at)) {
    //           setSavedRuns((prev) => [...prev, run]);
    //         }
    //       },
    //     },
    //     {
    //       text: "Future",
    //       onPress: () => {
    //         // Add only if not already in future runs
    //         if (!futureRuns.some((r) => r.created_at === run.created_at)) {
    //           setFutureRuns((prev) => [...prev, run]);
    //         }
    //       },
    //     },
    //     { text: "Cancel", style: "cancel" },
    //   ]);
    // } else if (kind === "saved") {
    //   Alert.alert("Manage Run", "What would you like to do with this run?", [
    //     {
    //       text: "Unsave",
    //       onPress: () => setSavedRuns((prev) => prev.filter((r) => r.created_at !== run.created_at)),
    //     },
    //     {
    //       text: "Future",
    //       onPress: () => {
    //         // Add only if not already in future runs
    //         if (!futureRuns.some((r) => r.created_at === run.created_at)) {
    //           setFutureRuns((prev) => [...prev, run]);
    //         }
    //       },
    //     },
    //     { text: "Cancel", style: "cancel" },
    //   ]);
    // } else if (kind === "future") {
    //   Alert.alert("Manage Run", "What would you like to do with this run?", [
    //     {
    //       text: "Save",
    //       onPress: () => {
    //         // Add only if not already saveda
    //         if (!savedRuns.some((r) => r.created_at === run.created_at)) {
    //           setSavedRuns((prev) => [...prev, run]);
    //         }
    //       },
    //     },
    //     {
    //       text: "Edit Future",
    //       onPress: () => {
    //         // Edit logic here
    //         console.log("Edit Future selected");
    //       },
    //     },
    //     { text: "Cancel", style: "cancel" },
    //   ]);
    // }
  };

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/sign-in");
  };

  const hadasInit = ({ inp }: { inp: string }) => {
    if (!inp.trim()) return;
    setHadasInp(inp);
    router.push("/(root)/(tabs)/chat");
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setHasPermission(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords?.latitude!,
        longitude: location.coords?.longitude!,
      });

      setUserLocation({
        latitude: location.coords?.latitude,
        longitude: location.coords?.longitude,
        address: `${address[0].name}, ${address[0].region}`, // ron - i think its better to use address[0].formattedAddress for savibng the address. look at the full 'address' object and tell me wha you think
      });

      setUserLocationStr(`${address[0].formattedAddress}`);
      setUserLatLong({ latitude: location.coords?.latitude!, longitude: location.coords?.longitude! });
    })();
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${userLatLong?.latitude || 32.009444}&lon=${userLatLong?.longitude || 34.882778}&units=metric&appid=${process.env.EXPO_PUBLIC_OPEN_WEATHER_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        // console.log("Weather data:", data);
        const weatherMain = data?.weather[0]?.main || "Unknown";
        const weatherEmoji = weatherMain === "Clear" ? "☀️" : weatherMain === "Clouds" ? "☁️" : weatherMain === "Rain" ? "🌧️" : weatherMain === "Snow" ? "❄️" : weatherMain === "Thunderstorm" ? "⛈️" : "⛅";

        setWeather(`${data.main.temp}°C with ${data.weather[0].description} ${weatherEmoji}`);
      } catch (error) {
        console.error("Error fetching weather:", error);
      }
    };

    fetchWeather();
  }, [userLatLong]);

  const handleDestinationPress = (location: { latitude: number; longitude: number; address: string }) => {
    setDestinationLocation(location);

    router.push("/(root)/find-run");
  };

  // useEffect to setStartPoint
  useEffect(() => {
    if (startAddress) {
      setStartPoint(startAddress);
    }
    if (endAddress) {
      setEndPoint(endAddress);
    }
  }, [startAddress, endAddress]);

  useEffect(() => {
    fetchRoutes("recent_routes");
    fetchRoutes("saved_routes");
    fetchRoutes("future_routes");
  }, []);

  useEffect(() => {
    // Request permissions on mount.
    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== "granted") {
        alert("Notification permissions not granted!");
      }
    })();
  }, []);

  const fetchRoutes = async (apiType: string) => {
    try {
      const recent = await fetch(`/(api)/${apiType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clerkId: user?.id }),
      }).then((res) => res.json());

      if (apiType === "recent_routes") {
        setRecentRunRoutes(recent);
      } else if (apiType === "saved_routes") {
        setSavedRunsRoutes(recent);
      } else if (apiType === "future_routes") {
        setFutureRunsRoutes(recent);
      }
    } catch (error) {
      console.error("Error fetching routes:", error);
    }
  };

  const generator = async () => {
    // log the form inputs:
    console.log("Length:", length);
    console.log("Start Point:", startPoint);
    console.log("End Point:", endPoint);
    console.log("Difficulty:", difficulty);

    // bug: we need this value but we get stuck on this line. idk why.

    let startLatLong = null;
    if (!startPoint) {
      // later on we will put here a default value.
      Alert.alert("Missing Start Point!\n", "Calculating with your current \nlocation.");
      startLatLong = userLatLong;
    } else {
      startLatLong = await getLatLngFromAddress(startPoint); // this turns the address into lat and long (for free)
    }

    // update the inputs in the singleton store
    setDifficultyInput(difficulty || "easy");
    setLengthInput(parseFloat(length) || 3);
    setStartPointInput(startLatLong);
    if (endPoint) {
      try {
        const endLatLong = await getLatLngFromAddress(endPoint);
        setEndPointInput(endLatLong);
      } catch (error) {
        console.log("(not a real error) couldnt get lat long from end point, setting it to null");
        setEndPointInput(null);
      }
    } else {
      setEndPointInput(null);
    }

    console.log("Generating route...");

    // reset local variables..
    setLength("");
    setStartPoint("");
    setEndPoint("");
    setDifficulty("");

    router.push("/(root)/choose-run");
  };

  const viewRadio = (kind: string) => {
    if (kind == "recent") {
      return recentRunRoutes;
    } else if (kind == "saved") {
      return savedRunsRoutes;
    } else if (kind == "future") {
      return futureRunsRoutes;
    }
  };

  // // this is for debugging notifications
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log("Notification received:", notification);
      checkPendingNotifications();
      // Notifications.cancelAllScheduledNotificationsAsync(); // cancel all notifications, this is not good but theres a bug in the expo-notifications library
    });
    return () => subscription.remove();
  }, []);

  // to check pending notifications
  const checkPendingNotifications = async () => {
    const pending = await Notifications.getAllScheduledNotificationsAsync();
    console.log("Pending notifications:", pending);
  };

  // useEffect(() => {
  //   checkPendingNotifications();
  // }, []);

  // // to cancel all pending notifications
  // useEffect(() => {
  //   Notifications.cancelAllScheduledNotificationsAsync();
  // }, []);

  const debug = async () => {
    // return;
    fetchRoutes("recent_routes");
    fetchRoutes("saved_routes");
    fetchRoutes("future_routes");
    // console.log("saved routes: ", savedRunsRoutes);
    // console.log("\n\n\n\nrecent routes: ", recentRunRoutes);
    // console.log("\n\n\n\nfuture routes: ", futureRunsRoutes);

    console.log("Scheduling notification");
    const notification = {
      title: "It's time to run! 🏃‍♂️",
      body: "Don't forget to run the route you scheduled for today.",
      data: { data: "goes here" },
    };

    const trigger: Notifications.DateTriggerInput = {
      type: SchedulableTriggerInputTypes.DATE,
      date: new Date(2025, 2, 8, 10, 45), // Note: Month is 0-indexed, so 2 represents March (this is march 8, 2025 at 10:41 am)
    };

    try {
      const id = await Notifications.scheduleNotificationAsync({ content: notification, trigger });
      console.log("Notification scheduled with id:", id);
    } catch (error) {
      console.error("Error scheduling notification:", error);
    }
  };

  return (
    <SafeAreaView className="bg-general-500">
      <Button title="Hi" onPress={debug} />
      <FlatList
        data={viewRadio(kind)}
        renderItem={({ item }) => (
          <TouchableOpacity className="p-4 bg-white rounded-lg shadow-md mb-2" onLongPress={() => handleLongPress(item)}>
            <RunCard run={item} />
          </TouchableOpacity>
        )}
        keyExtractor={(item, index) => index.toString()}
        className="px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center">
            {!loading ? (
              <>
                <Image source={images.noResult} className="w-40 h-40" alt={`No ${kind} runs found`} resizeMode="contain" />
                <Text className="text-sm">{`No ${kind} runs found`}</Text>
              </>
            ) : (
              <ActivityIndicator size="small" color="#000" />
            )}
          </View>
        )}
        ListHeaderComponent={
          <>
            <View className="flex flex-row items-center justify-between my-5">
              <Text className="text-2xl font-JakartaExtraBold">Welcome {user?.firstName}👋</Text>
              <TouchableOpacity onPress={handleSignOut} className="justify-center items-center w-10 h-10 rounded-full absolute right-0">
                <Image source={icons.out} className="w-4 h-4" />
              </TouchableOpacity>
            </View>

            <View className="mb-3 p-4 bg-white rounded-lg shadow-md">
              <Text className="text-lg font-JakartaSemiBold text-gray-800">Now's weather in {userLocationStr}:</Text>
              <Text className="text-xl font-JakartaBold text-blue-500">{weather}</Text>
            </View>

            <HadasTextInput icon={icons.search} containerStyle="bg-white shadow-md shadow-neutral-300" placeholder="Use Hadas to find your next running route" handleString={hadasInit} editable={true} />

            <>
              <View className="flex flex-row items-center bg-transparent h-[490px] mt-4">
                <Map theme={mapTheme || "standard"} pins={[]} directions={undefined} />
              </View>

              <View className="mt-4">
                <View className="flex relative rounded-xl bg-[#d6d6d6] shadow-md shadow-neutral-300 p-4">
                  <View className="justify-left items-left">
                    <Text className="text-black text-lg font-JakartaSemiBold">Length (km)</Text>
                  </View>
                  <View className="justify-center items-center">
                    <TextInput
                      className="flex-1 rounded-xl px-3 py-2 h-12 mt-3 w-full"
                      style={{
                        backgroundColor: "white",
                        fontSize: 16,
                        fontWeight: "600",
                        textAlign: "left",
                      }}
                      keyboardType="numeric"
                      placeholder="numbers only"
                      placeholderTextColor="gray"
                      value={length}
                      onChangeText={setLength}
                    />
                  </View>

                  <View className="justify-center items-center">
                    <PointInput label="Start Point" placeholder={"e.g. Yafo 1, Jerusalem"} setAddress={setStartAddress} setPointInput={setStartPointInput} setPoint={setStartPoint} />
                  </View>

                  <View className="justify-center items-center">
                    <PointInput label="End Point" placeholder={"Optional"} setAddress={setEndAddress} setPointInput={setEndPointInput} setPoint={setEndPoint} />
                  </View>

                  <View className="justify-left items-left my-3">
                    <Text className="text-black text-lg font-JakartaSemiBold">Difficulty</Text>
                  </View>
                  <View style={styles.radioContainer}>
                    <TouchableOpacity onPress={() => setDifficulty("easy")} style={[styles.radio, difficulty === "easy" && styles.selectedRadio]}>
                      <Text style={[styles.radioText, difficulty === "easy" && styles.selectedText]}>Easy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setDifficulty("medium")} style={[styles.radio, difficulty === "medium" && styles.selectedRadio]}>
                      <Text style={[styles.radioText, difficulty === "medium" && styles.selectedText]}>Medium</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setDifficulty("hard")} style={[styles.radio, difficulty === "hard" && styles.selectedRadio]}>
                      <Text style={[styles.radioText, difficulty === "hard" && styles.selectedText]}>Hard</Text>
                    </TouchableOpacity>
                  </View>

                  <CustomButton onPress={generator} title="Generate" bgVariant="primary" textVariant="default" className="mt-4" />
                </View>
              </View>
            </>

            <View className="flex-1 justify-center items-center">
              <View className="border-t border-gray-300 w-full my-4" />
            </View>

            <View className="flex flex-row justify-between items-center bg-gray-100 p-2 rounded-full w-full">
              <TouchableOpacity className={`flex-1 p-3 rounded-full ${kind === "recent" ? "bg-blue-500" : "bg-transparent"}`} onPress={() => setKind("recent")}>
                <Text className={`text-center font-bold ${kind === "recent" ? "text-white" : "text-gray-600"}`}>Recent</Text>
              </TouchableOpacity>

              <TouchableOpacity className={`flex-1 p-3 rounded-full ${kind === "saved" ? "bg-blue-500" : "bg-transparent"}`} onPress={() => setKind("saved")}>
                <Text className={`text-center font-bold ${kind === "saved" ? "text-white" : "text-gray-600"}`}>Saved</Text>
              </TouchableOpacity>

              <TouchableOpacity className={`flex-1 p-3 rounded-full ${kind === "future" ? "bg-blue-500" : "bg-transparent"}`} onPress={() => setKind("future")}>
                <Text className={`text-center font-bold ${kind === "future" ? "text-white" : "text-gray-600"}`}>Future</Text>
              </TouchableOpacity>
            </View>
          </>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  radioContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
  },
  radio: {
    backgroundColor: "#F4F4F4",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: "30%",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  selectedRadio: {
    backgroundColor: "#8c76a3",
    borderColor: "#8c76a3",
  },
  radioText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6B7280",
  },
  selectedText: {
    color: "white",
  },
});

export default Home;
