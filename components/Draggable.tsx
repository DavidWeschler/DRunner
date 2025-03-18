// Draggable.js
import React, { useRef } from "react";
import { Animated, PanResponder } from "react-native";

import { ViewStyle } from "react-native";

interface DraggableProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

const Draggable: React.FC<DraggableProps> = ({ children, style }) => {
  const pan = useRef(new Animated.ValueXY()).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  return (
    <Animated.View style={[style, { transform: pan.getTranslateTransform() }]} {...panResponder.panHandlers}>
      {children}
    </Animated.View>
  );
};

export default Draggable;
