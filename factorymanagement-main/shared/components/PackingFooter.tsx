import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function PackingFooter() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const tabs = [
    { id: '/packing/packing_list', label: 'Packing List', icon: 'list' },
    { id: '/packing/finished_products', label: 'Create Finished', icon: 'add-circle' },
    { id: '/packing/inventory', label: 'Inventory', icon: 'cube' },
    { id: '/packing/packing_material', label: 'Packing Material', icon: 'archive' },
    { id: '/packing/packing_sticker', label: 'Stickers', icon: 'pricetag' },
    { id: '/packing/scan_qr', label: 'Scan QR', icon: 'qr-code' },
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
                size={22} 
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
    minWidth: 75,
  },
  tabLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
    textAlign: 'center'
  },
  activeTabLabel: {
    color: '#10B981',
  },
});
