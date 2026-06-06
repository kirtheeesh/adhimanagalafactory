import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import your central API config
import { SERVER_URL } from '@shared/constants/ApiConfig';
import PHeadFooter from '@shared/components/PHeadFooter';

// --- TYPES ---
interface Machine {
    id: string; 
    machine_name: string;
    status: string;
    total_output: number;
    accumulated_output: number;
    cycle_timing: number;
    start_time: string | null; 
    resume_time: string | null;
    material_type: string;
    material_type_1?: string;
    material_qty_1?: number;
    material_type_2?: string;
    material_qty_2?: number;
    material_type_3?: string;
    material_qty_3?: number;
    material_type_4?: string;
    material_qty_4?: number;
    material_color?: string;
    color_qty?: number;
    mold_type: string;
    cavity: string;
    shift: string;
    operator_name?: string;
}

// --- SUB-COMPONENT: HANDLES THE LIVE MATH ---
const LiveOutputText = ({ item }: { item: Machine }) => {
    const [count, setCount] = useState(item.total_output || 0);

    useEffect(() => {
        let interval: any = null; 

        const status = item.status?.toLowerCase();
        const isRunning = status === 'running';

        if (isRunning) {
            const updateCount = () => {
                const startTimeStr = item.resume_time || item.start_time;
                if (!startTimeStr) {
                    setCount(item.accumulated_output || 0);
                    return;
                }

                const start = new Date(startTimeStr).getTime();
                const now = new Date().getTime();
                
                const timing = Math.max(1, item.cycle_timing || 5);
                const cav = Math.max(1, parseInt(item.cavity) || 1);
                const accumulated = item.accumulated_output || 0;

                const diffSeconds = Math.floor((now - start) / 1000);
                const sessionOutput = Math.floor(diffSeconds / timing) * cav; 
                
                const newTotal = accumulated + sessionOutput;
                setCount(newTotal > 0 ? newTotal : accumulated);
            };

            updateCount(); // Run immediately on load
            interval = setInterval(updateCount, 1000); 
        } else {
            // If idle/paused, show the exact value from the database
            // Note: the backend sets total_output = accumulated_output when pausing/stopping
            setCount(item.total_output || 0);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [item.status, item.start_time, item.resume_time, item.total_output, item.accumulated_output, item.cycle_timing, item.cavity]);

    return (
        <Text style={styles.statVal}>
            {count} <Text style={styles.unitText}>PCS</Text>
        </Text>
    );
};

// --- MAIN MONITORING SCREEN ---
export default function MonitoringScreen() {
    const router = useRouter();
    const [machines, setMachines] = useState<Machine[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch data from machine_status table
    const fetchStatus = async () => {
        try {
            const response = await fetch(`${SERVER_URL}/machines`);
            const data = await response.json();
            if (Array.isArray(data)) {
                // Keep machines in order 1, 2, 3...
                setMachines(data.sort((a, b) => Number(a.id) - Number(b.id)));
            }
        } catch (error) {
            console.error("Fetch Error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchStatus();
        // Background sync every 10 seconds to get status changes (Running/Idle)
        const syncInterval = setInterval(fetchStatus, 10000); 
        return () => clearInterval(syncInterval);
    }, []);

    const getStatusColor = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'running') return '#10B981'; // Green
        if (s === 'idle') return '#64748B';    // Gray
        if (s === 'stop') return '#EF4444';    // Red
        return '#F59E0B';                      // Orange (Paused/Power Cut)
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <StatusBar barStyle="light-content" />
            
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.title}>Unit Monitoring</Text>
                    <Text style={styles.subtitle}>{machines.length} Machines reporting live</Text>
                </View>
            </View>

            {loading ? (
                <View style={styles.centered}>
                    <ActivityIndicator size="large" color="#10B981" />
                </View>
            ) : (
                <FlatList
                    data={machines}
                    keyExtractor={(item) => item.id.toString()}
                    numColumns={1}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl 
                            refreshing={refreshing} 
                            onRefresh={() => {setRefreshing(true); fetchStatus();}} 
                            tintColor="#10B981" 
                        />
                    }
                    renderItem={({ item }) => (
                        <View style={styles.wideCard}>
                            {/* TOP SECTION */}
                            <View style={styles.cardHeader}>
                                <View style={{ flex: 1, marginRight: 10 }}>
                                    <Text style={styles.unitNum}>{item.machine_name || `UNIT ${item.id}`}</Text>
                                    {item.operator_name && (
                                        <View style={styles.operatorRow}>
                                            <Ionicons name="person" size={10} color="#94A3B8" />
                                            <Text style={styles.operatorText}>{item.operator_name.toUpperCase()}</Text>
                                        </View>
                                    )}
                                    <View style={styles.statusRow}>
                                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(item.status) }]} />
                                        <Text style={[styles.statusLabel, { color: getStatusColor(item.status) }]}>
                                            {item.status?.toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.shiftBadge}>
                                    <Text style={styles.shiftText}>{item.shift?.toUpperCase() || 'NO SHIFT'}</Text>
                                </View>
                            </View>

                            {/* OUTPUT SECTION */}
                            <View style={styles.mainStats}>
                                <View>
                                    <Text style={styles.statLabel}>
                                        {item.status?.toLowerCase() === 'running' ? 'ACTUAL OUTPUT (LIVE)' : 'TOTAL OUTPUT'}
                                    </Text>
                                    <LiveOutputText item={item} />
                                </View>
                            </View>

                            <View style={styles.divider} />

                            {/* DETAILS VERTICAL LIST FOR MOBILE */}
                            <View style={styles.detailGrid}>
                                <View style={[styles.detailBox, { marginBottom: 10 }]}>
                                    <Text style={styles.detailLabel}>MATERIAL</Text>
                                    {(() => {
                                        const mats = [
                                            { type: item.material_type_1, qty: item.material_qty_1 },
                                            { type: item.material_type_2, qty: item.material_qty_2 },
                                            { type: item.material_type_3, qty: item.material_qty_3 },
                                            { type: item.material_type_4, qty: item.material_qty_4 },
                                            { type: item.material_color, qty: item.color_qty }
                                        ].filter(m => m.type && m.type !== 'None' && m.type !== 'N/A');

                                        if (mats.length === 0) {
                                            return <Text style={styles.detailVal}>N/A</Text>;
                                        }

                                        return mats.map((m, idx) => (
                                            <Text key={idx} style={[styles.detailVal, { fontSize: 11, marginBottom: 2 }]}>
                                                {m.type} ({m.qty || 0} KG)
                                            </Text>
                                        ));
                                    })()}
                                </View>
                                
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <View style={[styles.detailBox, { flex: 2, marginRight: 10 }]}>
                                        <Text style={styles.detailLabel}>MOLD TYPE</Text>
                                        <Text style={styles.detailVal}>{item.mold_type || 'N/A'}</Text>
                                    </View>
                                    <View style={[styles.detailBox, { flex: 1 }]}>
                                        <Text style={styles.detailLabel}>CAVITY</Text>
                                        <Text style={styles.detailVal}>{item.cavity || 'N/A'}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    )}
                />
            )}
            <PHeadFooter />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 15 },
    backBtn: { marginRight: 15, padding: 8, backgroundColor: '#1E293B', borderRadius: 10 },
    title: { color: 'white', fontSize: 20, fontWeight: 'bold' },
    subtitle: { color: '#64748B', fontSize: 12 },
    listContainer: { paddingHorizontal: 12, paddingBottom: 30 },
    wideCard: {
        backgroundColor: '#1E293B',
        borderRadius: 16,
        padding: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#334155',
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    unitNum: { color: '#F59E0B', fontSize: 16, fontWeight: '900' },
    operatorRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
    operatorText: { color: '#94A3B8', fontSize: 10, fontWeight: 'bold', marginLeft: 4 },
    statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    statusDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
    statusLabel: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
    shiftBadge: { backgroundColor: '#334155', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
    shiftText: { color: '#94A3B8', fontSize: 9, fontWeight: 'bold' },
    mainStats: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 15 },
    statLabel: { color: '#64748B', fontSize: 9, fontWeight: 'bold' },
    statVal: { color: 'white', fontSize: 24, fontWeight: '900' },
    unitText: { fontSize: 12, color: '#475569' },
    divider: { height: 1, backgroundColor: '#334155', marginVertical: 12, opacity: 0.5 },
    detailGrid: { flexDirection: 'column' },
    detailBox: { width: '100%' },
    detailLabel: { color: '#475569', fontSize: 8, fontWeight: 'bold', marginBottom: 4 },
    detailVal: { color: '#CBD5E1', fontSize: 11, fontWeight: '600' },
});