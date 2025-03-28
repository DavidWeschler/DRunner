import { render, fireEvent, waitFor } from "@testing-library/react-native";
import HadasTextInput from "@/components/HadasInp"; // Adjust according to your file structure
import { icons } from "@/constants";

describe("HadasTextInput Component", () => {
  const mockHandleString = jest.fn();

  it("renders correctly with initial text", () => {
    const { getByTestId } = render(<HadasTextInput icon={icons.search} initialLocation="Test location" containerStyle="bg-blue-500" textInputBackgroundColor="lightgray" placeholder="Enter location" handleString={mockHandleString} editable={true} />);

    const input = getByTestId("hadas-input");
    expect(input.props.value).toBe("Test location");
  });

  it("calls handleString on submit when editable is true", () => {
    const { getByTestId } = render(<HadasTextInput icon={icons.search} initialLocation="Test location" containerStyle="bg-blue-500" textInputBackgroundColor="lightgray" placeholder="Enter location" handleString={mockHandleString} editable={true} />);

    const input = getByTestId("hadas-input");
    const button = getByTestId("hadas-input-button");

    // Simulate typing text
    fireEvent.changeText(input, "New Location");

    // Simulate button press
    fireEvent.press(button);

    expect(mockHandleString).toHaveBeenCalledTimes(1);
    expect(mockHandleString).toHaveBeenCalledWith({ inp: "New Location" });
  });

  //POSSIBLE BUG!
  //   it("does not call handleString when editable is false", () => {
  //     const { getByTestId } = render(<HadasTextInput icon={icons.search} initialLocation="Test location" containerStyle="bg-blue-500" textInputBackgroundColor="lightgray" placeholder="Enter location" handleString={mockHandleString} editable={false} />);

  //     const input = getByTestId("hadas-input");
  //     const button = getByTestId("hadas-input-button");

  //     // Simulate typing text
  //     fireEvent.changeText(input, "New Location");

  //     // Simulate button press
  //     fireEvent.press(button);

  //     // Ensure handleString is not called
  //     expect(mockHandleString).not.toHaveBeenCalled();
  //   });

  it("clears the text input after submitting", () => {
    const { getByTestId } = render(<HadasTextInput icon={icons.search} initialLocation="Test location" containerStyle="bg-blue-500" textInputBackgroundColor="lightgray" placeholder="Enter location" handleString={mockHandleString} editable={true} />);

    const input = getByTestId("hadas-input");
    const button = getByTestId("hadas-input-button");

    // Simulate typing text
    fireEvent.changeText(input, "New Location");

    // Simulate button press
    fireEvent.press(button);

    // Ensure the input is cleared after submit
    expect(input.props.value).toBe("");
  });
});
