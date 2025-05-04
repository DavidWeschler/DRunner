/**
 * @description This file contains a component that provides OAuth login functionality using Google.
 * It allows users to log in with their Google account and handles the session state.
 * The component uses the Clerk library for authentication and Expo Router for navigation.
 */
import { useSSO } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Alert, Image, Text, View } from "react-native";
import CustomButton from "@/components/CustomButton";
import { icons } from "@/constants";
import { googleOAuth } from "@/lib/auth";

const OAuth = () => {
  const { startSSOFlow } = useSSO();

  const handleGoogleSignIn = async () => {
    const result = await googleOAuth(startSSOFlow);

    if (result.code === "session_exists") {
      Alert.alert("Success", "Session exists. Redirecting to home screen.");
      router.replace("/(root)/(tabs)/home");
    }

    Alert.alert(result.success ? "Success" : "Error", result.message);
  };

  return (
    <View className="flex items-center">
      <View className="flex flex-row justify-center items-center mt-4 gap-x-3">
        <View className="flex-1 h-[1px] bg-general-100" />
        <Text className="text-lg">Or</Text>
        <View className="flex-1 h-[1px] bg-general-100" />
      </View>

      <CustomButton title="Log In with Google" className="mt-5 w-10/12 shadow-none" IconLeft={() => <Image source={icons.google} resizeMode="contain" className="w-5 h-5 mx-2" />} bgVariant="outline" textVariant="primary" onPress={handleGoogleSignIn} />
    </View>
  );
};

export default OAuth;
