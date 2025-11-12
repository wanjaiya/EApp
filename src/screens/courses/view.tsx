import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  Platform
} from 'react-native';
import { useSession } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { WebView } from 'react-native-webview';
import Cookies from '@react-native-cookies/cookies';

const CourseView = ({ route, navigation }) => {
  const { user, session, edxSessionId, sessionId } = useSession();
  const colors = useThemeColors();
  const { currentTheme } = useTheme();
  const { section, parent, chapter, course_id } = route.params;
  const webViewRef = useRef(null);

  const child = section.value.children[0];

  console.log(section);

  const match = parent.find(obj => obj.key === child);
  const webUrl = match.value.student_view_url;
  const secureUrl = webUrl.replace(/^http:\/\//i, 'https://');
  const [currentUrl, setCurrentUrl] = useState(secureUrl);
  const [loading, setLoading] = useState(true);

  // Replace with your LMS host or MFE origin so we can detect "return" redirect.

  const APP_BASE_URL = 'https://courses.akinsure.com';
  const MFE_BASE_URL =  'https://apps.courses.akinsure.com'



  // Helper: read cookies for LMS origin (useful for native network calls)
  const readLmsCookies = async (url) => {
    try {
      //
      const cookies = await Cookies.get(url);
      // cookies is an object of cookieName => {value, domain, ...}
      return cookies;
    } catch (e) {
      console.warn('Failed to read cookies:', e);
      return null;
    }
  };

  // Optionally call to sync or verify session after login
  const handlePossibleLoginComplete = async url => {
    console.log(url);
    // If navigation returned to MFE student view, check cookies or page content to confirm login
    if (url.startsWith(APP_BASE_URL) && !url.includes('/login')) {
      // read cookies to confirm session cookie exists (e.g., edx-user or sessionid)
      const Cresults = await readLmsCookies(url);

      if (Cresults) {
        const arr = Object.entries(Cresults).map(([key, value]) => ({
          key,
          value,
        }));
        console.log(arr);
        if (
          arr &&
          (arr[0]['key'] === 'sessionid' || arr[1]['key'] === 'sessionid')
        ) {
          // Confirmed - reload the MFE to render course content (MFE will now be authenticated)
          console.log(webViewRef);
          webViewRef.current?.reload;
        } else {
          // fallback: inject JS to check page content for authenticated UI, or keep waiting
          console.log(
            'No session cookie yet; waiting or checking page content.',
          );
        }
      }

      // You can check for typical LMS cookies like 'sessionid' or 'edx.logged_in' etc.
    }
  };

  // Handle navigation state changes
  const onNavigationStateChange = navState => {
    const { url, loading: navLoading } = navState;

    setCurrentUrl(url);
    setLoading(navLoading);
    // Detect return to the MFE student view URL (login success)
    handlePossibleLoginComplete(url);
  };

  // Intercept requests on Android/iOS if you want more control (e.g., capture file downloads or custom schemes)
  const onShouldStartLoadWithRequest = request => {
    // request: { url, navigationType, ... }
    // Allow everything generally. You can intercept custom-scheme redirects here.
    // Example: if LMS SSO redirects to a custom scheme indicating login success:
    if (request.url.startsWith('myapp://auth-callback')) {
      // handle native deep link flow here
      // parse token and inject to webview if needed
      return false; // prevent WebView from trying to load the scheme
    }
    return true;
  };

  // Receive messages posted from the web app (if you inject a window.ReactNativeWebView.postMessage from the MFE)
  const onMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log('Message from MFE:', data);

       if (data.type === 'auth_check') {
      const cookies = await Cookies.get(APP_BASE_URL);
        
      console.log('MFE cookies' + cookies);


      if (cookies['edx-jwt-cookie-header-payload'] && cookies['edx-jwt-cookie-signature']) {
        console.log('Authenticated cookies detected — reloading MFE');
        setTimeout(() =>  webViewRef.current?.reload(), 1500);
      } else {
        console.log('Still not authenticated. Cookies:', cookies);
      }
    }


    //   if (data.type === 'auth_complete') {
    //     // optionally read cookies and reload
    //     handlePossibleLoginComplete(currentUrl);
    //   }
    } catch (e) {
      console.log('Plain message from webview:', event.nativeEvent.data);
    }
  };

  // JS injected into pages to allow the MFE to notify RN when auth state changes.
  // (Add to MFE code: window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({type:'auth_complete'})))
  const injectedJS = `
    (function() {
      // If MFE exposes a global event when login completes, hook it. Fallback: check if logged-in element exists.
      function notifyNative() {
        try {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'auth_check', url: window.location.href }));
        } catch (e) { }
      }
      // Run once
      notifyNative();
      // Observe navigation changes (single page MFEs might not perform full reloads)
      var last = window.location.href;
      setInterval(function() {
        if (window.location.href !== last) {
          last = window.location.href;
          notifyNative();
        }
      }, 500);
    })();
    true; // note: required for android to evaluate
  `;

    useEffect(() => {
    setCurrentUrl(secureUrl);
   
  }, [secureUrl]);

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
        {loading && (
          <ActivityIndicator
            size="large"
            color="#ffffff"
            style={{
              position: 'absolute',
              marginTop: '80%',
              left: '50%',
              transform: [{ translateX: -25 }, { translateY: -25 }],
              zIndex: 1,
            }}
          />
        )}
        <WebView
          ref={webViewRef}
          source={{ uri: currentUrl }}
          style={{ flex: 1 }}
          originWhitelist={['*']}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          thirdPartyCookiesEnabled={true}
          sharedCookiesEnabled={true} // iOS: allows WKWebView to share cookies with native cookie store
          onNavigationStateChange={onNavigationStateChange}
          onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
          onMessage={onMessage}
          injectedJavaScript={injectedJS}
          startInLoadingState={true}
          incognito={false}
          onError={syntheticEvent => {
            const { nativeEvent } = syntheticEvent;
            console.log('WebView error: ', nativeEvent);
            Alert.alert('Error', nativeEvent.description);
          }}
          onHttpError={e =>
            console.log('HTTP error:', e.nativeEvent.statusCode)
          }
        />
      </View>
    </ScrollView>
  );
};
export default CourseView;
