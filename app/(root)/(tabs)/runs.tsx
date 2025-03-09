import RunCard from "@/components/RunCard";
import { icons, images } from "@/constants";
import { Run } from "@/types/type";
import { useUser } from "@clerk/clerk-expo";
import { FlatList, Text, View, Image, ActivityIndicator, TouchableOpacity, Modal, Pressable, Alert, TextInput, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";

import MyDateTimePicker from "../../../components/MyDatePicker";

const Runs = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const loading = false;

  const [kind, setKind] = useState("recent");
  const [recentRunRoutes, setRecentRunRoutes] = useState<Run[]>([]);
  const [savedRunsRoutes, setSavedRunsRoutes] = useState<Run[]>([]);
  const [futureRunsRoutes, setFutureRunsRoutes] = useState<Run[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRun, setSelectedRun] = useState<Run | null>(null);
  const [selectedRunSavedStatus, setSelectedRunSavedStatus] = useState(selectedRun?.is_saved || false);
  const [newTitle, setNewTitle] = useState("");
  const [showPicker, setShowPicker] = useState(false);

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
      console.error("Error fetching routes:", error);
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
    console.log("Deleting:", selectedRun);

    try {
      const res = await fetch(`/(api)/delete_route`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clerkId: user?.id, routeId: selectedRun?.route_id }),
      }).then((res) => res.json());

      console.log("Route deleted:", res);
    } catch (error) {
      console.log("Error deleting route:", error);
      Alert.alert("Error deleting route", "Please try again later", [{ text: "OK" }]);
    }

    setModalVisible(false);
    await refreshRoutes();
  };

  const handleEditTitle = async () => {
    console.log("New title:", newTitle);

    try {
      const res = await fetch(`/(api)/edit_title_route`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clerkId: user?.id, routeId: selectedRun?.route_id, newTitle }),
      }).then((res) => res.json());

      console.log("Route title edited:", res);
    } catch (error) {
      console.log("Error editing route:", error);
      Alert.alert("Error editing route", "Please try again later", [{ text: "OK" }]);
    }

    setModalVisible(false);
    await refreshRoutes();
  };

  const handleEditSchedule = async () => {
    setShowPicker(true);
  };

  const setNotification = async (date: Date) => {
    const notification = {
      title: "It's time to run! 🏃‍♂️",
      body: "Don't forget to run the route you scheduled for today.",
      data: { data: "goes here" },
    };

    const trigger: Notifications.DateTriggerInput = {
      type: SchedulableTriggerInputTypes.DATE,
      date: date,
    };

    try {
      const id = await Notifications.scheduleNotificationAsync({ content: notification, trigger });
      console.log("Notification scheduled with id:", id);
    } catch (error) {
      Alert.alert("Error scheduling notification", "Please try again later.");
    }
  };

  const scheduleRoute = async (date: Date) => {
    const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
    const scheduleToClear = allScheduled.find((notification) => {
      const trigger = notification?.trigger;

      if (trigger && "value" in trigger) {
        return new Date(trigger.value as number).getTime() === new Date(selectedRun?.is_scheduled || "").getTime();
      }

      return false;
    });

    if (scheduleToClear) {
      await Notifications.cancelScheduledNotificationAsync(scheduleToClear.identifier);
    }

    try {
      const res = await fetch(`/(api)/edit_schedule_route`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ clerkId: user?.id, routeId: selectedRun?.route_id, scheduleDate: new Date(date.getTime() - date.getTimezoneOffset() * 60000) }),
      }).then((res) => res.json());

      console.log("Route scheduling edited:", res);
    } catch (error) {
      console.log("Error scheduling route:", error);
      Alert.alert("Error scheduling route", "Please try again later", [{ text: "OK" }]);
    }

    setModalVisible(false);
    await refreshRoutes();
    setShowPicker(false);
    await setNotification(date);
  };

  const handleRunRoute = async () => {
    console.log("Running this route:", selectedRun);
    setModalVisible(false);
    await refreshRoutes();
  };

  const toggleSaveRoute = async () => {
    setSelectedRunSavedStatus(!selectedRunSavedStatus);
    try {
      const response = await fetch(`/(api)/toggle_save_route`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clerkId: user?.id, routeId: selectedRun?.route_id, save: !selectedRun?.is_saved }),
      });
      const result = await response.json();
      console.log("Route saved/unsaved:", result);
    } catch (error) {
      console.error("Error saved/unsaved route:", error);
      Alert.alert("Error", "Could not update route status. Please try again.");
    } finally {
      await refreshRoutes();
    }
  };

  return (
    <SafeAreaView>
      <FlatList
        data={viewRadio(kind)}
        renderItem={({ item }) => (
          <TouchableOpacity className="p-4 bg-white rounded-lg shadow-md mb-2" onLongPress={() => handleLongPress(item)}>
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
              <TouchableOpacity onPress={handleSignOut} className="justify-center items-center w-10 h-10 rounded-full absolute right-0">
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

      {/* Modal for long press options */}
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

            <Pressable onPress={handleEditSchedule} className="border-b flex-row items-center p-1 pl-0">
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
