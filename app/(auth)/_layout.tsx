import { Stack } from "expo-router";

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="transactions"
        options={{
          title: "Transactions",
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="reports"
        options={{
          title: "Reports",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="(auth)/settings"
        options={{
          title: "Settings",
          headerShown: true,
        }}
      />
    </Stack>
  );
}