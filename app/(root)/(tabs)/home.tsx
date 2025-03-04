import { useUser } from "@clerk/clerk-expo";
import { useAuth } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, Image, FlatList, ActivityIndicator, TextInput, StyleSheet, Alert } from "react-native";
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

import PointInput from "@/components/GoogleText";

const recentRuns = [
  {
    run_id: "1",
    origin_address: "Kathmandu, Nepal",
    destination_address: "Pokhara, Nepal",
    origin_latitude: 27.717245,
    origin_longitude: 85.323961,
    destination_latitude: 28.209583,
    destination_longitude: 83.985567,
    run_time: 45,
    route_lenght: 5,
    difficulty_level: "Easy",
    user_id: "1",
    created_at: "2024-08-12 05:19:20.620007",
  },
  {
    run_id: "2",
    origin_address: "Jalkot, MH",
    destination_address: "Pune, Maharashtra, India",
    origin_latitude: 18.609116,
    origin_longitude: 77.165873,
    destination_latitude: 18.52043,
    destination_longitude: 73.856744,
    run_time: 491,
    route_lenght: 8.3,
    difficulty_level: "Hard",
    user_id: "1",
    created_at: "2024-08-12 06:12:17.683046",
  },
  {
    run_id: "3",
    origin_address: "Zagreb, Croatia",
    destination_address: "Rijeka, Croatia",
    origin_latitude: 45.815011,
    origin_longitude: 15.981919,
    destination_latitude: 45.327063,
    destination_longitude: 14.442176,
    run_time: 124,
    route_lenght: 3,
    difficulty_level: "Medium",
    user_id: "1",
    created_at: "2024-08-12 08:49:01.809053",
  },
  {
    run_id: "4",
    origin_address: "Okayama, Japan",
    destination_address: "Osaka, Japan",
    origin_latitude: 34.655531,
    origin_longitude: 133.919795,
    destination_latitude: 34.693725,
    destination_longitude: 135.502254,
    run_time: 159,
    route_lenght: 4.7,
    difficulty_level: "Medium",
    user_id: "1",
    created_at: "2024-08-12 18:43:54.297838",
  },
];

const getLatLngFromAddress = async (address: string) => {
  console.log("Getting lat and long from address:", address);
  const [result] = await Location.geocodeAsync(address);
  console.log("Latitude:", result.latitude);
  console.log("Longitude:", result.longitude);
  return { latitude: result.latitude, longitude: result.longitude };
};

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
  const [savedRuns, setSavedRuns] = useState<Run[]>([]);
  const [futureRuns, setFutureRuns] = useState<Run[]>([]);

  const [userLocationStr, setUserLocationStr] = useState("");
  const [weather, setWeather] = useState("");
  const [userLatLong, setUserLatLong] = useState<{ latitude: number; longitude: number } | null>(null);

  const handleLongPress = (run: Run) => {
    if (kind === "recent") {
      Alert.alert("Manage Run", "What would you like to do with this run?", [
        {
          text: "Save",
          onPress: () => {
            // Add only if not already saved
            if (!savedRuns.some((r) => r.created_at === run.created_at)) {
              setSavedRuns((prev) => [...prev, run]);
            }
          },
        },
        {
          text: "Future",
          onPress: () => {
            // Add only if not already in future runs
            if (!futureRuns.some((r) => r.created_at === run.created_at)) {
              setFutureRuns((prev) => [...prev, run]);
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ]);
    } else if (kind === "saved") {
      Alert.alert("Manage Run", "What would you like to do with this run?", [
        {
          text: "Unsave",
          onPress: () => setSavedRuns((prev) => prev.filter((r) => r.created_at !== run.created_at)),
        },
        {
          text: "Future",
          onPress: () => {
            // Add only if not already in future runs
            if (!futureRuns.some((r) => r.created_at === run.created_at)) {
              setFutureRuns((prev) => [...prev, run]);
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ]);
    } else if (kind === "future") {
      Alert.alert("Manage Run", "What would you like to do with this run?", [
        {
          text: "Save",
          onPress: () => {
            // Add only if not already saveda
            if (!savedRuns.some((r) => r.created_at === run.created_at)) {
              setSavedRuns((prev) => [...prev, run]);
            }
          },
        },
        {
          text: "Edit Future",
          onPress: () => {
            // Edit logic here
            console.log("Edit Future selected");
          },
        },
        { text: "Cancel", style: "cancel" },
      ]);
    }
  };

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/sign-in");
  };

  const tempFunc = ({ inp }: { inp: string }) => {
    if (!inp.trim()) return;
    setHadasInp(inp);
    router.push("/(root)/(tabs)/chat");
  };

  const [hasPermission, setHasPermission] = useState<boolean>(false);

  // const {
  //   data: recentRuns,
  //   loading,
  //   error,
  // } = useFetch<Run[]>(`/(api)/ride/${user?.id}`);

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

  const generator = async () => {
    // log the form inputs:
    console.log("Length:", length);
    console.log("Start Point:", startPoint);
    console.log("End Point:", endPoint);
    console.log("Difficulty:", difficulty);

    // bug: we need this value but we get stuck on this line. idk why.
    // const s = useLocationStore((state) => state.startAddress);
    // const { startAddress } = useLocationStore();

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
      const endLatLong = await getLatLngFromAddress(endPoint);
      setEndPointInput(endLatLong);
    } else {
      setEndPointInput(null);
    }

    console.log("Generating route...");

    // reset local variables..
    setLength("");
    setStartPoint("");
    setEndPoint("");
    setDifficulty("");

    router.push("/(root)/showRoute");
  };

  const viewRadio = (kind: string) => {
    if (kind == "recent") {
      return recentRuns?.slice(0, 3);
    } else if (kind == "saved") {
      return savedRuns;
    } else if (kind == "future") {
      return futureRuns;
    }
  };

  return (
    <SafeAreaView className="bg-general-500">
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

            <HadasTextInput icon={icons.search} containerStyle="bg-white shadow-md shadow-neutral-300" placeholder="Use Hadas to find your next running route" handleString={tempFunc} />

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
