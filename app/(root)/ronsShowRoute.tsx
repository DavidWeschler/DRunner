import React, { useState } from "react";
import { View, Image, Text, TouchableOpacity, ScrollView } from "react-native";
import Swiper from "react-native-swiper";
import Map from "@/components/Map";
import { useLocationStore } from "@/store";
import { icons, images } from "@/constants";
import { useRouter } from "expo-router";

const RonsShowRun = () => {
  const router = useRouter();
  const mapTheme = useLocationStore((state) => state.mapTheme);

  // Consolidate route data into a single state object
  const [routes, setRoutes] = useState({
    easy: { pins: [], directions: null, length: 0, elevation: 0 },
    medium: { pins: [], directions: null, length: 0, elevation: 0 },
    hard: { pins: [], directions: null, length: 0, elevation: 0 },
  });

  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [hideHeader, setHideHeader] = useState(false);
  const [hideButton, setHideButton] = useState(false);

  const getMapData = () => routes[difficulty];

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1 bg-white">
      <View className="flex flex-row items-center justify-between my-5">
        <Text className="text-2xl font-JakartaExtraBold ml-12">Select a route 🏃‍♂️‍➡️</Text>
        <TouchableOpacity onPress={() => router.back()} className="justify-center items-center w-10 h-10 rounded-full absolute left-0">
          <Image source={icons.backArrow} className="w-6 h-6" />
        </TouchableOpacity>
      </View>
      <View className="border-t border-gray-300 w-[95%] mx-auto my-1" />
      <Swiper
        style={{ height: 620 }}
        containerStyle={{ flex: 1 }}
        loop={false}
        showsPagination={true}
        dotColor="gray"
        activeDotColor="black"
        onIndexChanged={(index) => {
          const levels = ["easy", "medium", "hard"];
          setDifficulty((levels[index] as "easy" | "medium" | "hard") || "easy");
        }}
      >
        {Object.keys(routes).map((level, index) => (
          <View key={index} className="items-center justify-center flex-1">
            <Text className={`text-xl font-bold ${level === "easy" ? "text-blue-500" : level === "medium" ? "text-yellow-500" : "text-red-500"}`}>{level.charAt(0).toUpperCase() + level.slice(1)} Route</Text>

            {/* Map Component */}
            <View className="flex flex-row items-center bg-transparent h-[450px] w-[90%] mx-auto mt-4">
              <Map theme={mapTheme || "standard"} {...getMapData()} />
            </View>

            {/* Route Details */}
            <View className="bg-gray-100 rounded-2xl p-4 w-[90%] mx-auto mt-4 mb-10">
              <Text className="text-lg font-semibold text-gray-700">Route Length: {routes[difficulty].length} km</Text>
              <Text className="text-lg font-semibold text-gray-700">Elevation Gain: {routes[difficulty].elevation} m</Text>
            </View>
          </View>
        ))}
      </Swiper>

      {/* Start Run Button */}
      {!hideButton && (
        <TouchableOpacity
          className="w-[95%] p-4 bg-blue-500 rounded-full items-center mx-auto mb-4"
          onPress={() => {
            setHideHeader(true);
            setHideButton(true);
            console.log("Start Run");
          }}
        >
          <Text className="text-white text-lg font-bold">Start Run</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default RonsShowRun;
