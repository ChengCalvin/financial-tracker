import auth from "@react-native-firebase/auth";
import React, { useState } from "react";
import { ActivityIndicator, Button, KeyboardAvoidingView, StyleSheet, Text, TextInput, View } from "react-native";

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    setLoading(true);
    try {
      const res = await auth().createUserWithEmailAndPassword(email, password);
      console.log(res);
    } catch (e: any) {
      setError("Registration Error: " + e.message);
    } finally {
      setLoading(false);
    }
  }

  const signIn = async () => {
    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (e: any) {
      setError("Sign in Error: " + e.message);
      alert(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <KeyboardAvoidingView behavior="padding">
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={(text) => setEmail(text)}
          style={styles.input}
        />
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry
          style={styles.input}
        />
        {error ? <Text>{error}</Text> : null}
        {
          loading ? <ActivityIndicator size="small" style={{margin: 28}} /> :
            <React.Fragment>
              <Button title="Sign Up" onPress={signUp} disabled={loading} />
              <Button title="Sign In" onPress={signIn} disabled={loading} />
            </React.Fragment>
        }
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    marginHorizontal: 20,
  },
  input: {
    height: 50,
    marginVertical: 4,
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
  },
});