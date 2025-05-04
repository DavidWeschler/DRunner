/**
 * SignUp.tsx
 * This file contains the SignUp component which is used for user registration.
 * It uses the Clerk library for authentication and Expo Router for navigation.
 * It also includes custom components for input fields and buttons.
 * The component allows users to sign up using their email, name, and password.
 * After signing up, users receive a verification code via email to verify their account.
 */
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { icons, images } from "@/constants";
import InputField from "@/components/InputField";
import React, { useState } from "react";
import CustomButton from "@/components/CustomButton";
import { Link, router } from "expo-router";
import OAuth from "@/components/OAuth";
import { useSignUp } from "@clerk/clerk-expo";
import { ReactNativeModal } from "react-native-modal";
import { fetchAPI } from "@/lib/fetch";

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerification({
        ...verification,
        state: "pending",
      });
    } catch (err: any) {
      console.log(JSON.stringify(err, null, 2));
      Alert.alert("Error", err.errors[0].longMessage);
    }
  };
  const onPressVerify = async () => {
    if (!isLoaded) return;
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });
      if (completeSignUp.status === "complete") {
        await fetchAPI("/(api)/user", {
          method: "POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            clerkId: completeSignUp.createdUserId,
          }),
        });
        await setActive({ session: completeSignUp.createdSessionId });
        setVerification({
          ...verification,
          state: "success",
        });
      } else {
        setVerification({
          ...verification,
          error: "Verification failed. Please try again.",
          state: "failed",
        });
      }
    } catch (err: any) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      setVerification({
        ...verification,
        error: err.errors[0].longMessage,
        state: "failed",
      });
    }
  };

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[190px]">
          <Image source={images.signUpCar} className="z-0 w-full h-[190px]" />
          <View className="flex justify-center items-center mt-2">
            <Text className="text-2xl text-black font-JakartaSemiBold">Create Your Account</Text>
          </View>
        </View>
        <View className="p-5 mt-8">
          <InputField label="Email" placeholder="Enter your email" icon={icons.email} value={form.email} onChangeText={(value) => setForm({ ...form, email: value })} />

          <InputField label="Name" placeholder="Enter your name" icon={icons.person} value={form.name} onChangeText={(value) => setForm({ ...form, name: value })} />

          <InputField label="Password" placeholder="Enter your password" icon={icons.lock} secureTextEntry={true} value={form.password} onChangeText={(value) => setForm({ ...form, password: value })} />

          <CustomButton title="Sign Up" onPress={onSignUpPress} className="w-11/12 mt-6 mx-auto" />
        </View>

        <OAuth />

        <View className="mt-5">
          <Link href="/sign-in">
            <Text className="text-lg text-center text-general-200 mt-10">Already have an account? </Text>
            <Text className="text-primary-500 text-lg underline">Log In</Text>
          </Link>
        </View>

        <ReactNativeModal
          isVisible={verification.state === "pending"}
          onModalHide={() => {
            if (verification.state === "success") {
              setShowSuccessModal(true);
            }
          }}
        >
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Text className="font-JakartaExtraBold text-2xl mb-2">Verification</Text>
            <Text className="font-Jakarta mb-5">Verification code sent to {form.email}</Text>
            <InputField label={"Code"} icon={icons.lock} placeholder={"12345"} value={verification.code} keyboardType="numeric" onChangeText={(code) => setVerification({ ...verification, code })} />
            {verification.error && <Text className="text-red-500 text-sm mt-1">{verification.error}</Text>}
            <CustomButton title="Verify Email" onPress={onPressVerify} className="mt-5 bg-success-500" />
          </View>
        </ReactNativeModal>

        <ReactNativeModal isVisible={showSuccessModal}>
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Image source={images.check} className="w-[110px] h-[110px] mx-auto my-5" />
            <Text className="text-3xl font-JakartaBold text-center">Verified</Text>

            <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">You have successfully verified your account.</Text>

            <CustomButton title="Browse Home" onPress={() => router.push(`/(root)/(tabs)/home`)} className="mt-5" />
          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};

export default SignUp;
