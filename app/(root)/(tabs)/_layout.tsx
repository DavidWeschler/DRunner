/* istanbul ignore file */

import { Tabs } from "expo-router";
import { Image, ImageSourcePropType, View, Keyboard, Platform } from "react-native";
import { useState, useEffect } from "react";
import { icons } from "@/constants";

const TabIcon = ({ source, focused }: { source: ImageSourcePropType; focused: boolean }) => (
  <View className={`flex flex-row justify-center items-center rounded-full ${focused ? "bg-[#004A8E]" : ""}`}>
    <View className={`rounded-full w-12 h-12 items-center justify-center ${focused ? "bg-[#D69C32]" : ""}`} style={{ transform: [{ translateY: -15 }] }}>
      <Image source={source} tintColor="white" resizeMode="contain" className="w-7 h-7" />
    </View>
  </View>
);

const Layout = () => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow", () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide", () => setKeyboardVisible(false));

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "white",
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#004A8E",
          borderRadius: 50,
          overflow: "hidden",
          marginHorizontal: 20,
          marginBottom: 20,
          marginVertical: 50,
          height: 78,
          display: keyboardVisible ? "none" : "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexDirection: "row",
          position: "absolute",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} source={icons.home} />,
        }}
      />

      <Tabs.Screen
        name="runs"
        options={{
          title: "Runs",
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} source={icons.list} />,
        }}
      />

      <Tabs.Screen
        name="chat"
        options={{
          title: "Chat",
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} source={icons.chat} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} source={icons.profile} />,
        }}
      />
    </Tabs>
  );
};

export default Layout;
