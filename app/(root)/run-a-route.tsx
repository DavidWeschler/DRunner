// import React, { useState, useRef, useEffect } from "react";
// import { View, Image, Text, TouchableOpacity, ScrollView } from "react-native";
// import { useLocationStore } from "@/store";
// import { icons } from "@/constants";
// import { useRouter } from "expo-router";
// import CustomButton from "@/components/CustomButton";
// import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
// import { router } from "expo-router";
// import { GestureHandlerRootView } from "react-native-gesture-handler";
// import Map from "@/components/Map";

// import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";
// import { rgbaColor } from "react-native-reanimated/lib/typescript/Colors";

// configureReanimatedLogger({
//   level: ReanimatedLogLevel.warn,
//   strict: false, // Set to true to see warnings for potential issues
// });

// const RunRoute = () => {
//   const router = useRouter();
//   const { mapTheme, routeWayPoints, routeDirections, routeDetalis } = useLocationStore();
//   const bottomSheetRef = useRef<BottomSheet>(null);

//   // Refs for timer interval and start time
//   const intervalRef = useRef<NodeJS.Timeout | null>(null);
//   const startTimeRef = useRef<number | null>(null);

//   // Stopwatch state
//   const [isRunning, setIsRunning] = useState(false);
//   const [elapsedTime, setElapsedTime] = useState(0); // in milliseconds
//   const [laps, setLaps] = useState<{ time: number; lapTime: number; overallTime: number }[]>([]);
//   const [isPaused, setIsPaused] = useState(false);
//   const [isFirst, setIsFirst] = useState(true);
//   const scrollViewRef = useRef<ScrollView>(null);

//   const [isDetailsExpanded, setIsDetailsExpanded] = useState(true);

//   // Format time function: converts ms to HH:MM:SS
//   const formatTime = (time: number) => {
//     const totalSeconds = Math.floor(time / 1000);
//     const hours = Math.floor(totalSeconds / 3600);
//     const minutes = Math.floor((totalSeconds % 3600) / 60);
//     const seconds = totalSeconds % 60;
//     const pad = (n: number) => n.toString().padStart(2, "0");
//     return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
//   };

//   // Handle start, pause, and resume functionality
//   const handleStartPause = () => {
//     if (!isRunning) {
//       // Start the stopwatch
//       setIsRunning(true);
//       setIsPaused(false);
//       setIsFirst(false);
//       startTimeRef.current = Date.now();
//       intervalRef.current = setInterval(() => {
//         if (startTimeRef.current !== null) {
//           setElapsedTime(Date.now() - startTimeRef.current);
//         }
//       }, 1000);
//     } else if (!isPaused) {
//       // Pause the stopwatch
//       setIsPaused(true);
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//     } else if (isPaused) {
//       // Resume the stopwatch
//       setIsPaused(false);
//       startTimeRef.current = Date.now() - elapsedTime;
//       intervalRef.current = setInterval(() => {
//         if (startTimeRef.current !== null) {
//           setElapsedTime(Date.now() - startTimeRef.current);
//         }
//       }, 1000);
//     }
//   };

//   // Handle lap and reset functionality
//   const handleResetLap = () => {
//     if (isRunning && !isPaused) {
//       // Record a lap: compute lap time relative to the last lap
//       const lastOverallTime = laps.length > 0 ? laps[laps.length - 1].overallTime : 0;
//       const lapTime = elapsedTime - lastOverallTime;
//       const newLap = { time: Date.now(), lapTime, overallTime: elapsedTime };
//       setLaps((prev) => [...prev, newLap]);
//     } else if (isPaused) {
//       // Reset the stopwatch and laps when paused
//       setIsRunning(false);
//       setIsPaused(false);
//       setElapsedTime(0);
//       setLaps([]);
//       setIsFirst(true);
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//         intervalRef.current = null;
//       }
//     }
//   };

//   // Cleanup interval on component unmount
//   useEffect(() => {
//     return () => {
//       if (intervalRef.current) {
//         clearInterval(intervalRef.current);
//       }
//     };
//   }, []);

//   // Auto-scroll lap log to the bottom when a new lap is added
//   useEffect(() => {
//     if (scrollViewRef.current) {
//       scrollViewRef.current.scrollToEnd({ animated: true });
//     }
//   }, [laps]);

//   return (
//     <GestureHandlerRootView className="flex-1">
//       <View className="flex-1 bg-white">
//         <View className="flex flex-col h-screen bg-blue-500">
//           <View className="flex flex-row absolute z-10 top-25 mt-3 items-center justify-start px-5">
//             <TouchableOpacity onPress={() => router.back()}>
//               <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
//                 <Image source={icons.backArrow} resizeMode="contain" className="w-6 h-6" />
//               </View>
//             </TouchableOpacity>
//             <Text className="text-xl font-JakartaSemiBold ml-5">Go Back</Text>
//           </View>

//           {/* <Map theme={mapTheme || "standard"} pins={routeWayPoints} directions={routeDirections} /> */}
//           <Map theme={mapTheme || "standard"} pins={routeDetalis.pins} directions={routeDetalis.directions} />
//         </View>

//         {/* Details */}
//         <View className="absolute top-16 left-5 right-5 z-30">
//           <TouchableOpacity onPress={() => setIsDetailsExpanded(!isDetailsExpanded)}>
//             {isDetailsExpanded ? (
//               <View className="bg-white p-2 rounded-md flex-row justify-around border">
//                 <Text className="text-s text-black font-bold">Diff: {routeDetalis.difficulty}</Text>
//                 <Text className="text-s text-black font-bold">Length: {routeDetalis.length} km</Text>
//                 <Text className="text-s text-black font-bold">Elev: {routeDetalis.elevationGain} m</Text>
//               </View>
//             ) : (
//               <View className="bg-white p-2 rounded-full items-center justify-center w-10 h-10 border">
//                 <Text className="text-xs text-black">Info</Text>
//               </View>
//             )}
//           </TouchableOpacity>
//         </View>

//         <BottomSheet ref={bottomSheetRef} snapPoints={["25%", "65%"]}>
//           <BottomSheetView style={{ flex: 1, padding: 20, backgroundColor: "rgb(226, 226, 226)" }}>
//             <Text className="text-5xl font-JakartaBold text-center mb-3">{formatTime(elapsedTime)}</Text>
//             <View className="border-t border-gray-300 w-[95%] mx-auto mb-4" />
//             <View className="flex-row space-x-4">
//               <TouchableOpacity onPress={handleStartPause} className={`flex-1 rounded-full p-3 flex justify-center items-center shadow-md shadow-neutral-400/70 ${!isRunning || isPaused ? "bg-green-600" : "bg-red-500"}`}>
//                 <Text className="text-lg font-bold text-white">{isRunning ? (isPaused ? "Resume" : "Pause") : "Start"}</Text>
//               </TouchableOpacity>

//               <TouchableOpacity onPress={handleResetLap} className={`flex-1 rounded-full p-3 flex justify-center items-center shadow-md shadow-neutral-400/70 ${(!isRunning && isPaused) || (isRunning && !isPaused && !isFirst) ? "bg-gray-500" : "bg-gray-400"}`} disabled={!isRunning && !isPaused}>
//                 <Text className="text-lg font-bold text-white">{(isRunning && !isPaused) || isFirst ? "Lap" : "Reset"}</Text>
//               </TouchableOpacity>
//             </View>

//             {/* Lap Log ScrollView */}
//             <ScrollView className="mt-4 flex-1" ref={scrollViewRef}>
//               <View className="border-t border-black" />
//               {laps.length > 0 ? (
//                 laps.map((lap, index) => (
//                   <View key={index} className="flex-row justify-between py-2 border-b border-gray-300 mt-2">
//                     <Text className="text-lg font-Jakarta">{`Lap ${index + 1}:`}</Text>
//                     <Text className="text-lg font-JakartaBold">{formatTime(lap.lapTime)}</Text>
//                     <Text className="text-lg font-JakartaBold">{formatTime(lap.overallTime)}</Text>
//                   </View>
//                 ))
//               ) : (
//                 <View className="flex-1 justify-center items-center mt-20">
//                   <Text className="text-center text-lg font-JakartaSemiBold text-gray-500">No laps recorded</Text>
//                 </View>
//               )}
//             </ScrollView>

//             <CustomButton title="End Run" onPressIn={() => router.push(`/home`)} className="mt-5 mb-3" />
//           </BottomSheetView>
//         </BottomSheet>
//       </View>
//     </GestureHandlerRootView>
//   );
// };

// export default RunRoute;
import React, { useState, useRef, useEffect } from "react";
import { View, Image, Text, TouchableOpacity, ScrollView } from "react-native";
import { useLocationStore } from "@/store";
import { icons } from "@/constants";
import { useRouter } from "expo-router";
import CustomButton from "@/components/CustomButton";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Map from "@/components/Map";
import Draggable from "@/components/Draggable"; // adjust the import path as needed

import { configureReanimatedLogger, ReanimatedLogLevel } from "react-native-reanimated";

configureReanimatedLogger({
  level: ReanimatedLogLevel.warn,
  strict: false,
});

const RunRoute = () => {
  const router = useRouter();
  const { mapTheme, routeWayPoints, routeDirections, routeDetalis } = useLocationStore();
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Refs for timer interval and start time
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Stopwatch state
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // in milliseconds
  const [laps, setLaps] = useState<{ time: number; lapTime: number; overallTime: number }[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isFirst, setIsFirst] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  const [isDetailsExpanded, setIsDetailsExpanded] = useState(true);

  // Format time function: converts ms to HH:MM:SS
  const formatTime = (time: number) => {
    const totalSeconds = Math.floor(time / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  // Handle start, pause, and resume functionality
  const handleStartPause = () => {
    if (!isRunning) {
      // Start the stopwatch
      setIsRunning(true);
      setIsPaused(false);
      setIsFirst(false);
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current !== null) {
          setElapsedTime(Date.now() - startTimeRef.current);
        }
      }, 1000);
    } else if (!isPaused) {
      // Pause the stopwatch
      setIsPaused(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    } else if (isPaused) {
      // Resume the stopwatch
      setIsPaused(false);
      startTimeRef.current = Date.now() - elapsedTime;
      intervalRef.current = setInterval(() => {
        if (startTimeRef.current !== null) {
          setElapsedTime(Date.now() - startTimeRef.current);
        }
      }, 1000);
    }
  };

  // Handle lap and reset functionality
  const handleResetLap = () => {
    if (isRunning && !isPaused) {
      // Record a lap: compute lap time relative to the last lap
      const lastOverallTime = laps.length > 0 ? laps[laps.length - 1].overallTime : 0;
      const lapTime = elapsedTime - lastOverallTime;
      const newLap = { time: Date.now(), lapTime, overallTime: elapsedTime };
      setLaps((prev) => [...prev, newLap]);
    } else if (isPaused) {
      // Reset the stopwatch and laps when paused
      setIsRunning(false);
      setIsPaused(false);
      setElapsedTime(0);
      setLaps([]);
      setIsFirst(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Auto-scroll lap log to the bottom when a new lap is added
  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [laps]);

  return (
    <GestureHandlerRootView className="flex-1">
      <View className="flex-1 bg-white">
        <View className="flex flex-col h-screen bg-blue-500">
          {/* Back Button */}
          <View className="flex flex-row absolute z-10 top-25 mt-3 items-center justify-start px-5">
            <TouchableOpacity onPress={() => router.back()}>
              <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
                <Image source={icons.backArrow} resizeMode="contain" className="w-6 h-6" />
              </View>
            </TouchableOpacity>
            <Text className="text-xl font-JakartaSemiBold ml-5">Go Back</Text>
          </View>

          {/* Map */}
          <Map theme={mapTheme || "standard"} pins={routeDetalis.pins} directions={routeDetalis.directions} />
        </View>

        {/* Draggable Details (narrower and lower) */}
        {/* <Draggable
          style={{
            position: "absolute",
            top: 80, // lowered from previous top value
            alignSelf: "center",
            width: "80%", // narrower width
            maxWidth: 300,
            zIndex: 30,
          }}
        > */}
        <TouchableOpacity
          onPressOut={() => setIsDetailsExpanded(!isDetailsExpanded)}
          style={{
            position: "absolute",
            top: 80, // lowered from previous top value
            alignSelf: "center",
            width: "85%", // narrower width
            maxWidth: 400,
            zIndex: 30,
          }}
        >
          {isDetailsExpanded ? (
            <View className="bg-white p-2 rounded-md flex-row justify-around border">
              <Text className="text-s text-black font-bold">Diff: {routeDetalis.difficulty}</Text>
              <Text className="text-s text-black font-bold">Length: {routeDetalis.length} km</Text>
              <Text className="text-s text-black font-bold">Elev: {routeDetalis.elevationGain} m</Text>
            </View>
          ) : (
            <View className="bg-white p-2 rounded-full items-center justify-center w-10 h-10 border">
              <Text className="text-xs text-black">Info</Text>
            </View>
          )}
        </TouchableOpacity>
        {/* </Draggable> */}

        {/* Stopwatch and Lap Log BottomSheet */}
        <BottomSheet ref={bottomSheetRef} snapPoints={["25%", "65%"]}>
          <BottomSheetView style={{ flex: 1, padding: 20, backgroundColor: "rgb(226, 226, 226)" }}>
            <Text className="text-5xl font-JakartaBold text-center mb-3">{formatTime(elapsedTime)}</Text>
            <View className="border-t border-gray-300 w-[95%] mx-auto mb-4" />
            <View className="flex-row space-x-4">
              <TouchableOpacity onPress={handleStartPause} className={`flex-1 rounded-full p-3 flex justify-center items-center shadow-md shadow-neutral-400/70 ${!isRunning || isPaused ? "bg-green-600" : "bg-red-500"}`}>
                <Text className="text-lg font-bold text-white">{isRunning ? (isPaused ? "Resume" : "Pause") : "Start"}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={handleResetLap} className={`flex-1 rounded-full p-3 flex justify-center items-center shadow-md shadow-neutral-400/70 ${(!isRunning && isPaused) || (isRunning && !isPaused && !isFirst) ? "bg-gray-500" : "bg-gray-400"}`} disabled={!isRunning && !isPaused}>
                <Text className="text-lg font-bold text-white">{(isRunning && !isPaused) || isFirst ? "Lap" : "Reset"}</Text>
              </TouchableOpacity>
            </View>

            {/* Lap Log ScrollView */}
            <ScrollView className="mt-4 flex-1" ref={scrollViewRef}>
              <View className="border-t border-black" />
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

            <CustomButton title="End Run" onPressIn={() => router.push(`/home`)} className="mt-5 mb-3" />
          </BottomSheetView>
        </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
};

export default RunRoute;
