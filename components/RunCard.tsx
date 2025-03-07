import { Image, Text, View } from "react-native";

import { icons } from "@/constants";
import { formatDate, formatTime } from "@/lib/utils";
import { Run } from "@/types/type";

// to exlore there icons, go to https://icons.expo.fyi/Index
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

const RunCard = ({ run }: { run: Run }) => {
  const { created_at, difficulty, elevation_gain, length, route_title, address, waypoints, is_scheduled } = run;

  const destination = waypoints[waypoints.length - 1];

  return (
    <View className="flex flex-row items-center justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 mb-3">
      <View className="flex flex-col items-start justify-center p-3">
        <View className="flex flex-row items-center justify-between">
          <Image
            source={{
              uri: `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${destination[0]},${destination[1]}&zoom=14&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`,
            }}
            className="w-[80px] h-[90px] rounded-lg"
          />

          <View className="flex flex-col mx-5 gap-y-5 flex-1">
            <View className="flex flex-row items-center gap-x-2">
              <AntDesign name="twitter" size={20} color="blue" />
              <Text className="text-md font-JakartaMedium" numberOfLines={1}>
                {route_title}
              </Text>
            </View>

            <View className="flex flex-row items-center gap-x-2">
              <MaterialIcons name="location-city" size={20} color="black" />
              <Text className="text-md font-JakartaMedium" numberOfLines={1}>
                {address}
              </Text>
            </View>

            {is_scheduled && (
              <View className="flex flex-row items-center gap-x-2">
                <AntDesign name="clockcircleo" size={20} color="black" />
                <Text className="text-md font-JakartaMedium" numberOfLines={1}>
                  {formatDate(is_scheduled, true)}
                </Text>
              </View>
            )}

            {/* <View className="flex flex-col mx-5 gap-y-5 flex-1">
            <View className="flex flex-row items-center gap-x-2">
              <Image source={icons.to} className="w-5 h-5" />
              <Text className="text-md font-JakartaMedium" numberOfLines={1}>
                {run.origin_address}
              </Text>
            </View> */}

            {/* <View className="flex flex-row items-center gap-x-2">
              <Image source={icons.point} className="w-5 h-5" />
              <Text className="text-md font-JakartaMedium" numberOfLines={1}>
                {run.destination_address}
              </Text>
            </View>*/}
          </View>
        </View>

        <View className="flex flex-col w-full mt-5 bg-general-500 rounded-lg p-3 items-start justify-center">
          <View className="flex flex-row items-center w-full justify-between mb-5">
            <Text className="text-md font-JakartaMedium text-gray-500">Date:</Text>
            <Text className="text-md font-JakartaBold" numberOfLines={1}>
              {formatDate(created_at)}
            </Text>
          </View>
          <View className="flex flex-row items-center w-full justify-between">
            <Text className="text-md font-JakartaMedium text-gray-500">Route difficulty:</Text>
            <Text className={`text-md capitalize font-JakartaBold ${difficulty === "hard" ? "text-red-500" : difficulty === "medium" ? "text-orange-500" : "text-green-500"}`}>{difficulty}</Text>
          </View>
          <View className="flex flex-row items-center w-full justify-between">
            <Text className="text-md font-JakartaMedium text-gray-500">Route lenght:</Text>
            <Text className="text-md font-JakartaBold" numberOfLines={1}>
              {length.toFixed(2)} Km
            </Text>
          </View>
          <View className="flex flex-row items-center w-full justify-between">
            <Text className="text-md font-JakartaMedium text-gray-500">Elevation:</Text>
            <Text className="text-md font-JakartaBold" numberOfLines={1}>
              {Math.floor(elevation_gain)} m
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default RunCard;
