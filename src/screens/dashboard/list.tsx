import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../config/axiosConfig';
import { useSession } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CourseCard from '../../components/app/CourseCard';
import { MainTabsScreenProps } from '../../navigation/types';

const List = ({ route, navigation }: MainTabsScreenProps) => {
  const { user, session } = useSession();
  const colors = useThemeColors();
  const { currentTheme } = useTheme();
  const [courses, setCourses] = useState([]);
  const { list } = route.params || {};

  const fetchAllCourses = async () => {
    try {
      const response = await axiosInstance.get(`/api/all-courses/`, {
        headers: {
          Authorization: `Bearer ${session}`,
        },
      });

      setCourses(response.data);
    } catch (error) {
      console.log(error);
      console.error('Failed to fetch suggested courses:', error);
    }
  };

  useEffect(() => {
    setCourses([]);
    if (!list) {
      fetchAllCourses();
    } else {
      setCourses(list);
    }
  }, [list]);

  return (
    <ScrollView
      vertical
      className={`flex-1 ${
        currentTheme === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`}
    >
      {/* Header */}
      <View className="flex-row items-center p-4 border-b border-gray-200">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons
            name="arrow-back"
            size={20}
            color={colors.primary}
            style={{ marginRight: 20, paddingRight: 10 }}
          />
        </TouchableOpacity>
        <Text
          className={`text-xl font-semibold ml-3 flex flex-row items-center justify-center ${
            currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}
        >
          Course List
        </Text>
      </View>

      {/* Body */}
      <View className="flex flex-col mb-4 items-center justify-center mt-5">
        {courses.map((course, index) => (
          <CourseCard
            key={index}
            display_name={course.display_name}
            effort={course.effort}
            course_image_uri={course.course_image_uri}
            course_id={course.course_id}
            enrolled={course.enrolled == 1 ? 'Enrolled' : 'Not Enrolled'}
            gradient={
              [colors.card, colors.surface] as readonly [
                string,
                string,
                ...string[],
              ]
            }
            onPress={() =>
              navigation.navigate('CourseDetails', {
                course: course,
              })
            }
            className={` w-full h-auto`}
            style={{ width: '90%', marginBottom: 16 }}
            imageStyle={{ width: '100%', height: 200 }}
          />
        ))}
      </View>
    </ScrollView>
  );
};

export default List;
