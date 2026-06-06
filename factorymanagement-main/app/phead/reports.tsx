import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Linking,
    Modal,
    Platform,
    ScrollView, 
    StatusBar, 
    StyleSheet, 
    Text, 
    TouchableOpacity, 
    View,
    ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Import your central API config (Ensure this contains your PC's IP, not localhost)
import { SERVER_URL } from '@shared/constants/ApiConfig';
import PHeadFooter from '@shared/components/PHeadFooter';

export default function ProductionManagement() {
    const router = useRouter();
    const today = new Date();
    
    // Refs for Web Date Pickers
    const fromDateRef = React.useRef<any>(null);
    const toDateRef = React.useRef<any>(null);
    
    // --- DATE HELPERS ---
    // Formats dates to YYYY-MM-DD for PostgreSQL compatibility
    const formatDate = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const todayStr = formatDate(today);

    // --- STATES ---
    const [showRangeModal, setShowRangeModal] = useState(false);
    const [showMachineModal, setShowMachineModal] = useState(false);
    const [machines, setMachines] = useState<any[]>([]);
    const [selectedMachineId, setSelectedMachineId] = useState('');
    const [reportType, setReportType] = useState(''); 
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [showFromPicker, setShowFromPicker] = useState(false);
    const [showToPicker, setShowToPicker] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedHourlyDate, setSelectedHourlyDate] = useState(new Date());
    const [showHourlyDatePicker, setShowHourlyDatePicker] = useState(false);

    const onFromChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowFromPicker(false);
        }
        if (selectedDate) setFromDate(selectedDate);
    };

    const onToChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowToPicker(false);
        }
        if (selectedDate) setToDate(selectedDate);
    };

    const handleWebDateChange = (val: string, setter: (d: Date) => void) => {
        if (!val) return;
        const [y, m, d] = val.split('-').map(Number);
        setter(new Date(y, m - 1, d));
    };

    // --- HANDLERS ---
    const fetchMachines = async () => {
        try {
            const res = await fetch(`${SERVER_URL}/machines`);
            if (res.ok) {
                const data = await res.json();
                setMachines(data);
            }
        } catch (error) {
            console.error("Fetch Machines Error:", error);
        }
    };

    const openRangeModal = (type: string) => {
        setReportType(type); // For Monthly Summary, this is 'monthly'
        setShowRangeModal(true);
    };

    const openMachineModal = (type: string = 'prod_1hr') => {
        setReportType(type);
        fetchMachines();
        setShowMachineModal(true);
    };

    /**
     * The Download Handler
     * Opens the PDF in the phone's browser based on the selected type and dates.
     */
    const handleDownload = async (type: string, machineId?: string) => {
        let endpoint = "";
        
        // 1. Static Reports (No date range needed)
        if (type === 'operator_list') {
            endpoint = `/reports/operator_list_pdf`;
        } 
        // 2. Today's Hourly Report (Now with selected date)
        else if (type === 'prod_1hr') {
            const hDateStr = formatDate(selectedHourlyDate);
            endpoint = `/reports/production_hourly?date=${hDateStr}${machineId ? `&machine_id=${machineId}` : ''}`;
        }
        // 4. Lumps Report
        else if (type === 'lumps') {
            const hDateStr = formatDate(selectedHourlyDate);
            endpoint = `/reports/lumps_report?date=${hDateStr}${machineId ? `&machine_id=${machineId}` : ''}`;
        }
        // 5. QC Report
        else if (type === 'qc_report') {
            const hDateStr = formatDate(selectedHourlyDate);
            endpoint = `/reports/qc_report?date=${hDateStr}${machineId ? `&machine_id=${machineId}` : ''}`;
        }
        // 3. Date Range Reports (Monthly Summary)
        else if (type === 'range_fetch') {
            if (fromDate > toDate) {
                return Alert.alert("Error", "From Date cannot be after To Date.");
            }
            
            setLoading(true);
            const fromStr = formatDate(fromDate);
            const toStr = formatDate(toDate);
            
            // This maps 'monthly' selection to the 'monthly_summary' backend route
            const route = reportType === 'monthly' ? 'monthly_summary' : reportType;
            endpoint = `/reports/${route}?from=${fromStr}&to=${toStr}`;
        }

        try {
            const url = SERVER_URL + endpoint;
            
            // Check if URL can be opened
            const supported = await Linking.canOpenURL(url);
            
            if (supported) {
                // Open browser to trigger PDF download from Node.js
                await Linking.openURL(url);
                if (type === 'range_fetch') setShowRangeModal(false);
            } else {
                Alert.alert("Error", "Cannot reach the server URL: " + url);
            }
        } catch (e) { 
            Alert.alert("Error", "Download failed. Ensure your backend server is running."); 
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            {/* Header */}
            <View style={styles.headerRow}>
                <TouchableOpacity onPress={() => router.replace('/phead')} style={styles.iconBtn}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View style={{flex:1, marginLeft: 15}}>
                    <Text style={styles.title}>Production Reports</Text>
                    <Text style={styles.dateText}>Generated on: {todayStr}</Text>
                </View>
            </View>

            <ScrollView contentContainerStyle={{paddingBottom: 100}}>
                <Text style={styles.sectionTitle}>Main Reports</Text>
                
                <View style={styles.reportGrid}>
                    {/* MONTHLY SUMMARY - Opens Modal */}
                    <TouchableOpacity 
                        style={[styles.reportCard, {backgroundColor: '#8B5CF6', width: '100%'}]} 
                        onPress={() => openRangeModal('monthly')}
                    >
                        <Ionicons name="calendar" size={32} color="white" />
                        <Text style={styles.reportText}>Monthly Summary</Text>
                    </TouchableOpacity>

                    {/* OPERATOR LIST - Instant Download */}
                    <TouchableOpacity 
                        style={[styles.reportCard, {backgroundColor: '#6366F1'}]} 
                        onPress={() => handleDownload('operator_list')}
                    >
                        <Ionicons name="people" size={32} color="white" />
                        <Text style={styles.reportText}>Operator List</Text>
                    </TouchableOpacity>

                    {/* HOURLY PROD - Opens Machine Modal */}
                    <TouchableOpacity 
                        style={[styles.reportCard, {backgroundColor: '#3B82F6'}]} 
                        onPress={() => openMachineModal('prod_1hr')}
                    >
                        <Ionicons name="time" size={32} color="white" />
                        <Text style={styles.reportText}>Hourly Prod</Text>
                    </TouchableOpacity>

                    {/* OPERATOR SHIFT REPORT - Navigates to Screen */}
                    <TouchableOpacity 
                        style={[styles.reportCard, {backgroundColor: '#EC4899'}]} 
                        onPress={() => router.push('/phead/operator_shift_reports')}
                    >
                        <Ionicons name="clipboard" size={32} color="white" />
                        <Text style={styles.reportText}>Shift Reports</Text>
                    </TouchableOpacity>

                    {/* SALES HISTORY - Navigates to Screen */}
                    <TouchableOpacity 
                        style={[styles.reportCard, {backgroundColor: '#10B981'}]} 
                        onPress={() => router.push('/phead/sales_history')}
                    >
                        <Ionicons name="cash" size={32} color="white" />
                        <Text style={styles.reportText}>Sales History</Text>
                    </TouchableOpacity>

                    {/* LUMPS REPORT - Opens Machine Modal */}
                    <TouchableOpacity 
                        style={[styles.reportCard, {backgroundColor: '#F87171'}]} 
                        onPress={() => openMachineModal('lumps')}
                    >
                        <Ionicons name="trash" size={32} color="white" />
                        <Text style={styles.reportText}>Lumps Report</Text>
                    </TouchableOpacity>

                    {/* QC REPORT - Opens Machine Modal */}
                    <TouchableOpacity 
                        style={[styles.reportCard, {backgroundColor: '#F59E0B'}]} 
                        onPress={() => openMachineModal('qc_report')}
                    >
                        <Ionicons name="shield-checkmark" size={32} color="white" />
                        <Text style={styles.reportText}>QC Report</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Date Range Selection Modal */}
            <Modal visible={showRangeModal} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>SELECT DATE RANGE</Text>
                        
                        <View style={styles.inputFlexRow}>
                            {/* From Date */}
                            <View style={styles.flexOne}>
                                <Text style={styles.label}>FROM</Text>
                                {Platform.OS === 'web' ? (
                                    <View style={{ position: 'relative', height: 45 }}>
                                        <TouchableOpacity 
                                            activeOpacity={0.7}
                                            style={styles.dateInputBox}
                                            onPress={() => fromDateRef.current?.showPicker?.()}
                                        >
                                            <Text style={{color: 'white', fontWeight: 'bold'}}>{formatDate(fromDate)}</Text>
                                            <input 
                                                ref={fromDateRef}
                                                type="date"
                                                style={{ 
                                                    position: 'absolute', 
                                                    top: 0, 
                                                    left: 0, 
                                                    width: '100%', 
                                                    height: '100%', 
                                                    opacity: 0, 
                                                    cursor: 'pointer',
                                                    zIndex: -1,
                                                    border: 'none',
                                                    pointerEvents: 'none'
                                                }}
                                                value={formatDate(fromDate)}
                                                onChange={(e: any) => handleWebDateChange(e.target.value, setFromDate)}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity style={styles.dateInputBox} onPress={() => setShowFromPicker(true)}>
                                        <Text style={{color: 'white', fontWeight: 'bold'}}>{formatDate(fromDate)}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>

                            <View style={{paddingHorizontal: 10, marginTop: 25}}>
                                <Ionicons name="arrow-forward" size={18} color="#475569" />
                            </View>

                            {/* To Date */}
                            <View style={styles.flexOne}>
                                <Text style={styles.label}>TO</Text>
                                {Platform.OS === 'web' ? (
                                    <View style={{ position: 'relative', height: 45 }}>
                                        <TouchableOpacity 
                                            activeOpacity={0.7}
                                            style={styles.dateInputBox}
                                            onPress={() => toDateRef.current?.showPicker?.()}
                                        >
                                            <Text style={{color: 'white', fontWeight: 'bold'}}>{formatDate(toDate)}</Text>
                                            <input 
                                                ref={toDateRef}
                                                type="date"
                                                style={{ 
                                                    position: 'absolute', 
                                                    top: 0, 
                                                    left: 0, 
                                                    width: '100%', 
                                                    height: '100%', 
                                                    opacity: 0, 
                                                    cursor: 'pointer',
                                                    zIndex: -1,
                                                    border: 'none',
                                                    pointerEvents: 'none'
                                                }}
                                                value={formatDate(toDate)}
                                                onChange={(e: any) => handleWebDateChange(e.target.value, setToDate)}
                                            />
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <TouchableOpacity style={styles.dateInputBox} onPress={() => setShowToPicker(true)}>
                                        <Text style={{color: 'white', fontWeight: 'bold'}}>{formatDate(toDate)}</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity 
                            style={[styles.fetchButton, loading && {opacity: 0.7}]} 
                            onPress={() => handleDownload('range_fetch')}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Ionicons name="cloud-download-outline" size={22} color="white" />
                                    <Text style={styles.fetchButtonText}>FETCH DATA</Text>
                                </>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setShowRangeModal(false)} style={styles.cancelLink}>
                            <Text style={{color: '#94A3B8', fontWeight: 'bold'}}>CANCEL</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Machine Selection Modal */}
            <Modal visible={showMachineModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>SELECT MACHINE</Text>
                        
                        <View style={{ marginBottom: 15 }}>
                            <Text style={styles.label}>SELECT DATE</Text>
                            <TouchableOpacity 
                                style={styles.dateInputBox} 
                                onPress={() => setShowHourlyDatePicker(true)}
                            >
                                <Text style={{color: 'white', fontWeight: 'bold'}}>{formatDate(selectedHourlyDate)}</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={{maxHeight: 250, width: '100%', marginVertical: 15}}>
                            {machines.map((m) => (
                                <TouchableOpacity 
                                    key={m.id}
                                    style={[
                                        styles.machineItem, 
                                        selectedMachineId === m.id.toString() && {backgroundColor: '#3B82F6'}
                                    ]}
                                    onPress={() => setSelectedMachineId(m.id.toString())}
                                >
                                    <Text style={[
                                        styles.machineItemText,
                                        selectedMachineId === m.id.toString() && {color: 'white'}
                                    ]}>
                                        {m.machine_name} (ID: {m.id})
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity 
                            style={[styles.fetchButton, (!selectedMachineId || loading) && {opacity: 0.5}]} 
                            onPress={() => {
                                handleDownload(reportType, selectedMachineId);
                                setShowMachineModal(false);
                            }}
                            disabled={!selectedMachineId || loading}
                        >
                            <Text style={styles.fetchButtonText}>DOWNLOAD REPORT</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => setShowMachineModal(false)} style={styles.cancelLink}>
                            <Text style={{color: '#94A3B8', fontWeight: 'bold'}}>CANCEL</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* Platform Native Date Pickers */}
            {showFromPicker && <DateTimePicker value={fromDate} mode="date" onChange={onFromChange} />}
            {showToPicker && <DateTimePicker value={toDate} mode="date" onChange={onToChange} />}
            {showHourlyDatePicker && (
                <DateTimePicker 
                    value={selectedHourlyDate} 
                    mode="date" 
                    onChange={(event, date) => {
                        setShowHourlyDatePicker(false);
                        if (date) setSelectedHourlyDate(date);
                    }} 
                />
            )}
            <PHeadFooter />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#0F172A' },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 25, marginTop: 10, paddingHorizontal: 20 },
    iconBtn: { padding: 10, backgroundColor: '#1E293B', borderRadius: 12 },
    title: { color: 'white', fontSize: 24, fontWeight: 'bold' },
    dateText: { color: '#64748B', fontSize: 13 },
    sectionTitle: { color: '#94A3B8', fontSize: 13, fontWeight: 'bold', marginBottom: 20, textTransform: 'uppercase', paddingHorizontal: 20 },
    reportGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20 },
    reportCard: { width: '48%', height: 120, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
    reportText: { color: 'white', fontWeight: 'bold', marginTop: 10, fontSize: 13 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#1E293B', width: '90%', padding: 25, borderRadius: 25, borderWidth: 1, borderColor: '#334155' },
    modalTitle: { color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 25, textAlign: 'center' },
    inputFlexRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
    flexOne: { flex: 1 },
    label: { color: '#64748B', fontSize: 11, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
    dateInputBox: { backgroundColor: '#0F172A', padding: 15, borderRadius: 12, alignItems: 'center', borderWidth: 1, borderColor: '#334155' },
    fetchButton: { backgroundColor: '#8B5CF6', padding: 18, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    fetchButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 10 },
    cancelLink: { marginTop: 25, alignSelf: 'center' },
    machineItem: { backgroundColor: '#0F172A', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
    machineItemText: { color: '#94A3B8', fontWeight: 'bold', textAlign: 'center' }
});
