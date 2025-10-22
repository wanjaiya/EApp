import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Welcome from "../screens/index";
import Signin from "../screens/auth/sign-in";
import CourseDetails from "../screens/courses/details";
import { RootStackParamList } from './types';
import { SessionProvider, useSession } from "../context/AuthContext";
import { ActivityIndicator, View } from 'react-native';
import MainTabs from "./MainTabs";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
      const { session, isLoading } = useSession();


if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
       {session && !isLoading ? (
        <>
         <Stack.Screen name="MainTabs" component={MainTabs} />
         <Stack.Screen name="CourseDetails" component={CourseDetails} />
         </>
      ) : (
       <>
         <Stack.Screen name="Welcome" component={Welcome} />
          <Stack.Screen name="Signin" component={Signin} />
        </>
      )}
    </Stack.Navigator>
  );
}