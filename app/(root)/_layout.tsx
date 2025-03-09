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
