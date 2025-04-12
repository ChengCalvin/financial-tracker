import { StyleSheet } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { HomeScreen } from './src/screens/Home';
// import { DashboardScreen } from './src/screens/Dashboard';
// import { SafeAreaView } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider, Icon } from 'react-native-paper';
// import { theme } from './src/styles/theme';
import { StrictMode, useContext, useEffect } from 'react';
import { ExpenseModel } from './src/features/expense/expense.model';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import { AuthContext, AuthProvider } from './src/contexts/AuthContext';
import SignInScreen from './src/screens/SignIn';
import SignUpScreen from './src/screens/Signup';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

declare global {
  interface Window {
    expenseModel: ExpenseModel;
  }
}

const AuthNavigator = () => {

  const authContext = useContext(AuthContext);

  if (!authContext) {
    throw new Error("AuthContext is not provided");
  }

  const { user } = authContext;

  return (
    // <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {
        user ? (
          <Stack.Screen name="Financial" component={FinancialNavigator} />
        ) : (
          <>
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        )
      }
    </Stack.Navigator>
    // </NavigationContainer>
  );
}

export const FinancialNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} options={{
        tabBarShowLabel: false,
        headerShown: false,
        tabBarIcon: () => <Icon source="currency-usd" size={25} />
      }} />
    </Tab.Navigator>
  )
}

export default function App() {
  return (
    <StrictMode>
      {/* <PaperProvider theme={theme}> */}
      <Provider store={store}>
        <AuthProvider>
          <NavigationContainer>
            <AuthNavigator />
          </NavigationContainer>
        </AuthProvider>
      </Provider>
      {/* </PaperProvider> */}
    </StrictMode>
  );
}
