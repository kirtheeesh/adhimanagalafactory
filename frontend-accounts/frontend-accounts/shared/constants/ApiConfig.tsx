// ApiConfig.js
import { Platform } from 'react-native';

// Use environment variable from .env or fallback to VPS URL
export const SERVER_URL = process.env.EXPO_PUBLIC_API_URL || 'http://103.172.92.131:3000';

console.log(`[API] SERVER_URL is set to: ${SERVER_URL}`);