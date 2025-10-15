import type { NativeStackScreenProps } from '@react-navigation/native-stack';

// Define all routes and their params here
export type RootStackParamList = {
  Welcome: undefined;
  Signin: undefined;
  MainTabs: undefined;
};

// Type helpers to use in each screen
export type WelcomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Welcome'>;
export type SigninScreenProps = NativeStackScreenProps<RootStackParamList, 'Signin'>;
export type MainTabsScreenProps = NativeStackScreenProps<RootStackParamList, 'MainTabs'>;