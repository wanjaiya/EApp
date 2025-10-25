import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import React, { useEffect, useState } from 'react';
import axiosInstance from "../../config/axiosConfig";
import { useSession } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useThemeColors } from "../../hooks/useThemeColors";
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import  FeatureCard  from "../../components/app/FeaturedCard";
import CourseCard from "../../components/app/CourseCard";
import {MainTabsScreenProps} from "../../navigation/types";

const Index = ({ navigation }: MainTabsScreenProps) => {
 const { user, session } = useSession();
  const colors = useThemeColors();
  const [stats, setStats] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [latest, setLatest] = useState([]);
  const { currentTheme } = useTheme();

  const fetchDashboardData = async () => {
      try {
        const response = await axiosInstance.get("/api/request-dashboard", {
          headers: {
            Authorization: `Bearer ${session}`,
          },
        });

        setStats(response.data);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

  const fetchSuggestedCourses = async () => {

    try {
        const response = await axiosInstance.get(`/api/suggested-courses/`, {
          headers: {
            Authorization: `Bearer ${session}`,
          },
        });

        setSuggested(response.data);

      } catch (error) {
        console.log(error);
        console.error("Failed to fetch suggested courses:", error);
      }
    };

    const fetchLatestCourses = async () => {

    try {
        const response = await axiosInstance.get(`/api/latest-courses/`, {
          headers: {
            Authorization: `Bearer ${session}`,
          },
        });

        setLatest(response.data);

      } catch (error) {
        console.log(error);
        console.error("Failed to fetch suggested courses:", error);
      }
    };


  useEffect(() => {
    fetchDashboardData();
   fetchSuggestedCourses();
   fetchLatestCourses();

  }, []);


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
       <ScrollView horizontal style={{ flex: 1, padding: 12, paddingLeft:0 }}>
        <View className="flex flex-row mb-4">
          {stats.map((card, index) => (
            <FeatureCard
              key={card.title}
              title={card.title}
              description={card.description}
              icon={card.icon as keyof typeof MaterialIcons.glyphMap}
              gradient={
                [colors.card, colors.surface] as readonly [
                  string,
                  string,
                  ...string[],
                ]
              }
              onPress={() => navigation.navigate(card.route as any)}
              className={index > 0 ? 'ml-4' : ''}
            />
          ))}
        </View>
        </ScrollView>

        <View className="flex flex-row">
          <Text className={`text-2xl font-bold mb-2 ${currentTheme === "dark" ? "text-white" : "text-gray-800"}`}>
            Suggested Courses
          </Text>
        </View>
        { !suggested || suggested.length !== 0 ? (
          <>
          <ScrollView horizontal style={{ flex: 1, padding: 12, paddingLeft:0 }}>
           <View className="flex flex-row mb-4">
              {suggested.map((course, index) => (
                <CourseCard
                  key={index}
                  display_name={course.display_name}
                  effort={course.effort}
                  course_image_uri={course.course_image_uri}
                  course_id={course.course_id}
                  enrolled= {course.enrolled == 1 ? 'Enrolled' : 'Not Enrolled'}
                  gradient={
                    [colors.card, colors.surface] as readonly [
                      string,
                      string,
                      ...string[],
                    ]
                  }
                  onPress={() => navigation.navigate('CourseDetails', { course: course})}
                  className={`flex-1 max-w-72 h-auto ${index > 0 ? 'ml-4' : ''}`}
                />
              ))}
               </View>
            </ScrollView>
          </>
          ) : (
            <View className="flex flex-row mt-5 items-center justify-center">
              <Text className={`text-2xl font-bold mb-2 ${currentTheme === "dark" ? "text-white" : "text-gray-800"}`}>
                 No Suggested courses
              </Text>
            </View>
          )}

          <View className="flex flex-row">
          <Text className={`text-2xl font-bold mb-2 ${currentTheme === "dark" ? "text-white" : "text-gray-800"}`}>
            Latest Courses
          </Text>
        </View>
        { !latest || latest.length !== 0 ? (
          <>
          <ScrollView horizontal style={{ flex: 1, padding: 12, paddingLeft:0 }}>
           <View className="flex flex-row mb-4">
              {latest.map((course, index) => (
                <CourseCard
                  key={index}
                  display_name={course.display_name}
                  effort={course.effort}
                  course_image_uri={course.course_image_uri}
                  course_id={course.course_id}
                  enrolled= {course.enrolled == 1 ? 'Enrolled' : 'Not Enrolled'}
                  gradient={
                    [colors.card, colors.surface] as readonly [
                      string,
                      string,
                      ...string[],
                    ]
                  }
                  onPress={() => navigation.navigate('CourseDetails', { course: course})}
                  className={`flex-1 max-w-72 h-auto ${index > 0 ? 'ml-4' : ''}`}
                />
              ))}
               </View>
            </ScrollView>
          </>
          ) : (
            <View className="flex flex-row mt-5 items-center justify-center">
              <Text className={`text-2xl font-bold mb-2 ${currentTheme === "dark" ? "text-white" : "text-gray-800"}`}>
                 No Latest courses
              </Text>
            </View>
          )}
      </View>
    </ScrollView>
  )
}

export default Index