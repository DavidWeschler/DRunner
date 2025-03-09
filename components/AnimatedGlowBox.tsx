import React from "react";
import { View } from "react-native";
import { MotiView } from "moti";

const AnimatedGlowBox = () => {
  return (
    <MotiView
      from={{ opacity: 0.3, scale: 1 }}
      animate={{ opacity: 1, scale: 1.02 }}
      transition={{
        loop: true,
        type: "timing",
        duration: 1200,
      }}
      style={{
        position: "absolute",
        top: 505, // 20px from the top of the parent
        left: 6, // 20px from the left of the parent
        right: 20, // 20px from the right of the parent
        bottom: 10, // 20px from the bottom of the parent
        width: "95%",
        height: "25%",
        borderWidth: 2.5,
        borderColor: "#0286FF",
        borderRadius: 12,
        shadowColor: "#0286FF",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 15,
      }}
    />
  );
};

export default AnimatedGlowBox;
