import { View, Text, Platform,Alert } from 'react-native'
import React from 'react'
import { useTheme } from "../../context/ThemeContext";
import { useSession } from '../../context/AuthContext';
import Button from '../../components/core/Button';


const Settings = () => {
  
   const { user, signOut} = useSession();

      const handleLogout = () => {
          Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
              {
                text: 'Cancel',
                style: 'cancel'
              },
              {
                text:'Logout',
                style: 'destructive',
                onPress: () => signOut(), 
              }
    
            ],
            {cancelable: true}
          );
        
      };
  return (
   <View className={`flex-1 p-5`}>
      <Button
       onPress={handleLogout}
       variant="danger"
       className='shadow-lg'
      >
        <Text className='text-white text-center font-semibold'>Logout</Text>
      </Button>
    </View>
  )
}

export default Settings