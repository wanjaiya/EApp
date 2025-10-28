import React from 'react';
import { View, Text } from 'react-native';

const CourseView = ({ route, navigation }) => {
  const { section } = route.params;
  console.log(section);
  return (
    <View>
      <Text></Text>
    </View>
  );
};

export default CourseView;
