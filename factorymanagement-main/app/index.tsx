import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Index() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userId = await AsyncStorage.getItem('user_id');
        const userRole = await AsyncStorage.getItem('user_role');

        if (userId && userRole) {
          switch (userRole) {
            case 'PRODUCTION HEAD': router.replace('/phead'); break;
            case 'QUALITY': router.replace('/quality'); break;
            case 'PACKING': router.replace('/packing/packing_list'); break; 
            case 'SALES': router.replace('/sales'); break;
            default: router.replace('/login'); break;
          }
        } else {
          router.replace('/login');
        }
      } catch (e) {
        console.log("Auth check failed", e);
        router.replace('/login');
      } finally {
        setChecking(false);
      }
    };
    
    // Tiny delay to ensure router is ready
    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, []);

  if (checking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={{ position: 'absolute', bottom: 10, color: 'red' }}>Debug: Index Loading...</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center'
  }
});
