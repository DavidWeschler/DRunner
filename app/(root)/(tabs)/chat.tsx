import { useState, useEffect, useRef } from "react";
import { View, Text, FlatList, Keyboard, Platform, Button, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HadasTextInput from "@/components/HadasInp";
import { icons } from "@/constants";
import { useLocationStore, useaiModelStore, useHadasStore } from "@/store";
import * as Location from "expo-location";
import { router } from "expo-router";
import CustomButton from "@/components/CustomButton";
import HadasHelp from "@/components/HadasHelp";
import TypingDots from "@/components/AiThinking";
import React from "react";
import { ApiMessage } from "@/types/type";
const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;

// prettier-ignore
const generateStartingMessage = (): string => {
  const messages: string[] = [
    "Hi there! My name is Hadas and I can help you plan a route for your next run. Let's get started!",
    "Hello! I'm Hadas. I can assist you in planning a route for your run. Let's begin!",
    "Greetings! I'm Hadas and I'm here to help you plan a route for your run. Let's start!",
    "Hi there! I am Hadas, I can guide you in planning a route for your run. Let's get going!",
    "Hey! I'm Hadas and I'm here to assist you in planning a route for your run. Let's begin!",
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

const getLatLngFromAddress = async (address: string) => {
  const [result] = await Location.geocodeAsync(address);
  return { latitude: result.latitude, longitude: result.longitude };
};

const Chat = () => {
  const { inp, setUserLocation, setHadasInp, setLengthInput, setStartAddress, setEndAddress, setDifficultyInput, setStartPointInput, setEndPointInput } = useLocationStore();
  const { chatReset, setChatReset } = useHadasStore();
  const { model } = useaiModelStore();
  const [messages, setMessages] = useState<{ text: string | JSX.Element; sender: "user" | "bot"; timestamp: string }[]>([
    {
      text: generateStartingMessage(),
      sender: "bot",
      timestamp: new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      }),
    },
  ]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [deepAnswered, setDeepAnswered] = useState(true);
  const [generatePressed, setGeneratePressed] = useState(false);
  const [userLocationStr, setUserLocationStr] = useState("");
  const flatListRef = useRef<FlatList>(null);
  const scrollToBottom = () => {
    flatListRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        return;
      }

      let location = await Location.getCurrentPositionAsync({});

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords?.latitude!,
        longitude: location.coords?.longitude!,
      });

      setUserLocation({
        latitude: location.coords?.latitude,
        longitude: location.coords?.longitude,
        address: `${address[0].name}, ${address[0].region}`,
      });

      setUserLocationStr(`${address[0].formattedAddress}`);
    })();
  }, []);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow", () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide", () => setKeyboardVisible(false));

    if (inp) {
      setMessages(() => [
        {
          text: generateStartingMessage(),
          sender: "bot",
          timestamp: new Date().toLocaleTimeString("en-GB", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          }),
        },
      ]);
      scrollToBottom();
      handleSend({ inp });
      setHadasInp("");
    }
    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, [inp]);

  useEffect(() => {
    setStartAddress("");
    setEndAddress("");
    setLengthInput(Number(null));
    setDifficultyInput("");

    setMessages(() => [
      {
        text: generateStartingMessage(),
        sender: "bot",
        timestamp: new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      },
    ]);
    scrollToBottom();
    setChatReset(false);
  }, [chatReset]);

  const askAi = async (instructions: string, message: string) => {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model.host,
        messages: [
          {
            role: "system",
            content: instructions,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.4,
        max_tokens: 500,
      }),
    });
    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    const messageContent = data.choices[0].message.content;
    return messageContent;
  };

  const generateRes = async (userInput: string) => {
    scrollToBottom();
    let finalAnswer = "I didn't catch that. Try rephrasing your message :)";
    try {
      let currentInputs = {
        "running route length ": useLocationStore.getState().length,
        "running route start location ": useLocationStore.getState().startAddress,
        "running route end location ": useLocationStore.getState().endAddress,
        "running route difficulty level ": useLocationStore.getState().difficulty,
      };

      const systemPrompt: ApiMessage = {
        role: "system",
        content: `You are a JSON generator for running routes. Follow these rules STRICTLY:
      1. Respond ONLY with valid JSON using these keys: startLocation, endLocation, routeLength, difficultyLvl, AIresponse. Do not include any other keys!
      2. Use "unknown" for missing values.
      3. NEVER include explanations, thoughts, or markdown.
      4. Difficulty must be one of: easy, medium, hard. you may choose the closest one.
      5. routeLength must be numbers only in kilometers.
      6. AIresponse is your text response to the user's message. Answer as shortly as possible. Make sure to include what you understood.
      7. In AIresponse ask the user on a specific next step from any single MISSING value here: ${JSON.stringify(currentInputs)} make sure its missing! If everything is correct, ask if the user wants to generate the route by clicking the button "Generate".
      8. If the user ask for advices on planning a route, Give him a usfull advices HOW or SUGGEST some options (no more than 40 words) in the AIresponse.
      9. Do not include any additional text or formatting. Only respond with JSON.
      10. If the user is referring to his location, ${userLocationStr ? `this is his address to use: ${userLocationStr}` : "ask him to grant permission to location services"}.`,
      };

      const userMessage: ApiMessage = {
        role: "user",
        content: `${userInput}\n\nONLY RESPOND WITH JSON. NO ADDITIONAL TEXT.`,
      };

      const rawContent = await askAi(systemPrompt.content, userMessage.content);
      const jsonString = rawContent?.match(/\{[\s\S]*\}/)?.[0] || "";

      const cleanedJson = jsonString
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .replace(/\\n/g, "")
        .replace(/\n/g, "")
        .replace(/\\/g, "");

      if (!cleanedJson) {
        throw new Error("No JSON found in response");
      }

      const reply = JSON.parse(cleanedJson);
      if (reply?.startLocation && reply.startLocation !== "unknown") setStartAddress(reply.startLocation);
      if (reply?.endLocation && reply.endLocation !== "unknown") setEndAddress(reply.endLocation);
      if (reply?.routeLength && reply.routeLength !== "unknown") setLengthInput(Number(reply.routeLength));
      if (reply?.difficultyLvl && ["easy", "medium", "hard"].includes(reply.difficultyLvl)) setDifficultyInput(reply.difficultyLvl as "easy" | "medium" | "hard");

      finalAnswer =
        reply?.AIresponse && reply.AIresponse !== "unknown"
          ? (reply.AIresponse ?? "")
              .replace(/\*\*/g, "\n**")
              .replace(/\*\*/g, "")
              .split(/<\/think>/)
              .map((s: string) => s.replace(/\n/g, ""))
              .filter((s: string) => s.trim() !== "")
              .pop() ?? finalAnswer
          : finalAnswer;
    } catch (error) {
    } finally {
      const timestamp = new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      setMessages((prev) => [...prev, { text: finalAnswer, sender: "bot", timestamp }]);
      scrollToBottom();
    }
  };

  const handleSend = async ({ inp }: { inp: string }) => {
    if (!inp.trim() || !deepAnswered) {
      return;
    }
    const timestamp = new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    try {
      setMessages((prev) => [...prev, { text: inp, sender: "user", timestamp }]);
      setDeepAnswered(false);
      setMessages((prev) => [...prev, { text: <TypingDots />, sender: "bot", timestamp }]);
      await generateRes(inp);
      setMessages((prev) => prev.filter((msg) => !React.isValidElement(msg.text)));
    } catch (error) {
      console.log("Error handling message:", error);
      setMessages((prev) => [...prev, { text: "Sorry, something went wrong. Please try again.", sender: "bot", timestamp }]);
    } finally {
      setDeepAnswered(true);
      scrollToBottom();
    }
  };

  const generateRoute = async () => {
    setGeneratePressed(true);
    setDeepAnswered(false);
    const s = useLocationStore.getState().startAddress;
    const e = useLocationStore.getState().endAddress;
    const l = useLocationStore.getState().length || 5;
    const d = useLocationStore.getState().difficulty || "easy";
    let startCoords = null;
    let endCoords = null;

    try {
      if (s) {
        startCoords = await getLatLngFromAddress(s);
        setStartPointInput(startCoords);
      } else {
        return;
      }
      if (e) {
        endCoords = await getLatLngFromAddress(e);
        if (endCoords !== startCoords) setEndPointInput(endCoords);
      }
      setLengthInput(l);
      setDifficultyInput(d as "easy" | "medium" | "hard");
      router.push("/(root)/choose-run");
    } catch {
      setGeneratePressed(false);
      setDeepAnswered(true);
      const timestamp = new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      setMessages((prev) => [...prev, { text: "Sorry, something went wrong with generating your route", sender: "bot", timestamp }]);
      scrollToBottom();
    }
  };

  const [isModalVisible, setModalVisible] = useState(false);
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  return (
    <SafeAreaView className="flex-1 p-4">
      <View className="flex-row justify-between items-center w-full px-4">
        <TouchableOpacity
          onPress={() => {
            router.push("/home");
          }}
          className="justify-center items-center w-10 h-10 rounded-full"
          testID="back-button"
        >
          <Image source={icons.backArrow} className="w-6 h-6" />
        </TouchableOpacity>

        <View className="flex-1 justify-center items-center">
          <Text className="text-2xl font-JakartaBold mt-2">Hadas AI 🤖</Text>
        </View>

        <View className="items-center justify-center">
          <CustomButton onPress={toggleModal} title="?" bgVariant="secondary" textVariant="default" className="ml-6 w-11 h-11 rounded-full flex items-center justify-center mt-1" textClassName="relative -mt-1" />
          <HadasHelp visible={isModalVisible} onClose={toggleModal} />
        </View>
      </View>

      <View className="border-t border-gray-300 w-full my-4 mt-5" />
      {(messages.length > 3 || useLocationStore.getState().length || useLocationStore.getState().startAddress) && !generatePressed && deepAnswered && <CustomButton onPress={generateRoute} title="Generate" bgVariant="primary" textVariant="default" className="mt-[-10]" />}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View className={`p-4 my-2 rounded-lg ${item.sender === "user" ? "bg-blue-300 self-end" : "bg-gray-300 self-start"}`} style={{ maxWidth: "80%" }}>
            <Text className="text-black text-sm font-JakartaSemiBold">{item.text}</Text>
            <Text className="text-xs text-gray-500 mt-1">{item.timestamp}</Text>
          </View>
        )}
        contentContainerStyle={{ flexGrow: 1, justifyContent: "flex-end" }}
      />

      <View className={`${keyboardVisible ? "" : " p-2 mb-20"}`}>
        <HadasTextInput icon={icons.to} containerStyle="bg-white shadow-md shadow-neutral-300" placeholder="Message" handleString={handleSend} editable={deepAnswered} />
      </View>
    </SafeAreaView>
  );
};

export default Chat;
