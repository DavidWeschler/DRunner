import RunCard from "@/components/RunCard";
import { images } from "@/constants";
import { useUser } from "@clerk/clerk-expo";
import { FlatList, Text, View, Image, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const recentRuns = [
  {
    run_id: "1",
    origin_address: "Kathmandu, Nepal",
    destination_address: "Pokhara, Nepal",
    origin_latitude: 27.717245,
    origin_longitude: 85.323961,
    destination_latitude: 28.209583,
    destination_longitude: 83.985567,
    run_time: 45,
    route_lenght: 5,
    difficulty_level: "Easy",
    user_id: "1",
    created_at: "2024-08-12 05:19:20.620007",
  },
  {
    run_id: "2",
    origin_address: "Jalkot, MH",
    destination_address: "Pune, Maharashtra, India",
    origin_latitude: 18.609116,
    origin_longitude: 77.165873,
    destination_latitude: 18.52043,
    destination_longitude: 73.856744,
    run_time: 491,
    route_lenght: 8.3,
    difficulty_level: "Hard",
    user_id: "1",
    created_at: "2024-08-12 06:12:17.683046",
  },
  {
    run_id: "3",
    origin_address: "Zagreb, Croatia",
    destination_address: "Rijeka, Croatia",
    origin_latitude: 45.815011,
    origin_longitude: 15.981919,
    destination_latitude: 45.327063,
    destination_longitude: 14.442176,
    run_time: 124,
    route_lenght: 3,
    difficulty_level: "Medium",
    user_id: "1",
    created_at: "2024-08-12 08:49:01.809053",
  },
  {
    run_id: "4",
    origin_address: "Okayama, Japan",
    destination_address: "Osaka, Japan",
    origin_latitude: 34.655531,
    origin_longitude: 133.919795,
    destination_latitude: 34.693725,
    destination_longitude: 135.502254,
    run_time: 159,
    route_lenght: 4.7,
    difficulty_level: "Medium",
    user_id: "1",
    created_at: "2024-08-12 18:43:54.297838",
  },
];

const Runs = () => {
  const { user } = useUser();
  const loading = false;

  return (
    <SafeAreaView>
      <FlatList
        data={recentRuns}
        renderItem={({ item }) => <RunCard run={item} />}
        keyExtractor={(item, index) => index.toString()}
        className="px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center">
            {!loading ? (
              <>
                <Image source={images.noResult} className="w-40 h-40" alt="No recent runs found" resizeMode="contain" />
                <Text className="text-sm">No recent runs found</Text>
              </>
            ) : (
              <ActivityIndicator size="small" color="#000" />
            )}
          </View>
        )}
        ListHeaderComponent={
          <>
            <Text className="text-2xl font-JakartaBold my-5">Running Routes History</Text>
          </>
        }
      />
    </SafeAreaView>
  );
};

export default Runs;
