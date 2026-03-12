import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSession } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { WebView } from 'react-native-webview';
import Cookies from '@react-native-cookies/cookies';
import axiosInstance from '../../config/axiosConfig';
import Button from '../../components/core/Button';
import { LMS_BASE_URL } from '../../config/env';

type SectionType = 'html' | 'scorm' | 'video' | 'discussion';

const CourseView = ({ route, navigation }) => {
  const { user, session, edxSessionId, sessionId, edxUser, position } =
    useSession();
  const colors = useThemeColors();
  const { section, parent, course } = route.params;
  const webViewRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [renderUrl, setRenderUrl] = useState('');
  const [nextSection, setNextSection] = useState('');
  const [previousSection, setPreviousSection] = useState('');
  const [completeSection, setCompleteSection] = useState(false);
  const [completePrereq, setCompletePrereq] = useState(false);

  const { width } = useWindowDimensions();

  const name = user?.email;
  const pass = position;

  function findParentByChildId(childId) {
    return parent.find(cour =>
      cour.value.child_info.children.some(child => child.id === childId),
    );
  }

  const getNextVertical = async () => {
    const verticals = [];

    const findParent = findParentByChildId(section.id);

    const coursePart = findParent.value.id.split(':')[1].split('+type@')[0];

    const response = await axiosInstance.get('/api/get-block-grade/', {
      params: {
        subSectionId: findParent.value.id,
        edxSessionId: edxSessionId,
        courseId: 'course-v1:' + coursePart,
      },
      headers: {
        Authorization: `Bearer ${session}`,
      },
    });

    parent.forEach(part => {
      if (part.value.child_info.category === 'vertical') {
        verticals.push(part.value.child_info.children[0]);
      }
    });
    // Get the current index of the section from parent
    const index = verticals.findIndex(u => u.id === section.id);

    // Get the last index of the collection
    const lastIndex = verticals[verticals.length - 1];

    // check if if is quiz (last index)
    if (section.id === lastIndex.id) {
      completedCourse(response.data.course);
    } else {
      // This is a prerequsite that needs to be completed before proceeding
      if (response.data.prereq === true) {
        completeUnit();
      } else {
        if (index !== -1) {
          // Found the current vertical

          if (index < verticals.length - 1) {
            navigation.navigate('CourseView', {
              section: verticals[index + 1],
              parent: parent,
            });
          }
        }
      }
    }
  };

  const getPreviousVertical = async () => {
    const verticals = [];
    parent.forEach(part => {
      if (part.value.child_info.category === 'vertical') {
        verticals.push(part.value.child_info.children[0]);
      }
    });

    const index = verticals.findIndex(u => u.id === section.id);

    if (index !== -1) {
      if (index === 0) {
        setPreviousSection(null);
      } else {
        // Found the current vertical
        if (index <= verticals.length - 1) {
          // There is a next vertical inside the same subsection
          setPreviousSection(verticals[index - 1]);
        } else {
          // No more units in this subsection
          setPreviousSection(null);
        }
      }
    }
  };

  function completeUnit() {
    Alert.alert(
      'Alert',
      `Kindly complete this section by attaining 50% and above before proceeding to the next section`,
      [
        {
          text: 'Okay',
          style: 'cancel',
        },
      ],
      { cancelable: true },
    );
  }

  function completedCourse(mcourse) {
    Alert.alert(
      'Congratulations',
      `You have reached the end of the course. Click proceed to check your grade.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Proceed',
          style: 'destructive',
          onPress: () =>
            navigation.navigate('CourseDetails', {
              course: mcourse,
              update: true,
            }),
        },
      ],
      { cancelable: true },
    );
  }

  useEffect(() => {
    setCompletePrereq(false);
    getPreviousVertical();
    if (section) {
      setRenderUrl(section.embed_lms_url);
    }
  }, [section]); // runs every time `count` changes

  return (
    <View className={`flex-1`}>
      <View className="flex-row items-center p-4 border-b border-gray-200 bg-white">
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons
            name="arrow-back"
            size={20}
            color={colors.primary}
            style={{ marginRight: 20, paddingRight: 10 }}
          />
        </TouchableOpacity>
        <Text className={`text-lg font-semibold ml-3 text-gray-800`}>
          {section.display_name}
        </Text>
      </View>

      <View className={`flex-1 px-3`}>
        <WebView
          source={{ uri: renderUrl }}
          style={{ flex: 1, paddingLeft: 20, paddingRight: 10 }}
        />
      </View>

      <View className="flex-row items-center p-2 border-b border-gray-200 bg-white">
        {previousSection ? (
          <Button
            className={`ml-2 `}
            onPress={() =>
              navigation.navigate('CourseView', {
                section: previousSection,
                parent: parent,
              })
            }
            disabled={loading}
            loading={loading}
            variant="primary"
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-white text-center text-sm">
                Previous Section
              </Text>
            </View>
          </Button>
        ) : (
          ''
        )}

        <Button
          className={`ml-4`}
          onPress={() => getNextVertical()}
          disabled={loading}
          loading={loading}
          variant="primary"
        >
          <View className="flex-row items-center justify-center">
            <Text className="text-white text-center text-sm">Next Section</Text>
          </View>
        </Button>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
export default CourseView;
