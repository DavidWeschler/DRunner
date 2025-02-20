import BottomSheet, { BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import React, { useRef } from "react";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useLocationStore } from "@/store";

import Map from "@/components/Map";
import { icons } from "@/constants";

import { Algorithm, decodePolyline, getDirectionsBetweenPins } from "./algorithm";

const showRun = async () => {
  const { setUserLocation, setDestinationLocation, setMapTheme } = useLocationStore();

  // retriee map theme from store
  const mapTheme = useLocationStore((state) => state.mapTheme);

  console.log("mapTheme", mapTheme);

  // this is temporarally hardcoded
  const inputs = {
    length: 10,
    startPoint: { latitude: 32.144065, longitude: 34.876698 },
    difficulty: "easy",
  };

  const routePins = await Algorithm(inputs);
  console.log("routePins", routePins);

  const routeDirections = await getDirectionsBetweenPins(routePins);

  return <Map theme={mapTheme || "standard"} pins={routePins} directions={routeDirections} />;
};

export default showRun;
