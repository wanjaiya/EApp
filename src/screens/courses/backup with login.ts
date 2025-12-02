import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform,
  Button
} from 'react-native';
import { useSession } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { WebView } from 'react-native-webview';
import Cookies from '@react-native-cookies/cookies';

import axios from 'axios';

const LMS_URL = "https://courses.akinsure.com";

const CourseView = ({ route, navigation }) => {
  const { user, session, edxSessionId, sessionId, edxUser, position } = useSession();
  const colors = useThemeColors();
  const { currentTheme } = useTheme();
  const { section, parent, chapter, course_id } = route.params;
  const webViewRef = useRef(null);
  
 const [loading, setLoading] = useState(false);
  const [scormUrl, setScormUrl] = useState(null);


  const child = section.value.children[0];


  const match = parent.find(obj => obj.key === child);
  const webUrl = section.value.student_view_url;
  const secureUrl = webUrl.replace(/^http:\/\//i, 'https://');



  const name = user?.email;
  const pass = position;

  const login = async(email: string, password: string) =>{

   setLoading(true);
   try {

    await axios.get(`${LMS_URL}/user_api/v1/account/login_session/`, { withCredentials: true });
    
      const cookies = await Cookies.get(LMS_URL);
      const csrftoken = cookies?.csrftoken?.value;

       const formData = new URLSearchParams();
        formData.append("email", email);
        formData.append("password", password);

      await axios.post(
        `${LMS_URL}/user_api/v1/account/login_session/`,
         formData.toString(),
        {
          headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "X-CSRFToken": csrftoken,
        },
          withCredentials: true,
        }
      );

     const newCookies = await Cookies.get(LMS_URL);
     const sessionid = newCookies?.sessionid?.value;
     const csrf = newCookies?.csrftoken?.value;

     console.log(newCookies);
     console.log(sessionid);
     console.log(csrf);

     if (!sessionid) throw new Error("Login failed: no session cookie");

      console.log("Logged in, sessionid:", sessionid);

      setScormUrl(secureUrl);

        console.log('Authenticated cookies detected — reloading MFE');
        setTimeout(() =>  webViewRef.current?.reload(), 1500);

   }catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }

  }

  const refreshLogin = async () => {
    try {
      const cookies = await Cookies.get(LMS_URL);
      const sessionid = cookies?.sessionid?.value;
      const csrftoken = cookies?.csrftoken?.value;

      if (!sessionid) {
        console.log("No session found, login required");
        return false;
      }

      await axios.post(
        `${LMS_URL}/login_refresh`,
        {},
        {
          headers: {
            "X-CSRFToken": csrftoken,
            Cookie: `sessionid=${sessionid}; csrftoken=${csrftoken}`,
          },
          withCredentials: true,
        }
      );

      console.log("Session refreshed");
      return true;
    } catch (err) {
      console.error("Login refresh failed", err.response?.data || err);
      return false;
    }
  };

  
 
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
          {match.value.display_name}
        </Text>
      </View>

     <View style={{ flex: 1 }}>
      {loading && <ActivityIndicator size="large" style={{ marginTop: 50 }} />}
      {!scormUrl && !loading && (
        <View style={{ padding: 20 }}>
          <Text>Login to Open edX to access SCORM content</Text>
          <Button
            title="Login"
            onPress={() => login(name, pass)}
          />
        </View>
      )}
      {scormUrl && (
        <WebView
          ref={webViewRef}
          source={{ uri: scormUrl }}
          startInLoadingState
          javaScriptEnabled
          domStorageEnabled
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          originWhitelist={["*"]}
          onError={(e) => console.error("WebView error", e.nativeEvent)}
          renderLoading={() => <ActivityIndicator size="large" />}
          onHttpError={e =>
            console.log('HTTP error:', e.nativeEvent)
          }
        />
      )}
    </View>
    </ScrollView>
  );
};
export default CourseView;
