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
            role: "user",
            content: `${instructions} ${message}`,
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
    return messageContent;
  };

  const getBotReply = async (message: string) => {
    console.log("You:", message);

    if (msgCounter === 0) {
      setMsgCounter(1);
      return `${generateStartingMessage()}\n\nWhould you like me to help you plan a route or are you here just for a chat?`;
    }

    if (msgCounter === 1) {
      setMsgCounter(2);
      const instructions = "deepseek, reply using 'answer_0' or 'answer_1' only and nothing else. from the following sentenence, reply 'answer_1' if it implies that whoever wrote it wants help with planning a route, and reply with 'answer_0' otherwhise. put the reply in choices[0].message.content with nothing else there. the sentence is:";
      const userWantsToPlanRoute = await askAi(instructions, message);
      if (userWantsToPlanRoute.includes("answer_1")) {
        setIsPlanningRoute(true);
        return "Great! Let's start planning your route. What's the starting point?";
      } else {
        return "Alright! I'm here to chat. What's on your mind?";
      }
    }

    if (isPlanningRoute) {
      const instructionsAddress = "reply with the address of the starting point in the form of: address_<here>. put the reply with nothing else there. do this only if theres an address in the users message. The message is:";
      const instructionsLength = "reply with the length of the route in kilometers in the form of: length_<length in number here>. put the reply with nothing else there. do this only if theres a length in the users message The message is:";
      const instructionsDifficulty = "reply with the difficulty level of the route in the form of: difficulty_<easy | medium | hard>. put the reply with nothing else there. decide if the user wants easy, medium or hard accourding to what's closest to what they want. do this only if theres a difficulty level in the users message The message is:";

      if (!start) {
        const userStart = await askAi(instructionsAddress, message);
        const address = userStart.includes("address_") ? userStart.split("address_")[1] : null;
        setStart(address);
        return address ? "Got it! What's the ending point?" : "Sorry, I didn't get that. Can you please provide the starting point again?";
      }

      if (!end) {
        const userEnd = await askAi(instructionsAddress, message);
        const address = userEnd.includes("address_") ? userEnd.split("address_")[1] : null;
        setEnd(message);
        return "Nice! What's the length of the route?";
      }

      if (!len) {
        const userLen = await askAi(instructionsLength, message);
        const length = userLen.includes("length_") ? userLen.split("length_")[1] : null;
        setLen(Number(length));
        return length ? "Awesome! What's the difficulty level of the route?" : "Sorry, I didn't get that. Can you please provide the length of the route again?";
      }

      if (!difficulty) {
        const diffLevels = ["easy", "medium", "hard"];
        const userDiffic = await askAi(instructionsDifficulty, message);
        const diffic = userDiffic.includes("difficulty_") ? userDiffic.split("difficulty_")[1] : null;
        if (!diffLevels.includes(diffic)) {
          return "Sorry, I didn't get that. Can you please provide the difficulty level of the route again?";
        }
        setDifficulty(diffic.toLowerCase());
        setIsPlanningRoute(false);

        return `Alright! I'll plan a ${len} km ${diffic} route starting at ${start} and ending at ${end}.\n\nEnjoy your run!`;
      }
    }

    return askAi("answer shortly:", message);
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

  interface ApiResponse {
    choices: Array<{
      message: {
        content: string;
      };
    }>;
  }

  const extractRouteDetails = async (userInput: string): Promise<RouteDetails | null> => {
    const apiUrl = "https://openrouter.ai/api/v1/chat/completions";
    const headers = {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "YOUR_DOMAIN",
      "X-Title": "Your App Name",
    };

    const systemPrompt: ApiMessage = {
      role: "system",
      content: `You are a JSON generator for running routes. Follow these rules STRICTLY:
    1. Respond ONLY with valid JSON using these keys: start, end, len, difficulty
    2. Use "unknown" for missing values
    3. Never include explanations, thoughts, or markdown
    4. Format example:
    ${JSON.stringify({ start: "unknown", end: "unknown", len: "5", difficulty: "unknown" })}
    
    Current request:`,
    };

    const userMessage: ApiMessage = {
      role: "user",
      content: `${userInput}\n\nONLY RESPOND WITH JSON. NO ADDITIONAL TEXT.`,
    };

    let rawContent = "";

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers,
        body: JSON.stringify({
          model: "deepseek/deepseek-r1-distill-llama-70b:free",
          messages: [systemPrompt, userMessage],
          temperature: 0.3, // Reduce creativity for better compliance
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data: ApiResponse = await response.json();
      rawContent = data.choices[0]?.message?.content;

      // log data
      console.log("Full response:", JSON.stringify(data, null, 2));

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

    // get length, startAddress, endAddress, difficulty from useLocationStore

    const algoInputs = {
      len: useLocationStore.getState().length,
      start: useLocationStore.getState().startAddress,
      end: useLocationStore.getState().endAddress,
      difficulty: useLocationStore.getState().difficulty,
    };

    console.log("Algo Inputs:", algoInputs);

    // Add user message
    setMessages((prev) => [...prev, { text: inp, sender: "user", timestamp }]);

    // Simulate bot reply
    // const reply = await getBotReply(inp);
    const reply = await extractRouteDetails(inp);

    console.log("Reply:", reply);

    if (reply?.start && reply.start !== "unknown") setStartAddress(reply.start);
    if (reply?.end && reply.end !== "unknown") setEndAddress(reply.end);
    if (reply?.len && reply.len !== "unknown") setLengthInput(Number(reply.len));
    if (reply?.difficulty && ["easy", "medium", "hard"].includes(reply.difficulty)) setDifficultyInput(reply.difficulty as "easy" | "medium" | "hard");
    setMessages((prev) => [...prev, { text: `${JSON.stringify(algoInputs)}`, sender: "bot", timestamp }]);

    // if all inputs are ready, call the algorithm
    if (algoInputs.len && algoInputs.start && algoInputs.end && algoInputs.difficulty) {
      //turn start and end to coordinates
      console.log("generating route now that i have all that i need");
      const startCoords = await getLatLngFromAddress(algoInputs.start);
      const endCoords = await getLatLngFromAddress(algoInputs.end);
      setStartPointInput(startCoords);
      setEndPointInput(endCoords);
    }
  };

  const generateRoute = async () => {
    const everyThingIsOk = true;

    if (everyThingIsOk) {
      router.push("/(root)/showRoute");
    }
  };

  return (
    <SafeAreaView className="flex-1 p-4">
      <View className="justify-center items-center">
        {/*a button that triggers a function called generateRoute() */}
        <Button title="Generate Route" onPress={generateRoute} />

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
