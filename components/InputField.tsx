/**
 * This component is a reusable input field for React Native applications.
 */
import { useState } from "react";
import { TextInput, View, Text, Image, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard } from "react-native";
import { InputFieldProps } from "@/types/type";

const InputField = ({ label, icon, secureTextEntry = false, labelStyle, containerStyle, inputStyle, iconStyle, className, ...props }: InputFieldProps) => {
  const [text, setText] = useState("");

  return (
    <KeyboardAvoidingView behavior={"height"}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="my-2 w-full">
          <Text className={`text-lg font-JakartaSemiBold mb-3 ${labelStyle}`}>{label}</Text>
          <View className={`flex flex-row justify-start items-center relative bg-neutral-100 rounded-full border border-neutral-100 focus:border-primary-500  ${containerStyle}`}>
            {icon && <Image source={icon} className={`w-6 h-6 ml-4 ${iconStyle}`} />}
            <TextInput className={`rounded-full p-4 font-JakartaSemiBold text-[15px] flex-1 ${inputStyle} text-left`} secureTextEntry={secureTextEntry} value={text} onChangeText={setText} {...props} />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default InputField;
