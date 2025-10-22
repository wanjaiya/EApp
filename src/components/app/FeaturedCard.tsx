import { useTheme } from "../../context/ThemeContext";
import { useThemeColors } from "../../hooks/useThemeColors";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import React from "react";
import { Text, View } from "react-native";
import GradientCard from "../core/GradientCard";

export interface FeatureCardProps{
    title?: string,
    description?: string
    icon: keyof typeof MaterialIcons.glyphMap;
    onPress: () => void;
    gradient?: readonly [string, string, ...string[]];
    disabled?: boolean;
    className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
title,
description,
icon,
onPress,
gradient,
disabled = false,
className
})=> {
    const colors = useThemeColors();
    const { currentTheme } = useTheme();
    return(
         <GradientCard
         onPress={onPress}
         gradientColors={gradient || [colors.card, colors.surface] as readonly [string, string, ...string[]]}
         disabled={disabled}
         style={{ width: '30%', marginBottom: 16 }}
         className={className}
         >
            <View className={`flex flex-col p-6`}>
            <View className="items-center mb-4">
              <MaterialIcons
               name={icon}
               size={24}
               color={colors.primary}
              />
            </View>
            <View className="items-center">
                <Text className= {`text-lg font-semibold text-center mb-2 ${currentTheme === "dark" ? "text-white" : "text-gray-800"}`}>{title}</Text>
                <Text className= {`text-center text-sm ${currentTheme === "dark" ? "text-gray-300" : "text-gray-600"}`}>{description}</Text>
            </View>
            </View>

         </GradientCard>
    )


};


export default FeatureCard;