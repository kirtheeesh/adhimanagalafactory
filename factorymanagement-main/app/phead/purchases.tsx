import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PHeadFooter from '@shared/components/PHeadFooter';

export default function PurchaseMenuScreen() {
    const router = useRouter();

    const menuItems = [
        {
            title: 'Purchase Request',
            subtitle: 'Create a new procurement request for materials, colors or molds',
            icon: 'cart',
            color: '#E11D48',
            route: '/phead/purchase_request'
        },
        {
            title: 'Purchase History',
            subtitle: 'View previous purchase invoices and approved procurement logs',
            icon: 'receipt',
            color: '#10B981',
            route: '/phead/purchase_history'
        }
    ];

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="chevron-back" size={24} color="#0EA5E9" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.title}>Purchases</Text>
                    <Text style={styles.subtitle}>Procurement Management</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={styles.menuList}>
                {menuItems.map((item, index) => (
                    <TouchableOpacity 
                        key={index} 
                        style={styles.menuCard}
                        onPress={() => router.push(item.route as any)}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
                            <Ionicons name={item.icon as any} size={32} color={item.color} />
                        </View>
                        <View style={styles.textContainer}>
                            <Text style={styles.itemTitle}>{item.title}</Text>
                            <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#334155" />
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <PHeadFooter />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        padding: 20, 
        backgroundColor: '#1E293B', 
        borderBottomLeftRadius: 25, 
        borderBottomRightRadius: 25, 
        marginBottom: 20 
    },
    backBtn: { marginRight: 15, padding: 8, backgroundColor: '#0F172A', borderRadius: 12 },
    title: { color: 'white', fontSize: 24, fontWeight: '900' },
    subtitle: { color: '#64748B', fontSize: 13, fontWeight: 'bold' },
    menuList: { padding: 20 },
    menuCard: { 
        backgroundColor: '#1E293B', 
        borderRadius: 20, 
        padding: 20, 
        flexDirection: 'row', 
        alignItems: 'center', 
        borderWidth: 1, 
        borderColor: '#334155',
        marginBottom: 15
    },
    iconContainer: { 
        width: 60, 
        height: 60, 
        borderRadius: 15, 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginRight: 15 
    },
    textContainer: { flex: 1 },
    itemTitle: { color: 'white', fontSize: 18, fontWeight: '800', marginBottom: 4 },
    itemSubtitle: { color: '#94A3B8', fontSize: 12, lineHeight: 18 }
});
