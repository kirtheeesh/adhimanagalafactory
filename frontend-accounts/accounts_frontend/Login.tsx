import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, ImageBackground, KeyboardAvoidingView,
  Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import { fetchWithTimeout } from '@shared/utils/fetchTimeout';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function AccountsLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('acc@factory.com');
  const [password, setPassword] = useState('acc123');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Required", "Please enter credentials.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithTimeout(`${SERVER_URL}/accounts/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await AsyncStorage.setItem('user_id', String(data.user.id || ''));
        await AsyncStorage.setItem('username', String(data.user.username || ''));
        await AsyncStorage.setItem('user_role', 'ACCOUNTS');
        
        router.replace('/accounts/ledger');
      } else {
        Alert.alert("Access Denied", data.message || "Unauthorized.");
      }
    } catch (error) {
      Alert.alert("Network Error", "Server is not responding. Check connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground 
      source={require('../assets/background.jpeg')} 
      style={styles.background}
      imageStyle={{ width: '135%', left: '-15%' }}
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
                <Text style={styles.portalTitle}>ACCOUNTS <Text style={{color: '#10B981'}}>PORTAL</Text></Text>
                <Text style={styles.portalSub}>FACTORY MANAGEMENT SYSTEM</Text>
              </View>

              <View style={styles.glassCard}>
                <Text style={styles.loginStatusText}>ACCOUNTS LOGIN</Text>
                <View style={styles.field}>
                  <Text style={styles.label}>ACCOUNTS EMAIL ID</Text>
                  <TextInput 
                    style={styles.input} 
                    placeholder="acc@factory.com"
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
                  {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionBtnText}>LOGIN TO ACCOUNTS</Text>}
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.backBtn}
                  onPress={() => router.replace('/')}
                >
                  <Text style={styles.backBtnText}>BACK TO MAIN PORTAL</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.footerInfo}>SERVER: {SERVER_URL} | Accounts V1.0.0</Text>
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
  headerArea: { alignItems: 'center', marginBottom: 15 },
  logoBar: { width: 40, height: 4, backgroundColor: '#10B981', marginBottom: 6 },
  portalTitle: { fontSize: 30, fontWeight: '900', color: '#fff' },
  portalSub: { color: '#94A3B8', fontSize: 10, fontWeight: 'bold', letterSpacing: 2 },
  glassCard: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 25, padding: 25, elevation: 20 },
  loginStatusText: { fontSize: 16, fontWeight: '900', color: '#0F172A', textAlign: 'center', marginBottom: 20, letterSpacing: 1 },
  field: { marginBottom: 15 },
  label: { fontSize: 9, fontWeight: '900', color: '#64748B', marginBottom: 6 },
  input: { backgroundColor: '#F1F5F9', borderRadius: 12, padding: 14, fontSize: 16, color: '#0F172A', borderWidth: 1, borderColor: '#E2E8F0' },
  actionBtn: { backgroundColor: '#0F172A', padding: 18, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14, letterSpacing: 1 },
  backBtn: { marginTop: 15, padding: 10, alignItems: 'center' },
  backBtnText: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
  footerInfo: { textAlign: 'center', color: '#94A3B8', fontSize: 10, marginTop: 25 }
});
