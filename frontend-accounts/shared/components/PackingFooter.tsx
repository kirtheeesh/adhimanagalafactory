import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PackingFooter() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { id: '/packing/packing_list', label: 'Packing List', icon: 'cube' },
    { id: '/packing/packing_sticker', label: 'Stickers', icon: 'pricetag' },
  ];

  return (
    <View style={styles.footer}>
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
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#334155',
    justifyContent: 'space-around',
    paddingBottom: 25,
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
