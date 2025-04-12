import React, { useState, useContext } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { TextInput as PaperInput } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

const SignInScreen = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const authContext = useContext(AuthContext);
    if (!authContext) {
        throw new Error('AuthContext is null. Ensure it is properly initialized.');
    }
    const { signIn } = authContext;
    const navigation = useNavigation();

    const handleSignIn = async () => {
        // Dummy sign-in logic (replace with real auth logic)
        if (email && password) {
            await signIn({ email, password });
            // navigation.navigate('Financial', { screen: 'Home' });
        } else {
            alert('Please enter valid credentials');
        }
    };

    return (
        <SafeAreaProvider>
            <SafeAreaView style={{flex: 1}} edges={['top', 'bottom']}>
                <View style={{ padding: 20 }}>
                    <PaperInput
                        label="Email"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        style={{ marginBottom: 10 }}
                    />
                    <PaperInput
                        label="Password"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        style={{ marginBottom: 20 }}
                    />
                    <Button title="Sign In" onPress={handleSignIn} />
                    <Text onPress={() => navigation.navigate('SignUp')} style={{ marginTop: 10 }}>
                        Don't have an account? Sign Up
                    </Text>
                </View>
            </SafeAreaView>
        </SafeAreaProvider>
    );
};

export default SignInScreen;
