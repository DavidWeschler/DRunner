/* istanbul ignore file */
/**
 * @file _layout.tsx
 * @description This file defines the layout for the authentication screens in the app.
 * It uses the Expo Router to create a stack navigator for the authentication screens.
 */
import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="wellcome" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;
