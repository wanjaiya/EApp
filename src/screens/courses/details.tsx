import React, { useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, Image,useWindowDimensions } from 'react-native'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import axiosInstance from "../../config/axiosConfig";
import { useSession } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useThemeColors } from "../../hooks/useThemeColors";
import RenderHTML from 'react-native-render-html';
import Button from '../../components/core/Button';

const Details = ({ route, navigation }) => {
     const { user, session } = useSession();
     const colors = useThemeColors();
     const { currentTheme } = useTheme();
    const [details, setDetails] = useState([]);
    const [loading, setLoading] = useState(false);
    const { width } = useWindowDimensions();
    const {course} = route.params;
    const courseId = course.course_id;
    const pieces = course.effort?.split(":");
    const outline = course.more_info;

    const handleEnrollment = async () => {
        console.log(courseId);
    }

    const fetchCourseData = async () => {
      try {
        const response = await axiosInstance.get("/api/get-course-data/",{
        params: {
            "course_id": courseId
          },
          headers: {
            Authorization: `Bearer ${session}`,
          },
        });

         await setDetails(response.data);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    const html = details.overview;

useEffect(() => {
    fetchCourseData();
  }, []);


console.log(outline);
    return (
        <View className={`flex-1 ${currentTheme === "dark" ? "bg-gray-900" : "bg-white"}`}>
          {/* Header */}
          <View className="flex-row items-center p-4 border-b border-gray-200">
            <TouchableOpacity onPress={() => navigation.goBack()}>
               <MaterialIcons
                name="arrow-back"
                size={20}
                color={colors.primary}
                style={{ marginRight: 20, paddingRight: 10}}
                />
            </TouchableOpacity>
            <Text className= {`text-lg font-semibold ml-3 ${currentTheme === "dark" ? "text-white" : "text-gray-800"}`}>
                {course.display_name}
            </Text>
          </View>

         {/* Body */}
        <View className="flex flex-row mt-2 ml-2 mr-2">
             {/*Course Image*/}
          <Image
            source={{ uri: course.course_image_uri }}
            style={{ width:'100%', height:200 }}
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
                        style={{ paddingTop: 2, paddingRight: 3}}
                        />
                <Text className={`${currentTheme === "dark" ? "text-white" : "text-gray-800"}`}>
                        {pieces[2]} Mins
                    </Text>
              </View>
               <Text className={`pr-6 pt-0 ${currentTheme === "dark" ? "text-white" : "text-gray-800"}`}>
                     {course.enrolled == 1
                     ? 'Enrolled'
                     :
                     ''

                 }
                </Text>
          </View>
             {/*Course Description*/}
          <View className="p-4 pb-2 flex items-center justify-center">
             <RenderHTML className={`${currentTheme === "dark" ? "text-white" : "text-gray-800"}`}
              contentWidth={width}
              source={{ html}}
              baseStyle={{ color: currentTheme === "dark" ? "#ffffff" : "#1F2937", fontSize: 16 }} />

          </View>
             {/*Course Outline*/}
         <View className="p-4 pt-0">
          <Text className={`text-2xl font-bold mb-2 ${currentTheme === "dark" ? "text-white" : "text-gray-800"}`}>
            What you will learn
          </Text>
          <RenderHTML className={`${currentTheme === "dark" ? "text-white" : "text-gray-800"}`}
              contentWidth={width}
              source={{html: outline}}
              baseStyle={{ color: currentTheme === "dark" ? "#ffffff" : "#1F2937", fontSize: 16 }}
              tagsStyles={{
                ul: { paddingLeft: 10,
                      marginVertical: 4,
                      listStyleType:'disc'
                       },
                li: {marginVertical: 8},
              }}
          />
        </View>

        {course.enrolled == 0 ?
         (<Button
            className={`absolute w-full bottom-4 pt-0 mt-0`}
            onPress={handleEnrollment}
            disabled={loading}
            loading={loading}
            variant="primary"
            >
            <View className="flex-row items-center justify-center">
            <Text className="text-white text-center text-xl">Enroll</Text>
            </View>
            </Button>
          )
         :''}
    </View>
    )
}

export default Details