import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from './env';

const axiosInstance = axios.create({
 baseURL: API_BASE_URL,
 headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
 },
 withCredentials: false,

});

//Add request interceptor to dynamically add auth token
axiosInstance.interceptors.request.use(
    async (config) =>{
     // Get token from secure storage if needed
     const token = await AsyncStorage.getItem('session');

     if(token){
        config.headers.Authorization = `Bearer ${token}`;
     }

     return config;
    },
    (error) =>{
       console.log(error)
       return Promise.reject(error);
    }
);

export default axiosInstance;