import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const MicrosoftButton = ({ onPress, disabled = false }) => {
  const { currentTheme } = useTheme();
  return (
    <TouchableOpacity style={[styles.button, disabled && styles.disabled]} onPress={disabled ? undefined : onPress} disabled={disabled} className={`${
        currentTheme === 'dark' ? ' bg-white' : 'bg-[#e6c619]'
      }`}>
         <View style={styles.container}>
         <Image
        source={require('../../assets/images/microsoft.jpg')}
        style={styles.logo}
        resizeMode="contain"
      />
      </View>
      <View style={styles.container2}>
       
        <Text style={styles.text} className={`${
          currentTheme === 'dark' ? ' text-gray-900' : 'text-white'
        }`}>
           
          
         Sign in with Microsoft </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 2,
    marginTop: 10,
    width: '94%',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width:'30%',
  },

   container2: {
    paddingVertical:12,
    flexDirection: 'row',
    alignItems: 'center',
    width:'70%',
  },
  logo: {
    width:'40%',
    height:'100%',
    marginLeft: 5,
    paddingTop:10,
    paddingBottom:10,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    flexDirection: 'row',
   
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MicrosoftButton;
