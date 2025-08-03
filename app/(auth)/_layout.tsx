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
    </Stack>
  );
}