import React from 'react'
import { WebView } from 'react-native-webview';
import {View, StyleSheet} from 'react-native';

function RenderView() {


  return (
     <View style={styles.container}>
        <WebView
          source={{uri: 'https://www.youtube.com/embed/MhkGQAoc7bc'}}
          style={styles.video}
        />
      </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',

  },
  video: {
    marginTop: 20,
    maxHeight: 200,
    width: 320,
    flex: 1
  }
});
export default RenderView