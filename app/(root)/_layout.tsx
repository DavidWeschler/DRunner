/* istanbul ignore file */
/**
 * @file _layout.tsx
 * @description This file is the root layout for the app. It contains the stack navigator for the app.
 */
import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="choose-run" options={{ headerShown: false }} />
      <Stack.Screen name="run-a-route" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;
