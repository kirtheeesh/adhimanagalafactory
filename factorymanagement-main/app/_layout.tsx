import { Stack } from 'expo-router';
import React, { useEffect, Component, ReactNode } from 'react';
import { LogBox, View, Text, StyleSheet, Alert, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MachineProvider } from '@shared/context/MachineContext';
import * as SplashScreen from 'expo-splash-screen';

// Prevent splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

declare var ErrorUtils: {
  setGlobalHandler: (callback: (error: any, isFatal?: boolean) => void) => void;
  getGlobalHandler: () => (error: any, isFatal?: boolean) => void;
};

class GlobalErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("GlobalErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Application Error</Text>
          <Text style={styles.errorText}>{this.state.error?.toString()}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function RootLayout() {
  useEffect(() => {
    // Force logs to show for debugging
    LogBox.ignoreAllLogs(false);

    // Backup timeout to hide splash screen no matter what after 5 seconds
    const backupTimer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 5000);

    // Hide splash screen after initialization
    const prepareApp = async () => {
      try {
        // Pre-initialization logic can go here (fonts, auth check etc.)
        await new Promise(resolve => setTimeout(resolve, 1000)); 
      } catch (e) {
        console.warn(e);
      } finally {
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          console.error("Error hiding splash screen:", e);
        }
      }
    };

    prepareApp();

    // Global error handler for React Native
    if (typeof ErrorUtils !== 'undefined') {
        const originalHandler = ErrorUtils.getGlobalHandler();
        ErrorUtils.setGlobalHandler((error, isFatal) => {
          console.error("Global JS Error Caught:", error, isFatal);
          SplashScreen.hideAsync().catch(() => {}); // Try to hide splash on error
          if (isFatal) {
            Alert.alert("Fatal Application Error", error?.message || "Something went wrong. Please restart the app.");
          }
          originalHandler(error, isFatal);
        });
    }

    return () => clearTimeout(backupTimer);
  }, []);

  return (
    <SafeAreaProvider>
      <GlobalErrorBoundary>
        <MachineProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="phead" />
            <Stack.Screen name="quality" />
            <Stack.Screen name="sales/index" />
          </Stack>
        </MachineProvider>
      </GlobalErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});
