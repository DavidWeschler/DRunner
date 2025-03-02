import { useState, useEffect } from "react";
import { View, Text, FlatList, Keyboard, Platform, Button } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import HadasTextInput from "@/components/HadasInp";
import { icons } from "@/constants";
import { useLocationStore } from "@/store";
import { get } from "react-native/Libraries/TurboModule/TurboModuleRegistry";
import axios from "axios";
import * as Location from "expo-location";
import { router } from "expo-router";

const OPENROUTER_API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;

// --------------------- Helper functions -------------------------------

// prettier-ignore
const generateStartingMessage = (): string => {
  const messages: string[] = [
    "Welcome to the R&D route planner bot! I can help you plan a route for your next run. Let's get started!",
    "Hello! I'm the R&D route planner bot. I can assist you in planning a route for your run. Let's begin!",
    "Greetings! I'm the R&D route planner bot. I'm here to help you plan a route for your run. Let's start!",
    "Hi there! I'm the R&D route planner bot. I can guide you in planning a route for your run. Let's get going!",
    "Hey! I'm the R&D route planner bot. I'm here to assist you in planning a route for your run. Let's begin!",
    "Hello! I'm the R&D route planner bot. I can help you map out a route for your run. Let's start!",
    "Wassup! I can help you plan a route for your next run. Let's get started!"
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

const getLatLngFromAddress = async (address: string) => {
  console.log("Getting lat and long from address:", address);
  const [result] = await Location.geocodeAsync(address);
  console.log("Latitude:", result.latitude);
  console.log("Longitude:", result.longitude);
  return { latitude: result.latitude, longitude: result.longitude };
};
// ---------------------------------------------------------------------

const Chat = () => {
  const { inp, setHadasInp, setLengthInput, setStartAddress, setEndAddress, setDifficultyInput, setStartPointInput, setEndPointInput } = useLocationStore();
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "bot"; timestamp: string }[]>([]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const [msgCounter, setMsgCounter] = useState(0);

  const [isGreeting, setIsGreeting] = useState(true);
  const [isChatting, setIsChatting] = useState(false);
  const [isPlanningRoute, setIsPlanningRoute] = useState(false);
  const [start, setStart] = useState<string | null>(null);
  const [end, setEnd] = useState<string | null>(null);
  const [len, setLen] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<string | null>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow", () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide", () => setKeyboardVisible(false));
    setMsgCounter(0);

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

  const askAi = async (instructions: string, message: string) => {
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
            role: "system",
            content: instructions,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.3, // Reduce creativity for better compliance
        // max_tokens: 100, // Maximum number of tokens to generate
      }),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Full response:", JSON.stringify(data, null, 2)); // Log the full response
    const messageContent = data.choices[0].message.content;
    return messageContent;
  };

  interface RouteDetails {
    start?: string;
    end?: string;
    len?: string;
    difficulty?: string;
  }

  interface ApiMessage {
    role: string;
    content: string;
  }

  const extractRouteDetails = async (userInput: string): Promise<RouteDetails | null> => {
    const apiUrl = "https://openrouter.ai/api/v1/chat/completions";
    const headers = {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    };

    const systemPrompt: ApiMessage = {
      role: "system",
      content: `You are a JSON generator for running routes. Follow these rules STRICTLY:
    1. Respond ONLY with valid JSON using these keys: start, end, len, difficulty
    2. Use "unknown" for missing values
    3. Never include explanations, thoughts, or markdown
    4. Difficulty must be one of: easy, medium, hard. you may choose the closest one
    5. Format example:
    ${JSON.stringify({ start: "unknown", end: "unknown", len: "5", difficulty: "unknown" })}
    
    Current request:`,
    };

    const userMessage: ApiMessage = {
      role: "user",
      content: `${userInput}\n\nONLY RESPOND WITH JSON. NO ADDITIONAL TEXT.`,
    };

    let rawContent = "";

    try {
      rawContent = await askAi(systemPrompt.content, userMessage.content);

      // Extract JSON from response text using regex
      const jsonString = rawContent?.match(/\{[\s\S]*\}/)?.[0] || "";

      // Clean common formatting issues
      const cleanedJson = jsonString
        .replace(/```json/g, "") // Remove markdown code blocks
        .replace(/```/g, "") // Remove any remaining backticks
        .replace(/\\n/g, "") // Remove newline characters
        .replace(/\n/g, ""); // Remove literal newlines

      if (!cleanedJson) {
        throw new Error("No JSON found in response");
      }

      // Parse with error handling
      const parsed = JSON.parse(cleanedJson) as RouteDetails;

      // Validate structure
      if (!("start" in parsed && "end" in parsed && "len" in parsed && "difficulty" in parsed)) {
        throw new Error("Invalid JSON structure");
      }

      return parsed;
    } catch (error) {
      console.error("Parsing Error:", error);
      console.log("Raw API Response:", rawContent);
      return null;
    }
  };

  const handleSendMessage = async ({ inp }: { inp: string }) => {
    if (!inp.trim()) return;
    const timestamp = new Date().toLocaleTimeString();
    const algoInputs = {
      len: useLocationStore.getState().length,
      start: useLocationStore.getState().startAddress,
      end: useLocationStore.getState().endAddress,
      difficulty: useLocationStore.getState().difficulty,
    };

    console.log("Algo Inputs:", algoInputs);

    // Add user message
    setMessages((prev) => [...prev, { text: inp, sender: "user", timestamp }]);

    // Greet the user
    if (msgCounter === 0) {
      setMsgCounter(1);
      const botAnswer = `${generateStartingMessage()}\n\nWhould you like me to help you plan a route or are you here just for a chat?`;
      setMessages((prev) => [...prev, { text: botAnswer, sender: "bot", timestamp }]);
      return;
    }
    if (msgCounter === 1) {
      setMsgCounter(2);
      const instructions = "deepseek, reply using 'answer_0' or 'answer_1' only and nothing else. from the following sentenence, reply 'answer_1' if it implies that whoever wrote it wants help with planning a route, and reply with 'answer_0' otherwhise. put the reply in with nothing else there. the sentence is:";
      const userWantsToPlanRoute = await askAi(instructions, inp);
      let botAnswer = "";
      if (userWantsToPlanRoute.includes("answer_1")) {
        setIsPlanningRoute(true);
        botAnswer = "Great! Let's start planning your route. What's the starting point?";
      } else {
        botAnswer = "Alright! I'm here to chat. What's on your mind?";
      }
      setMessages((prev) => [...prev, { text: botAnswer, sender: "bot", timestamp }]);
      return;
    }

    if (isPlanningRoute) {
      const reply = await extractRouteDetails(inp);
      console.log("Reply:", reply);
      if (reply?.start && reply.start !== "unknown") setStartAddress(reply.start);
      if (reply?.end && reply.end !== "unknown") setEndAddress(reply.end);
      if (reply?.len && reply.len !== "unknown") setLengthInput(Number(reply.len));
      if (reply?.difficulty && ["easy", "medium", "hard"].includes(reply.difficulty)) setDifficultyInput(reply.difficulty as "easy" | "medium" | "hard");

      //for debug
      const currentInputs = {
        len: useLocationStore.getState().length,
        start: useLocationStore.getState().startAddress,
        end: useLocationStore.getState().endAddress,
        difficulty: useLocationStore.getState().difficulty,
      };

      setMessages((prev) => [...prev, { text: `${JSON.stringify(currentInputs)}`, sender: "bot", timestamp }]);
    } else {
      // User just wants to chat
      const reply = await askAi("answer shortly:", inp);
      setMessages((prev) => [...prev, { text: reply, sender: "bot", timestamp }]);
    }
  };

  const generateRoute = async () => {
    const s = useLocationStore.getState().startAddress; // || users current location
    const e = useLocationStore.getState().endAddress; // || users current location
    const l = useLocationStore.getState().length || 5;
    const d = useLocationStore.getState().difficulty || "easy";
    let startCoords = null;
    let endCoords = null;

    if (s) {
      startCoords = await getLatLngFromAddress(s);
      setStartPointInput(startCoords);
    }
    if (e) {
      endCoords = await getLatLngFromAddress(e);
      if (endCoords !== startCoords) setEndPointInput(endCoords); // this is supposed to help with creating a circular route
    }
    setLengthInput(l);
    setDifficultyInput(d as "easy" | "medium" | "hard");
    router.push("/(root)/showRoute");
  };

  return (
    <SafeAreaView className="flex-1 p-4">
      <View className="justify-center items-center">
        {/*a button that triggers a function called generateRoute() */}
        {isPlanningRoute && <Button title="Generate Route" onPress={generateRoute} />}

        <Text className="text-2xl font-JakartaBold mt-5">Chatting With Hadas AI</Text>
        <View className="border-t border-gray-300 w-full my-4" />
      </View>
      <FlatList
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
        <HadasTextInput icon={icons.to} containerStyle="bg-white shadow-md shadow-neutral-300" placeholder="Message" handleString={handleSendMessage} />
      </View>
    </SafeAreaView>
  );
};

export default Chat;
