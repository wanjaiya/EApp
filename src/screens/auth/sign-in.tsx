import Button from '../../components/core/Button';
import Input from '../../components/core/Input';
import axiosInstance from '../../config/axiosConfig';
import { useSession } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import React, { useState } from 'react';
import { Alert, Image, Text, View } from 'react-native';
import { SigninScreenProps } from '../../navigation/types';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import { IOS_CLIENT_ID,WEB_CLIENT_ID, ANDROID_CLIENT_ID } from '../../config/env';

GoogleSignin.configure({
  webClientId: WEB_CLIENT_ID,
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
  offlineAccess: true,
  forceCodeForRefreshToken: true,
  iosClientId: IOS_CLIENT_ID,
});

const Signin = ({ navigation }: SigninScreenProps) => {
  const { signIn } = useSession();
  const { currentTheme } = useTheme();
  const [data, setData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (key: string, value: string) => {
    setData({ ...data, [key]: value });
    setErrors({ ...errors, [key]: '' });
  };

  const handleLogin = async () => {
    setLoading(true);
    setErrors({ email: '', password: '' });

    try {
      const response = await axiosInstance.post('/api/login', data);

      await signIn(
        response.data.token,
        response.data.user,
        response.data.edxinstanceId,
      );

      navigation.navigate('Welcome');
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
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (response) {
      const result = await axiosInstance.post('/api/googleLogin', {
        email: response.data.user.email,
        googleId : response.data.user.id
      });

     const Rs = await signIn(
        result.data.token,
        result.data.user,
        result.data.edxinstanceId,
      );

     if(Rs){
      navigation.navigate('MainTabs');
     }
     // navigation.navigate('MainTabs');

    } else {
      // sign in was cancelled by user
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
    } finally {
      setLoading(false);
    }

  };

  return (
    <View
      className={`flex-1 p-5 ${
        currentTheme === 'dark' ? 'bg-gray-900' : 'bg-white'
      }`}
    >
      <View className="items-center mt-4">
        <Image
          source={require('../../assets/images/logo.png')}
          style={{ height: 145, width: 85 }}
        />
      </View>
      <View className="items-center">
        <Text
          className={`text-2xl text-center font-bold mt-4 ${
            currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          Welcome to The AKI Knowledge Hub
        </Text>
      </View>
      <Text
        className={`text-[14px] justify-start  mt-4 mb-4 ${
          currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}
      >
        Sign in to continue
      </Text>

      <Input
        placeholder="Email / Username"
        value={data.email}
        onChangeText={value => handleChange('email', value)}
        error={errors.email}
      />
      <Input
        placeholder="Password"
        value={data.password}
        onChangeText={value => handleChange('password', value)}
        secureTextEntry
        error={errors.password}
      />

      <Button
        className={`w-full mb-4 `}
        onPress={handleLogin}
        disabled={loading}
        loading={loading}
        variant="primary"
      >
        <View className="flex-row items-center justify-center">
          <Text className="text-white text-center text-xl">Sign in</Text>
        </View>
      </Button>

      <View className={`flex-1 items-center mt-10 `}>
        <Text
          className={`mb-4 ${
            currentTheme === 'dark' ? 'text-white' : 'text-gray-900'
          }`}
        >
          {' '}
          Or sign in with
        </Text>

        <GoogleSigninButton
          size={GoogleSigninButton.Size.Wide}
          color={GoogleSigninButton.Color.Dark}
          onPress={handleGoogle}
          disabled={loading}
        />
      </View>
    </View>
  );
};

export default Signin;
