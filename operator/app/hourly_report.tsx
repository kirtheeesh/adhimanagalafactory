import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    Platform,
    View
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

interface HourlyReportProps {
    visible: boolean;
    onClose: () => void;
    machineData: any;
    currentTotalCount: number;  
    lastReportCount: number;    
    intervalProduction: number;
    serverUrl: string;
    onSuccess: (newTotal: number, newInterval: number) => Promise<void>; 
    operatorId: string | null;
    hourRange: string;
    semiFinishedProduct?: string;
    reportDate?: string;
    onDiscard?: () => Promise<void>;
    initialChecks?: {
        chiller: boolean;
        compressor: boolean;
        mould: boolean;
        machine: boolean;
        remarks: string;
        down_time?: string;
        down_reason?: string;
        good_parts?: string;
        rejects?: string;
    };
}

export default function HourlyReportModal({
    visible, onClose, machineData, currentTotalCount, lastReportCount, intervalProduction, serverUrl, onSuccess,
    operatorId, hourRange, semiFinishedProduct, reportDate, onDiscard, initialChecks
}: HourlyReportProps) {

    const parseLocalDate = (value?: string | Date) => {
        if (!value) return new Date();
        if (value instanceof Date) return value;
        const dateOnlyMatch = /^\d{4}-\d{2}-\d{2}$/.test(value);
        if (dateOnlyMatch) {
            const [year, month, day] = value.split('-').map(Number);
            return new Date(year, month - 1, day);
        }
        const parsed = new Date(value);
        return isNaN(parsed.getTime()) ? new Date() : parsed;
    };

    const formatLocalDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [selectedDate, setSelectedDate] = useState<Date>(parseLocalDate(reportDate || new Date()));
    const [showDatePicker, setShowDatePicker] = useState(false);
    const canChangeDate = reportDate ? parseLocalDate(reportDate).toDateString() !== new Date().toDateString() : false;

    useEffect(() => {
        setSelectedDate(parseLocalDate(reportDate || new Date()));
    }, [reportDate]);

    const [goodParts, setGoodParts] = useState('');
    const [rejects, setRejects] = useState('');
    const [chillerOk, setChillerOk] = useState(false);
    const [compressorOk, setCompressorOk] = useState(false);
    const [mouldOk, setMouldOk] = useState(false);
    const [machineOk, setMachineOk] = useState(false);
    const [remarks, setRemarks] = useState('');
    const [downTime, setDownTime] = useState('');
    const [downReason, setDownReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (visible) {
            // Manual entry only - do not auto-fill unless provided by initialChecks (for editing)
            setGoodParts(initialChecks?.good_parts || '');
            setRejects(initialChecks?.rejects || '');

            if (initialChecks) {
                setChillerOk(initialChecks.chiller);
                setCompressorOk(initialChecks.compressor);
                setMouldOk(initialChecks.mould);
                setMachineOk(initialChecks.machine);
                setRemarks(initialChecks.remarks);
                setDownTime(initialChecks.down_time || '');
                setDownReason(initialChecks.down_reason || '');
            }
        } else {
            // Reset fields for the next interval
            setGoodParts('');
            setRejects('');
            setChillerOk(false);
            setCompressorOk(false);
            setMouldOk(false);
            setMachineOk(false);
            setRemarks('');
            setDownTime('');
            setDownReason('');
        }
    }, [visible, initialChecks]); 

    const handleUpdate = async () => {
        if (!goodParts.trim()) {
            Alert.alert("Required", "Please enter Good Parts count");
            return;
        }

        setIsSubmitting(true);
        
        const gParts = parseInt(goodParts) || 0;
        const rParts = parseInt(rejects) || 0;
        const newTotal = lastReportCount + gParts; // Calculate total based on last known total + manual entry

        // Parse hour range to slots
        let slotFrom = '';
        let slotTo = '';
        if (hourRange.includes('-')) {
            const parts = hourRange.split('-').map(p => p.trim());
            slotFrom = parts[0];
            slotTo = parts[1];
        }

        const payload = {
            machine_id: machineData.id,
            machine_name: machineData.name,
            shift: machineData.shift,
            operator_id: operatorId,
            hour_range: hourRange,
            hour_slot_from: slotFrom,
            hour_slot_to: slotTo,
            production_date: formatLocalDate(selectedDate),
            good_parts: gParts,
            rejects: rParts,
            total_output: newTotal, 
            hourly_output: gParts, 
            chiller_check: chillerOk,
            compressor_check: compressorOk,
            mould_check: mouldOk,
            machine_check: machineOk,
            remarks: remarks,
            down_time: downTime,
            down_reason: downReason,
            semi_finished_product: semiFinishedProduct,
            timestamp: new Date().toISOString(),
            status: 'approved'
        };

        try {
            const response = await fetch(`${serverUrl}/hourly_logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                await onSuccess(newTotal, gParts); 
                Alert.alert("Success", "Successfully stored in hourly logs");
                onClose();
            } else {
                const errData = await response.json().catch(() => ({ error: "Unknown error" }));
                Alert.alert("Error", `Could not save hourly report: ${errData.error || response.statusText}`);
            }
        } catch (error) {
            Alert.alert("Error", "Server connection failed.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal 
            visible={visible} 
            animationType="fade" 
            transparent 
            onRequestClose={() => {}} 
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <Text style={styles.headerText}>HOURLY PRODUCTION ENTRY</Text>
                    
                    <View style={styles.machineInfoBar}>
                        <View style={styles.unitBadge}>
                            <Text style={styles.unitBadgeText}>UNIT {machineData?.id}</Text>
                        </View>
                        <Text style={styles.machineNameText}>{machineData?.name}</Text>
                    </View>

                    <View style={styles.timeInfoBox}>
                        <View style={styles.datePickerRow}>
                            <Text style={styles.dateLabel}>
                                {selectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                            </Text>
                            {canChangeDate ? (
                                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                                    <Text style={styles.changeDateText}>CHANGE</Text>
                                </TouchableOpacity>
                            ) : null}
                        </View>
                        <Text style={styles.hourRangeLabel}>{hourRange}</Text>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
                        
                        <View style={styles.manualEntryBox}>
                            <View style={styles.inputRow}>
                                <View style={styles.inputCol}>
                                    <Text style={styles.inputLabel}>GOOD PARTS</Text>
                                    <TextInput 
                                        style={styles.bigInput} 
                                        value={goodParts} 
                                        onChangeText={setGoodParts} 
                                        placeholder="0" 
                                        placeholderTextColor="#475569" 
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={styles.inputCol}>
                                    <Text style={styles.inputLabel}>REJECTS</Text>
                                    <TextInput 
                                        style={styles.bigInput} 
                                        value={rejects} 
                                        onChangeText={setRejects} 
                                        placeholder="0" 
                                        placeholderTextColor="#475569" 
                                        keyboardType="numeric"
                                    />
                                </View>
                            </View>
                        </View>

                        <Text style={styles.sectionLabel}>MACHINE & EQUIPMENT CHECKS</Text>
                        <View style={styles.checkGrid}>
                            <CheckItem label="Chiller OK" val={chillerOk} set={setChillerOk} />
                            <CheckItem label="Compressor OK" val={compressorOk} set={setCompressorOk} />
                            <CheckItem label="Mould OK" val={mouldOk} set={setMouldOk} />
                            <CheckItem label="Machine OK" val={machineOk} set={setMachineOk} />
                        </View>

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <Text style={styles.sectionLabel}>DOWN TIME (MINS)</Text>
                                <TextInput 
                                    style={styles.inputSmall} 
                                    value={downTime} 
                                    onChangeText={setDownTime} 
                                    placeholder="0" 
                                    placeholderTextColor="#475569" 
                                    keyboardType="numeric"
                                />
                            </View>
                            <View style={{ flex: 2 }}>
                                <Text style={styles.sectionLabel}>DOWN REASON</Text>
                                <TextInput 
                                    style={styles.inputSmall} 
                                    value={downReason} 
                                    onChangeText={setDownReason} 
                                    placeholder="Enter reason if any" 
                                    placeholderTextColor="#475569" 
                                />
                            </View>
                        </View>

                        <Text style={styles.sectionLabel}>REMARKS</Text>
                        <TextInput 
                            style={styles.input} 
                            multiline 
                            value={remarks} 
                            onChangeText={setRemarks} 
                            placeholder="Add observations..." 
                            placeholderTextColor="#475569" 
                        />
                    </ScrollView>

                    <View style={styles.btnRow}>
                        <TouchableOpacity 
                            style={styles.cancelBtn} 
                            onPress={async () => {
                                if (onDiscard) await onDiscard();
                                onClose();
                            }}
                        >
                            <Text style={styles.btnText}>DISCARD</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={styles.submitBtn} 
                            onPress={handleUpdate}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text style={styles.btnText}>SUBMIT ENTRY</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                    {showDatePicker ? (
                        Platform.OS === 'web' ? (
                            <View style={webDatePickerStyles.overlay}>
                                <View style={webDatePickerStyles.container}>
                                    <Text style={webDatePickerStyles.title}>Select Date</Text>
                                    <TextInput
                                        placeholder="YYYY-MM-DD"
                                        placeholderTextColor="#475569"
                                        style={webDatePickerStyles.input}
                                        value={formatLocalDate(selectedDate)}
                                        onChangeText={(val) => {
                                            if (/^\d{4}-\d{2}-\d{2}$/.test(val)) {
                                                const d = parseLocalDate(val);
                                                if (!isNaN(d.getTime())) {
                                                    setSelectedDate(d);
                                                }
                                            }
                                        }}
                                    />
                                    <TouchableOpacity
                                        style={webDatePickerStyles.cancelBtn}
                                        onPress={() => setShowDatePicker(false)}
                                    >
                                        <Text style={webDatePickerStyles.cancelText}>DONE</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <DateTimePicker
                                value={selectedDate}
                                mode="date"
                                display="default"
                                onChange={(event, date) => {
                                    setShowDatePicker(false);
                                    if (date) setSelectedDate(date);
                                }}
                            />
                        )
                    ) : null}
                </View>
            </View>
        </Modal>
    );
}

const CheckItem = ({ label, val, set }: any) => (
    <TouchableOpacity style={styles.checkItem} onPress={() => set(!val)}>
        <Ionicons 
            name={val ? "checkbox" : "square-outline"} 
            size={24} 
            color={val ? "#10B981" : "#94A3B8"} 
        />
        <Text style={[styles.checkText, { marginLeft: 8 }]}>{label}</Text>
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
    container: { 
        backgroundColor: '#1E293B', 
        width: '90%', 
        maxWidth: 500,
        borderRadius: 20, 
        padding: 20, 
        maxHeight: '90%',
        alignSelf: 'center'
    },
    headerText: { color: '#3B82F6', fontSize: 14, fontWeight: 'bold', textAlign: 'center', marginBottom: 5 },
    machineInfoBar: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginBottom: 10, 
        backgroundColor: '#0F172A', 
        paddingHorizontal: 10,
        paddingVertical: 8, 
        borderRadius: 12 
    },
    unitBadge: { 
        backgroundColor: '#3B82F6', 
        paddingHorizontal: 8, 
        paddingVertical: 2, 
        borderRadius: 6,
        marginRight: 6
    },
    unitBadgeText: { 
        color: 'white', 
        fontSize: 12, 
        fontWeight: '900' 
    },
    machineNameText: { 
        color: '#F8FAFC', 
        fontSize: 14, 
        fontWeight: 'bold' 
    },
    timeInfoBox: { 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center', 
        marginBottom: 15, 
        flexWrap: 'wrap' 
    },
    datePickerRow: { flexDirection: 'row', alignItems: 'center' },
    changeDateText: { color: '#3B82F6', fontSize: 11, fontWeight: 'bold', marginLeft: 8 },
    dateLabel: { color: '#94A3B8', fontSize: 12, fontWeight: 'bold', marginRight: 10 },
    hourRangeLabel: { 
        color: 'white', 
        backgroundColor: '#334155', 
        paddingHorizontal: 10, 
        paddingVertical: 4, 
        borderRadius: 8, 
        fontSize: 12, 
        fontWeight: 'bold',
        minWidth: 140,
        textAlign: 'center'
    },
    manualEntryBox: { backgroundColor: '#0F172A', padding: 15, borderRadius: 15, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
    inputRow: { flexDirection: 'row', justifyContent: 'space-between' },
    inputCol: { width: '48%' },
    inputLabel: { color: '#3B82F6', fontSize: 11, fontWeight: 'bold', marginBottom: 5, textAlign: 'center' },
    bigInput: { backgroundColor: '#1E293B', color: 'white', fontSize: 20, fontWeight: 'bold', textAlign: 'center', padding: 8, borderRadius: 10, borderWidth: 1, borderColor: '#334155' },
    sectionLabel: { color: '#94A3B8', fontSize: 11, fontWeight: 'bold', marginBottom: 8, marginTop: 8 },
    row: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 10 },
    input: { backgroundColor: '#0F172A', color: 'white', padding: 10, borderRadius: 10, height: 50, textAlignVertical: 'top', fontSize: 13 },
    inputSmall: { backgroundColor: '#0F172A', color: 'white', padding: 8, borderRadius: 10, height: 40, fontSize: 13 },
    checkGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    checkItem: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        backgroundColor: '#0F172A', 
        padding: 8, 
        borderRadius: 10, 
        width: '48%', 
        marginBottom: 8,
        minHeight: 45
    },
    checkText: { color: '#94A3B8', fontSize: 11, flexShrink: 1, marginLeft: 6 },
    btnRow: { flexDirection: 'row', marginTop: 10 },
    cancelBtn: { flex: 1, padding: 12, alignItems: 'center', backgroundColor: '#334155', borderRadius: 10, marginRight: 5 },
    submitBtn: { flex: 2, padding: 12, alignItems: 'center', backgroundColor: '#3B82F6', borderRadius: 10, marginLeft: 5 },
    btnText: { color: 'white', fontWeight: 'bold', fontSize: 13 }
});

const webDatePickerStyles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 2000
    },
    container: {
        backgroundColor: '#1E293B',
        padding: 25,
        borderRadius: 25,
        width: 320,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#334155'
    },
    title: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 20
    },
    input: {
        color: 'white',
        backgroundColor: '#0F172A',
        padding: 15,
        borderRadius: 12,
        width: '100%',
        height: 50,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#3B82F6'
    },
    cancelBtn: {
        marginTop: 20,
        padding: 12,
        width: '100%',
        alignItems: 'center',
        backgroundColor: '#3B82F6',
        borderRadius: 12
    },
    cancelText: {
        color: 'white',
        fontWeight: 'bold'
    }
});
