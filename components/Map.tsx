import { icons } from "@/constants";
import { useLocationStore } from "@/store";
import React, { useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import mapThemes from "./MapThemes/mapThemes";

import { MapThemeType, MarkerData } from "@/types/type";
import { decodePolyline } from "../app/(root)/algorithm_firstVersion"; // mybe creat a utils file or smthing idk

const dummy = [
  { latitude: 32.144065, longitude: 34.876698 },
  { latitude: 32.14821885296124, longitude: 34.8605208136513 },
  { latitude: 32.13216372224022, longitude: 34.8673076747823 },
  { latitude: 32.13300035031964, longitude: 34.88742070172813 },
  { latitude: 32.14954143801683, longitude: 34.89231651624365 },
];

interface MapProps {
  theme: MapThemeType;
  pins: MarkerData[];
  directions: any; // Ideally, define a proper type for directions
}

// redefine const map according to the new requirements
const Map: React.FC<MapProps> = ({ theme, pins, directions }) => {
  const { userLongitude, userLatitude, destinationLatitude, destinationLongitude } = useLocationStore();

  const mapTheme = mapThemes[theme] || mapThemes.standard;

  // console.log("in map; pins", pins);

  return (
    <>
      <MapView provider={PROVIDER_DEFAULT} className="w-full h-full rounded-2xl" tintColor="black" showsUserLocation={true} userInterfaceStyle="light" customMapStyle={mapTheme}>
        {/* Render route pins dynamically */}
        {pins.map((pin, index) => (
          <Marker key={index} coordinate={{ latitude: pin.latitude, longitude: pin.longitude }} title={`Pin ${index + 1}`} />
        ))}

        {/* Draw the polyline for directions */}
        {directions &&
          directions.map((points: string, index: number) => (
            <Polyline
              key={index}
              coordinates={decodePolyline(points)}
              strokeColor="#CC6600" // Customize color
              strokeWidth={4} // Customize width
            />
          ))}
      </MapView>
    </>
  );
};

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
  radioGroup: {
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

export default Map;
