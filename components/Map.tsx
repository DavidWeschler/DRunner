import { icons } from "@/constants";
import { useLocationStore } from "@/store";
import { Text, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";

const Map = () => {
  const { userLongitude, userLatitude, destinationLatitude, destinationLongitude } = useLocationStore();
  return (
    <MapView provider={PROVIDER_DEFAULT} className="w-full h-full rounded-2xl" tintColor="black" showsPointsOfInterest={false} showsUserLocation={true} userInterfaceStyle="light">
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
  );
};

export default Map;
