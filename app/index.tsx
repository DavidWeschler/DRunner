/**
 * @expo/next-adapter
 * This is the entry point for the app. It is used to set up the app and configure the router.
 * It is also used to set up the app's navigation and authentication.
 */
import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";

const Page = () => {
  const { isSignedIn } = useAuth();

  if (isSignedIn) return <Redirect href="./(root)/(tabs)/home" />;

  return <Redirect href="./(auth)/wellcome" />;
};

export default Page;
