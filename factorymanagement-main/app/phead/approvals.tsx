import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    Modal,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    RefreshControl,
    ActivityIndicator,
    StatusBar
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SERVER_URL } from '@shared/constants/ApiConfig';
import { fetchWithTimeout } from '@shared/utils/fetchTimeout';
import PHeadFooter from '@shared/components/PHeadFooter';

interface ProductionLog {
    log_id: number;
    machine_display_name: string;
    shift: string;
    product_name: string;
    total_output: number;
    rejection_count: number;
    wastage_lumps: number;
    material_list: string;
    total_mat_qty: number;
    mold_type: string;
    cavity: string;
    run_time_display: string;
    stop_reason: string;
    created_at: string;
    materials: any[];
}

interface MissedRequest {
    id: number;
    machine_id: string;
    operator_id: string;
    production_date: string;
    hour_slot_from: string;
    hour_slot_to: string;
    status: string;
    created_at: string;
}

export default function ApprovalsScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [reports, setReports] = useState<ProductionLog[]>([]);
    const [missedRequests, setMissedRequests] = useState<MissedRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // POPUP STATES
    const [modalVisible, setModalVisible] = useState(false);
    const [inputText, setInputText] = useState('');
    const [selectedLog, setSelectedLog] = useState<number | null>(null);
    const [actionType, setActionType] = useState<'approved' | 'rejected'>('approved');
    const [approvalMode, setApprovalMode] = useState<'log' | 'missed'>('log');
    
    // Toggle state for machine stop awareness
    const [awareOfStop, setAwareOfStop] = useState<boolean | null>(null);

    const fetchData = async () => {
        try {
            const logsRes = await fetchWithTimeout(`${SERVER_URL}/head/pending_reports`, {}, 5000);
            
            const logsData = await logsRes.json();
            if (logsData && Array.isArray(logsData)) {
                setReports(logsData);
            }
        } catch (error) {
            console.error("Fetch Error:", error);
            Alert.alert("Error", "Could not load data from server");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const submitAction = async () => {
        if (approvalMode === 'log') {
            if (!inputText.trim()) {
                Alert.alert("Required", `Please enter ${actionType === 'approved' ? 'Operator Name' : 'Reason'}`);
                return;
            }

            if (actionType === 'approved' && awareOfStop === null) {
                Alert.alert("Required", "Please select if you are aware of the machine stop (Yes/No)");
                return;
            }

            try {
                const res = await fetchWithTimeout(`${SERVER_URL}/head/update_approval`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        log_id: selectedLog, 
                        status: actionType,
                        aware_of_stop: awareOfStop, 
                        [actionType === 'approved' ? 'operator_name' : 'rejection_reason']: inputText
                    }),
                }, 8000);
                
                if (res.ok) {
                    setModalVisible(false);
                    resetForm();
                    fetchData();
                    Alert.alert("Success", `Log has been ${actionType}.`);
                }
            } catch (e) {
                Alert.alert("Error", "Failed to save to database");
            }
        } else {
            // Missed Request Approval
            try {
                const res = await fetch(`${SERVER_URL}/hourly_logs/approve_missed`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        id: selectedLog,
                        status: actionType,
                        approved_by: 'Production Head'
                    })
                });
                if (res.ok) {
                    setModalVisible(false);
                    resetForm();
                    fetchData();
                    Alert.alert("Success", `Missed request has been ${actionType}.`);
                }
            } catch (e) {
                Alert.alert("Error", "Failed to update missed request");
            }
        }
    };

    const resetForm = () => {
        setInputText('');
        setAwareOfStop(null);
        setSelectedLog(null);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "N/A";
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { 
            day: '2-digit', 
            month: 'short', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const renderCleanMaterials = (list: string) => {
        if (!list) return "No Materials Logged";
        const cleaned = list
            .split(',')
            .map(item => item.trim())
            .filter(item => item.toLowerCase() !== 'none' && item !== "")
            .join(', ');
        return cleaned !== "" ? cleaned : "No Materials Logged";
    };

    if (loading) {
        return (
            <View style={[styles.container, {justifyContent: 'center'}]}>
                <ActivityIndicator size="large" color="#F59E0B" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />

            <Modal visible={modalVisible} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {actionType === 'approved' ? 'Approve Production Log' : 'Reject Production Log'}
                        </Text>
                        
                        <Text style={styles.inputLabel}>
                            {actionType === 'approved' ? "ASSIGNED OPERATOR" : "REJECTION REASON"}
                        </Text>
                        <TextInput 
                            style={styles.modalInput}
                            placeholder={actionType === 'approved' ? "Type Name..." : "Type Reason..."}
                            placeholderTextColor="#475569"
                            value={inputText}
                            onChangeText={setInputText}
                        />

                        {actionType === 'approved' && (
                            <View style={styles.toggleContainer}>
                                <Text style={styles.inputLabel}>ARE YOU AWARE OF MACHINE STOP?</Text>
                                <View style={styles.toggleRow}>
                                    <TouchableOpacity 
                                        style={[styles.toggleBtn, awareOfStop === true && styles.toggleBtnYes]}
                                        onPress={() => setAwareOfStop(true)}
                                    >
                                        <Text style={[styles.toggleText, awareOfStop === true && styles.whiteText]}>YES</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity 
                                        style={[styles.toggleBtn, awareOfStop === false && styles.toggleBtnNo]}
                                        onPress={() => setAwareOfStop(false)}
                                    >
                                        <Text style={[styles.toggleText, awareOfStop === false && styles.whiteText]}>NO</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        <View style={styles.modalActions}>
                            <TouchableOpacity 
                                onPress={() => { setModalVisible(false); resetForm(); }} 
                                style={styles.cancelBtn}
                            >
                                <Text style={{color: '#94A3B8', fontWeight: 'bold'}}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={submitAction} 
                                style={[styles.confirmBtn, {backgroundColor: actionType === 'approved' ? '#10B981' : '#EF4444'}]}
                            >
                                <Text style={{color: 'white', fontWeight: 'bold'}}>Confirm Action</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <View style={[styles.header, { paddingTop: Math.max(insets.top, 5) }]}>
                <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/phead')} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View>
                    <Text style={styles.title}>Pending Approvals</Text>
                    <Text style={styles.subtitle}>{reports.length + missedRequests.length} Reports Waiting</Text>
                </View>
            </View>

            <FlatList
                data={reports}
                keyExtractor={(item) => 'log-' + item.log_id.toString()}
                contentContainerStyle={{ paddingBottom: 20 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} tintColor="#F59E0B" />}
                ListEmptyComponent={<Text style={styles.emptyText}>All caught up! No pending logs or requests.</Text>}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <View style={styles.cardHeader}>
                            <View>
                                <Text style={styles.mId}>{item.machine_display_name}</Text>
                                <Text style={styles.dateText}>{formatDate(item.created_at)} • {item.shift}</Text>
                            </View>
                            <View style={styles.outputContainer}>
                                <Text style={styles.outputVal}>{item.total_output}</Text>
                                <Text style={styles.outputLabel}>PCS</Text>
                            </View>
                        </View>

                        <View style={styles.divider} />

                        <View style={styles.detailsGrid}>
                            <View style={styles.detailItem}>
                                <Text style={styles.label}>PRODUCT</Text>
                                <Text style={styles.val}>{item.product_name || 'N/A'}</Text>
                            </View>
                            <View style={[styles.detailItem, styles.rightSideItem]}>
                                <Text style={styles.label}>RUN TIME</Text>
                                <Text style={styles.val}>{item.run_time_display || '00h 00m'}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.label}>MOLD/CAV</Text>
                                <Text style={styles.val}>{item.mold_type} / {item.cavity}</Text>
                            </View>
                            <View style={[styles.detailItem, styles.rightSideItem]}>
                                <Text style={styles.label}>MAT. WEIGHT</Text>
                                <Text style={styles.val}>{item.total_mat_qty} KG</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Text style={styles.label}>REJECTION</Text>
                                <Text style={[styles.val, {color: '#EF4444'}]}>{item.rejection_count} PCS</Text>
                            </View>
                            <View style={[styles.detailItem, styles.rightSideItem]}>
                                <Text style={styles.label}>LUMPS</Text>
                                <Text style={styles.val}>{item.wastage_lumps} KG</Text>
                            </View>
                        </View>

                        {item.materials && item.materials.length > 0 && (
                            <View style={[styles.matBox, {backgroundColor: '#0F172A', marginTop: 10}]}>
                                <Text style={[styles.label, {color: '#10B981'}]}>MATERIALS BREAKDOWN</Text>
                                {item.materials.map((m: any, idx: number) => (
                                    <View key={idx} style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 4}}>
                                        <Text style={{color: 'white', fontSize: 12}}>{m.material_name}</Text>
                                        <Text style={{color: '#94A3B8', fontSize: 12}}>
                                            {m.used_kg}kg (Bal: {parseFloat(m.balance_kg).toFixed(2)}kg)
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        <View style={styles.matBox}>
                            <Text style={styles.label}>MATERIAL MIX</Text>
                            <Text style={styles.matText}>{renderCleanMaterials(item.material_list)}</Text>
                        </View>

                        {item.stop_reason && (
                            <View style={styles.reasonRow}>
                                <Ionicons name="warning" size={14} color="#EF4444" />
                                <Text style={styles.reasonText}>STOP: {item.stop_reason}</Text>
                            </View>
                        )}

                        <View style={styles.actionRow}>
                            <TouchableOpacity 
                                onPress={() => { setSelectedLog(item.log_id); setActionType('rejected'); setModalVisible(true); }} 
                                style={[styles.btn, styles.rej]}
                            >
                                <Ionicons name="close-circle-outline" size={18} color="white" style={{marginRight: 6}} />
                                <Text style={styles.btnTxt}>REJECT</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={() => { setSelectedLog(item.log_id); setActionType('approved'); setModalVisible(true); }} 
                                style={[styles.btn, styles.app]}
                            >
                                <Ionicons name="checkmark-circle-outline" size={18} color="white" style={{marginRight: 6}} />
                                <Text style={styles.btnTxt}>APPROVE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
            />
            <PHeadFooter />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#020617' },
    header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, marginVertical: 12 },
    backBtn: { marginRight: 10, padding: 8, backgroundColor: '#1E293B', borderRadius: 10 },
    title: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    subtitle: { color: '#64748B', fontSize: 11 },
    
    card: { backgroundColor: '#0F172A', padding: 12, borderRadius: 16, marginBottom: 12, marginHorizontal: 10, borderWidth: 1, borderColor: '#1E293B' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    mId: { color: '#F59E0B', fontSize: 15, fontWeight: '900' },
    dateText: { color: '#475569', fontSize: 10, marginTop: 2 },
    outputContainer: { alignItems: 'center', backgroundColor: '#F59E0B', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
    outputVal: { color: '#0F172A', fontSize: 16, fontWeight: 'bold' },
    outputLabel: { color: '#0F172A', fontSize: 8, fontWeight: '900' },
    divider: { height: 1, backgroundColor: '#1E293B', marginVertical: 10 },
    
    detailsGrid: { flexDirection: 'row', flexWrap: 'wrap' },
    detailItem: { width: '50%', marginBottom: 10 },
    rightSideItem: { paddingLeft: 10 }, 
    
    label: { color: '#475569', fontSize: 8, fontWeight: 'bold' },
    val: { color: '#F8FAFC', fontSize: 12, fontWeight: '600', marginTop: 2 },
    matBox: { backgroundColor: '#020617', padding: 8, borderRadius: 10, marginTop: 10, borderLeftWidth: 3, borderLeftColor: '#0EA5E9' },
    matText: { color: '#0EA5E9', fontSize: 10, fontWeight: '600' },
    reasonRow: { flexDirection: 'row', alignItems: 'center', marginTop: 10, backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 6, borderRadius: 6 },
    reasonText: { color: '#EF4444', fontSize: 10, fontWeight: '700', marginLeft: 4 },
    
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
    btn: { flex: 0.48, height: 40, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
    app: { backgroundColor: '#10B981' },
    rej: { backgroundColor: '#EF4444' },
    btnTxt: { color: 'white', fontWeight: '800', fontSize: 12 },
    emptyText: { color: '#475569', textAlign: 'center', marginTop: 60, fontSize: 12 },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#0F172A', width: '90%', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#1E293B' },
    modalTitle: { color: 'white', fontSize: 16, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
    inputLabel: { color: '#64748B', fontSize: 10, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' },
    modalInput: { backgroundColor: '#020617', color: 'white', padding: 12, borderRadius: 10, marginBottom: 15, fontSize: 14, borderWidth: 1, borderColor: '#1E293B' },
    
    toggleContainer: { marginBottom: 20 },
    toggleRow: { flexDirection: 'row', justifyContent: 'center' },
    toggleBtn: { flex: 1, height: 40, borderRadius: 10, backgroundColor: '#020617', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#1E293B', marginHorizontal: 5 },
    toggleBtnYes: { backgroundColor: '#10B981', borderColor: '#10B981' },
    toggleBtnNo: { backgroundColor: '#EF4444', borderColor: '#EF4444' },
    toggleText: { color: '#475569', fontWeight: 'bold', fontSize: 13 },
    whiteText: { color: 'white' },

    modalActions: { flexDirection: 'row', justifyContent: 'space-between' },
    cancelBtn: { flex: 1, height: 45, alignItems: 'center', justifyContent: 'center' },
    confirmBtn: { flex: 2, height: 45, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginLeft: 10 }
});