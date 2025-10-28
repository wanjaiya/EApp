import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  useWindowDimensions,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axiosInstance from '../../config/axiosConfig';
import { useSession } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import RenderHTML from 'react-native-render-html';
import Button from '../../components/core/Button';

const Details = ({ route, navigation }) => {
  const { user, session, edxSessionId } = useSession();
  const colors = useThemeColors();
  const { currentTheme } = useTheme();
  const [details, setDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [enrollment, setEnrollment] = useState();
  const [sequential, setSequential] = useState([]);

  const { width } = useWindowDimensions();
  const { course } = route.params;
  const courseId = course.course_id;
  const pieces = course.effort?.split(':');
  const outline = course.more_info;
  const [expanded, setExpanded] = useState(null);

  const html = details.overview;
  const sections = Object.entries(sequential).map(([key, value]) => ({
    key,
    value,
  }));

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
            text: 'OK',
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
          setErrors(responseData.errors);
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
      const response = await axiosInstance.get('/api/get-course-data/', {
        params: {
          course_id: courseId,
        },
        headers: {
          Authorization: `Bearer ${session}`,
        },
      });
      setEnrollment(1);

      //console.log(response.data.outline);

      await setDetails(response.data);
      await setSequential(response.data.sequential);
    } catch (error) {
      console.error('Failed to course additional data:', error);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, []);

  return (
    <ScrollView
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
          className={`text-lg font-semibold ml-3 ${
            currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}
        >
          {course.display_name}
        </Text>
      </View>

      {/* Body */}
      <View className="flex flex-row mt-2 ml-2 mr-2">
        {/*Course Image*/}
        <Image
          source={{ uri: course.course_image_uri }}
          style={{ width: '100%', height: 200 }}
          resizeMode="contain"
        />
      </View>

      {/*Effort and enrollment text*/}
      <View className=" flex-row justify-between">
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
          {enrollment == 1 ? 'Enrolled' : ''}
        </Text>
      </View>
      {/*Course Description*/}
      <View className="p-4 pb-2 flex items-center justify-center">
        <RenderHTML
          className={`${
            currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
          }`}
          contentWidth={width}
          source={{ html }}
          baseStyle={{
            color: currentTheme === 'dark' ? '#ffffff' : '#1F2937',
            fontSize: 16,
          }}
        />
      </View>
      {/*Course Outline*/}
      {enrollment == 0 ? (
        <View className="p-4 pt-0">
          <Text
            className={`text-2xl font-bold mb-2 ${
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
              fontSize: 16,
            }}
            tagsStyles={{
              ul: { paddingLeft: 10, marginVertical: 4, listStyleType: 'disc' },
              li: { marginVertical: 8 },
            }}
          />
        </View>
      ) : (
        <View className="p-4 pt-0">
          <Text
            className={`text-2xl font-bold mb-2 mt-4 ${
              currentTheme === 'dark' ? 'text-white' : 'text-gray-800'
            }`}
          >
            Course Outline
          </Text>

          <FlatList
            data={sections}
            keyExtractor={item => item.value.id}
            renderItem={({ item }) => {
              if (item.value.type === 'sequential') {
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
                        className={`text-lg font-bold ${
                          currentTheme === 'dark'
                            ? 'text-white'
                            : 'text-gray-800'
                        }`}
                        style={{ fontSize: 18, fontWeight: '600' }}
                      >
                        {item.value.display_name}
                      </Text>
                    </TouchableOpacity>

                    {/* Children (shown only if expanded) */}
                    {expanded === item.value.id && (
                      <View style={{ paddingLeft: 16 }}>
                        {item.value.children.map((child, index) => {
                          const match = sections.find(obj => obj.key === child);
                          return (
                            <TouchableOpacity
                              key={index}
                              onPress={() =>
                                navigation.navigate('CourseView', {
                                  section: match,
                                  parent: sections,
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
                                style={{ fontSize: 16 }}
                              >
                                {match.value.display_name !== 'Wrap Up'
                                  ? match.value.display_name
                                  : ''}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                );
              }
            }}
          />
        </View>
      )}

      {enrollment == 0 ? (
        <Button
          className={`bottom-6 w-full `}
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
    </ScrollView>
  );
};

export default Details;
