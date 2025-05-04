/**
 * @description This file contains a component that provides an input field for selecting a point using Google Places Autocomplete.
 * It allows users to enter a location and fetches details about the selected place.
 * The component uses the Google Places API to provide suggestions and details about the selected location.
 */
import { View, Text } from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { GoogleTextInputs } from "@/types/type";
import { useLocationStore } from "../store/index";

const googlePlacesApiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

const PointInput = ({ label, placeholder, setAddress, setPointInput, setPoint }: GoogleTextInputs) => {
  const start = useLocationStore((state) => state.startAddress);
  const end = useLocationStore((state) => state.endAddress);

  const [inpValue, setInpValue] = useState<string | null>(null);

  useEffect(() => {
    if (label.includes("Start") && start) {
      setInpValue((start || "").replace(/[A-Za-z0-9]{2,}\+[A-Za-z0-9]+,?/g, "") || "unknown");
    } else if (label.includes("End") && end) {
      setInpValue((end || "").replace(/[A-Za-z0-9]{2,}\+[A-Za-z0-9]+,?/g, "") || "unknown");
    } else {
      setInpValue("");
    }
  }, [start, end]);

  return (
    <View>
      {/* Label */}
      <View className="items-start my-3">
        <Text className="text-black text-lg font-JakartaSemiBold">{label}</Text>
      </View>

      {/* Google Places Input */}
      <View className="justify-center items-center w-full">
        <GooglePlacesAutocomplete
          fetchDetails={true}
          placeholder={placeholder || ""}
          debounce={200}
          query={{
            key: googlePlacesApiKey,
            language: "en",
          }}
          styles={{
            textInputContainer: {
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
            },
            textInput: {
              backgroundColor: "white",
              fontSize: 16,
              fontWeight: "600",
              textAlign: "left",
              borderRadius: 12,
              paddingHorizontal: 10,
              height: 48,
              width: "100%",
            },
            listView: {
              backgroundColor: "white",
              borderRadius: 10,
              elevation: 5,
            },
          }}
          onPress={(data, details = null) => {
            if (details) {
              setAddress(data.description);
              setPointInput({ latitude: details.geometry.location.lat, longitude: details.geometry.location.lng });
              setPoint(data.description);
            }
          }}
          textInputProps={{
            placeholderTextColor: "gray",
            value: inpValue || "",
            onChange(e) {
              setInpValue(e.nativeEvent.text);
              setAddress(e.nativeEvent.text);
            },
          }}
        />
      </View>
    </View>
  );
};

export default PointInput;
