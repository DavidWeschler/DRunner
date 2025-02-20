import { icons } from "@/constants";
import { useLocationStore } from "@/store";
import React, { useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import mapThemes from "./MapThemes/mapThemes";

import { MapThemeType, MarkerData } from "@/types/type";

interface MapProps {
  theme: MapThemeType;
  pins: MarkerData[];
  directions: any; // Ideally, define a proper type for directions
}

// redefine const map according to the new requirements
const Map: React.FC<MapProps> = ({ theme, pins, directions }) => {
  const { userLongitude, userLatitude, destinationLatitude, destinationLongitude } = useLocationStore();

  const mapTheme = mapThemes[theme] || mapThemes.standard;

  // next: add the pins and directions to the map

  return (
    <>
      <MapView provider={PROVIDER_DEFAULT} className="w-full h-full rounded-2xl" tintColor="black" showsPointsOfInterest={false} showsUserLocation={true} userInterfaceStyle="light" customMapStyle={mapTheme}>
        {destinationLatitude && destinationLongitude && (
          <>
            <Marker
              key="destination"
              coordinate={{
                latitude: destinationLatitude,
                longitude: destinationLongitude,
              }}
              title="Destination"
              image={icons.pin}
            />
          </>
        )}
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
