// ApiConfig.js
import { Platform } from 'react-native';

const PROD_URL = 'https://apkadhimangala.in';
const DEFAULT_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export const SERVER_URL = process.env.EXPO_PUBLIC_API_URL || 
                         (__DEV__ ? DEFAULT_URL : PROD_URL);

console.log(`[API] SERVER_URL is set to: ${SERVER_URL} (${__DEV__ ? 'Debug' : 'Release'})`);