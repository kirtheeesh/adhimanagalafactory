import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { SERVER_URL } from '@shared/constants/ApiConfig';

export default function QAScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [machines, setMachines] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMachine, setSelectedMachine] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleString());
    const [isSaving, setIsSaving] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const HOURS = [
        '12 AM', '1 AM', '2 AM', '3 AM', '4 AM', '5 AM', '6 AM', '7 AM', '8 AM', '9 AM', '10 AM', '11 AM',
        '12 PM', '1 PM', '2 PM', '3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'
    ];

    // --- QC INPUT STATES ---
    const [startHour, setStartHour] = useState('');
    const [endHour, setEndHour] = useState('');
    const [lastHourProd, setLastHourProd] = useState('');
    const [avgWeight, setAvgWeight] = useState('');
    const [rejectionPcs, setRejectionPcs] = useState('');
    const [qcRemarks, setQcRemarks] = useState('');

    const fetchMachines = async () => {
        if (modalVisible) return; // Optimization: Don't fetch while modal is open to avoid interrupting user input
        try {
            const res = await fetch(`${SERVER_URL}/machines`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setMachines(data);
                
                // Update selected machine details if modal is open
                setSelectedMachine((prev: any) => {
                    if (!prev) return null;
                    return data.find((m: any) => (m.id || m.machine_id) === (prev.id || prev.machine_id)) || prev;
                });
            }
        } catch (e) { 
            console.log("Network Error"); 
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMachines();
        const interval = setInterval(fetchMachines, 5000); // Throttled to 5s
        const timer = setInterval(() => setCurrentTime(new Date().toLocaleString()), 10000); // Clock update every 10s is enough

        return () => {
            clearInterval(interval);
            clearInterval(timer);
        };
    }, []); // Only run once on mount

    const handleLogout = async () => {
        try {
            await AsyncStorage.clear();
            router.replace('/login');
        } catch (e) {
            router.replace('/login');
        }
    };

    const getStatusColor = (status: string) => {
        const s = status?.toLowerCase();
        if (s === 'running') return '#10B981'; // Green
        if (s === 'idle') return '#F59E0B';    // Orange
        if (s === 'pause' || s === 'paused') return '#3B82F6'; // Blue for pause
        return '#EF4444';                      // Red
    };

    const getMaterialsList = (machine: any) => {
        const materials = [];
        if (machine?.material_type_1) materials.push(`${machine.material_type_1} (${machine.material_qty_1 || 0}kg)`);
        if (machine?.material_type_2) materials.push(`${machine.material_type_2} (${machine.material_qty_2 || 0}kg)`);
        if (machine?.material_type_3) materials.push(`${machine.material_type_3} (${machine.material_qty_3 || 0}kg)`);
        if (machine?.material_type_4) materials.push(`${machine.material_type_4} (${machine.material_qty_4 || 0}kg)`);
        if (machine?.material_color) materials.push(`${machine.material_color} (${machine.color_qty || 0}kg)`);
        
        return materials.length > 0 ? materials.join('\n') : (machine?.material_type || 'N/A');
    };

    const handleSaveQC = async () => {
        if (!startHour || !endHour || !lastHourProd || !avgWeight || !rejectionPcs || !qcRemarks) {
            Alert.alert("Missing Information", "All fields are mandatory. Please fill in all details before submitting.");
            return;
        }

        // Validate 1-hour gap
        const startIndex = HOURS.indexOf(startHour);
        const endIndex = HOURS.indexOf(endHour);
        const isNextHour = (endIndex === (startIndex + 1) % 24);

        if (!isNextHour) {
            Alert.alert("Invalid Time Range", `Only a 1-hour gap is acceptable (e.g., ${startHour} to ${HOURS[(startIndex + 1) % 24]}).`);
            return;
        }

        const qcData = {
            machine_id: selectedMachine?.id || selectedMachine?.machine_id,
            time_range: `${startHour} - ${endHour}`,
            last_hour_production: parseInt(lastHourProd) || 0,
            average_weight: parseFloat(avgWeight) || 0,
            rejection_pcs: parseInt(rejectionPcs) || 0,
            remarks: qcRemarks,
            qa_staff: 'QA System'
        };

        console.log("[QC SAVE] Payload:", qcData);
        setIsSaving(true);

        try {
            const res = await fetch(`${SERVER_URL}/qc_logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(qcData),
            });

            const responseData = await res.json().catch(() => ({}));
            console.log("[QC SAVE] Response:", responseData);
            
            if (res.ok) {
                // Show success in UI
                setSubmitStatus('success');
                setStartHour(''); setEndHour(''); setLastHourProd(''); setAvgWeight(''); setRejectionPcs(''); setQcRemarks('');
            } else {
                console.error("[QC SAVE] Error Response:", responseData);
                setSubmitStatus('error');
                setErrorMessage(responseData.error || res.statusText || 'Unable to save record');
            }
        } catch (e: any) { 
            console.error("[QC SAVE] Network Error:", e.message);
            setSubmitStatus('error');
            setErrorMessage(`Connection Failed: ${e.message}`);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading && machines.length === 0) {
        return (
            <View style={[styles.container, { justifyContent: 'center' }]}>
                <ActivityIndicator size="large" color="#10B981" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            <View style={[styles.header, { paddingTop: Math.max(insets.top, 10) }]}>
                <View>
                    <Text style={styles.title}>QA MONITORING</Text>
                    <Text style={styles.subtitle}>Factory Floor List</Text>
                </View>
                <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                    <Text style={styles.logoutText}>LOGOUT</Text>
                </TouchableOpacity>
            </View>
            
            <FlatList
                data={machines}
                keyExtractor={(item, index) => (item?.id || item?.machine_id || index).toString()}
                initialNumToRender={8}
                maxToRenderPerBatch={5}
                windowSize={5}
                renderItem={({ item }: any) => (
                    <TouchableOpacity 
                        activeOpacity={0.8}
                        style={styles.machineCard}
                        onPress={() => { setSelectedMachine(item); setModalVisible(true); }}
                    >
                        <View style={styles.cardContent}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.unitIdText}>{item.machine_name || `UNIT ${item.id || item.machine_id}`}</Text>
                                <Text style={styles.moldText}>{item.mold_type || 'NO MOLD'}</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                                <Text style={styles.statusBadgeText}>
                                    {item.status ? item.status.charAt(0).toUpperCase() : 'O'}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                )}
            />

            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalIndicator} />
                        
                        <Text style={styles.modalHeader}>{selectedMachine?.machine_name || `UNIT ${selectedMachine?.id || selectedMachine?.machine_id}`} INSPECTION</Text>
                        
                        {submitStatus === 'success' ? (
                            <View style={styles.successContainer}>
                                <Text style={styles.successIcon}>✅</Text>
                                <Text style={styles.successText}>Data Uploaded Successfully!</Text>
                                <TouchableOpacity 
                                    style={styles.doneBtn} 
                                    onPress={() => {
                                        setModalVisible(false);
                                        setSubmitStatus('idle');
                                    }}
                                >
                                    <Text style={styles.doneBtnText}>CLOSE</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <>
                                <View style={styles.timeTag}>
                                    <Text style={styles.timeTagText}>{currentTime}</Text>
                                </View>
                                
                                {submitStatus === 'error' && (
                                    <View style={styles.errorBanner}>
                                        <Text style={styles.errorBannerText}>{errorMessage}</Text>
                                    </View>
                                )}
                                
                                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
                                    <View style={styles.infoSection}>
                                        <View style={styles.row}>
                                            <DetailItem label="Status" value={selectedMachine?.status} color={getStatusColor(selectedMachine?.status)} />
                                            <DetailItem label="Loaded Materials" value={getMaterialsList(selectedMachine)} />
                                        </View>
                                        <View style={styles.row}>
                                            <DetailItem label="Mold" value={selectedMachine?.mold_type} />
                                            <DetailItem label="Cavity" value={selectedMachine?.cavity} />
                                        </View>
                                    </View>

                                    <View style={styles.formSection}>
                                        <Text style={styles.label}>START HOUR</Text>
                                        <View style={styles.pickerWrapper}>
                                            <Picker
                                                selectedValue={startHour}
                                                onValueChange={(itemValue) => setStartHour(itemValue)}
                                                style={styles.picker}
                                                dropdownIconColor="#000000"
                                                mode="dropdown"
                                            >
                                                <Picker.Item label="Select Start Hour" value="" color="#000000" />
                                                {HOURS.map(h => (
                                                    <Picker.Item key={`start-${h}`} label={h} value={h} color="#000000" />
                                                ))}
                                            </Picker>
                                        </View>

                                        <Text style={styles.label}>END HOUR</Text>
                                        <View style={styles.pickerWrapper}>
                                            <Picker
                                                selectedValue={endHour}
                                                onValueChange={(itemValue) => setEndHour(itemValue)}
                                                style={styles.picker}
                                                dropdownIconColor="#000000"
                                                mode="dropdown"
                                            >
                                                <Picker.Item label="Select End Hour" value="" color="#000000" />
                                                {HOURS.map(h => (
                                                    <Picker.Item key={`end-${h}`} label={h} value={h} color="#000000" />
                                                ))}
                                            </Picker>
                                        </View>

                                        <Text style={styles.label}>TAKEN PCS FOR QUALITY CHECK</Text>
                                        <TextInput style={styles.input} keyboardType="numeric" value={lastHourProd} onChangeText={setLastHourProd} placeholder="0" placeholderTextColor="#475569" />

                                        <Text style={styles.label}>AVERAGE WEIGHT (GMS)</Text>
                                        <TextInput style={styles.input} keyboardType="numeric" value={avgWeight} onChangeText={setAvgWeight} placeholder="0.00" placeholderTextColor="#475569" />

                                        <Text style={styles.label}>REJECTION PIECES</Text>
                                        <TextInput style={styles.input} keyboardType="numeric" value={rejectionPcs} onChangeText={setRejectionPcs} placeholder="0" placeholderTextColor="#475569" />

                                        <Text style={styles.label}>QC REMARKS</Text>
                                        <TextInput style={[styles.input, {height: 70}]} multiline value={qcRemarks} onChangeText={setQcRemarks} placeholder="Notes..." placeholderTextColor="#475569" />
                                    </View>

                                    <TouchableOpacity 
                                        style={[styles.saveBtn, isSaving && { opacity: 0.7 }]} 
                                        onPress={handleSaveQC}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <ActivityIndicator color="white" size="small" />
                                        ) : (
                                            <Text style={styles.saveBtnText}>SUBMIT INSPECTION</Text>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity style={styles.closeBtn} onPress={() => { setModalVisible(false); setSubmitStatus('idle'); }}>
                                        <Text style={styles.closeBtnText}>CANCEL</Text>
                                    </TouchableOpacity>
                                </ScrollView>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const DetailItem = ({ label, value, color }: any) => (
    <View style={{ flex: 1, marginBottom: 8 }}>
        <Text style={{ color: '#64748B', fontSize: 10, fontWeight: 'bold' }}>{label.toUpperCase()}</Text>
        <Text style={{ color: color || 'white', fontSize: 14, fontWeight: '700' }}>{value || 'N/A'}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020617', paddingHorizontal: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
    title: { color: 'white', fontSize: 22, fontWeight: '900' },
    subtitle: { color: '#64748B', fontSize: 12 },
    logoutBtn: { backgroundColor: 'rgba(239, 68, 68, 0.1)', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
    logoutText: { color: '#EF4444', fontWeight: '900', fontSize: 13 },
    
    // Minimalist Card
    machineCard: {
        backgroundColor: '#1E2235',
        marginBottom: 15,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#2D334D',
    },
    cardContent: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: 22 
    },
    unitIdText: { color: 'white', fontSize: 19, fontWeight: '900', textTransform: 'uppercase' },
    moldText: { color: '#4E577A', fontSize: 13, marginTop: 6, fontWeight: '600' },
    statusBadge: { width: 10, height: 35, borderRadius: 5, justifyContent: 'center', alignItems: 'center' },
    statusBadgeText: { fontSize: 8, fontWeight: '900', color: 'rgba(255,255,255,0.4)' },
    
    // Modal
    modalOverlay: { flex: 1, backgroundColor: 'rgba(2, 6, 23, 0.9)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#1E293B', borderTopLeftRadius: 25, borderTopRightRadius: 25, padding: 20, maxHeight: '90%' },
    modalIndicator: { width: 30, height: 4, backgroundColor: '#334155', borderRadius: 2, alignSelf: 'center', marginBottom: 15 },
    modalHeader: { color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
    timeTag: { alignSelf: 'center', backgroundColor: '#0F172A', paddingVertical: 4, paddingHorizontal: 10, borderRadius: 15, marginTop: 8, marginBottom: 15 },
    timeTagText: { color: '#10B981', fontSize: 10, fontWeight: 'bold' },
    infoSection: { backgroundColor: '#0F172A', padding: 15, borderRadius: 12, marginBottom: 20 },
    row: { flexDirection: 'row' },
    formSection: { },
    label: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold', marginBottom: 8, marginTop: 10 },
    input: { backgroundColor: '#0F172A', borderRadius: 10, padding: 12, color: 'white', borderWidth: 1, borderColor: '#334155', marginBottom: 5 },
    pickerWrapper: { backgroundColor: '#fff', borderRadius: 10, borderWidth: 1, borderColor: '#334155', marginBottom: 5, overflow: 'hidden' },
    picker: { color: '#000000', height: 50 },
    successContainer: { padding: 40, alignItems: 'center', justifyContent: 'center' },
    successIcon: { fontSize: 60, marginBottom: 20 },
    successText: { color: '#10B981', fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
    doneBtn: { backgroundColor: '#10B981', paddingVertical: 12, paddingHorizontal: 40, borderRadius: 10 },
    doneBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
    errorBanner: { backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 12, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.3)' },
    errorBannerText: { color: '#EF4444', fontSize: 12, textAlign: 'center', fontWeight: '600' },
    saveBtn: { backgroundColor: '#10B981', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 20 },
    saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 15 },
    closeBtn: { padding: 15, alignItems: 'center' },
    closeBtnText: { color: '#64748B', fontWeight: 'bold' }
});