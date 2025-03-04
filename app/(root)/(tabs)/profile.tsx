import { useUser } from "@clerk/clerk-expo";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import InputField from "@/components/InputField";
import ScrollableAlert from "@/components/AboutModal";
import { useState } from "react";
import { useLocationStore } from "@/store";
import { StyleSheet } from "react-native";
import CustomButton from "@/components/CustomButton";

const Profile = () => {
  const { user } = useUser();
  const [currentMapTheme, setCurrentMapTheme] = useState<"standard" | "dark" | "aubergine" | "night" | "retro" | "silver">("standard");
  const { setMapTheme } = useLocationStore();
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const setMapThemeInStrored = (theme: "standard" | "dark" | "aubergine" | "night" | "retro" | "silver") => {
    setCurrentMapTheme(theme);
    setMapTheme(theme);
  };

  return (
    <SafeAreaView className="flex-1">
      <ScrollView className="px-5" contentContainerStyle={{ paddingBottom: 120 }}>
        <View className="justify-center items-center">
          <Text className="text-2xl font-JakartaBold mt-5">My profile</Text>
          <View className="border-t border-gray-300 w-full my-4" />
        </View>

        <View className="flex items-center justify-center my-5">
          <Image
            source={{
              uri: user?.externalAccounts[0]?.imageUrl ?? user?.imageUrl,
            }}
            style={{ width: 110, height: 110, borderRadius: 110 / 2 }}
            className=" rounded-full h-[110px] w-[110px] border-[3px] border-white shadow-sm shadow-neutral-300"
          />
        </View>

        <View className="flex flex-col items-start justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 px-5 py-3">
          <View className="flex flex-col items-start justify-start w-full">
            <InputField label="First name" placeholder={user?.firstName || "Not Found"} containerStyle="w-full" inputStyle="p-3.5" editable={false} />

            <InputField label="Last name" placeholder={user?.lastName || "Not Found"} containerStyle="w-full" inputStyle="p-3.5" editable={false} />

            <InputField label="Email" placeholder={user?.primaryEmailAddress?.emailAddress || "Not Found"} containerStyle="w-full" inputStyle="p-3.5" editable={false} />
          </View>
        </View>

        <View className="items-center justify-center items-left mt-2">
          <Text className="text-black text-lg font-JakartaSemiBold">Map Theme</Text>
          <View className="border-t border-gray-300 w-full my-4" />
        </View>

        <View style={styles.radioContainer}>
          <TouchableOpacity onPress={() => setMapThemeInStrored("dark")} style={[styles.radio, currentMapTheme === "dark" && styles.selected]}>
            <Image source={require("@/assets/MapImages/dark.png")} style={styles.radioImage} />
            {/* <Text style={[styles.radioText, currentMapTheme === "dark" ? styles.selectedText : styles.unselectedText]}>Dark</Text> */}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMapThemeInStrored("aubergine")} style={[styles.radio, currentMapTheme === "aubergine" && styles.selected]}>
            <Image source={require("@/assets/MapImages/aubergine.png")} style={styles.radioImage} />
            {/* <Text style={[styles.radioText, currentMapTheme === "aubergine" ? styles.selectedText : styles.unselectedText]}>Aubergine</Text> */}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMapThemeInStrored("night")} style={[styles.radio, currentMapTheme === "night" && styles.selected]}>
            <Image source={require("@/assets/MapImages/night.png")} style={styles.radioImage} />
            {/* <Text style={[styles.radioText, currentMapTheme === "night" ? styles.selectedText : styles.unselectedText]}>Night</Text> */}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMapThemeInStrored("retro")} style={[styles.radio, currentMapTheme === "retro" && styles.selected]}>
            <Image source={require("@/assets/MapImages/retro.png")} style={styles.radioImage} />
            {/* <Text style={[styles.radioText, currentMapTheme === "retro" ? styles.selectedText : styles.unselectedText]}>Retro</Text> */}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMapThemeInStrored("silver")} style={[styles.radio, currentMapTheme === "silver" && styles.selected]}>
            <Image source={require("@/assets/MapImages/silver.png")} style={styles.radioImage} />
            {/* <Text style={[styles.radioText, currentMapTheme === "silver" ? styles.selectedText : styles.unselectedText]}>Silver</Text> */}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMapThemeInStrored("standard")} style={[styles.radio, currentMapTheme === "standard" && styles.selected]}>
            <Image source={require("@/assets/MapImages/standard.png")} style={styles.radioImage} />
            {/* <Text style={[styles.radioText, currentMapTheme === "standard" ? styles.selectedText : styles.unselectedText]}>Standard</Text> */}
          </TouchableOpacity>
        </View>

        <View className="flex-1 justify-center items-center">
          <View className="border-t border-gray-300 w-full my-4" />
        </View>
        <View className="flex-1 justify-center items-center">
          <CustomButton onPress={toggleModal} title="About" bgVariant="primary" textVariant="default" className="mt-1" />
          <ScrollableAlert visible={isModalVisible} onClose={toggleModal} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  radioContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 10,
  },
  radio: {
    backgroundColor: "#F4F4F4",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    width: "30%",
    alignItems: "center",
    justifyContent: "center",
    // marginHorizontal: 5,
    // marginBottom: 10,
    // borderWidth: 1,
    borderColor: "#D1D5DB",
    overflow: "hidden",
  },
  selected: {
    backgroundColor: "#9cc8f0",
  },
  unselected: {
    color: "#6B7280",
  },
  radioText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    maxWidth: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  selectedText: {
    color: "#FFFFFF",
  },
  unselectedText: {
    color: "#6B7280",
  },
  button: {
    backgroundColor: "#0286FF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  radioImage: {
    width: "100%",
    height: 50,
    resizeMode: "cover",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
});
