// import React from "react";
// import { render, fireEvent, waitFor } from "@testing-library/react-native";
// import Chat from "@/app/(root)/(tabs)/chat";
// import { router } from "expo-router";
// import * as Location from "expo-location";
// import { useLocationStore, useaiModelStore, useHadasStore } from "@/store";

// // Mock expo-router
// jest.mock("expo-router", () => ({
//   router: { push: jest.fn() },
// }));

// // Mock expo-location functions
// jest.mock("expo-location", () => ({
//   requestForegroundPermissionsAsync: jest.fn(),
//   getCurrentPositionAsync: jest.fn(),
//   reverseGeocodeAsync: jest.fn(),
//   geocodeAsync: jest.fn(),
// }));

// // Mock Zustand stores
// jest.mock("@/store", () => ({
//   useLocationStore: jest.fn(),
//   useaiModelStore: jest.fn(),
//   useHadasStore: jest.fn(),
// }));

// // Mock HadasTextInput so we can simulate sending a message.
// jest.mock("@/components/HadasInp", () => (props: any) => {
//   const { TouchableOpacity } = require("react-native");
//   return (
//     <TouchableOpacity testID="hadas-input" onPress={() => props.handleString("Test message")}>
//       HadasTextInput
//     </TouchableOpacity>
//   );
// });

// // Mock CustomButton as a simple button
// jest.mock("@/components/CustomButton", () => (props: any) => {
//   const { TouchableOpacity } = require("react-native");
//   return (
//     <TouchableOpacity testID="custom-button" onPress={props.onPress}>
//       {props.title}
//     </TouchableOpacity>
//   );
// });

// // Mock HadasHelp so we can check modal toggling
// jest.mock("@/components/HadasHelp", () => (props: any) => {
//   return props.visible ? (
//     <div data-testid="hadas-help">
//       About R&D Route Generator
//       <button onClick={props.onClose}>Close</button>
//     </div>
//   ) : null;
// });

// // Mock TypingDots
// jest.mock("@/components/AiThinking", () => () => <div data-testid="typing-dots">TypingDots</div>);

// describe("Chat Component", () => {
//   let setUserLocationMock: jest.Mock, setHadasInpMock: jest.Mock, setLengthInputMock: jest.Mock, setStartAddressMock: jest.Mock, setEndAddressMock: jest.Mock, setDifficultyInputMock: jest.Mock, setStartPointInputMock: jest.Mock, setEndPointInputMock: jest.Mock, setChatResetMock: jest.Mock;

//   beforeEach(() => {
//     jest.clearAllMocks();

//     setUserLocationMock = jest.fn();
//     setHadasInpMock = jest.fn();
//     setLengthInputMock = jest.fn();
//     setStartAddressMock = jest.fn();
//     setEndAddressMock = jest.fn();
//     setDifficultyInputMock = jest.fn();
//     setStartPointInputMock = jest.fn();
//     setEndPointInputMock = jest.fn();
//     setChatResetMock = jest.fn();

//     // Provide default implementations for the Zustand stores
//     (useLocationStore as unknown as jest.Mock).mockReturnValue({
//       inp: "",
//       setUserLocation: setUserLocationMock,
//       setHadasInp: setHadasInpMock,
//       setLengthInput: setLengthInputMock,
//       setStartAddress: setStartAddressMock,
//       setEndAddress: setEndAddressMock,
//       setDifficultyInput: setDifficultyInputMock,
//       setStartPointInput: setStartPointInputMock,
//       setEndPointInput: setEndPointInputMock,
//       getState: jest.fn().mockReturnValue({
//         length: 10,
//         startAddress: "",
//         endAddress: "",
//         difficulty: "easy",
//       }),
//     });

//     (useaiModelStore as unknown as jest.Mock).mockReturnValue({
//       model: { host: "google/gemma-3-4b-it:free" },
//     });

//     (useHadasStore as unknown as jest.Mock).mockReturnValue({
//       chatReset: false,
//       setChatReset: setChatResetMock,
//     });

//     // Mock expo-location responses
//     (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: "granted" });
//     (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
//       coords: { latitude: 1, longitude: 2 },
//     });
//     (Location.reverseGeocodeAsync as jest.Mock).mockResolvedValue([{ name: "Test Name", region: "Test Region", formattedAddress: "Test Address" }]);
//     (Location.geocodeAsync as jest.Mock).mockResolvedValue([{ latitude: 1, longitude: 2 }]);

//     // Mock fetch for the askAi API call in generateRes
//     global.fetch = jest.fn().mockResolvedValue({
//       ok: true,
//       json: async () => ({
//         choices: [
//           {
//             message: {
//               content: '{"startLocation": "Start Address", "endLocation": "End Address", "routeLength": "10", "difficultyLvl": "easy", "AIresponse": "Test AI response"}',
//             },
//           },
//         ],
//       }),
//     });
//   });

//   it("renders initial elements", async () => {
//     const { getByText, getByTestId } = render(<Chat />);
//     // Wait for the useEffect async tasks to finish (e.g. location permissions)
//     await waitFor(() => expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled());
//     expect(getByText("Hadas AI 🤖")).toBeTruthy();
//     expect(getByTestId("hadas-input")).toBeTruthy();
//   });

//   it("navigates back to home when back arrow is pressed", async () => {
//     const { getAllByRole } = render(<Chat />);
//     // The first TouchableOpacity (mocked as a button) is used as the back arrow.
//     const buttons = getAllByRole("button");
//     fireEvent.press(buttons[0]);
//     expect(router.push).toHaveBeenCalledWith("/home");
//   });

//   it("sends a message when HadasTextInput triggers handleString", async () => {
//     const { getByTestId, queryByText } = render(<Chat />);
//     // Simulate sending a message via the mocked HadasTextInput
//     fireEvent.press(getByTestId("hadas-input"));
//     // Wait for the asynchronous message handling to update the UI with the AI response
//     await waitFor(() => expect(queryByText("Test AI response")).toBeTruthy());
//   });

//   it("generates route when Generate button is pressed", async () => {
//     // To force the "Generate" button to render, the condition in Chat is based on store values.
//     (useLocationStore as unknown as jest.Mock).mockReturnValue({
//       inp: "",
//       setUserLocation: setUserLocationMock,
//       setHadasInp: setHadasInpMock,
//       setLengthInput: setLengthInputMock,
//       setStartAddress: setStartAddressMock,
//       setEndAddress: setEndAddressMock,
//       setDifficultyInput: setDifficultyInputMock,
//       setStartPointInput: setStartPointInputMock,
//       setEndPointInput: setEndPointInputMock,
//       getState: jest.fn().mockReturnValue({
//         length: 10,
//         startAddress: "",
//         endAddress: "",
//         difficulty: "easy",
//       }),
//     });
//     const { getByText } = render(<Chat />);
//     // Wait until the "Generate" button is rendered
//     await waitFor(() => getByText("Generate"));
//     const generateButton = getByText("Generate");
//     fireEvent.press(generateButton);
//     await waitFor(() => expect(router.push).toHaveBeenCalledWith("/(root)/choose-run"));
//   });

//   it("toggles the Help modal", async () => {
//     const { getByText, queryByTestId } = render(<Chat />);
//     // The "?" button (rendered via CustomButton) should be visible.
//     const helpButton = getByText("?");
//     // Initially, the modal should not be visible.
//     expect(queryByTestId("hadas-help")).toBeNull();
//     fireEvent.press(helpButton);
//     // After pressing, the modal should appear.
//     await waitFor(() => expect(queryByTestId("hadas-help")).toBeTruthy());
//     // Now close the modal.
//     const closeButton = getByText("Close");
//     fireEvent.press(closeButton);
//     await waitFor(() => expect(queryByTestId("hadas-help")).toBeNull());
//   });
// });
