import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function SalesFooter() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const tabs = [
    { id: '/sales', label: 'Home', icon: 'home' },
    { id: '/sales/requests', label: 'Request', icon: 'list' },
    { id: '/sales/history', label: 'History', icon: 'time' },
    { id: '/sales/customers', label: 'Customer', icon: 'people' },
  ];

  return (
    <View style={[styles.footer, { paddingBottom: insets.bottom, height: 60 + insets.bottom }]}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.id;
        return (
          <TouchableOpacity 
            key={tab.id} 
            style={styles.tab} 
            onPress={() => router.replace(tab.id as any)}
          >
            <Ionicons 
              name={isActive ? (tab.icon as any) : (`${tab.icon}-outline` as any)} 
              size={24} 
              color={isActive ? '#10B981' : '#64748B'} 
            />
            <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
  },
  tabLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
  },
  activeTabLabel: {
    color: '#10B981',
  },
});
