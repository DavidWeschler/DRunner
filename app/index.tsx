import { useAuth } from "@clerk/clerk-expo";
import { Redirect } from "expo-router";

const Page = () => {
  const { isSignedIn } = useAuth();
  const fuckSignUp = process.env?.FUCK_SIGN_UP || false;

  if (isSignedIn || fuckSignUp) return <Redirect href="./(root)/(tabs)/home" />;

  return <Redirect href="./(auth)/wellcome" />;
};

export default Page;
