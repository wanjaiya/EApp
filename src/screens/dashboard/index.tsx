import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from 'react';
import axiosInstance from "../../config/axiosConfig";
import { useSession } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useThemeColors } from "../../hooks/useThemeColors";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const index = () => {
 const { user, session } = useSession();
  const colors = useThemeColors();
  const [stats, setStats] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const { currentTheme } = useTheme();



  return (
     <ScrollView className={`flex-1 ${currentTheme === "dark" ? "bg-gray-900" : "bg-white"}`}>
      <View className="p-4">
        <View className="flex flex-row justify-between items-center mb-6">
          <Text className={`text-2xl font-bold ${currentTheme === "dark" ? "text-white" : "text-gray-800"}`}>
            Welcome, {user?.name}!
          </Text>
        
        </View>

        <View className="flex flex-row">
          <Text className={`text-xl font-bold ${currentTheme === "dark" ? "text-white" : "text-gray-800"}`}>
            Dashboard Stats
          </Text>
        </View>
      

         
       
      </View>
    </ScrollView>
  )
}

export default index