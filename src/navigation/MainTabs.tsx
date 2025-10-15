import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { useSession } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useThemeColors } from "../hooks/useThemeColors";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ActivityIndicator, Text, View } from "react-native";
import Dashboard from "../screens/dashboard/index";
import Settings from "../screens/dashboard/settings";
import InProgress from "../screens/dashboard/inProgress";
import Completed from "../screens/dashboard/completed";
import List from "../screens/dashboard/list";
import { MainTabsScreenProps } from "./types";


const Tab = createBottomTabNavigator();

export default function MainTabs({navigation} : MainTabsScreenProps) {
    const {session, isLoading} = useSession();
    const colors  = useThemeColors();
    const { currentTheme } = useTheme();

    if(isLoading){
        return (
            <View className="flex-1 justify-center items-center bg-white dark:bg-gray-900">
                <ActivityIndicator size="large" color={colors.primary} />
                 <Text className="mt-2 text-gray-800 dark:text-white">Loading</Text>
            </View>
        )
    }

    if(!session){
      navigation.replace("Signin");
    }

    return (
    <Tab.Navigator screenOptions={{ headerShown: false, tabBarActiveTintColor: '#e6c619',
        tabBarStyle: {height: 70, backgroundColor: currentTheme === "dark" ? "#111827" : "#ffffff"},
       }}>
      <Tab.Screen name="Dashboard" component={Dashboard} options={{ title: 'Home', tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home-sharp' : 'home-outline'} color={color} size={24} />
          ), }}  />
         <Tab.Screen name="inProgress" component={InProgress} options={{ title: 'In Progress', tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'bookmark-sharp' : 'bookmark-outline'} color={color} size={24} />
          ), }} />

         <Tab.Screen name="Completed" component={Completed} options={{ title: 'Completed', tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'checkmark-circle-sharp' : 'checkmark-circle-outline'} color={color} size={24} />
          ), }}/>

           <Tab.Screen name="list" component={List} options={{ title: 'All Courses', tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'search-sharp' : 'search-outline'} color={color} size={24} />
          ), }} />

      <Tab.Screen name="Settings" component={Settings} options={{ title: 'Settings', tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'settings-sharp' : 'settings-outline'} color={color} size={24} />
          ), }} />
    </Tab.Navigator>
  );

}