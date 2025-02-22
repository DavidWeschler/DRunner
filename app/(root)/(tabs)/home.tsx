import { useUser } from "@clerk/clerk-expo";
import { useAuth } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { Text, View, TouchableOpacity, Image, FlatList, ActivityIndicator, TextInput, StyleSheet, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import GoogleTextInput from "@/components/GoogleTextInput";
import Map from "@/components/Map";
import RunCard from "@/components/RunCard";
import { icons, images } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { Run } from "@/types/type";
import React from "react";

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
  const [result] = await Location.geocodeAsync(address);
  console.log("Latitude:", result.latitude);
  console.log("Longitude:", result.longitude);
  return { latitude: result.latitude, longitude: result.longitude };
};

const Home = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const loading = false;
  const { setUserLocation, setDestinationLocation, setMapTheme, setLengthInput, setStartPointInput, setEndPointInput, setDifficultyInput } = useLocationStore();

  const [length, setLength] = useState("");
  const [startPoint, setStartPoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [currentMapTheme, setCurrentMapTheme] = useState<"standard" | "dark" | "aubergine" | "night" | "retro" | "silver">("standard");

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/sign-in");
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
        address: `${address[0].name}, ${address[0].region}`,
      });
    })();
  }, []);

  const handleDestinationPress = (location: { latitude: number; longitude: number; address: string }) => {
    setDestinationLocation(location);

    router.push("/(root)/find-run");
  };

  const setMapThemeInStrored = (theme: "standard" | "dark" | "aubergine" | "night" | "retro" | "silver") => {
    setCurrentMapTheme(theme);
    setMapTheme(theme);
  };

  const generator = async () => {
    console.log("Generating route...");
    // log the form inputs:
    console.log("Length:", length);
    console.log("Start Point:", startPoint);
    console.log("End Point:", endPoint);
    console.log("Difficulty:", difficulty);

    const startLatLong = await getLatLngFromAddress(startPoint); // this turns the address into lat and long (for free)

    // update the inputs in the singleton store
    setLengthInput(parseFloat(length));
    setStartPointInput(startLatLong);
    if (endPoint) {
      const endLatLong = await getLatLngFromAddress(endPoint);
      setEndPointInput(endLatLong);
    }
    setDifficultyInput(difficulty);

    router.push("/(root)/showRoute");
  };

  return (
    <SafeAreaView className="bg-general-500">
      <FlatList
        data={recentRuns?.slice(0, 5)}
        renderItem={({ item }) => <RunCard run={item} />}
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
                <Image source={images.noResult} className="w-40 h-40" alt="No recent runs found" resizeMode="contain" />
                <Text className="text-sm">No recent runs found</Text>
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

            <GoogleTextInput icon={icons.search} containerStyle="bg-white shadow-md shadow-neutral-300" handlePress={handleDestinationPress} />

            <>
              <Text className="text-xl font-JakartaBold mt-5 mb-3">Your current location</Text>
              <View className="flex flex-row items-center bg-transparent h-[450px]">
                <Map theme={currentMapTheme} pins={[]} directions={undefined} />
              </View>

              <Text>Theme:</Text>
              <View style={styles.radioContainer}>
                <TouchableOpacity onPress={() => setMapThemeInStrored("dark")} style={styles.radio}>
                  <Text style={currentMapTheme === "dark" ? styles.selected : styles.unselected}>Dark</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMapThemeInStrored("aubergine")} style={styles.radio}>
                  <Text style={currentMapTheme === "aubergine" ? styles.selected : styles.unselected}>Aubergine</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMapThemeInStrored("night")} style={styles.radio}>
                  <Text style={currentMapTheme === "night" ? styles.selected : styles.unselected}>Night</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMapThemeInStrored("retro")} style={styles.radio}>
                  <Text style={currentMapTheme === "retro" ? styles.selected : styles.unselected}>Retro</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMapThemeInStrored("silver")} style={styles.radio}>
                  <Text style={currentMapTheme === "silver" ? styles.selected : styles.unselected}>Silver</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setMapThemeInStrored("standard")} style={styles.radio}>
                  <Text style={currentMapTheme === "standard" ? styles.selected : styles.unselected}>Standard</Text>
                </TouchableOpacity>
              </View>

              <View>
                <View style={styles.form}>
                  <Text>Length (kilometers):</Text>
                  <TextInput style={styles.input} value={length} onChangeText={setLength} keyboardType="numeric" />

                  <Text>Start Point:</Text>
                  <TextInput style={styles.input} value={startPoint} onChangeText={setStartPoint} />

                  <Text>End Point:</Text>
                  <TextInput style={styles.input} value={endPoint} onChangeText={setEndPoint} placeholder="Optional" />

                  <Text>Difficulty:</Text>
                  <View style={styles.radioContainer}>
                    <TouchableOpacity onPress={() => setDifficulty("easy")} style={styles.radio}>
                      <Text style={difficulty === "easy" ? styles.selected : styles.unselected}>Easy</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setDifficulty("medium")} style={styles.radio}>
                      <Text style={difficulty === "medium" ? styles.selected : styles.unselected}>Medium</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setDifficulty("hard")} style={styles.radio}>
                      <Text style={difficulty === "hard" ? styles.selected : styles.unselected}>Hard</Text>
                    </TouchableOpacity>
                  </View>
                  <Button title="Generate" onPress={generator} color="#C96915" />
                </View>
              </View>
            </>

            <Text className="text-xl font-JakartaBold mt-5 mb-3">Recent Runs</Text>
          </>
        }
      />
    </SafeAreaView>
  );
};

// more this to a separate file later...
const styles = StyleSheet.create({
  form: {
    marginTop: 20,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  radioContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  radio: {
    padding: 10,
  },
  selected: {
    fontWeight: "bold",
    color: "blue",
  },
  unselected: {
    color: "black",
  },
});

export default Home;
