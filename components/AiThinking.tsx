import React from "react";
import { View, Text } from "react-native";
import { MotiView } from "moti";

const TypingDots = () => {
  return (
    <View className="flex-row space-x-1">
      {[0, 1, 2].map((index) => (
        <MotiView
          key={index}
          from={{ opacity: 0.3, translateY: 0 }}
          animate={{ opacity: 1, translateY: -3 }}
          transition={{
            loop: true,
            type: "timing",
            duration: 500,
            delay: index * 200, // Staggered effect
          }}
          className="w-2 h-2 bg-gray-500 rounded-full"
        />
      ))}
    </View>
  );
};

export default TypingDots;
