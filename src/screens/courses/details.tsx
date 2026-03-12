import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  ScrollView,
  Alert,
  FlatList,
  ActivityIndicator,
  useColorScheme
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axiosInstance from '../../config/axiosConfig';
import { useSession } from '../../context/AuthContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import RenderHTML from 'react-native-render-html';
import Button from '../../components/core/Button';
import axios from 'axios';
import { getCourseData } from '../../api/edx';
import Cookies from '@react-native-cookies/cookies';
import { useFocusEffect } from '@react-navigation/native';
import { MainTabsScreenProps } from '../../navigation/types';
import { dashboard } from '../dashboard/index';

const Details = ({ route, navigation }: MainTabsScreenProps) => {
  const { user, session, edxSessionId, signOut } = useSession();
  const colors = useThemeColors();
  const  currentTheme  = useColorScheme();
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [enrollment, setEnrollment] = useState();
  const [sequential, setSequential] = useState([]);

  const { width } = useWindowDimensions();
  const { course, update } = route.params;
  const courseId = course.course_id;
  const pieces = course.effort?.split(':');
  const outline = course.more_info;
  const [expanded, setExpanded] = useState(null);
  const [locked, setLocked] = useState('');

  const LMS_URL = 'https://courses.akinsure.com';

  const toggleExpand = id => {
    setExpanded(expanded === id ? null : id);
  };

  const handleEnrollment = async () => {
    try {
      const data = {
        course_id: courseId,
        edxSessionId: edxSessionId,
      };
      const response = await axiosInstance.post(
        '/api/course-enrollment',
        data,
        {
          headers: {
            Authorization: `Bearer ${session}`,
          },
        },
      );
      if (response.data.status == true) {
        Alert.alert('Success', response.data.message, [
          {
            text: 'Take Course',
            onPress: () => fetchCourseData(), // 🔁 Refresh trigger
          },
        ]);
      } else {
        Alert.alert('Info', response.data.message, [
          {
            text: 'OK',
            onPress: () => fetchCourseData(), // 🔁 Refresh trigger
          },
        ]);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data;
        if (responseData?.errors) {
          console.log(responseData.errors);
          Alert.alert('Error', responseData.errors);
        } else if (responseData?.message) {
          Alert.alert('Error', responseData.message);
        }
      } else {
        console.error('Error', error);
        Alert.alert('Error', 'Unable to connect to the server.');
      }
    }
  };

  const fetchCourseData = async () => {
    try {
      setPageLoading(true);
      setDetails([]);
      setSequential([]);

      const allCookies = await Cookies.get(LMS_URL);
      const other = await Cookies.get('edxsessionid');

      console.log(edxSessionId);

      const response = await axiosInstance.get('/api/get-course-data/', {
        params: {
          course_id: courseId,
          edxSessionId: edxSessionId,
        },
        headers: {
          Authorization: `Bearer ${session}`,
        },
      });


      console.log(response);

      console.log(course);

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
        setDetails(response.data);
        setSequential(response.data.sequential.children);
      }
    } catch (error) {
      console.log(error);

      console.error('Failed to course additional data:', error);
    } finally {
      setPageLoading(false);
    }
  };

  function formatToDate(dateStr) {
    const date = new Date(dateStr.replace(' ', 'T'));
    const d = String(date.getDate()).padStart(2, '0');
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const y = date.getFullYear();
    return `${d}-${m}-${y}`;
  }

  function completePrevious(Item) {
    Alert.alert(
      'Alert',
      `Kindly complete ${Item.value.display_name} before proceeding to the next section`,
      [
        {
          text: 'Okay',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  }

  const html = details.overview;

  const sections = Object.entries(sequential).map(([key, value]) => ({
    key,
    value,
  }));



  useEffect(() => {
    fetchCourseData();
  }, []);

  return (
    <ScrollView
      className={`flex-1 ${
        currentTheme === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`}
      key={refreshKey}
    >
      {pageLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <>
          {/* Header */}
          <View className="flex-row items-center p-4 border-b border-gray-200">
            <TouchableOpacity onPress={() => navigation.popToTop()}>
              <MaterialIcons
                name="arrow-back"
                size={20}
                color={colors.primary}
                style={{ marginRight: 2, paddingRight: 2 }}
              />
            </TouchableOpacity>
            <Text
              className={`text-md font-semibold  ${
                currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}
            >
              {details.name}
            </Text>
          </View>

          {/* Body */}
          <View className="flex flex-row mt-2 ml-2 mr-2">
            {/*Course Image*/}
            <Image
              source={{ uri: details.course_image_uri }}
              style={{ width: '100%', height: 200 }}
              resizeMode="contain"
            />
          </View>

          {/*Effort and enrollment text*/}
          <View className=" flex-row justify-between mt-3">
            <View className="p-4 pt-0 flex flex-row">
              <MaterialIcons
                name="access-time"
                size={14}
                color={colors.primary}
                style={{ paddingTop: 2, paddingRight: 3 }}
              />
              <Text
                className={`${
                  currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}
              >
                {pieces[2]} Mins
              </Text>
            </View>
            <Text
              className={`pr-6 pt-0 ${
                currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}
            >
              {details.completion_status
                ? details.completion_status
                : details.enrolled == 1
                ? 'Enrolled'
                : 'Not Enrolled'}
            </Text>
          </View>

          {/*Completion Date and Score*/}
          {details.completion_date ? (
            <>
              <View className=" flex-row justify-between mt-3">
                <Text
                  className={`pl-4 ${
                    currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  {`Score: ${Math.round(details.score * 100)}%`}
                </Text>

                <Text
                  className={`pr-6 pt-0 ${
                    currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
                  }`}
                >
                  {`Completion Date: ${formatToDate(details.completion_date)}`}
                </Text>
              </View>
            </>
          ) : (
            ''
          )}

          {/*Course Description*/}
          <View className="p-4 pb-2  flex items-center justify-center">
            <RenderHTML
              className={`${
                currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
              }`}
              contentWidth={width}
              source={{ html }}
              baseStyle={{
                color: currentTheme === 'dark' ? '#ffffff' : '#1F2937',
                fontSize: 14,
              }}
            />
          </View>
          {/*Course Outline*/}
          {details.enrolled == 0 ? (
            <>
              {outline ? (
                <View className="p-4 pt-0">
                  <Text
                    className={`text-lg font-bold mb-2 ${
                      currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}
                  >
                    What you will learn
                  </Text>
                  <RenderHTML
                    className={`${
                      currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
                    }`}
                    contentWidth={width}
                    source={{ html: outline }}
                    baseStyle={{
                      color: currentTheme === 'dark' ? '#ffffff' : '#1F2937',
                      fontSize: 14,
                    }}
                    tagsStyles={{
                      ul: {
                        paddingLeft: 10,
                        marginVertical: 4,
                        listStyleType: 'disc',
                      },
                      li: { marginVertical: 8 },
                    }}
                  />
                </View>
              ) : (
                <View className="p-4 pt-0 mb-4">
                  <></>
                </View>
              )}
            </>
          ) : (
            <View className="p-4 pt-0">
              <Text
                className={`text-lg font-bold mb-2 mt-4 ${
                  currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}
              >
                Course Outline
              </Text>

              <FlatList
                data={sections}
                scrollEnabled={false}
                style={{ marginLeft: 4 }}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => {
                  if (item.value.category === 'sequential') {
                    const prevItem = sections
                      .slice(0, index)
                      .reverse()
                      .find(i => i.value.has_graded_assignment);

                    if (item.value.prereq) {
                      if (prevItem?.value.percent_graded >= 0.5) {
                        return (
                          <View>
                            {/* Parent item */}
                            <TouchableOpacity
                              onPress={() => toggleExpand(item.value.id)}
                              style={{
                                paddingVertical: 10,
                                borderBottomWidth: 1,
                                borderColor: '#ccc',
                              }}
                            >
                              <Text
                                className={`text-md font-bold ${
                                  currentTheme === 'dark'
                                    ? 'text-white'
                                    : 'text-gray-800'
                                }`}
                                style={{ fontSize: 16, fontWeight: '600' }}
                              >
                                {item.value.display_name}
                              </Text>
                            </TouchableOpacity>

                            {/* Children (shown only if expanded) */}
                            {expanded === item.value.id && (
                              <View style={{ paddingLeft: 16 }}>
                                {item.value.child_info.children.map(
                                  (child, index) => {
                                    return (
                                      <TouchableOpacity
                                        key={index}
                                        onPress={() =>
                                          navigation.navigate('CourseView', {
                                            section: child,
                                            parent: sections,
                                            course: course,
                                          })
                                        }
                                        style={{ paddingVertical: 8 }}
                                      >
                                        <Text
                                          className={`${
                                            currentTheme === 'dark'
                                              ? 'text-white'
                                              : 'text-gray-800'
                                          }`}
                                          style={{ fontSize: 14 }}
                                        >
                                          {child.display_name !== 'Wrap Up'
                                            ? child.display_name
                                            : ''}
                                        </Text>
                                      </TouchableOpacity>
                                    );
                                  },
                                )}
                              </View>
                            )}
                          </View>
                        );
                      } else {
                        return (
                          <View>
                            <TouchableOpacity
                              onPress={() => completePrevious(prevItem)}
                              style={{
                                paddingVertical: 10,
                                borderBottomWidth: 1,
                                borderColor: '#ccc',
                                flex: 1,
                                flexDirection: 'row',
                              }}
                            >
                              <MaterialIcons
                                name="lock"
                                size={20}
                                color={colors.primary}
                                style={{ paddingRight: 3, marginTop: 2 }}
                              />
                              <Text
                                className={`text-md font-bold ${
                                  currentTheme === 'dark'
                                    ? 'text-white'
                                    : 'text-gray-800'
                                }`}
                                style={{ fontSize: 16, fontWeight: '600' }}
                              >
                                {item.value.display_name}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        );
                      }
                    } else {
                      return (
                        <View>
                          {/* Parent item */}
                          <TouchableOpacity
                            onPress={() => toggleExpand(item.value.id)}
                            style={{
                              paddingVertical: 10,
                              borderBottomWidth: 1,
                              borderColor: '#ccc',
                            }}
                          >
                            <Text
                              className={`text-md font-bold ${
                                currentTheme === 'dark'
                                  ? 'text-white'
                                  : 'text-gray-800'
                              }`}
                              style={{ fontSize: 16, fontWeight: '600' }}
                            >
                              {item.value.display_name}
                            </Text>
                          </TouchableOpacity>

                          {/* Children (shown only if expanded) */}
                          {expanded === item.value.id && (
                            <View style={{ paddingLeft: 16 }}>
                              {item.value.child_info.children.map(
                                (child, index) => {
                                  return (
                                    <TouchableOpacity
                                      key={index}
                                      onPress={() =>
                                        navigation.navigate('CourseView', {
                                          section: child,
                                          parent: sections,
                                          course: course,
                                        })
                                      }
                                      style={{ paddingVertical: 8 }}
                                    >
                                      <Text
                                        className={`${
                                          currentTheme === 'dark'
                                            ? 'text-white'
                                            : 'text-gray-800'
                                        }`}
                                        style={{ fontSize: 14 }}
                                      >
                                        {child.display_name !== 'Wrap Up'
                                          ? child.display_name
                                          : ''}
                                      </Text>
                                    </TouchableOpacity>
                                  );
                                },
                              )}
                            </View>
                          )}
                        </View>
                      );
                    }
                  }
                }}
              />
            </View>
          )}

          {details.enrolled == 0 ? (
            <Button
              className={` w-full mt-2 `}
              onPress={handleEnrollment}
              disabled={loading}
              loading={loading}
              variant="primary"
            >
              <View className="flex-row items-center justify-center">
                <Text className="text-white text-center text-xl">Enroll</Text>
              </View>
            </Button>
          ) : (
            ''
          )}
        </>
      )}
    </ScrollView>
  );
};

export default Details;
