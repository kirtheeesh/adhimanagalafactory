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
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    ScrollView,
    Platform
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { SERVER_URL } from '@shared/constants/ApiConfig';

export default function HourlyReports() {
    const router = useRouter();
    const [reports, setReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Filters
    const [searchOperator, setSearchOperator] = useState('');
    const [selectedShift, setSelectedShift] = useState('All');
    const [selectedMachine, setSelectedMachine] = useState('All');
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const fetchReports = useCallback(async () => {
        try {
            const res = await fetch(`${SERVER_URL}/hourly_logs`);
            if (res.ok) {
                const data = await res.json();
                setReports(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.log("Fetch Hourly Reports Error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchReports();
    }, [fetchReports]);

    const handleDownloadPDF = async (id: number) => {
        const url = `${SERVER_URL}/hourly_logs/${id}/pdf`;
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

    const filteredReports = reports.filter(r => {
        const opName = (r.operator_name || "").toLowerCase();
        const matchOperator = opName.includes(searchOperator.toLowerCase());
        const matchShift = selectedShift === 'All' || r.shift === selectedShift;
        const matchMachine = selectedMachine === 'All' || r.machine_name === selectedMachine;
        const matchDate = !selectedDate || new Date(r.timestamp).toDateString() === selectedDate.toDateString();
        return matchOperator && matchShift && matchMachine && matchDate;
    });

    const machines = ['All', ...new Set(reports.map(r => r.machine_name))];

    const renderReportCard = ({ item }: { item: any }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View>
                    <Text style={styles.operatorName}>{item.operator_name || 'N/A'}</Text>
                    <Text style={styles.machineName}>{item.machine_name || 'N/A'} | {item.shift || 'N/A'}</Text>
                    <Text style={styles.hourRange}>{item.hour_range || 'N/A'}</Text>
                </View>
                <TouchableOpacity style={styles.downloadBtn} onPress={() => handleDownloadPDF(item.id)}>
                    <Ionicons name="download-outline" size={20} color="white" />
                </TouchableOpacity>
            </View>
            
            <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Hourly Prod:</Text>
                    <Text style={styles.infoValue}>{item.hourly_output} PCS</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Total Output:</Text>
                    <Text style={styles.infoValue}>{item.total_output} PCS</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Date:</Text>
                    <Text style={styles.infoValue}>{new Date(item.timestamp).toLocaleDateString()}</Text>
                </View>
                
                <View style={styles.checkGrid}>
                    <CheckStatus label="Chiller" status={item.chiller_check} />
                    <CheckStatus label="Compressor" status={item.compressor_check} />
                    <CheckStatus label="Mould" status={item.mould_check} />
                    <CheckStatus label="Machine" status={item.machine_check} />
                </View>

                {item.remarks ? (
                    <View style={{marginTop: 10}}>
                        <Text style={styles.infoLabel}>Remarks:</Text>
                        <Text style={styles.remarksText}>{item.remarks}</Text>
                    </View>
                ) : null}
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
                <Text style={styles.title}>Hourly Reports</Text>
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
                                style={[styles.shiftTab, selectedShift === s ? styles.activeShiftTab : null, { marginRight: 8 }]}
                                onPress={() => setSelectedShift(s)}
                            >
                                <Text style={[styles.shiftTabText, selectedShift === s ? styles.activeShiftTabText : null]}>{s === 'All' ? 'All' : s.split(' ')[0]}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={[styles.filterRow, {marginTop: 8}]}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 20 }}>
                        {machines.map(m => (
                            <TouchableOpacity 
                                key={m} 
                                style={[styles.shiftTab, selectedMachine === m ? styles.activeMachineTab : null, { marginRight: 8 }]}
                                onPress={() => setSelectedMachine(m)}
                            >
                                <Text style={[styles.shiftTabText, selectedMachine === m ? styles.activeShiftTabText : null]}>{m}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <TouchableOpacity 
                        style={[styles.dateFilterBtn, selectedDate ? styles.activeDateFilterBtn : null]} 
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Ionicons name="calendar" size={18} color={selectedDate ? 'white' : '#94A3B8'} />
                        {selectedDate ? (
                            <TouchableOpacity onPress={() => setSelectedDate(null)} style={{marginLeft: 5}}>
                                <Ionicons name="close-circle" size={16} color="white" />
                            </TouchableOpacity>
                        ) : null}
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 50 }} />
            ) : (
                <FlatList
                    data={filteredReports}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderReportCard}
                    contentContainerStyle={styles.listContainer}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchReports(); }} tintColor="#3B82F6" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No hourly reports found.</Text>
                        </View>
                    }
                />
            )}

            {showDatePicker ? (
                Platform.OS === 'web' ? (
                    <View style={webDatePickerStyles.overlay}>
                        <View style={webDatePickerStyles.container}>
                            <Text style={webDatePickerStyles.title}>Select Date</Text>
                            <TextInput
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor="#475569"
                                style={webDatePickerStyles.input}
                                onChangeText={(val) => {
                                    if (val.length === 10) {
                                        const d = new Date(val);
                                        if (!isNaN(d.getTime())) {
                                            setSelectedDate(d);
                                            setShowDatePicker(false);
                                        }
                                    }
                                }}
                                autoFocus
                            />
                            <Text style={{color: '#64748B', fontSize: 12, marginTop: 10}}>Format: YYYY-MM-DD</Text>
                            <TouchableOpacity 
                                onPress={() => setShowDatePicker(false)} 
                                style={webDatePickerStyles.cancelBtn}
                            >
                                <Text style={webDatePickerStyles.cancelText}>CANCEL</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <DateTimePicker 
                        value={selectedDate || new Date()} 
                        mode="date" 
                        onChange={(event, date) => { 
                            setShowDatePicker(false); 
                            if (date) setSelectedDate(date); 
                        }} 
                    />
                )
            ) : null}
        </SafeAreaView>
    );
}

const CheckStatus = ({ label, status }: { label: string, status: boolean }) => (
    <View style={styles.checkItem}>
        <Ionicons 
            name={status ? "checkmark-circle" : "close-circle"} 
            size={16} 
            color={status ? "#10B981" : "#EF4444"} 
        />
        <Text style={[styles.checkText, { color: status ? "#10B981" : "#EF4444" }]}>{label}</Text>
    </View>
);

const webDatePickerStyles = StyleSheet.create({
    overlay: {
        position: 'absolute' as const,
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center' as const,
        alignItems: 'center' as const,
        zIndex: 2000
    },
    container: {
        backgroundColor: '#1E293B',
        padding: 25,
        borderRadius: 25,
        width: 320,
        alignItems: 'center' as const,
        borderWidth: 1,
        borderColor: '#334155',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 15
    },
    title: { color: 'white', fontWeight: 'bold' as const, fontSize: 20, marginBottom: 25 },
    input: {
        color: 'white',
        backgroundColor: '#0F172A',
        padding: 15,
        borderRadius: 12,
        width: '100%',
        height: 55,
        fontSize: 18,
        textAlign: 'center' as const,
        borderWidth: 1,
        borderColor: '#3B82F6'
    },
    cancelBtn: { marginTop: 25, padding: 15, width: '100%', alignItems: 'center' as const, backgroundColor: '#334155', borderRadius: 12 },
    cancelText: { color: '#94A3B8', fontWeight: 'bold' as const, fontSize: 16 }
});

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 15, marginTop: 5 },
    backBtn: { backgroundColor: '#1E293B', padding: 8, borderRadius: 10, marginRight: 12 },
    title: { color: 'white', fontSize: 20, fontWeight: '900' },
    filterContainer: { paddingHorizontal: 15, marginBottom: 8 },
    searchInput: { backgroundColor: '#1E293B', borderRadius: 10, padding: 10, color: 'white', borderWidth: 1, borderColor: '#334155', marginBottom: 8, fontSize: 13 },
    filterRow: { flexDirection: 'row', alignItems: 'center' },
    shiftTab: { backgroundColor: '#1E293B', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, borderWidth: 1, borderColor: '#334155' },
    activeShiftTab: { backgroundColor: '#10B981', borderColor: '#34D399' },
    activeMachineTab: { backgroundColor: '#F59E0B', borderColor: '#FBBF24' },
    shiftTabText: { color: '#64748B', fontSize: 11, fontWeight: 'bold' },
    activeShiftTabText: { color: 'white' },
    dateFilterBtn: { backgroundColor: '#1E293B', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#334155', flexDirection: 'row', alignItems: 'center', marginLeft: 6 },
    activeDateFilterBtn: { backgroundColor: '#3B82F6', borderColor: '#60A5FA' },
    listContainer: { padding: 15, paddingBottom: 150 },
    card: { backgroundColor: '#1E293B', borderRadius: 15, padding: 15, marginBottom: 12, borderWidth: 1, borderColor: '#334155' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
    operatorName: { color: 'white', fontSize: 16, fontWeight: 'bold' },
    machineName: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold', marginTop: 2 },
    hourRange: { color: '#3B82F6', fontSize: 11, fontWeight: 'bold', marginTop: 2 },
    downloadBtn: { backgroundColor: '#3B82F6', padding: 8, borderRadius: 10 },
    cardBody: { borderTopWidth: 1, borderTopColor: '#334155', paddingTop: 12 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    infoLabel: { color: '#64748B', fontSize: 12, fontWeight: 'bold' },
    infoValue: { color: 'white', fontSize: 12, fontWeight: '900' },
    checkGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
    checkItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0F172A', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, marginRight: 8, marginBottom: 8 },
    checkText: { fontSize: 10, fontWeight: 'bold', marginLeft: 4 },
    remarksText: { color: '#CBD5E1', fontSize: 12, marginTop: 4, fontStyle: 'italic' },
    emptyContainer: { alignItems: 'center', marginTop: 50 },
    emptyText: { color: '#64748B', fontSize: 16, fontWeight: 'bold' }
});