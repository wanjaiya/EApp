import './global.css';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { SessionProvider } from './src/context/AuthContext';

function App() {
  return (
    <SessionProvider>
      <SafeAreaProvider>
        <SafeAreaView className={`flex-1`}>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaView>
      </SafeAreaProvider>
    </SessionProvider>
  );
}

export default App;
