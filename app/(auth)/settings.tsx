import { useState } from "react";
import { Alert, Button, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { useBudgetStore } from "../../store/budgetStore";

export default function SettingsScreen() {
  const { budget } = useBudgetStore();
  const [limit, setLimit] = useState(budget?.getLimit().toString() || "1000");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSaveLimit = () => {
    if (budget) {
      const parsedLimit = parseFloat(limit);
      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        Alert.alert("Error", "Please enter a valid budget limit greater than 0.");
        return;
      }
      budget.setLimit(parsedLimit);
      Alert.alert("Success", `Budget limit updated to $${parsedLimit.toFixed(2)}`);
    }
  };

  const toggleNotifications = () => {
    setNotificationsEnabled((prev) => !prev);
    Alert.alert(
      "Notifications",
      notificationsEnabled
        ? "Notifications have been disabled."
        : "Notifications have been enabled."
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      {/* Budget Limit */}
      <View style={styles.settingItem}>
        <Text style={styles.label}>Budget Limit</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={limit}
          onChangeText={setLimit}
        />
        <Button title="Save Limit" onPress={handleSaveLimit} />
      </View>

      {/* Notifications */}
      <View style={styles.settingItem}>
        <Text style={styles.label}>Enable Notifications</Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  settingItem: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    fontSize: 16,
    backgroundColor: "white",
  },
});