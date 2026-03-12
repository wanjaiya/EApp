import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
  useColorScheme
} from 'react-native';
import React, { useEffect, useState } from 'react';
import axiosInstance from '../../config/axiosConfig';
import { useSession } from '../../context/AuthContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import CourseCard from '../../components/app/CourseCard';
import { MainTabsScreenProps } from '../../navigation/types';

const Completed = ({ navigation }: MainTabsScreenProps) => {
  const { user, session, signOut } = useSession();
  const colors = useThemeColors();
  const [courses, setCourses] = useState([]);
  const  currentTheme  = useColorScheme();
  const [pageLoading, setPageLoading] = useState(false);

  const fetchCompletedCourses = async () => {
    setCourses([]);
    try {
      setPageLoading(true);
      const response = await axiosInstance.get(`/api/completed/`, {
        headers: {
          Authorization: `Bearer ${session}`,
        },
      });

      if (response.status === 201) {
        if (response.data.expired === true) {
          Alert.alert(
            'Login',
            response.data.error,
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Login',
                style: 'destructive',
                onPress: () => signOut(),
              },
            ],
            { cancelable: true },
          );
        } else {
          Alert.alert(
            'Error',
            response.data.error,
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
            ],
            { cancelable: true },
          );
        }
      } else {
        setCourses(response.data);
      }
    } catch (error) {
     
      console.log(error);
      console.error('Failed to fetch suggested courses:', error);
    } finally {
      setPageLoading(false);
    }
  };
  useEffect(() => {
    fetchCompletedCourses();
  }, []);
  return (
    <ScrollView
      vertical
      className={`flex-1  ${
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
          Course completion
        </Text>
      </View>

      {/* Body */}
      {pageLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <View className="flex flex-col mb-4 items-center justify-center mt-5 px-2">
          {!courses || courses.length !== 0 ? (
            <>
              {courses.map((course, index) => (
                <CourseCard
                  key={index}
                  display_name={course.display_name}
                  effort={course.effort}
                  course_image_uri={course.course_image_uri}
                  course_id={course.course_id}
                  enrolled={course.completion_status}
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
                  style={{ width: '90%', marginBottom: 25 }}
                  imageStyle={{ width: '100%', height: 120 }}
                />
              ))}
            </>
          ) : (
            <View className="flex flex-row mt-5 items-center justify-center">
              <Text
                className={`text-2xl font-bold mb-2 ${
                  currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}
              >
                No completed courses
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default Completed;
