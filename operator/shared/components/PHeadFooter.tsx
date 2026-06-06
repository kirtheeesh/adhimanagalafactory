import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PHeadFooter() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const tabs = [
    { id: '/phead/inventory', label: 'Inv', icon: 'cube' },
    { id: '/phead/approvals', label: 'Appr', icon: 'checkmark-done-circle' },
    { id: '/phead/purchases', label: 'Purchases', icon: 'cart' },
    { id: '/phead/packing_list', label: 'Pack', icon: 'gift' },
    { id: '/phead/packing_approvals', label: 'Pack Appr', icon: 'checkmark-circle' },
    { id: '/phead/scan_qr', label: 'Scan', icon: 'qr-code' },
    { id: '/phead/dispatch_history', label: 'Disp', icon: 'send' },
    { id: '/phead/reports', label: 'Rep', icon: 'document-text' },
    { id: '/phead/attendance', label: 'Att', icon: 'people' },
  ];

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.footer}
      >
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
                size={20} 
                color={isActive ? '#10B981' : '#64748B'} 
              />
              <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
  },
  footer: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  tab: {
    alignItems: 'center',
    paddingHorizontal: 12,
    minWidth: 60,
  },
  tabLabel: {
    color: '#64748B',
    fontSize: 9,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center',
  },
  activeTabLabel: {
    color: '#10B981',
  },
});
