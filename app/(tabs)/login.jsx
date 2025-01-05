import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Button } from "react-native-paper";
import * as Google from "expo-auth-session/providers/google";
import { useRouter } from "expo-router";
import { LoginManager, AccessToken } from "react-native-fbsdk-next";

const LoginPage = () => {
  const router = useRouter();

  // Google Login
  const [request, response, promptAsync] = Google.useAuthRequest({
    expoClientId: "YOUR_GOOGLE_EXPO_CLIENT_ID", // Replace with your Google Expo Client ID
    iosClientId: "YOUR_GOOGLE_IOS_CLIENT_ID",
    androidClientId: "YOUR_GOOGLE_ANDROID_CLIENT_ID",
    webClientId: "YOUR_GOOGLE_WEB_CLIENT_ID",
  });

  React.useEffect(() => {
    if (response?.type === "success") {
      const { authentication } = response;
      console.log("Google Login Successful", authentication);
      router.push("/"); // Navigate to home or other pages after successful login
    }
  }, [response]);

  // Facebook Login
  const handleFacebookLogin = async () => {
    try {
      const result = await LoginManager.logInWithPermissions(["public_profile", "email"]);
      if (!result.isCancelled) {
        const data = await AccessToken.getCurrentAccessToken();
        console.log("Facebook Login Successful", data);
        router.push("/"); // Navigate to home or other pages after successful login
      }
    } catch (error) {
      console.error("Facebook Login Error", error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login Page</Text>

      {/* Google Login Button */}
      <Button mode="contained" onPress={() => promptAsync()} style={[styles.button, { backgroundColor: "#DB4437" }]} disabled={!request}>
        Login with Google
      </Button>

      {/* Facebook Login Button */}
      <Button mode="contained" onPress={handleFacebookLogin} style={[styles.button, { backgroundColor: "#4267B2" }]}>
        Login with Facebook
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#333333",
    padding: 20,
  },
  title: {
    color: "white",
    fontSize: 24,
    marginBottom: 20,
  },
  button: {
    width: "100%",
    marginBottom: 15,
    paddingVertical: 10,
    borderRadius: 5,
  },
});

export default LoginPage;
