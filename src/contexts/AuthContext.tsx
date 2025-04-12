import React, { createContext, useState } from 'react';
import * as SecureStore from 'expo-secure-store';

interface AuthContext {
    user: null;
    signIn: (userCredentials: any) => Promise<void>;
    signOut: () => Promise<void>;
}

// Create a Context for Authentication
export const AuthContext = createContext<AuthContext | null>(null);

// Create an AuthProvider to wrap your app
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const signIn = async (userCredentials) => {
    // Store user credentials securely
    await SecureStore.setItemAsync('user', JSON.stringify(userCredentials));
    setUser(userCredentials);
  };

  const signOut = async () => {
    // Clear user data
    await SecureStore.deleteItemAsync('user');
    setUser(null);
  };

  const contextValue = {
    user,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}