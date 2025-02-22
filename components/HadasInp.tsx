import { View, Image, TextInput } from "react-native";
import { useState } from "react";

import { icons } from "@/constants";
import { HadasInputProps } from "@/types/type";

const HadasTextInput = ({ icon, initialLocation, containerStyle, textInputBackgroundColor, placeholder, handleString }: HadasInputProps) => {
  const [text, setText] = useState(initialLocation || "");

  const onSubmit = () => {
    handleString({ inp: text });
    setText("");
  };

  return (
    <View className={`flex flex-row h-14 items-center justify-center relative z-50 rounded-xl ${containerStyle}`}>
      <View className="justify-center items-center w-6 h-6 mr-4">
        <Image source={icon ? icon : icons.search} className="ml-8 w-6 h-6" resizeMode="contain" />
      </View>
      <TextInput value={text} onChangeText={setText} onSubmitEditing={onSubmit} placeholder={placeholder} placeholderTextColor="gray" className="flex-1 rounded-xl px-3 py-2" style={{ backgroundColor: textInputBackgroundColor || "white", fontSize: 16, fontWeight: "600" }} returnKeyType="done" />
    </View>
  );
};

export default HadasTextInput;
