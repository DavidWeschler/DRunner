import React from "react";
import { View, Text } from "react-native";
import { MotiView } from "moti";

const LoadingScreen = () => {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <MotiView
        from={{ opacity: 0.5, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          loop: true,
          type: "timing",
          duration: 1000,
        }}
        className="w-16 h-16 bg-blue-500 rounded-full"
      />
      <Text className="mt-4 text-gray-600 font-semibold text-lg">Loading...</Text>
    </View>
  );
};

export default LoadingScreen;
