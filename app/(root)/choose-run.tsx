import CustomButton from "@/components/CustomButton";
import RunLayout from "@/components/RunLayout";
import { router } from "expo-router";
import { View, Text } from "react-native";
import { FlatList } from "react-native-gesture-handler";

const ChooseRun = () => {
  return (
    <RunLayout title="Choose a running route">
      <Text>select suggusted running route</Text>
      <View className="mx-5 mt-10">
        <CustomButton title="Select Ride" onPress={() => router.push("/(root)/find-run")} />
      </View>
    </RunLayout>
  );
};

export default ChooseRun;
