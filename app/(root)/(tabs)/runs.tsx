import RunCard from "@/components/RunCard";
import { icons, images } from "@/constants";
import { Run } from "@/types/type";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { FlatList, Text, View, Image, ActivityIndicator, TouchableOpacity, Modal, Pressable, Alert, TextInput, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";
import MyDateTimePicker from "@/components/MyDatePicker";
import Spinner from "@/components/Spinner";
import { useLocationStore } from "@/store";
import { getIsraelTimezoneOffset } from "@/lib/utils";

const Runs = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const loading = false;
  const { setRouteDetails } = useLocationStore();

  const [kind, setKind] = useState("recent");
  const [recentRunRoutes, setRecentRunRoutes] = useState<Run[]>([]);
  const [savedRunsRoutes, setSavedRunsRoutes] = useState<Run[]>([]);
  const [futureRunsRoutes, setFutureRunsRoutes] = useState<Run[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);
  const [selectedRunSavedStatus, setSelectedRunSavedStatus] = useState(selectedRun?.is_saved || false);
  const [newTitle, setNewTitle] = useState("");
  const [showSpinner, setShowSpinner] = useState(false);

  const fetchRoutes = async (apiType: string) => {
    try {
      const recent = await fetch(`/(api)/${apiType}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clerkId: user?.id, maxNumOfRoutes: 30 }),
      }).then((res) => res.json());

      if (apiType === "recent_routes") {
        setRecentRunRoutes(recent);
      } else if (apiType === "saved_routes") {
        setSavedRunsRoutes(recent);
      } else if (apiType === "future_routes") {
        setFutureRunsRoutes(recent);
      }
    } catch (error) {
      console.log("Error fetching routes:", error);
      Alert.alert("We couldn't load your routes, please try again later.");
    }
  };

  const refreshRoutes = async () => {
    await fetchRoutes("recent_routes");
    await fetchRoutes("saved_routes");
    await fetchRoutes("future_routes");
  };

  useEffect(() => {
    const fetchData = async () => {
      await refreshRoutes();
    };
    fetchData();
  }, []);

  const viewRadio = (kind: string) => {
    if (kind == "recent") {
      return recentRunRoutes;
    } else if (kind == "saved") {
      return savedRunsRoutes;
    } else if (kind == "future") {
      return futureRunsRoutes;
    }
  };

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/sign-in");
  };

  const handleLongPress = (item: Run) => {
    setSelectedRun(item);
    setSelectedRunSavedStatus(item.is_saved);
    setModalVisible(true);
  };

  const handleDelete = async () => {
    setShowSpinner(true);

    try {
      await fetch(`/(api)/delete_route`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clerkId: user?.id, routeId: selectedRun?.route_id }),
      }).then((res) => res.json());
    } catch (error) {
      console.log("Error deleting route:", error);
      Alert.alert("Error deleting route", "Please try again later", [{ text: "OK" }]);
    }

    setShowSpinner(false);
    setModalVisible(false);
    await refreshRoutes();
  };

  const handleEditTitle = async () => {
    setShowSpinner(true);

    try {
      await fetch(`/(api)/edit_title_route`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clerkId: user?.id, routeId: selectedRun?.route_id, newTitle }),
      }).then((res) => res.json());
    } catch (error) {
      console.log("Error editing route:", error);
      Alert.alert("Error editing route", "Please try again later", [{ text: "OK" }]);
    }

    setShowSpinner(false);
    setModalVisible(false);
    await refreshRoutes();
  };

  const setNotification = async (date: Date) => {
    const notification = {
      title: "It's time to run! 🏃‍♂️",
      body: "Don't forget to run the route you scheduled for today.",
      data: { data: "goes here" }, //david whats this?
    };

    const trigger: Notifications.DateTriggerInput = {
      type: SchedulableTriggerInputTypes.DATE,
      date: date,
    };

    try {
      const id = await Notifications.scheduleNotificationAsync({ content: notification, trigger });
    } catch (error) {
      Alert.alert("Error scheduling notification", "Please try again later.");
    }
  };

  const scheduleRoute = async (date: Date) => {
    if (selectedRun?.is_scheduled) {
      const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
      const selectedRunTime = new Date(selectedRun?.is_scheduled).getTime();
      const scheduleToClear = allScheduled.find((notification) => {
        const notificationTime = (notification.trigger as any).value - getIsraelTimezoneOffset() * 60 * 60 * 1000;
        return notificationTime === selectedRunTime;
      });

      if (scheduleToClear) {
        await Notifications.cancelScheduledNotificationAsync(scheduleToClear.identifier);
      }
    }

    try {
      await fetch(`/(api)/edit_schedule_route`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clerkId: user?.id, routeId: selectedRun?.route_id, scheduleDate: date }),
      }).then((res) => res.json());
    } catch (error) {
      console.log("Error scheduling route:", error);
      Alert.alert("Error scheduling route", "Please try again later", [{ text: "OK" }]);
    }

    setModalVisible(false);
    await refreshRoutes();
    await setNotification(date);
  };

  const handleRunRoute = async () => {
    setModalVisible(false);
    await refreshRoutes();
    const pins = selectedRun ? selectedRun.waypoints.map((waypoint: any) => ({ longitude: waypoint[0], latitude: waypoint[1] })) : [];
    setRouteDetails({
      difficulty: selectedRun?.difficulty,
      length: selectedRun?.length,
      pins,
      directions: selectedRun?.directions,
      elevationGain: selectedRun?.elevation_gain,
    });

    await fetch(`/(api)/update_recent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ clerkId: user?.id, difficulty: selectedRun?.difficulty, is_recent: true, route_id: selectedRun?.route_id }),
    });

    router.push("/(root)/run-a-route");
  };

  const toggleSaveRoute = async () => {
    setSelectedRunSavedStatus(!selectedRunSavedStatus);
    try {
      const response = await fetch(`/(api)/toggle_save_route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId: user?.id, routeId: selectedRun?.route_id, save: !selectedRun?.is_saved }),
      });
      await response.json();
    } catch (error) {
      console.log("Error saved/unsaved route:", error);
      Alert.alert("Error", "Could not update route status. Please try again.");
    } finally {
      await refreshRoutes();
    }
  };

  return (
    <SafeAreaView>
      <Spinner visible={showSpinner} />

      <FlatList
        data={viewRadio(kind)}
        renderItem={({ item }) => (
          <TouchableOpacity className="p-4 bg-white rounded-lg shadow-md mb-2" onLongPress={() => handleLongPress(item)} testID="runCard">
            <RunCard run={item} />
          </TouchableOpacity>
        )}
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
                <Image source={images.noResult} className="mt-12 w-40 h-40" alt={`No ${kind} runs found`} resizeMode="contain" />
                <Text className="text-sm">{`No ${kind} runs found`}</Text>
              </>
            ) : (
              <ActivityIndicator size="small" color="#000" />
            )}
          </View>
        )}
        ListHeaderComponent={
          <>
            <View className="flex flex-row items-center justify-between my-5">
              <Text className="text-2xl font-JakartaExtraBold">Manage Your Routes 📝</Text>
              <TouchableOpacity onPress={handleSignOut} className="justify-center items-center w-10 h-10 rounded-full absolute right-0" testID="signOutButton">
                <Image source={icons.out} className="w-4 h-4" />
              </TouchableOpacity>
            </View>

            <View className="flex flex-row justify-between items-center bg-gray-100 p-2 rounded-full w-full">
              <TouchableOpacity className={`flex-1 p-3 rounded-full ${kind === "recent" ? "bg-blue-500" : "bg-transparent"}`} onPress={() => setKind("recent")}>
                <Text className={`text-center font-bold ${kind === "recent" ? "text-white" : "text-gray-600"}`}>Recent</Text>
              </TouchableOpacity>

              <TouchableOpacity className={`flex-1 p-3 rounded-full ${kind === "saved" ? "bg-blue-500" : "bg-transparent"}`} onPress={() => setKind("saved")}>
                <Text className={`text-center font-bold ${kind === "saved" ? "text-white" : "text-gray-600"}`}>Saved</Text>
              </TouchableOpacity>

              <TouchableOpacity className={`flex-1 p-3 rounded-full ${kind === "future" ? "bg-blue-500" : "bg-transparent"}`} onPress={() => setKind("future")}>
                <Text className={`text-center font-bold ${kind === "future" ? "text-white" : "text-gray-600"}`}>Future</Text>
              </TouchableOpacity>
            </View>
          </>
        }
      />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/40">
          <View className="bg-white p-5 rounded-lg w-4/5 shadow-lg">
            <Text className="text-lg font-bold mb-4">Choose an action</Text>

            <Pressable onPress={handleDelete} className="p-3 border-b">
              <Text>🗑️{"   "} Delete this item</Text>
            </Pressable>

            <View className="p-1 border-b flex-row items-center justify-between">
              <Text>🔖 Save this route</Text>
              <Switch value={selectedRunSavedStatus} onValueChange={toggleSaveRoute} trackColor={{ false: "#767577", true: "#34D399" }} thumbColor={selectedRunSavedStatus ? "#10B981" : "#f4f3f4"} />
            </View>

            <View className="p-3 border-b flex-row items-center space-x-2">
              <Text>✏️</Text>
              <TextInput value={newTitle} onChangeText={setNewTitle} className="border border-gray-300 p-2 rounded flex-1" placeholder={selectedRun?.route_title || "Enter new title"} />
              <TouchableOpacity onPress={handleEditTitle} disabled={!newTitle.trim()} className={`p-2 rounded ${newTitle.trim() ? "bg-emerald-700" : "bg-gray-300"}`}>
                <Text className="text-white">Edit</Text>
              </TouchableOpacity>
            </View>

            <Pressable className="border-b flex-row items-center p-1 pl-0">
              <MyDateTimePicker alreadyChoseDate={false} onDateTimeSelected={async (date) => await scheduleRoute(date)} />
              <Text>Schedule route</Text>
            </Pressable>

            <Pressable onPress={handleRunRoute} className="p-3">
              <Text>🏃{"   "} Run this route</Text>
            </Pressable>

            <Pressable onPress={() => setModalVisible(false)} className="mt-3 p-3 bg-red-500 rounded">
              <Text className="text-white text-center">Close</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Runs;
