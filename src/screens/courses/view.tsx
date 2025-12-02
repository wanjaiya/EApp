import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  StyleSheet,
} from 'react-native';
import { useSession } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { WebView } from 'react-native-webview';
import Cookies from '@react-native-cookies/cookies';
import axios from 'axios';
import Button from '../../components/core/Button';

const LMS_URL = 'https://courses.akinsure.com';

type SectionType = 'html' | 'scorm' | 'video' | 'discussion';

const CourseView = ({ route, navigation }) => {
  const { user, session, edxSessionId, sessionId, edxUser, position } =
    useSession();
  const colors = useThemeColors();
  const { currentTheme } = useTheme();
  const { section, parent } = route.params;
  const webViewRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [renderUrl, setRenderUrl] = useState('');
  const [nextSection, setNextSection] = useState('');
  const [previousSection, setPreviousSection] = useState('');
  const { width } = useWindowDimensions();

  const name = user?.email;
  const pass = position;

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      // Step 1: Get CSRF cookie
      await axios.get(`${LMS_URL}/user_api/v1/account/login_session/`, {
        withCredentials: true,
      });

      const allCookies = await Cookies.get(LMS_URL);
      const csrftoken = allCookies?.csrftoken?.value;

      if (!csrftoken) {
        throw new Error('CSRF token not found');
      }

      // Step 2: Login (form-encoded)
      const formData = new URLSearchParams();
      formData.append('email', email);
      formData.append('password', password);

      await axios.post(
        `${LMS_URL}/user_api/v1/account/login_session/`,
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
      const cookies = await Cookies.get(LMS_URL);

      if (cookies.sessionid) {
        // Step 4: Persist cookie for WebView domain
        await Cookies.set(LMS_URL, {
          name: 'sessionid',
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

  const getUnitContent = async () => {
    parent.forEach(part => {
      if (section.key === part.key) {
        setRenderUrl(
          section.value.student_view_url.replace(/^http:\/\//i, 'https://'),
        );
      }
    });
  };

  const getNextVertical = async () => {
    const verticals = [];
    parent.forEach(part => {
      if (part.value.type === 'vertical') {
        verticals.push(part);
      }
    });

    const index = verticals.findIndex(u => u.key === section.key);

    if (index !== -1) {
      // Found the current vertical
      if (index < verticals.length - 1) {
        // There is a next vertical inside the same subsection
        setNextSection(verticals[index + 1]);
      } else {
        // No more units in this subsection
        setNextSection(null);
      }
    }
  };

  const getPreviousVertical = async () => {
    const verticals = [];
    parent.forEach(part => {
      if (part.value.type === 'vertical') {
        verticals.push(part);
      }
    });

    const index = verticals.findIndex(u => u.key === section.key);

    if (index !== -1) {
      if (index === 0) {
        setPreviousSection(null);
      } else {
        // Found the current vertical
        if (index < verticals.length - 1) {
          // There is a next vertical inside the same subsection
          setPreviousSection(verticals[index - 1]);
        } else {
          // No more units in this subsection
          setPreviousSection(null);
        }
      }
    }
  };

  useEffect(() => {
    if (isLoggedIn === true) {
      getUnitContent();
      getNextVertical();
      getPreviousVertical();
    } else {
      login(name, pass);
    }
  }, [name, pass, isLoggedIn]);

  console.log(nextSection);
  console.log(previousSection);

  return (
    <View
      className={`flex-1 ${
        currentTheme === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`}
    >
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
          {section.value.display_name}
        </Text>
      </View>

      <WebView
        source={{ uri: renderUrl }}
        style={{ flex: 1, paddingLeft: 10, paddingRight: 10 }}
      />

      <View className="flex-row items-center p-4 border-b border-gray-200">
        {previousSection ? (
          <Button
            className={`bottom-2 mt-2 `}
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
              <Text className="text-white text-center text-xl">
                Previous Section
              </Text>
            </View>
          </Button>
        ) : (
          ''
        )}

        {nextSection ? (
          <Button
            className={`bottom-2 mt-2 ml-4`}
            onPress={() =>
              navigation.navigate('CourseView', {
                section: nextSection,
                parent: parent,
              })
            }
            disabled={loading}
            loading={loading}
            variant="primary"
          >
            <View className="flex-row items-center justify-center">
              <Text className="text-white text-center text-xl">
                Next Section
              </Text>
            </View>
          </Button>
        ) : (
          ''
        )}
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
