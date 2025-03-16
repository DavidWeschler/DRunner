import { useUser } from "@clerk/clerk-expo";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import InputField from "@/components/InputField";
import ScrollableAlert from "@/components/AboutModal";
import { useState } from "react";
import { useLocationStore, useaiModelStore } from "@/store";
import { StyleSheet } from "react-native";
import CustomButton from "@/components/CustomButton";
// import {aiModel } from "@/types/type";

// models
// deep seek: "deepseek/deepseek-r1-distill-llama-70b:free"
// google gemma 3: "google/gemma-3-4b-it:free"
// Qwen QwQ 32B: "qwen/qwq-32b:free" ~~
// Nous DeepHermes 3 Llama 3 8B Preview (free): "nousresearch/deephermes-3-llama-3-8b-preview:free"
// Google Gemini Flash Lite 2.0 Preview (free): "google/gemini-2.0-flash-lite-preview-02-05:free"
// Meta: Llama 3.3 70B Instruct (free): "meta-llama/llama-3.3-70b-instruct:free"

const Profile = () => {
  const { user } = useUser();
  const [currentMapTheme, setCurrentMapTheme] = useState<"standard" | "dark" | "aubergine" | "night" | "retro" | "silver">("standard");
  const { setMapTheme } = useLocationStore();
  const { setAiModel } = useaiModelStore();
  const [currentAi, setCurrentAi] = useState<"google gemma 3" | "deepSeek" | "Qwen QwQ 32B" | "Nous DeepHermes 3 Llama 3 8B" | "Google Gemini Flash Lite 2.0" | "Meta Llama 3.3 70B">("google gemma 3");
  const [isModalVisible, setModalVisible] = useState(false);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const setMapThemeInStrored = (theme: "standard" | "dark" | "aubergine" | "night" | "retro" | "silver") => {
    setCurrentMapTheme(theme);
    setMapTheme(theme);
  };

  // prettier-ignore
  const mapUrl = (model: "google gemma 3" | "deepSeek" | "Qwen QwQ 32B" | "Nous DeepHermes 3 Llama 3 8B" | "Google Gemini Flash Lite 2.0" | "Meta Llama 3.3 70B"): string => {
    const modelUrls: { [key: string]: string } = {
      "google gemma 3": "google/gemma-3-4b-it:free",
      "deepSeek": "deepseek/deepseek-r1-distill-llama-70b:free",
      "Qwen QwQ 32B": "qwen/qwq-32b:free",
      "Nous DeepHermes 3 Llama 3 8B": "nousresearch/deephermes-3-llama-3-8b-preview:free",
      "Google Gemini Flash Lite 2.0": "google/gemini-2.0-flash-lite-preview-02-05:free",
      "Meta Llama 3.3 70B": "meta-llama/llama-3.3-70b-instruct:free",
    };

    return modelUrls[model] || "";
  };

  const setAiModelInStrored = (model: "google gemma 3" | "deepSeek" | "Qwen QwQ 32B" | "Nous DeepHermes 3 Llama 3 8B" | "Google Gemini Flash Lite 2.0" | "Meta Llama 3.3 70B") => {
    setCurrentAi(model);
    const host = mapUrl(model);
    setAiModel({ name: model, host: host });
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

        <View className="items-center justify-center items-left mt-5">
          <Text className="text-black text-lg font-JakartaSemiBold">AI Model</Text>
          <View className="border-t border-gray-300 w-full my-4" />
        </View>

        <View style={styles.radioContainer}>
          <TouchableOpacity onPress={() => setAiModelInStrored("google gemma 3")} style={[styles.radio, currentAi === "google gemma 3" && styles.selected]} testID="ai-model-gemma">
            <Image source={require("@/assets/AiModels/gemma.png")} style={styles.radioImage} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAiModelInStrored("deepSeek")} style={[styles.radio, currentAi === "deepSeek" && styles.selected]} testID="ai-model-deepseek">
            <Image source={require("@/assets/AiModels/deepseek.png")} style={styles.radioImage} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAiModelInStrored("Qwen QwQ 32B")} style={[styles.radio, currentAi === "Qwen QwQ 32B" && styles.selected]} testID="ai-model-qwen">
            <Image source={require("@/assets/AiModels/qwen.png")} style={styles.radioImage} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAiModelInStrored("Nous DeepHermes 3 Llama 3 8B")} style={[styles.radio, currentAi === "Nous DeepHermes 3 Llama 3 8B" && styles.selected]} testID="ai-model-hermes">
            <Image source={require("@/assets/AiModels/hermes.png")} style={styles.radioImage} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAiModelInStrored("Google Gemini Flash Lite 2.0")} style={[styles.radio, currentAi === "Google Gemini Flash Lite 2.0" && styles.selected]} testID="ai-model-gemini">
            <Image source={require("@/assets/AiModels/gemini.png")} style={styles.radioImage} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAiModelInStrored("Meta Llama 3.3 70B")} style={[styles.radio, currentAi === "Meta Llama 3.3 70B" && styles.selected]} testID="ai-model-meta">
            <Image source={require("@/assets/AiModels/meta.png")} style={styles.radioImage} />
          </TouchableOpacity>
        </View>

        <View className="items-center justify-center items-left mt-2">
          <Text className="text-black text-lg font-JakartaSemiBold">Map Theme</Text>
          <View className="border-t border-gray-300 w-full my-4" />
        </View>

        <View style={styles.radioContainer}>
          <TouchableOpacity onPress={() => setMapThemeInStrored("dark")} style={[styles.radio, currentMapTheme === "dark" && styles.selected]} testID="map-theme-dark">
            <Image source={require("@/assets/MapImages/dark.png")} style={styles.radioImage} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMapThemeInStrored("aubergine")} style={[styles.radio, currentMapTheme === "aubergine" && styles.selected]} testID="map-theme-aubergine">
            <Image source={require("@/assets/MapImages/aubergine.png")} style={styles.radioImage} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMapThemeInStrored("night")} style={[styles.radio, currentMapTheme === "night" && styles.selected]} testID="map-theme-night">
            <Image source={require("@/assets/MapImages/night.png")} style={styles.radioImage} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMapThemeInStrored("retro")} style={[styles.radio, currentMapTheme === "retro" && styles.selected]} testID="map-theme-retro">
            <Image source={require("@/assets/MapImages/retro.png")} style={styles.radioImage} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMapThemeInStrored("silver")} style={[styles.radio, currentMapTheme === "silver" && styles.selected]} testID="map-theme-silver">
            <Image source={require("@/assets/MapImages/silver.png")} style={styles.radioImage} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setMapThemeInStrored("standard")} style={[styles.radio, currentMapTheme === "standard" && styles.selected]} testID="map-theme-standard">
            <Image source={require("@/assets/MapImages/standard.png")} style={styles.radioImage} />
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
    borderRadius: 10,
    width: "30%",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 5,
    marginBottom: 10,
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
    width: "120%",
    height: 50,
    resizeMode: "cover",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
});
