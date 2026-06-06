import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function AccountsFooter() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { id: 'ledger', label: 'Ledger', icon: 'book-outline', route: '/accounts/ledger' },
    { id: 'daybook', label: 'Day Book', icon: 'journal-outline', route: '/accounts/daybook' },
    { id: 'banks', label: 'Banks & Cash', icon: 'wallet-outline', route: '/accounts/banks' },
    { id: 'customers', label: 'Customer', icon: 'people-outline', route: '/accounts/customers' },
    { id: 'vendors', label: 'Vendors', icon: 'business-outline', route: '/accounts/vendors' },
  ];

  return (
    <View style={styles.footer}>
      {tabs.map((tab) => {
        const isActive = pathname.startsWith(tab.route);
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tab}
            onPress={() => router.replace(tab.route as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={24}
              color={isActive ? '#10B981' : '#94A3B8'}
            />
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
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
    height: 70,
    backgroundColor: '#1E293B',
    borderTopWidth: 1,
    borderTopColor: '#334155',
    paddingBottom: 10,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#94A3B8',
    marginTop: 4,
  },
  tabLabelActive: {
    color: '#10B981',
  },
});
