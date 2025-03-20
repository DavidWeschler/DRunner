import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";

const SignIn = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/(root)/(tabs)/home");
      } else {
        // See https://clerk.com/docs/custom-flows/error-handling for more info on error handling
        Alert.alert("Error", "Log in failed. Please try again.");
      }
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors[0].longMessage);
    }
  }, [isLoaded, form]);

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[190px]">
          <Image source={images.signUpCar} className="z-0 w-full h-[190px]" />
          <View className="flex justify-center items-center mt-2">
            <Text className="text-2xl text-black font-JakartaSemiBold">Sign In</Text>
          </View>
        </View>
        <View className="p-5 mt-8">
          <InputField label="Email" placeholder="Enter your email" icon={icons.email} value={form.email} onChangeText={(value) => setForm({ ...form, email: value })} />

          <InputField label="Password" placeholder="Enter your password" icon={icons.lock} secureTextEntry={true} value={form.password} onChangeText={(value) => setForm({ ...form, password: value })} />

          <CustomButton title="Sign In" onPress={onSignInPress} className="w-11/12 mt-6 mx-auto" />
        </View>

        <OAuth />

        <View className="mt-5">
          <Link href="/sign-up">
            <Text className="text-lg text-center text-general-200 mt-10">Don't have an account? </Text>
            <Text className="text-primary-500 text-lg underline">Sign Up</Text>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignIn;
