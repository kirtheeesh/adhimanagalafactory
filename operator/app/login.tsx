import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, ImageBackground, KeyboardAvoidingView,
  Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// Import your central API config
import { SERVER_URL } from '@shared/constants/ApiConfig';
import { fetchWithTimeout } from '@shared/utils/fetchTimeout';

export default function SecureFactoryPortal() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDept, setSelectedDept] = useState('OPERATOR');
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);

  // Clear any stale session on login mount
  React.useEffect(() => {
    const clearSession = async () => {
      try {
        await AsyncStorage.removeItem('user_id');
        await AsyncStorage.removeItem('username');
      } catch (e) {}
    };
    clearSession();
  }, []);

  const departments = [
    { id: 'OPERATOR', label: 'Operator' },
  ];

  const testConnection = async () => {
    setTesting(true);
    try {
      const res = await fetch(`${SERVER_URL}/version`);
      const data = await res.json();
      Alert.alert("Success", `Connected to Server!\nVersion: ${data.version}\nDB: ${data.db}`);
    } catch (err: any) {
      Alert.alert("Connection Failed", `Error: ${err.message}\nURL: ${SERVER_URL}`);
    } finally {
      setTesting(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Required", "Please enter credentials.");
      return;
    }

    setLoading(true);
    try {
      console.log(`[LOGIN] Attempting login to: ${SERVER_URL}/login`);
      
      // 1. PRIMARY LOGIN using central SERVER_URL
      const response = await fetchWithTimeout(`${SERVER_URL}/login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          // Pretend to be a browser to bypass Hostinger's bot protection
          'User-Agent': 'Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36'
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          userRole: selectedDept, 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const userRole = data.user.role; 

        if (userRole !== 'OPERATOR') {
          Alert.alert("Access Denied", "This app is for Operators only.");
          setLoading(false);
          return;
        }

        // Store user info for other screens to use (e.g., operator_id for hourly logs)
        await AsyncStorage.setItem('user_id', String(data.user.id || ''));
        await AsyncStorage.setItem('username', String(data.user.username || ''));
        await AsyncStorage.setItem('user_role', userRole);
        await AsyncStorage.setItem('user_dept', selectedDept);

        // 3. ROUTING
        router.replace('/');
      } else {
        Alert.alert("Access Denied", data.message || "Unauthorized.");
      }
    } catch (error: any) {
      console.error("[LOGIN ERROR]", error);
      // Show the actual error message (SSL, Timeout, etc.) to debug
      Alert.alert("Connection Error", `Server: ${SERVER_URL}\n\nError: ${error.message || 'Unknown'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/background.jpeg')} 
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
            <ScrollView 
              contentContainerStyle={styles.scrollContent} 
              showsVerticalScrollIndicator={false}
              scrollEnabled={false}
            >
              <View style={styles.headerArea}>
                <View style={styles.logoBar} />
                <Text style={styles.portalTitle}>FACTORY <Text style={{color: '#10B981'}}>PORTAL</Text></Text>
                <Text style={styles.portalSub}>SELECT DEPARTMENT TO LOGIN</Text>
              </View>

              <View style={styles.deptContainer}>
                {departments.map((dept) => (
                  <TouchableOpacity 
                    key={dept.id} 
                    style={[styles.deptBtn, selectedDept === dept.id && styles.deptBtnActive]}
                    onPress={() => setSelectedDept(dept.id)}
                  >
                    <Text style={[styles.deptBtnText, selectedDept === dept.id && styles.deptBtnTextActive]}>
                      {dept.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.glassCard}>
                <Text style={styles.loginStatusText}>{selectedDept} LOGIN</Text>
                <View style={styles.field}>
                  <Text style={styles.label}>DEPARTMENT EMAIL ID</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="name@factory.com"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                  />
                </View>
                <View style={styles.field}>
                  <Text style={styles.label}>PASSWORD</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="••••••••" 
                    placeholderTextColor="#94A3B8"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                  />
                </View>
                <TouchableOpacity 
                  style={[styles.actionBtn, loading && {opacity: 0.7}]} 
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionBtnText}>LOGIN TO TERMINAL</Text>}
                </TouchableOpacity>

                <TouchableOpacity 
                  style={{ marginTop: 15, padding: 10 }} 
                  onPress={testConnection}
                  disabled={testing}
                >
                  <Text style={{ color: '#10B981', textAlign: 'center', fontSize: 12, fontWeight: 'bold' }}>
                    {testing ? 'Testing...' : 'TEST SERVER CONNECTION'}
                  </Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.footerInfo}>SERVER: {SERVER_URL} | {__DEV__ ? 'DEBUG' : 'RELEASE'} V2.0.2</Text>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { 
    flex: 1, 
    backgroundColor: '#000', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  overlay: { flex: 1, paddingHorizontal: 25 },
  scrollContent: { flexGrow: 1, justifyContent: 'center' },
  headerArea: { alignItems: 'center', marginBottom: 15, paddingTop: 60 },
  logoBar: { width: 40, height: 4, backgroundColor: '#10B981', marginBottom: 6 },
  portalTitle: { fontSize: 30, fontWeight: '900', color: '#fff' },
  portalSub: { color: '#94A3B8', fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  deptContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 15 },
  deptBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', margin: 3 },
  deptBtnActive: { backgroundColor: '#10B981', borderColor: '#34D399' },
  deptBtnText: { color: '#94A3B8', fontSize: 10, fontWeight: 'bold' },
  deptBtnTextActive: { color: '#000' },
  glassCard: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 25, padding: 25, elevation: 20 },
  loginStatusText: { fontSize: 16, fontWeight: '900', color: '#0F172A', textAlign: 'center', marginBottom: 20, letterSpacing: 1 },
  field: { marginBottom: 15 },
  label: { fontSize: 9, fontWeight: '900', color: '#64748B', marginBottom: 6 },
  input: { backgroundColor: '#F1F5F9', borderRadius: 12, padding: 14, fontSize: 16, color: '#0F172A', borderWidth: 1, borderColor: '#E2E8F0' },
  actionBtn: { backgroundColor: '#0F172A', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  footerInfo: { textAlign: 'center', color: '#94A3B8', fontSize: 10, marginTop: 25 }
});