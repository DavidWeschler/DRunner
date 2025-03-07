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
  const [messages, setMessages] = useState<{ text: string; sender: "user" | "bot"; timestamp: string }[]>([{ text: generateStartingMessage(), sender: "bot", timestamp: new Date().toLocaleTimeString() }]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const [deepAnswered, setDeepAnswered] = useState(true);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow", () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide", () => setKeyboardVisible(false));

    if (inp) {
      // Clear the conversation and add new message
      setMessages(() => [{ text: generateStartingMessage(), sender: "bot", timestamp: new Date().toLocaleTimeString() }]);
      handleSend({ inp });
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
        model: "qwen/qwq-32b:free",
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
        max_tokens: 120,
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
  const askAiOLD = async (instructions: string, message: string) => {
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
        max_tokens: 120,
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

  const resolveIntent = async (userInput: string): Promise<Boolean | null> => {
    const apiUrl = "https://openrouter.ai/api/v1/chat/completions";
    const headers = {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    };

    const systemPrompt: ApiMessage = {
      role: "system",
      content: `Answer only with $ or %: answer $ if the sentence include features of the wanted running route (e.g lenght, starting point, ending point, difficulty level), answer with % otherwhise. Answer only with $ or % with nothing else. The sentence is: `,
    };

    const userMessage: ApiMessage = {
      role: "user",
      content: `${userInput}\n`,
    };
    let rawContent = "";

    try {
      let i = 2;
      rawContent = await askAi(systemPrompt.content, userMessage.content);
      while (!rawContent || !((rawContent.includes("$") && !rawContent.includes("%")) || (rawContent.includes("%") && !rawContent.includes("$")))) {
        rawContent = await askAi(systemPrompt.content, userMessage.content);
        if (i === 0) {
          return rawContent === "$";
        }
        i--;
      }
      return rawContent.includes("$");
    } catch (error) {
      return null;
    }
  };

  const generateRes = async (userInput: string) => {
    try {
      const response = await resolveIntent(userInput);
      let res = "";
      if (response === null) {
        throw new Error("No response from AI");
      } else if (response) {
        console.log("$$$$$$$$$$");
        await extractRouteDetails(userInput);
      } else {
        console.log("%%%%%%%%%%");
        res = (await adviceUsr(`Answer VERY shortly. mention you can help with planning a running route. The sentence is: `, `${userInput} .Reply with no more then 15 words!`)) + " ";
      }

      const currentInputs = {
        "running route length ": useLocationStore.getState().length,
        "running route start location ": useLocationStore.getState().startAddress,
        "running route end location ": useLocationStore.getState().endAddress,
        "running route difficulty level ": useLocationStore.getState().difficulty,
      };

      const nullKeys = Object.entries(currentInputs).filter(([key, value]) => value === null);

      let conclude = "";
      let finalAnswer = "";
      while (!conclude || conclude.includes("user") || conclude.includes("I need to")) {
        if (nullKeys.length !== 0) {
          if (res === "I didn't catch that. Try reprashing your message :)") {
            finalAnswer = res;
          } else {
            console.log("nullKeys");
            conclude = await adviceUsr(`Ask VERY shortly how you can help with deciding on the ${nullKeys[0]}. Reply with no more then 10 words!`, `My current running route features: ${JSON.stringify(currentInputs)}`);
            finalAnswer = res + conclude;
          }
        } else {
          console.log("conclude");
          conclude = await adviceUsr(
            `VERY shortly recap the running route features and ask if the he want to change something or click "Generate" to see the suggested routes. 
            The route features:
            ${JSON.stringify(currentInputs)}`,
            ""
          );
          finalAnswer = conclude;
        }
      }
      finalAnswer = finalAnswer.replace(/\*\*/g, "\n**").replace(/\*\*/g, "");

      const timestamp = new Date().toLocaleTimeString();
      setMessages((prev) => [...prev, { text: finalAnswer, sender: "bot", timestamp }]);
    } catch (error) {
      console.error("Error resolving intent:", error);
      const timestamp = new Date().toLocaleTimeString();
      setMessages((prev) => [...prev, { text: "I didn't catch that. Try reprashing your message :)", sender: "bot", timestamp }]);
    }
  };

  const adviceUsr = async (content: string, userInput: string) => {
    const apiUrl = "https://openrouter.ai/api/v1/chat/completions";
    const headers = {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    };

    const systemPrompt: ApiMessage = {
      role: "system",
      content: content,
    };

    const userMessage: ApiMessage = {
      role: "user",
      content: `${userInput}\n`,
    };

    try {
      let cleanedText = "";
      while (!cleanedText || cleanedText.includes("user") || cleanedText.includes("I need to")) {
        const reply = await askAi(systemPrompt.content, userMessage.content);
        cleanedText = reply
          .split(/<\/think>/) // Split by </think>
          .map((s: string) => s.replace(/\n/g, "")) // Remove all newline characters
          .filter((s: string) => s.trim() !== "") // Remove empty elements
          .pop();
      }
      return cleanedText;
    } catch (error) {
      return "I didn't catch that. Try rephrasing your message :)";
    }
  };

  const extractRouteDetails = async (userInput: string) => {
    const apiUrl = "https://openrouter.ai/api/v1/chat/completions";
    const headers = {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    };

    const currentInputs = {
      "running route length ": useLocationStore.getState().length,
      "running route start location ": useLocationStore.getState().startAddress,
      "running route end location ": useLocationStore.getState().endAddress,
      "running route difficulty level ": useLocationStore.getState().difficulty,
    };

    let systemPrompt: ApiMessage = {
      role: "system",
      content: `You are a JSON generator for running routes. Follow these rules STRICTLY:
    1. Respond ONLY with valid JSON using these keys: start, end, len, difficulty
    2. Use "unknown" for missing values
    3. Never include explanations, thoughts, or markdown
    4. Difficulty must be one of: easy, medium, hard. you may choose the closest one
    5. The The current route features:
    ${JSON.stringify(currentInputs)}
    
    Current request: `,
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
      const reply = JSON.parse(cleanedJson) as RouteDetails;

      // Validate structure
      if (!("start" in reply && "end" in reply && "len" in reply && "difficulty" in reply)) {
        throw new Error("Invalid JSON structure");
      }

      if (reply?.start && reply.start !== "unknown") setStartAddress(reply.start);
      if (reply?.end && reply.end !== "unknown") setEndAddress(reply.end);
      if (reply?.len && reply.len !== "unknown") setLengthInput(Number(reply.len));
      if (reply?.difficulty && ["easy", "medium", "hard"].includes(reply.difficulty)) setDifficultyInput(reply.difficulty as "easy" | "medium" | "hard");

      // const currentInputs = {
      //   "running route length: ": useLocationStore.getState().length,
      //   "running route start location: ": useLocationStore.getState().startAddress,
      //   "running route end location: ": useLocationStore.getState().endAddress,
      //   "running route difficulty level: ": useLocationStore.getState().difficulty,
      // };

      // systemPrompt = {
      //   role: "system",
      //   content: `State the current values as a comprehensive sentence of the running route input that we understood so far unless they are "unknown". DO NOT add anything else to your answer. DO NOT ask any questions.
      //   Current values:
      //   ${JSON.stringify(currentInputs)}`,
      // };

      // let cleanedText = "";
      // while (!cleanedText) {
      //   const reply = await askAi(systemPrompt.content, "");
      //   cleanedText = reply
      //     .split(/<\/think>/) // Split by </think>
      //     .map((s: string) => s.replace(/\n/g, "")) // Remove all newline characters
      //     .filter((s: string) => s.trim() !== "") // Remove empty elements
      //     .pop();
      // }
      // return cleanedText;
    } catch (error) {}
  };

  const handleSend = async ({ inp }: { inp: string }) => {
    if (!inp.trim() || !deepAnswered) {
      return;
    }
    const timestamp = new Date().toLocaleTimeString();

    //DEBUG
    const currentInputs = {
      "running route length ": useLocationStore.getState().length,
      "running route start location ": useLocationStore.getState().startAddress,
      "running route end location ": useLocationStore.getState().endAddress,
      "running route difficulty level ": useLocationStore.getState().difficulty,
    };
    console.log("OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO");
    console.log("Current inputs:", currentInputs);
    console.log("OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO");
    //END DEBUG

    try {
      // Add user message
      setMessages((prev) => [...prev, { text: inp, sender: "user", timestamp }]);
      setDeepAnswered(false);
      // Show thinking indicator
      setMessages((prev) => [...prev, { text: "Thinking...", sender: "bot", timestamp }]);

      await generateRes(inp);

      // Remove thinking indicator
      setMessages((prev) => prev.filter((msg) => msg.text !== "Thinking..."));
    } catch (error) {
      console.error("Error handling message:", error);
      setMessages((prev) => [...prev, { text: "Sorry, something went wrong. Please try again.", sender: "bot", timestamp }]);
    } finally {
      setDeepAnswered(true);
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
        {useLocationStore.getState().length && <Button title="Generate Route" onPress={generateRoute} />}

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
        <HadasTextInput
          icon={icons.to}
          containerStyle="bg-white shadow-md shadow-neutral-300"
          placeholder="Message"
          handleString={handleSend}
          editable={deepAnswered} // Disable input if deepAnswered is false
        />
      </View>
    </SafeAreaView>
  );
};

export default Chat;
