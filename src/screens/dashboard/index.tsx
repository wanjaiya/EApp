import { ScrollView, Text, TouchableOpacity, View, Alert } from 'react-native';
import React, { useEffect, useState, useCallback } from 'react';
import axiosInstance from '../../config/axiosConfig';
import { useSession } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FeatureCard from '../../components/app/FeaturedCard';
import CourseCard from '../../components/app/CourseCard';
import { MainTabsScreenProps } from '../../navigation/types';
import Cookies from '@react-native-cookies/cookies';
import axios from 'axios';
import { LMS_BASE_URL, EDX_KEY, EDX_SECRET } from '../../config/env';
import { useFocusEffect } from '@react-navigation/native';

const Index = ({ navigation }: MainTabsScreenProps) => {
  const { user, session, position, signOut } = useSession();
  const colors = useThemeColors();
  const [stats, setStats] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [latest, setLatest] = useState([]);
  const { currentTheme } = useTheme();
  const [visibleCount, setVisibleCount] = useState(5);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  const name = user?.email;
  const pass = position;

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Step 1: Get CSRF cookie
      await axios.get(`${LMS_BASE_URL}/user_api/v1/account/login_session/`, {
        withCredentials: true,
      });

      const allCookies = await Cookies.get(LMS_BASE_URL);
      const csrftoken = allCookies?.csrftoken?.value;

      if (!csrftoken) {
        throw new Error('CSRF token not found');
      }

      // Step 2: Login (form-encoded)
      const formData = new URLSearchParams();
      formData.append('email', email);
      formData.append('password', password);
      formData.append('grant_type', 'password');
      formData.append('client_id', EDX_KEY);
      formData.append('client_secret', EDX_SECRET);

      await axios.post(
        `${LMS_BASE_URL}/user_api/v1/account/login_session/`,
        formData.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-CSRFToken': csrftoken,
          },
          withCredentials: true,
        },
      );

      // Step 3: Read cookies again after login
      const cookies = await Cookies.get(LMS_BASE_URL);

      if (cookies.sessionid) {
        // Step 4: Persist cookie for WebView domain
        await Cookies.set(LMS_BASE_URL, {
          name: 'edxsessionid',
          value: cookies.sessionid.value,
          domain: '.courses.akinsure.com', // very important: must match LMS domain
          path: '/',
          version: '1',
          secure: true,
          httpOnly: false,
        });

        setIsLoggedIn(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  

  const fetchDashboardData = async () => {
    setStats([]);
    try {
      const response = await axiosInstance.get('/api/request-dashboard', {
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
        setStats(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  const fetchSuggestedCourses = async () => {
    setSuggested([]);
    try {
      const response = await axiosInstance.get(`/api/suggested-courses/`, {
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
        setSuggested(response.data);
      }
    } catch (error) {
      console.log(error);
      console.error('Failed to fetch suggested courses:', error);
    }
  };

  const fetchLatestCourses = async () => {
    setLatest([]);

    try {
      const response = await axiosInstance.get(`/api/latest-courses/`, {
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
        setLatest(response.data);
      }
    } catch (error) {
      console.log(error);
      console.error('Failed to fetch suggested courses:', error);
    }
  };

  const visibleSuggested = suggested.slice(0, visibleCount);
  const visibleLatest = latest.slice(0, visibleCount);

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
      fetchSuggestedCourses();
      fetchLatestCourses();

      login(name, pass);
    }, [name, pass]),
  );

  return (
    <ScrollView
      className={`flex-1 ${
        currentTheme === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`}
    >
      <View className="p-4">
        <View className="flex flex-row justify-between items-center mb-6">
          <Text
            className={`text-2xl font-bold ${
              currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}
          >
            Welcome, {user?.name}!
          </Text>
        </View>

        <View className="flex flex-row">
          <Text
            className={`text-xl font-bold ${
              currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}
          >
            Dashboard Stats
          </Text>
        </View>
        <ScrollView horizontal style={{ flex: 1, padding: 12, paddingLeft: 0 }}>
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
          <Text
            className={`text-2xl font-bold mb-2 ${
              currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}
          >
            Suggested Courses
          </Text>
        </View>
        {!suggested || suggested.length !== 0 ? (
          <>
            <ScrollView
              horizontal
              style={{ flex: 1, padding: 12, paddingLeft: 0 }}
            >
              <View className="flex flex-row mb-4">
                {visibleSuggested.map((course, index) => (
                  <CourseCard
                    key={index}
                    display_name={course.display_name}
                    effort={course.effort}
                    course_image_uri={course.course_image_uri}
                    course_id={course.course_id}
                    enrolled={
                      course.enrolled == 1 ? 'Enrolled' : 'Not Enrolled'
                    }
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
                        isLoggedIn: isLoggedIn,
                      })
                    }
                    className={`flex-1 max-w-72 h-auto ${
                      index > 0 ? 'ml-4' : ''
                    }`}
                    style={{ width: '30%', marginBottom: 16 }}
                    imageStyle={{ width: 250, height: 120 }}
                  />
                ))}

                {visibleCount < suggested.length && (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('List', { list: suggested })
                    }
                    style={{
                      padding: 20,
                      borderRadius: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      className={`text-lg font-bold mb-2 ${
                        currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      See More
                      <MaterialIcons
                        name="keyboard-double-arrow-right"
                        size={20}
                        color={colors.textWhite}
                        style={{ marginTop: 5, paddingTop: 10, paddingLeft: 2 }}
                      />
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </>
        ) : (
          <View className="flex flex-row mt-5 items-center justify-center">
            <Text
              className={`text-2xl font-bold mb-2 ${
                currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}
            >
              No Suggested courses
            </Text>
          </View>
        )}

        <View className="flex flex-row">
          <Text
            className={`text-2xl font-bold mb-2 ${
              currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}
          >
            Latest Courses
          </Text>
        </View>
        {!latest || latest.length !== 0 ? (
          <>
            <ScrollView
              horizontal
              style={{ flex: 1, padding: 12, paddingLeft: 0 }}
            >
              <View className="flex flex-row mb-4">
                {visibleLatest.map((course, index) => (
                  <CourseCard
                    key={index}
                    display_name={course.display_name}
                    effort={course.effort}
                    course_image_uri={course.course_image_uri}
                    course_id={course.course_id}
                    enrolled={
                      course.enrolled == 1 ? 'Enrolled' : 'Not Enrolled'
                    }
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
                        isLoggedIn: isLoggedIn,
                      })
                    }
                    className={`flex-1 max-w-72 h-auto ${
                      index > 0 ? 'ml-4' : ''
                    }`}
                    style={{ width: '30%', marginBottom: 16 }}
                    imageStyle={{ width: 250, height: 120 }}
                  />
                ))}
                {visibleCount < latest.length && (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate('List', { list: latest })
                    }
                    style={{
                      padding: 20,
                      borderRadius: 10,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Text
                      className={`text-lg font-bold mb-2 ${
                        currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
                      }`}
                    >
                      See More
                      <MaterialIcons
                        name="keyboard-double-arrow-right"
                        size={20}
                        color={colors.textWhite}
                        style={{ marginTop: 5, paddingTop: 10, paddingLeft: 2 }}
                      />
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </>
        ) : (
          <View className="flex flex-row mt-5 items-center justify-center">
            <Text
              className={`text-2xl font-bold mb-2 ${
                currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}
            >
              No Latest courses
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default Index;
