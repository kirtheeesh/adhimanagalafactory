import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useCallback } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    RefreshControl,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    TextInput,
    ScrollView,
    Platform,
    Modal,
    Linking
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as XLSX from 'xlsx';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { SERVER_URL } from '@shared/constants/ApiConfig';
import PHeadFooter from '@shared/components/PHeadFooter';

export default function HourlyReports() {
    const router = useRouter();
    const datePickerRef = React.useRef<any>(null);
    const [machines, setMachines] = useState<any[]>([]);
    const [selectedMachineId, setSelectedMachineId] = useState<string | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [hourlyLogs, setHourlyLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showMachineModal, setShowMachineModal] = useState(false);

    // Modal state
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<any>(null);
    const [goodParts, setGoodParts] = useState('');
    const [rejects, setRejects] = useState('');
    const [remarks, setRemarks] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchMachines = useCallback(async () => {
        try {
            const res = await fetch(`${SERVER_URL}/machines`);
            if (res.ok) {
                const data = await res.json();
                setMachines(Array.isArray(data) ? data : []);
                if (data.length > 0 && !selectedMachineId) {
                    setSelectedMachineId(data[0].id.toString());
                }
            }
        } catch (error) {
            console.log("Fetch Machines Error:", error);
        }
    }, [selectedMachineId]);

    const fetchHourlyLogs = useCallback(async () => {
        if (!selectedMachineId) return;
        setLoading(true);
        try {
            const dateStr = formatDate(selectedDate);
            const res = await fetch(`${SERVER_URL}/hourly_logs/${selectedMachineId}/${dateStr}`);
            if (res.ok) {
                const data = await res.json();
                setHourlyLogs(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.log("Fetch Hourly Logs Error:", error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [selectedMachineId, selectedDate]);

    useEffect(() => {
        fetchMachines();
    }, [fetchMachines]);

    useEffect(() => {
        fetchHourlyLogs();
    }, [fetchHourlyLogs]);

    const formatDate = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const findLogBySlot = (slotRange: string) => {
        return hourlyLogs.find(l => {
            if (!l.hour_range) return false;
            if (l.hour_range.trim() === slotRange.trim()) return true;

            // Robust comparison by converting both to HH:00 format
            const normalize = (rangeStr: string) => {
                try {
                    const startPart = rangeStr.split('-')[0].trim();
                    const match = startPart.match(/(\d+):(\d+)\s*(AM|PM)?/i);
                    if (!match) return rangeStr;
                    
                    let h = parseInt(match[1]);
                    const m = match[2];
                    const ampm = match[3];
                    
                    if (ampm) {
                        if (ampm.toUpperCase() === 'PM' && h < 12) h += 12;
                        if (ampm.toUpperCase() === 'AM' && h === 12) h = 0;
                    }
                    return `${h.toString().padStart(2, '0')}:${m}`;
                } catch (e) {
                    return rangeStr;
                }
            };

            return normalize(l.hour_range) === normalize(slotRange);
        });
    };

    const handleEditSlot = (slot: any) => {
        const log = findLogBySlot(slot.range);
        setSelectedSlot(slot);
        setGoodParts(log ? log.good_parts?.toString() : '');
        setRejects(log ? log.rejects?.toString() : '');
        setRemarks(log ? log.remarks || '' : '');
        setShowEditModal(true);
    };

    const exportToExcel = async () => {
        if (hourlyLogs.length === 0) {
            Alert.alert("No Data", "There is no data to export.");
            return;
        }

        try {
            const machine = machines.find(m => m.id.toString() === selectedMachineId);
            const machineName = machine?.machine_name || `UNIT ${selectedMachineId}`;
            const dateStr = formatDate(selectedDate);

            // Format data as per the image (two sets of columns: 0-11 and 12-23)
            const excelData = [];
            
            // Header row
            excelData.push(["Hour", "Good Parts", "Rejects", " ", "Hour", "Good Parts", "Rejects"]);

            for (let i = 0; i < 12; i++) {
                const slot1 = slots[i];
                const log1 = findLogBySlot(slot1.range);
                
                const slot2 = slots[i + 12];
                const log2 = findLogBySlot(slot2.range);

                // Logic for slot 1
                let g1: any = log1 ? log1.good_parts : "-";
                let r1: any = log1 ? log1.rejects : "-";
                
                // Logic for slot 2
                let g2: any = log2 ? log2.good_parts : "-";
                let r2: any = log2 ? log2.rejects : "-";

                excelData.push([
                    slot1.range.split(' - ')[0], g1, r1,
                    " ",
                    slot2.range.split(' - ')[0], g2, r2
                ]);
            }

            const ws = XLSX.utils.aoa_to_sheet(excelData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "Hourly Report");

            const fileName = `HourlyReport_${machineName.replace(/\s+/g, '_')}_${dateStr}.xlsx`;

            if (Platform.OS === 'web') {
                XLSX.writeFile(wb, fileName);
            } else {
                const wbout = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
                const uri = FileSystem.cacheDirectory + fileName;

                await FileSystem.writeAsStringAsync(uri, wbout, {
                    encoding: FileSystem.EncodingType.Base64,
                });

                await Sharing.shareAsync(uri, {
                    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                    dialogTitle: 'Export Hourly Production Report',
                    UTI: 'com.microsoft.excel.xlsx',
                });
            }
        } catch (error: any) {
            Alert.alert("Error", "Failed to export Excel: " + error.message);
        }
    };

    const downloadPDF = async () => {
        if (!selectedMachineId) {
            Alert.alert("Error", "Please select a machine first");
            return;
        }
        const dateStr = formatDate(selectedDate);
        const url = `${SERVER_URL}/reports/production_hourly?date=${dateStr}&machine_id=${selectedMachineId}`;
        
        try {
            const supported = await Linking.canOpenURL(url);
            if (supported) {
                await Linking.openURL(url);
            } else {
                Alert.alert("Error", "Cannot open PDF URL: " + url);
            }
        } catch (error) {
            Alert.alert("Error", "Failed to download PDF report");
        }
    };

    const submitEdit = async () => {
        if (!goodParts.trim()) {
            Alert.alert("Required", "Please enter Good Parts count");
            return;
        }

        setIsSubmitting(true);
        const machine = machines.find(m => m.id.toString() === selectedMachineId);
        
        const payload = {
            machine_id: selectedMachineId,
            machine_name: machine?.machine_name || `UNIT ${selectedMachineId}`,
            hour_range: selectedSlot.range,
            hour_slot_from: selectedSlot.range.split('-')[0].trim(),
            hour_slot_to: selectedSlot.range.split('-')[1].trim(),
            production_date: formatDate(selectedDate),
            good_parts: parseInt(goodParts) || 0,
            rejects: parseInt(rejects) || 0,
            remarks: remarks,
            status: 'approved',
            is_edited_by_head: true,
            edited_by: 'Production Head',
            edited_at: new Date().toISOString()
        };

        try {
            const res = await fetch(`${SERVER_URL}/hourly_logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                Alert.alert("Success", "Hourly log updated successfully");
                setShowEditModal(false);
                fetchHourlyLogs();
            } else {
                Alert.alert("Error", "Failed to update hourly log");
            }
        } catch (error) {
            Alert.alert("Error", "Connection failed");
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderSlot = (slot: any) => {
        const log = findLogBySlot(slot.range);
        
        return (
            <TouchableOpacity 
                key={slot.range}
                style={[
                    styles.slotItem, 
                    log && styles.slotRecorded,
                    !log && styles.slotPending
                ]}
                onPress={() => handleEditSlot(slot)}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.slotRangeText}>{slot.range}</Text>
                        <Text style={styles.slotStatusText}>{log ? 'RECORDED' : 'NOT RECORDED'}</Text>
                    </View>
                    {log && (
                        <View style={{ flexDirection: 'row' }}>
                            <Ionicons name={log.chiller_check ? "checkmark-circle" : "close-circle"} size={16} color={log.chiller_check ? "#10B981" : "#EF4444"} />
                            <Ionicons name={log.compressor_check ? "checkmark-circle" : "close-circle"} size={16} color={log.compressor_check ? "#10B981" : "#EF4444"} style={{ marginLeft: 4 }} />
                            <Ionicons name={log.mould_check ? "checkmark-circle" : "close-circle"} size={16} color={log.mould_check ? "#10B981" : "#EF4444"} style={{ marginLeft: 4 }} />
                            <Ionicons name={log.machine_check ? "checkmark-circle" : "close-circle"} size={16} color={log.machine_check ? "#10B981" : "#EF4444"} style={{ marginLeft: 4 }} />
                        </View>
                    )}
                </View>
                {log && <Text style={styles.slotDataText}>G: {log.good_parts} R: {log.rejects}</Text>}
            </TouchableOpacity>
        );
    };

    const slots = Array.from({ length: 24 }, (_, i) => {
        const start = i;
        const end = (i + 1) % 24;
        const range = `${start.toString().padStart(2, '0')}:00 - ${end.toString().padStart(2, '0')}:00`;
        return { start, end, range };
    });

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View style={{ flex: 1 }}>
                    <Text style={styles.title}>Hourly Production Logs</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity onPress={exportToExcel} style={styles.exportBtn}>
                        <Ionicons name="document-text-outline" size={18} color="white" />
                        <Text style={[styles.exportBtnText, { marginLeft: 4 }]}>EXCEL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={downloadPDF} style={[styles.exportBtn, { backgroundColor: '#EF4444', marginLeft: 10 }]}>
                        <Ionicons name="download-outline" size={18} color="white" />
                        <Text style={[styles.exportBtnText, { marginLeft: 4 }]}>PDF</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.filterSection}>
                <Text style={styles.sectionLabel}>SELECT MACHINE</Text>
                <TouchableOpacity 
                    style={styles.dropdownBtn}
                    onPress={() => setShowMachineModal(true)}
                >
                    <Text style={styles.dropdownBtnText}>
                        {machines.find(m => m.id.toString() === selectedMachineId)?.machine_name || (selectedMachineId ? `UNIT ${selectedMachineId}` : 'Select Machine')}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#3B82F6" />
                </TouchableOpacity>

                <View style={styles.dateRow}>
                    <Text style={styles.sectionLabel}>PRODUCTION DATE: {formatDate(selectedDate)}</Text>
                    <TouchableOpacity 
                        style={styles.dateBtn}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Ionicons name="calendar" size={20} color="#3B82F6" />
                    </TouchableOpacity>
                </View>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#3B82F6" style={{ marginTop: 50 }} />
            ) : (
                <ScrollView 
                    style={styles.gridWrapper}
                    contentContainerStyle={{ paddingBottom: 100 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchHourlyLogs(); }} tintColor="#3B82F6" />}
                >
                    <View style={styles.gridContainer}>
                        {slots.map(renderSlot)}
                    </View>
                </ScrollView>
            )}

            <Modal visible={showEditModal} animationType="fade" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <Text style={styles.modalTitle}>EDIT HOURLY LOG</Text>
                        <Text style={styles.modalSubTitle}>{selectedSlot?.range}</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>GOOD PARTS</Text>
                            <TextInput 
                                style={styles.input} 
                                value={goodParts} 
                                onChangeText={setGoodParts} 
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor="#475569"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>REJECTS</Text>
                            <TextInput 
                                style={styles.input} 
                                value={rejects} 
                                onChangeText={setRejects} 
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor="#475569"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.inputLabel}>REMARKS</Text>
                            <TextInput 
                                style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
                                value={remarks} 
                                onChangeText={setRemarks} 
                                multiline
                                placeholder="Add observations..."
                                placeholderTextColor="#475569"
                            />
                        </View>

                        <View style={styles.modalBtnRow}>
                            <TouchableOpacity 
                                style={[styles.modalBtn, { backgroundColor: '#334155' }]} 
                                onPress={() => setShowEditModal(false)}
                            >
                                <Text style={styles.modalBtnText}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.modalBtn, { backgroundColor: '#3B82F6' }]} 
                                onPress={submitEdit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.modalBtnText}>SAVE CHANGES</Text>}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {showDatePicker && (
                Platform.OS === 'web' ? (
                    <Modal transparent animationType="fade" visible={showDatePicker}>
                        <View style={styles.modalOverlay}>
                            <View style={styles.modalContainer}>
                                <Text style={styles.modalTitle}>SELECT DATE</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="YYYY-MM-DD"
                                    placeholderTextColor="#475569"
                                    defaultValue={formatDate(selectedDate)}
                                    onChangeText={(val) => {
                                        if (val.length === 10) {
                                            const d = new Date(val);
                                            if (!isNaN(d.getTime())) {
                                                setSelectedDate(d);
                                                setShowDatePicker(false);
                                            }
                                        }
                                    }}
                                />
                                <TouchableOpacity 
                                    style={[styles.modalBtn, { backgroundColor: '#334155', marginTop: 15 }]} 
                                    onPress={() => setShowDatePicker(false)}
                                >
                                    <Text style={styles.modalBtnText}>CANCEL</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </Modal>
                ) : (
                    <DateTimePicker 
                        value={selectedDate} 
                        mode="date" 
                        onChange={(event, date) => {
                            setShowDatePicker(false);
                            if (date) setSelectedDate(date);
                        }}
                    />
                )
            )}

            <Modal visible={showMachineModal} transparent animationType="slide">
                <View style={styles.dropdownModalOverlay}>
                    <View style={styles.dropdownModalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>SELECT MACHINE</Text>
                            <TouchableOpacity onPress={() => setShowMachineModal(false)}>
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={{ maxHeight: 400 }}>
                            {machines.map((m) => (
                                <TouchableOpacity
                                    key={m.id}
                                    style={[
                                        styles.dropdownItem,
                                        selectedMachineId === m.id.toString() && styles.activeDropdownItem
                                    ]}
                                    onPress={() => {
                                        setSelectedMachineId(m.id.toString());
                                        setShowMachineModal(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.dropdownItemText,
                                        selectedMachineId === m.id.toString() && styles.activeDropdownItemText
                                    ]}>
                                        {m.machine_name || `UNIT ${m.id}`}
                                    </Text>
                                    {selectedMachineId === m.id.toString() && (
                                        <Ionicons name="checkmark" size={20} color="#3B82F6" />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <PHeadFooter />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    header: { flexDirection: 'row', alignItems: 'center', padding: 15 },
    backBtn: { backgroundColor: '#1E293B', padding: 8, borderRadius: 10, marginRight: 10 },
    title: { color: 'white', fontSize: 16, fontWeight: '900' },
    exportBtn: { 
        backgroundColor: '#10B981', 
        flexDirection: 'row', 
        alignItems: 'center', 
        paddingHorizontal: 10, 
        paddingVertical: 6, 
        borderRadius: 8
    },
    exportBtnText: { color: 'white', fontWeight: 'bold', fontSize: 10 },
    filterSection: { paddingHorizontal: 15, marginBottom: 12 },
    sectionLabel: { color: '#64748B', fontSize: 9, fontWeight: '900', marginBottom: 8 },
    dropdownBtn: { 
        backgroundColor: '#1E293B', 
        paddingVertical: 10, 
        paddingHorizontal: 15, 
        borderRadius: 10, 
        borderWidth: 1, 
        borderColor: '#334155',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5
    },
    dropdownBtnText: { color: 'white', fontSize: 13, fontWeight: 'bold' },
    dropdownModalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
    dropdownModalContent: { 
        backgroundColor: '#1E293B', 
        borderTopLeftRadius: 25, 
        borderTopRightRadius: 25, 
        padding: 20, 
        maxHeight: '70%',
        borderWidth: 1,
        borderColor: '#334155'
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    dropdownItem: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        paddingVertical: 15, 
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#334155'
    },
    activeDropdownItem: { backgroundColor: 'rgba(59, 130, 246, 0.1)' },
    dropdownItemText: { color: '#94A3B8', fontSize: 14, fontWeight: '600' },
    activeDropdownItemText: { color: '#3B82F6', fontWeight: 'bold' },
    dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
    dateBtn: { backgroundColor: '#1E293B', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: '#334155' },
    gridWrapper: { flex: 1 },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', padding: 12 },
    slotItem: { width: '48.5%', backgroundColor: '#1E293B', padding: 10, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
    slotRecorded: { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.05)' },
    slotPending: { borderColor: '#334155', opacity: 0.7 },
    slotRangeText: { color: 'white', fontWeight: 'bold', fontSize: 11 },
    slotStatusText: { color: '#64748B', fontSize: 8, fontWeight: '900', marginTop: 4 },
    slotDataText: { color: '#10B981', fontSize: 11, fontWeight: 'bold', marginTop: 4 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { backgroundColor: '#1E293B', borderRadius: 20, padding: 20, width: '92%', maxWidth: 400, borderWidth: 1, borderColor: '#334155' },
    modalTitle: { fontSize: 16, fontWeight: '900', color: '#3B82F6', textAlign: 'center' },
    modalSubTitle: { fontSize: 12, fontWeight: 'bold', color: 'white', textAlign: 'center', marginBottom: 15, marginTop: 5 },
    inputGroup: { marginBottom: 12 },
    inputLabel: { color: '#94A3B8', fontSize: 9, fontWeight: 'bold', marginBottom: 5 },
    input: { backgroundColor: '#0F172A', borderRadius: 10, padding: 10, color: 'white', fontWeight: 'bold', borderWidth: 1, borderColor: '#334155' },
    modalBtnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
    modalBtn: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center', marginHorizontal: 5 },
    modalBtnText: { color: 'white', fontWeight: 'bold', fontSize: 13 }
});
