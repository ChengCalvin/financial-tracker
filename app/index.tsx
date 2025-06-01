import { getAuth } from "@react-native-firebase/auth";
import { FirebaseError } from "firebase/app";
import { useState } from "react";
import { Button, KeyboardAvoidingView, StyleSheet, TextInput, View } from "react-native";
// import { auth } from "../firebase"; // Adjust the import path as necessary

export default function Index() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const signUp = async () => {
    setLoading(true);
    try {
      await getAuth().createUserWithEmailAndPassword(email, password);
    } catch (e: any) {
      const error = e as FirebaseError;
      setError("Registration Error:" + error.message);
    } finally {
      setLoading(false);
    }
  }

  const signIn = async () => {
    setLoading(true);
    try {
      await getAuth().signInWithEmailAndPassword(email, password);
    } catch (e: any) {
      const error = e as FirebaseError;
      setError("Sign in Error:" + error.message);
      alert(error.message);
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
          {/* {error ? <Text>{error}</Text> : null} */}
          <Button title="Sign Up" onPress={signUp} disabled={loading} />
          <Button title="Sign In" onPress={signIn} disabled={loading} />

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