import Chat from "@/app/(root)/(tabs)/chat";
import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";

jest.mock("moti", () => ({
  MotiView: jest.fn(({ children }) => <>{children}</>),
}));

describe("Chat component", () => {
  // test("renders the header correctly", () => {
  //   const { getByText } = render(
  //     <NavigationContainer>
  //       <Chat />
  //     </NavigationContainer>
  //   );
  //   expect(getByText("Hadas AI 🤖")).toBeTruthy();
  // });
  // it("shows generate button after first message", async () => {
  //   const { getByPlaceholderText, findByText } = render(<Chat />);
  //   const input = getByPlaceholderText("Message");
  //   fireEvent.changeText(input, "Test message");
  //   fireEvent(input, "submitEditing");
  //   expect(await findByText("Generate")).toBeTruthy(); // Waits for UI update
  // });
});
