import React from 'react'
import { View, Text } from 'react-native'

const Details = ({ route, navigation }) => {
    const {course} = route.params;
    console.log(course);
    return (
        <View>
            <Text></Text>
        </View>
    )
}

export default Details