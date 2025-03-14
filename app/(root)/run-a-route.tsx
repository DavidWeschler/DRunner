import React, { useState, useRef, useEffect } from "react";
import { View, Image, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useLocationStore } from "@/store";
import { icons, images } from "@/constants";
import { useRouter } from "expo-router";
import CustomButton from "@/components/CustomButton";
import BottomSheet, { BottomSheetScrollView, BottomSheetView } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Map from "@/components/Map";

const RunRoute = () => {
  const router = useRouter();
  const { mapTheme, routeWayPoints, routeDirections } = useLocationStore();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const [isRunning, setIsRunning] = useState(false); // Stopwatch state (running/paused)
  const [elapsedTime, setElapsedTime] = useState(0); // Time elapsed
  const [laps, setLaps] = useState<{ time: number; lapTime: number; overallTime: number }[]>([]);
  const [startTime, setStartTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false); // Check if it's paused
  const [isFirst, setIsFirst] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setStartTime(performance.now()); // Set the start time when the component mounts
  }, []);

  const handleAddLap = () => {
    const currentTime = performance.now();
    const lapTime = laps.length > 0 ? currentTime - laps[laps.length - 1].time : currentTime - startTime; // Calculate lap time
    const overallTime = currentTime - startTime; // Overall time since start

    // Add new lap to the laps array
    setLaps((prevLaps) => [...prevLaps, { time: currentTime, lapTime, overallTime }]);
  };

  const handleStartPause = () => {
    if (isFirst) {
      setIsFirst(false);
    }
    //setIsRunning(!isRunning);
    // setIsPaused(!isPaused);
    if (!isRunning) {
      setIsRunning(true);
      setIsPaused(false); // Start the timer, not paused
    } else {
      setIsRunning(false);
      setIsPaused(true); // Pause the timer
    }
  };

  const handleResetLap = () => {
    if (isRunning && !isPaused) {
      // Record Lap
      handleAddLap();
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    } else {
      // Reset Stopwatch
      setIsFirst(true);
      setIsRunning(false);
      setIsPaused(false);
      setElapsedTime(0);
      setLaps([]);
    }
  };

  const formatTime = (milliseconds: number) => {
    const mins = Math.floor(milliseconds / 60000);
    const secs = Math.floor((milliseconds % 60000) / 1000);
    const millis = Math.floor((milliseconds % 1000) / 10); // Keep only two digits

    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}:${millis.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = performance.now() - elapsedTime; // Adjust start time for resuming
      intervalRef.current = setInterval(() => {
        setElapsedTime(performance.now() - startTimeRef.current!);
      }, 10);
    } else if (!isRunning && intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning]);

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1 bg-white">
        <View className="flex flex-col h-screen bg-blue-500">
          <View className="flex flex-row absolute z-10 top-16 items-center justify-start px-5">
            <TouchableOpacity onPress={() => router.back()}>
              <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
                <Image source={icons.backArrow} resizeMode="contain" className="w-6 h-6" />
              </View>
            </TouchableOpacity>
            <Text className="text-xl font-JakartaSemiBold ml-5">{"Go Back"}</Text>
          </View>

          <Map theme={mapTheme || "standard"} pins={routeWayPoints} directions={routeDirections} />
        </View>

        <BottomSheet ref={bottomSheetRef} snapPoints={["22%", "65%"]}>
          <BottomSheetView
            style={{
              flex: 1,
              padding: 20,
            }}
          >
            <Text className="text-5xl font-JakartaBold text-center mb-3">{formatTime(elapsedTime)}</Text>
            <View className="border-t border-gray-300 w-[95%] mx-auto mb-4" />
            <View className="flex-row space-x-4">
              <TouchableOpacity onPress={handleStartPause} className={`flex-1 rounded-full p-3 flex justify-center items-center shadow-md shadow-neutral-400/70 ${!isRunning || isPaused ? "bg-green-600" : "bg-red-500"}`}>
                <Text className="text-lg font-bold text-white">{isRunning ? (isPaused ? "Resume" : "Pause") : "Start"}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleResetLap}
                className={`flex-1 rounded-full p-3 flex justify-center items-center shadow-md shadow-neutral-400/70 ${(!isRunning && isPaused) || (isRunning && !isPaused && !isFirst) ? "bg-gray-500" : "bg-gray-400"}`}
                disabled={!isRunning && !isPaused} // Disable when not running
              >
                <Text className="text-lg font-bold text-white">{(isRunning && !isPaused) || isFirst ? "Lap" : "Reset"}</Text>
              </TouchableOpacity>
            </View>

            {/* Lap Log ScrollView */}
            <ScrollView className="mt-4 flex-1" ref={scrollViewRef}>
              <View className="border-t border-white" />
              {laps.length > 0 ? (
                laps.map((lap, index) => (
                  <View key={index} className="flex-row justify-between py-2 border-b border-gray-300 mt-2">
                    <Text className="text-lg font-Jakarta">{`Lap ${index + 1}:`}</Text>
                    <Text className="text-lg font-JakartaBold">{formatTime(lap.lapTime)}</Text>
                    <Text className="text-lg font-JakartaBold">{formatTime(lap.overallTime)}</Text>
                  </View>
                ))
              ) : (
                <View className="flex-1 justify-center items-center mt-20">
                  <Text className="text-center text-lg font-JakartaSemiBold text-gray-500">No laps recorded</Text>
                </View>
              )}
            </ScrollView>

            <CustomButton title="End Run" onPress={() => router.push(`/home`)} className="mt-5 mb-3" />
          </BottomSheetView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
};

export default RunRoute;
