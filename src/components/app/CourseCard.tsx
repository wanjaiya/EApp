import { useTheme } from "../../context/ThemeContext";
import { useThemeColors } from "../../hooks/useThemeColors";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import GradientCard from "../core/GradientCard";


export interface CourseCardProps {
    course_id: string;
    display_name?: string;
    short_description?: string;
    effort?:string;
    course_image_uri?: string;
    onPress: () => void;
    gradient?: readonly [string, string, ...string[]];
    disabled?: boolean;
    className?: string;
    enrolled?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({
course_id,
display_name,
onPress,
gradient,
effort,
course_image_uri,
disabled = false,
className,
enrolled,
})=> {
    const colors = useThemeColors();
    const pieces = effort?.split(":");
    const {currentTheme} = useTheme();

    return(
         <GradientCard
         onPress={onPress}
         gradientColors={gradient || [colors.card, colors.surface] as readonly [string, string, ...string[]]}
         disabled= {disabled}
         style={{ width: '30%', marginBottom: 16}}
         className={className}
         >
         <View className="flex flex-row">
          <Image
            source={{ uri: course_image_uri }}
            style={{ width: 250, height:120 }}
            resizeMode="cover"
        />
         </View>
         <View style={{minHeight: 120}}>
             <View className="flex flex-row w-full p-3 pt-4">
               <Text className={`text-md font-bold  ${currentTheme === "dark" ? "text-white" : "text-gray-800"}`}> {display_name}</Text>
             </View>
             <View className="absolute bottom-4 left-4 right-4 flex-row justify-between">
                <View className="flex flex-row">
                   <MaterialIcons
                    name="access-time"
                    size={14}
                    color={colors.primary}
                    style={{paddingTop: 2, paddingRight: 3}}
                    />
                   <Text className={`${currentTheme === "dark" ? "text-white" : "text-gray-800"}`}>
                    {pieces[2]} Mins
                </Text>
                </View>
                 <Text className={`self-end ${currentTheme === "dark" ? "text-white" : "text-gray-800"}`}>
                  {enrolled}
                </Text>
            </View>
      </View>
        </GradientCard>
    );

}

const styles = StyleSheet.create({
  image: {
    alignSelf: "center",
    height: "%",
    width: "100%",
  },
});


export default CourseCard