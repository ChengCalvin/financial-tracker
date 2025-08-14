import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { SchedulableTriggerInputTypes } from "expo-notifications";

export async function requestNotificationPermissions() {
  if (!Device.isDevice) {
    console.log("Must use physical device for notifications");
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Failed to get push token for notifications!");
    return;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log("Notification token:", token);
  return token;
}

export async function scheduleBudgetAlert(budgetName: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Budget Alert",
      body: `You have exceeded your budget for ${budgetName}!`,
      sound: true,
    },
    trigger: { seconds: 5, type:  SchedulableTriggerInputTypes.CALENDAR}, // Trigger after 5 seconds (for testing)
  });
}