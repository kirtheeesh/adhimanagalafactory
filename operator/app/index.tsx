import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import { fetchWithTimeout } from '@shared/utils/fetchTimeout';

export default function Index() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const userId = await AsyncStorage.getItem('user_id');
        if (!isMounted) return;

        if (userId) {
          // Check for active shift
          try {
            const response = await fetchWithTimeout(`${SERVER_URL}/operator/current-shift/${userId}`, {}, 5000);
            const data = await response.json();
            
            if (!isMounted) return;

            if (data.active) {
              router.replace('/machineries');
            } else {
              router.replace('/select-machine');
            }
          } catch (error) {
            console.log("Shift check failed, fallback to machineries", error);
            if (isMounted) router.replace('/machineries');
          }
        } else {
          router.replace('/login');
        }
      } catch (e) {
        console.log("Auth check failed", e);
        if (isMounted) router.replace('/login');
      } finally {
        if (isMounted) setChecking(false);
      }
    };
    
    // Tiny delay to ensure router is ready
    const timer = setTimeout(checkAuth, 500);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  if (checking) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#10B981" />
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
