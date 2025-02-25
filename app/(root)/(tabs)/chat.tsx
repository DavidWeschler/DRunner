import { useState, useEffect } from "react";
import { View, Text, FlatList, Keyboard, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HadasTextInput from "@/components/HadasInp";
import { icons } from "@/constants";
import { useLocationStore } from "@/store";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import axios from "axios";

const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;

const getBotReply = async (message: string) => {
  console.log("You:", message);
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "deepseek/deepseek-r1-distill-llama-70b:free",
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.statusText}`);
  }

  const data = await response.json();
  console.log("Full response:", JSON.stringify(data, null, 2)); // Log the full response

  const messageContent = data.choices[0].message.content;
  console.log("Message content:", messageContent);
  return messageContent;
};

const Chat = () => {
  const { inp, setHadasInp } = useLocationStore();
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "bot"; timestamp: string }[]>([]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const handleSendMessage = async ({ inp }: { inp: string }) => {
    if (!inp.trim()) return;

    const timestamp = new Date().toLocaleTimeString();

    // Add user message
    setMessages((prev) => [...prev, { text: inp, sender: "user", timestamp }]);

    // Simulate bot reply
    const reply = await getBotReply(inp);
    setMessages((prev) => [...prev, { text: reply, sender: "bot", timestamp }]);
  };

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow", () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide", () => setKeyboardVisible(false));

    if (inp) {
      // Clear the conversation and add new message
      setMessages([]);
      handleSendMessage({ inp });
      setHadasInp(""); // Clear input after sending
    }

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, [inp]); // Dependency on `inp` to trigger the effect when `inp` changes

  return (
    <SafeAreaView className="flex-1 p-4">
      <View className="justify-center items-center">
        <Text className="text-2xl font-JakartaBold mt-5">Chatting With Hadas AI</Text>
        <View className="border-t border-gray-300 w-full my-4" />
      </View>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View className={`p-4 my-2 rounded-lg ${item.sender === "user" ? "bg-blue-300 self-end" : "bg-gray-300 self-start"}`} style={{ maxWidth: "80%" }}>
            <Text className="text-black text-lg font-JakartaSemiBold">{item.text}</Text>
            <Text className="text-sm text-gray-500 mt-1">{item.timestamp}</Text>
          </View>
        )}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
      />

      <View className={`${keyboardVisible ? "" : " p-2 mb-20"}`}>
        <HadasTextInput icon={icons.to} containerStyle="bg-white shadow-md shadow-neutral-300" placeholder="Message" handleString={handleSendMessage} />
      </View>
    </SafeAreaView>
  );
};

export default Chat;
