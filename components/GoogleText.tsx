import { View, Text } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import { GoogleTextInputs } from "@/types/type"; // Ensure this type includes required props

const googlePlacesApiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY; // Ensure this key is set

const PointInput = ({ label, address, setAddress, setPointInput, setPoint }: GoogleTextInputs) => {
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
          placeholder={address || ""}
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
              setPointInput(null); // Reset coordinates
              setPoint(data.description);
            }
          }}
          textInputProps={{
            placeholderTextColor: "gray",
          }}
        />
      </View>
    </View>
  );
};

export default PointInput;
