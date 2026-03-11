import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Image, View } from 'react-native';

const MicrosoftButton = ({ onPress, disabled = false }) => {
  return (
    <TouchableOpacity style={[styles.button, disabled && styles.disabled]} onPress={disabled ? undefined : onPress} disabled={disabled}>
      <Image
        source={require('../../assets/images/microsoft.jpg')}
        style={styles.logo}
        resizeMode="contain"
      />
      <View style={styles.container}>
        <Text style={styles.text}>Sign in with Microsoft</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 2,
    marginTop: 10,
    width: '94%',
  },
  container: {
    width: '86%',
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  logo: {
    width: '13.5%',
    height: '100%',
    marginRight: 10,
    backgroundColor: 'white',
  },
  text: {
    color: '#000000',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default MicrosoftButton;
