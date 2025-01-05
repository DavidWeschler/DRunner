import React, { useEffect, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";

// Your existing code...

const MapWithPins = () => {
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        let location = await Location.getCurrentPositionAsync({});
        setCurrentLocation(location.coords);
      }
    })();
  }, []);

  // If current location is not yet fetched, show loading message
  if (!currentLocation) {
    return <Text>Loading...</Text>;
  }

  const nearbyPins = [
    { latitude: 31.747829999999997, longitude: 35.2297785640655 },
    { latitude: 31.742684601665083, longitude: 35.22840393440912 },
    { latitude: 31.73950298030056, longitude: 35.22482800719663 },
    { latitude: 31.739507156912385, longitude: 35.22040692259369 },
    { latitude: 31.74269421104715, longitude: 35.21683447028687 },
    { latitude: 31.747841037066735, longitude: 35.21546587891893 },
    { latitude: 31.752983541427767, longitude: 35.21684522552989 },
    { latitude: 31.75616029080586, longitude: 35.22042392267836 },
    { latitude: 31.756149575063443, longitude: 35.224845008300804 },
    { latitude: 31.752957644691733, longitude: 35.22841469115308 },
    // { latitude: 31.74783, longitude: 35.222622 }, My home location
  ];

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
      >
        {/* Markers for the current location and nearby pins */}
        <Marker coordinate={currentLocation} title="Current Location" />
        {nearbyPins.map((pin, index) => (
          <Marker key={index} coordinate={pin} title={`Pin ${index + 1}`} />
        ))}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});

export default MapWithPins;
