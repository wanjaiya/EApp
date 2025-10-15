import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useThemeColors } from '../hooks/useThemeColors';
import { useTheme } from '../context/ThemeContext';
import { WelcomeScreenProps } from '../navigation/types';

const Welcome = ({ navigation }: WelcomeScreenProps) => {
  const colors = useThemeColors();
  const { currentTheme } = useTheme();

  return (
    <View
      className={`flex-1 ${currentTheme === 'dark' ? 'bg-white' : 'bg-white'}`}
    >
      <Image
        source={require('../assets/images/launch_background.jpg')}
        style={styles.image}
        resizeMode="cover"
      />
        <View className="flex justify-center items-center absolute bottom-10 w-full ">
          <TouchableOpacity
            className="h-[54px] w-80 border-[1.5px] justify-center items-center mb-4 "
            style={{
              borderColor: colors.background,
              backgroundColor: colors.background,
            }}
            onPress={() => navigation.navigate('Signin')}
          >
            <Text style={styles.buttonText}>Get Started</Text>
          </TouchableOpacity>
        </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    alignSelf: 'center',
    height: '100%',
    width: '100%',
  },
  text: {
    color: 'white',
    fontSize: 42,
    lineHeight: 84,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#000000c0',
  },
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#ff6b00',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Welcome;
