import { router } from "expo-router";
import { Text, View } from "react-native";

import Slider from "@react-native-community/slider";
import CustomButton from "@/components/CustomButton";
import GoogleTextInput from "@/components/GoogleTextInput";
import RunLayout from "@/components/RunLayout";
import { icons } from "@/constants";
import { useLocationStore } from "@/store";
import { useState } from "react";

const FindRide = () => {
  const { userAddress, destinationAddress, setDestinationLocation, setUserLocation } = useLocationStore();
  const [routeLength, setRouteLength] = useState(5);
  const [difficulty, setDifficulty] = useState(1);

  return (
    <RunLayout title="Run">
      <View className="my-3">
        <Text className="text-lg font-JakartaSemiBold mb-3">From</Text>

        <GoogleTextInput icon={icons.target} initialLocation={userAddress!} containerStyle="bg-neutral-100" textInputBackgroundColor="#f5f5f5" handlePress={(location) => setUserLocation(location)} />
      </View>

      <View className="my-3">
        <Text className="text-lg font-JakartaSemiBold mb-3">To</Text>

        <GoogleTextInput icon={icons.map} initialLocation={destinationAddress!} containerStyle="bg-neutral-100" textInputBackgroundColor="transparent" handlePress={(location) => setDestinationLocation(location)} />
      </View>

      <View className="my-3">
        <Text className="text-lg font-JakartaSemiBold mb-3">Route Length ({routeLength} km)</Text>
        <Slider minimumValue={1} maximumValue={15} step={1} value={routeLength} onValueChange={setRouteLength} minimumTrackTintColor="#1E90FF" maximumTrackTintColor="#D3D3D3" />
      </View>

      <View className="my-3">
        <Text className="text-lg font-JakartaSemiBold mb-3">Difficulty</Text>
        <Slider minimumValue={1} maximumValue={3} step={1} value={difficulty} onValueChange={setDifficulty} minimumTrackTintColor="#1E90FF" maximumTrackTintColor="#D3D3D3" />
        <Text className="text-center mt-2">{difficulty === 1 ? "Easy" : difficulty === 2 ? "Medium" : "Hard"}</Text>
      </View>

      <CustomButton title="Find Now" onPress={() => router.push(`/(root)/choose-run`)} className="mt-5" />
    </RunLayout>
  );
};

export default FindRide;
