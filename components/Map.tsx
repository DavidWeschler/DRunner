import { icons } from "@/constants";
import { useLocationStore } from "@/store";
import React, { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, StyleSheet, Alert } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";
import mapThemes from "./MapThemes/mapThemes";
import * as Location from "expo-location";
import CustomAlert from "@/components/CustomAlert";

import { MapThemeType, MarkerData } from "@/types/type";

interface Coordinate {
  latitude: number;
  longitude: number;
}

const decodePolyline = (encoded: string): Coordinate[] => {
  let polyline: Coordinate[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let byte: number;
    let shift = 0;
    let result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    let dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    let dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    polyline.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return polyline;
};

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
  directions: any;
}

const getGoogleGeocode = async (latitude: number, longitude: number) => {
  const googlePlacesApiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googlePlacesApiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === "OK" && data.results.length > 0) {
      return data.results[0].formatted_address;
    } else {
      console.error("Google Geocode API error:", data.status);
      return null;
    }
  } catch (error) {
    console.error("Error fetching geocode:", error);
    return null;
  }
};

const Map: React.FC<MapProps> = ({ theme, pins, directions }) => {
  const { startPoint, endPoint, setStartPointInput, setEndPointInput, setStartAddress, setEndAddress } = useLocationStore();
  const [isAlertVisible, setAlertVisible] = useState(false);
  const [locationData, setLocationData] = useState({ latitude: 0, longitude: 0, address: "" });

  const requestPermissions = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission denied", "Allow location access to use this feature.");
      return false;
    }
    return true;
  };

  const handleSetLocation = (latitude: number, longitude: number, address: string, isStart: boolean) => {
    if (isStart) {
      setStartPointInput({ latitude, longitude });
      setStartAddress(address);
    } else {
      setEndPointInput({ latitude, longitude });
      setEndAddress(address);
    }
    setAlertVisible(false); // Close the custom alert after setting location
  };

  const mapTheme = mapThemes[theme] || mapThemes.standard;

  const handleLongPress = async (event: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;

    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      const addressData = await getGoogleGeocode(latitude, longitude);
      setLocationData({ latitude, longitude, address: addressData });
      setAlertVisible(true); // Show the custom alert modal
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  return (
    <>
      <MapView provider={PROVIDER_DEFAULT} className="w-full h-full rounded-2xl" tintColor="black" showsUserLocation={true} userInterfaceStyle="light" customMapStyle={mapTheme} onLongPress={handleLongPress}>
        {pins.map((pin, index) => (
          <Marker key={index} coordinate={{ latitude: pin.latitude, longitude: pin.longitude }} title={`Pin ${index + 1}`} />
        ))}

        {directions && directions.map((points: string, index: number) => <Polyline key={index} coordinates={decodePolyline(points)} strokeColor="#CC6600" strokeWidth={4} />)}

        {startPoint && <Marker coordinate={startPoint} pinColor="green" title="Start" />}
        {endPoint && <Marker coordinate={endPoint} pinColor="red" title="End" />}
      </MapView>

      <CustomAlert visible={isAlertVisible} onClose={() => setAlertVisible(false)} onSetStart={() => handleSetLocation(locationData.latitude, locationData.longitude, locationData.address, true)} onSetEnd={() => handleSetLocation(locationData.latitude, locationData.longitude, locationData.address, false)} />
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
