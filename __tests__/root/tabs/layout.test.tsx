import React from "react";
import { render, act } from "@testing-library/react-native";
import { Keyboard, Platform, Image } from "react-native";
import Layout from "@/app/(root)/(tabs)/_layout";
import { icons } from "@/constants";

// --- Mocks --- //

// Mock expo-router Tabs
jest.mock("expo-router", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Tabs = (props: any) => (
    <View testID="tabs" {...props}>
      {props.children}
    </View>
  );
  Tabs.Screen = (props: any) => (
    <View testID={`screen-${props.name}`} {...props}>
      {props.children}
    </View>
  );
  return { Tabs };
});

// Keyboard event mocks
let keyboardShowCallback: Function;
let keyboardHideCallback: Function;

const keyboardShowEvent = Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
const keyboardHideEvent = Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

jest.spyOn(Keyboard, "addListener").mockImplementation((event, callback) => {
  if (event === keyboardShowEvent) keyboardShowCallback = callback;
  if (event === keyboardHideEvent) keyboardHideCallback = callback;
  return { remove: jest.fn() };
});

// --- Tests --- //

describe("Layout Component", () => {
  it("renders Tabs with correct initial style (keyboard hidden)", () => {
    const { getByTestId } = render(<Layout />);
    const tabs = getByTestId("tabs");
    expect(tabs.props.screenOptions).toBeDefined();
    expect(tabs.props.screenOptions.tabBarStyle.display).toBe("flex");
  });

  it("hides the tab bar when keyboard appears", () => {
    const { getByTestId } = render(<Layout />);
    act(() => keyboardShowCallback());
    const tabs = getByTestId("tabs");
    expect(tabs.props.screenOptions.tabBarStyle.display).toBe("none");
  });

  it("shows the tab bar when keyboard disappears", () => {
    const { getByTestId } = render(<Layout />);
    act(() => {
      keyboardShowCallback();
      keyboardHideCallback();
    });
    const tabs = getByTestId("tabs");
    expect(tabs.props.screenOptions.tabBarStyle.display).toBe("flex");
  });
});

// describe("TabIcon Component", () => {
//   it("renders with correct icon when focused", () => {
//     const { getByTestId } = render(<Layout />);
//     const icon = getByTestId("screen-home").findByType(Image);
//     expect(icon.props.source).toEqual(icons.home);
//   });

//   it("renders with correct icon when not focused", () => {
//     const { getByTestId } = render(<Layout />);
//     const icon = getByTestId("screen-runs").findByType(Image);
//     expect(icon.props.source).toEqual(icons.list);
//   });
// });
