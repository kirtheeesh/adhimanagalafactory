import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Linking,
    RefreshControl,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { SERVER_URL } from '@shared/constants/ApiConfig';
import PHeadFooter from '@shared/components/PHeadFooter';

export default function OperatorShiftReports() {
    const router = useRouter();
    const datePickerRef = React.useRef<any>(null);
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Filters
    const [searchOperator, setSearchOperator] = useState('');
    const [selectedShift, setSelectedShift] = useState('All');
    const [selectedMachine, setSelectedMachine] = useState('All'); // NEW
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const fetchReports = useCallback(async () => {
        try {
            const res = await fetch(`${SERVER_URL}/operator_report`);
            if (res.ok) {
                const data = await res.json();
                setReports(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.log("Fetch Reports Error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleDownloadPDF = async (id: number) => {
        const url = `${SERVER_URL}/operator_report/${id}/pdf`;
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert("Error", "Cannot open URL: " + url);
            }
        } catch (e) {
            Alert.alert("Error", "Failed to download PDF.");
        }
    };

    const formatDate = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const filteredReports = reports.filter(r => {
        const matchOperator = r.operator_name?.toLowerCase().includes(searchOperator.toLowerCase());
        const matchShift = selectedShift === 'All' || r.shift === selectedShift;
        const matchMachine = selectedMachine === 'All' || r.machine_name === selectedMachine;
        
        let matchDate = true;
        if (selectedDate) {
            const reportDateStr = formatDate(new Date(r.timestamp));
            const selectedDateStr = formatDate(selectedDate);
            matchDate = reportDateStr === selectedDateStr;
        }
        
        return matchOperator && matchShift && matchMachine && matchDate;
    });

    const machines = ['All', ...new Set(reports.map(r => r.machine_name))];

    const renderReportCard = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.operatorName}>{item.operator_name}</Text>
                    <Text style={styles.machineName}>{item.machine_name} | {item.shift}</Text>
                </View>
                <TouchableOpacity style={styles.downloadBtn} onPress={() => handleDownloadPDF(item.id)}>
                    <Ionicons name="download-outline" size={20} color="white" />
                </TouchableOpacity>
            </View>
            
            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Total Count:</Text>
                    <Text style={styles.infoValue}>{item.total_production_count} PCS</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Total Weight:</Text>
                    <Text style={styles.infoValue}>{parseFloat(item.total_production_weight_gm).toFixed(2)} gm ({parseFloat(item.total_production_weight_kg).toFixed(2)} kg)</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Date:</Text>
                    <Text style={styles.infoValue}>{formatDate(new Date(item.timestamp))}</Text>
                </View>
                <Text style={styles.wastageLabel}>Wastage:</Text>
                <Text style={styles.wastageText}>{item.wastage || 'None'}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.title}>Shift Reports</Text>
            </View>

            <View style={styles.filterContainer}>
                <TextInput 
                    style={styles.searchInput} 
                    placeholder="Search Operator..." 
                    placeholderTextColor="#64748B"
                    value={searchOperator}
                    onChangeText={setSearchOperator}
                />
                
                <View style={styles.filterRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {['All', 'Day Shift', 'Night Shift'].map(s => (
                            <TouchableOpacity 
                                key={s} 
                                style={[styles.shiftTab, selectedShift === s && styles.activeShiftTab, { marginRight: 8 }]}
                                onPress={() => setSelectedShift(s)}
                            >
                                <Text style={[styles.shiftTabText, selectedShift === s && styles.activeShiftTabText]}>{s === 'All' ? 'All' : s.split(' ')[0]}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={[styles.filterRow, {marginTop: 8}]}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {machines.map(m => (
                            <TouchableOpacity 
                                key={m} 
                                style={[styles.shiftTab, selectedMachine === m && styles.activeMachineTab, { marginRight: 8 }]}
                                onPress={() => setSelectedMachine(m)}
                            >
                                <Text style={[styles.shiftTabText, selectedMachine === m && styles.activeShiftTabText]}>{m}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity 
                        style={[styles.dateFilterBtn, selectedDate && styles.activeDateFilterBtn]} 
                        onPress={() => {
                            if (Platform.OS === 'web') {
                                datePickerRef.current?.showPicker?.();
                            } else {
                                setShowDatePicker(true);
                            }
                        }}
                    >
                        <Ionicons name="calendar" size={18} color={selectedDate ? 'white' : '#94A3B8'} />
                        {selectedDate && (
                            <TouchableOpacity onPress={(e) => {
                                e.stopPropagation();
                                setSelectedDate(null);
                            }} style={{marginLeft: 5}}>
                                <Ionicons name="close-circle" size={16} color="white" />
                            </TouchableOpacity>
                        )}
                        {Platform.OS === 'web' && (
                            <input 
                                ref={datePickerRef}
                                type="date"
                                style={{ 
                                    position: 'absolute', 
                                    width: 1, 
                                    height: 1, 
                                    opacity: 0,
                                    bottom: 0,
                                    left: 0,
                                    pointerEvents: 'none'
                                }}
                                value={selectedDate ? formatDate(selectedDate) : ''}
                                onChange={(e: any) => {
                                    const val = e.target.value;
                                    if (val) {
                                        const [y, m, d] = val.split('-').map(Number);
                                        setSelectedDate(new Date(y, m - 1, d));
                                    }
                                }}
                            />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={filteredReports}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderReportCard}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchReports(); }} tintColor="#10B981" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No shift reports found.</Text>
                        </View>
                    }
                />
            )}

            {showDatePicker && Platform.OS !== 'web' && (
                <DateTimePicker 
                    value={selectedDate || new Date()} 
                    mode="date" 
                    onChange={(event, date) => { 
                        if (Platform.OS === 'android') {
                            setShowDatePicker(false); 
                        }
                        if (date) setSelectedDate(date); 
                    }} 
                />
            )}

            <PHeadFooter />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 15, marginTop: 5 },
    backBtn: { backgroundColor: '#1E293B', padding: 8, borderRadius: 10, marginRight: 12 },
    title: { color: 'white', fontSize: 18, fontWeight: '900' },
    filterContainer: { paddingHorizontal: 15, marginBottom: 8 },
    searchInput: { backgroundColor: '#1E293B', borderRadius: 10, padding: 10, color: 'white', borderWidth: 1, borderColor: '#334155', marginBottom: 8, fontSize: 12 },
    filterRow: { flexDirection: 'row', alignItems: 'center' },
    shiftTab: { backgroundColor: '#1E293B', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
    activeShiftTab: { backgroundColor: '#10B981', borderColor: '#34D399' },
    activeMachineTab: { backgroundColor: '#F59E0B', borderColor: '#FBBF24' },
    shiftTabText: { color: '#64748B', fontSize: 10, fontWeight: 'bold' },
    activeShiftTabText: { color: 'white' },
    dateFilterBtn: { backgroundColor: '#1E293B', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#334155', flexDirection: 'row', alignItems: 'center' },
    activeDateFilterBtn: { backgroundColor: '#3B82F6', borderColor: '#60A5FA' },
    listContainer: { padding: 12, paddingBottom: 100 },
    card: { backgroundColor: '#1E293B', borderRadius: 16, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    operatorName: { color: 'white', fontSize: 15, fontWeight: 'bold' },
    machineName: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold', marginTop: 2 },
    downloadBtn: { backgroundColor: '#3B82F6', padding: 8, borderRadius: 10 },
    cardBody: { borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 12 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    infoLabel: { color: '#64748B', fontSize: 11, fontWeight: 'bold' },
    infoValue: { color: 'white', fontSize: 11, fontWeight: '900' },
    wastageLabel: { color: '#64748B', fontSize: 10, fontWeight: 'bold', marginTop: 8 },
    wastageText: { color: '#CBD5E1', fontSize: 11, marginTop: 3, fontStyle: 'italic' },
    emptyContainer: { alignItems: 'center', marginTop: 40 },
    emptyText: { color: '#64748B', fontSize: 14, fontWeight: 'bold' }
});
