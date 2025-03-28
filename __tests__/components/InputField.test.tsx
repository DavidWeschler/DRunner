import { render, fireEvent } from "@testing-library/react-native";
import InputField from "@/components/InputField";
import { icons } from "@/constants";
import { TextInput, Keyboard } from "react-native";

describe("InputField Component", () => {
  it("renders correctly with label and icon", () => {
    const { getByText, getByTestId } = render(<InputField label="Username" icon={icons.search} placeholder="Enter username" testID="input-field" />);

    expect(getByText("Username")).toBeTruthy();
    expect(getByTestId("input-field")).toBeTruthy();
  });

  it("updates text when typing", () => {
    const { getByTestId } = render(<InputField label="dummy" placeholder="Enter text" testID="input-field" />);

    const input = getByTestId("input-field");
    fireEvent.changeText(input, "New Value");

    expect(input.props.value).toBe("New Value");
  });

  it("hides text when secureTextEntry is true", () => {
    const { getByTestId } = render(<InputField label="dummy" secureTextEntry={true} placeholder="Password" testID="input-field" />);

    const input = getByTestId("input-field");
    expect(input.props.secureTextEntry).toBe(true);
  });

  it("dismisses keyboard when tapping outside", () => {
    const dismissSpy = jest.spyOn(Keyboard, "dismiss");

    const { getByTestId } = render(<InputField label="dummy" placeholder="Tap outside" testID="input-field" />);
    fireEvent.press(getByTestId("input-field"));

    expect(dismissSpy).toHaveBeenCalled();
  });
});
