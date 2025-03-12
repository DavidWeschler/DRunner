import React, { useState, useEffect } from "react";
import { View, Image, Text, TouchableOpacity, ScrollView } from "react-native";
import Map from "@/components/Map";
import { useLocationStore } from "@/store";
import { icons, images } from "@/constants";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUser } from "@clerk/clerk-react";

const ChooseRun = () => {
  const router = useRouter();
  const { mapTheme } = useLocationStore();
  const { user } = useUser();

  const [routeWayPoints, setWayPoints] = useState<{ latitude: number; longitude: number }[]>([]);
  const [routeDirections, setRouteDirections] = useState<string[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch the route based on clerkId
        const response = await fetch("/(api)/get_route", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ clerkId: user?.id }), // Sending only clerkId
        });

        if (response.ok) {
          const data = await response.json();
          // Set the waypoints and directions state with the fetched data
          setWayPoints(data.waypoints); // Set waypoints
          setRouteDirections(data.directions); // Set directions
          console.log("Route fetched successfully");
        } else {
          const errorData = await response.json();
          console.log("Failed to fetch route", errorData);
        }
      } catch (error) {
        console.log("Error fetching route", error);
      }
    };

    if (user?.id) {
      fetchData();
    }
  }, [user?.id]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex flex-row items-center justify-between my-2">
        <Text className="text-2xl font-JakartaExtraBold ml-12">Running Mode 🏃‍♂️‍➡️</Text>
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
      <View className="flex flex-row items-center bg-transparent h-[700px] w-full mx-auto mt-4">
        <Map theme={mapTheme || "standard"} pins={routeWayPoints} directions={routeDirections} />
      </View>
    </SafeAreaView>
  );
};

export default ChooseRun;
