import React from 'react';
import { View, Text } from 'react-native';

const CourseView = ({ route, navigation }) => {
  const { section, parent } = route.params;
  console.log(section.value.children);
  console.log(parent);
  return (
    <View>
      <Text></Text>
    </View>
  );
};

export default CourseView;
