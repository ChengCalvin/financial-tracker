import { firebaseConfig } from "@/firebase";
import { initializeApp } from "@react-native-firebase/app";
import { FirebaseAuthTypes, getAuth, onAuthStateChanged } from "@react-native-firebase/auth";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
// import { firebaseConfig } from "../firebase"; // Adjust the import path as necessary

initializeApp(firebaseConfig, "Hierarchy");
export default function RootLayout() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);

  const handleAuthStateChanged = (user: any) => {
    setUser(user);
    if (initializing) {
      setInitializing(false);

    }
  };

  useEffect(() => {
    // const subscriber = auth.onAuthStateChanged(onAuthStateChanged)
    const subscriber = onAuthStateChanged(getAuth(), handleAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    // User is not signed in, redirect to sign-in screen
    // return <Stack screenOptions={{ headerShown: false }} initialRouteName="signIn" />;
  }
  return <Stack />;
}
