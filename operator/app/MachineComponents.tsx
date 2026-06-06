import React, { memo, useMemo } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

export const ReportRow = memo(({ label, value }: any) => (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#334155' }}>
        <Text style={{ color: '#94A3B8', fontWeight: 'bold', fontSize: 11 }}>{label.toUpperCase()}</Text>
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 13, textAlign: 'right', flex: 1, marginLeft: 20 }}>{value}</Text>
    </View>
));

export const HourlyGridModal = memo(({ 
    visible, 
    setVisible, 
    hourlyLogs, 
    onSlotPress
}: any) => {
    const slots = useMemo(() => Array.from({ length: 24 }, (_, i) => {
        const start = i;
        const end = (i + 1) % 24;
        const range = `${start.toString().padStart(2, '0')}:00 - ${end.toString().padStart(2, '0')}:00`;
        return { start, end, range };
    }), []);

    const renderSlot = (slot: any) => {
        const log = (hourlyLogs || []).find((l: any) => l.hour_range === slot.range);
        
        return (
            <TouchableOpacity 
                key={slot.range}
                style={[
                    styles.slotItem, 
                    log ? styles.slotRecorded : styles.slotPending
                ]}
                onPress={() => onSlotPress(slot)}
            >
                <Text style={styles.slotRangeText}>{slot.range}</Text>
                <Text style={styles.slotStatusText}>{log ? 'RECORDED' : 'TAP TO RECORD'}</Text>
                {log && <Text style={styles.slotDataText}>G: {log.good_parts} R: {log.rejects}</Text>}
            </TouchableOpacity>
        );
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContainer, { width: '95%', maxHeight: '90%' }]}>
                    <Text style={styles.modalTitle}>RECORD HOURLY PRODUCTION</Text>
                    <ScrollView contentContainerStyle={styles.gridContainer}>
                        {slots.map(renderSlot)}
                    </ScrollView>
                    <TouchableOpacity 
                        style={[styles.modalBtn, { backgroundColor: '#334155', marginTop: 15 }]} 
                        onPress={() => setVisible(false)}
                    >
                        <Text style={styles.modalBtnText}>CLOSE</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
});

export const StopReasonModal = memo(({ visible, onClose, onConfirm, typedReason, setTypedReason }: any) => (
    <Modal animationType="fade" transparent={true} visible={visible}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>STOP REASON</Text>
                <TextInput 
                    style={styles.reasonInput} 
                    value={typedReason} 
                    onChangeText={setTypedReason} 
                    multiline 
                    placeholder="Enter reason..."
                    placeholderTextColor="#475569"
                />
                <View style={styles.modalBtnRow}>
                    <TouchableOpacity 
                        style={[styles.modalBtn, { backgroundColor: '#334155' }]} 
                        onPress={onClose}
                    >
                        <Text style={styles.modalBtnText}>BACK</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.modalBtn, { backgroundColor: '#EF4444' }]} 
                        onPress={onConfirm}
                    >
                        <Text style={styles.modalBtnText}>CONFIRM</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
));

export const CloseMachineModal = memo(({ visible, onClose, onSubmit, count, setCount, totalProdWeightGm, totalProdWeightKg, cavityTotalWeight, shift, operatorName, setOperatorName }: any) => (
    <Modal animationType="fade" transparent={true} visible={visible}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
                <Text style={[styles.modalTitle, { color: '#EF4444' }]}>CLOSE MACHINE & SHIFT</Text>
                
                <ScrollView style={{ marginVertical: 10 }}>
                    <View style={{ marginBottom: 15 }}>
                        <Text style={styles.inputLabel}>TOTAL PRODUCTION COUNT (PCS)</Text>
                        <TextInput 
                            style={styles.input} 
                            value={count.toString()} 
                            onChangeText={(txt) => setCount(parseInt(txt) || 0)}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={{ marginBottom: 15 }}>
                        <Text style={styles.inputLabel}>TOTAL PRODUCTION WEIGHT</Text>
                        <View style={[styles.input, styles.locked, { flexDirection: 'row', justifyContent: 'space-between' }]}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>{totalProdWeightGm.toFixed(2)} GM</Text>
                            <Text style={{ color: '#94A3B8', fontWeight: 'bold' }}>{totalProdWeightKg.toFixed(2)} KG</Text>
                        </View>
                        {cavityTotalWeight === 0 && <Text style={{ color: '#EF4444', fontSize: 10, fontWeight: 'bold' }}>* Mold cavity weights not set! Check mold settings.</Text>}
                    </View>

                    <View style={{ marginBottom: 15 }}>
                        <Text style={styles.inputLabel}>SHIFT</Text>
                        <TextInput style={[styles.input, styles.locked]} value={shift} editable={false} />
                    </View>

                    <View style={{ marginBottom: 15 }}>
                        <Text style={styles.inputLabel}>OPERATOR NAME</Text>
                        <TextInput style={styles.input} value={operatorName} onChangeText={setOperatorName} placeholder="Enter Name" placeholderTextColor="#475569" />
                    </View>
                </ScrollView>

                <View style={styles.modalBtnRow}>
                    <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#334155' }]} onPress={onClose}><Text style={styles.modalBtnText}>CANCEL</Text></TouchableOpacity>
                    <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#EF4444' }]} onPress={onSubmit}><Text style={styles.modalBtnText}>SUBMIT & CLOSE</Text></TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
));

export const ProductionReportModal = memo(({ visible, onClose, onConfirm, reportMaterials, setReportMaterials, count, setCount, rejectionCount, setRejectionCount, typedReason, setTypedReason, machineName, shift, semiProductName, machineSessionStart, stopTime, formatTime, moldType, cavity, cycleTiming }: any) => (
    <Modal animationType="slide" transparent={true} visible={visible}>
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { width: '90%', maxHeight: '85%' }]}>
                <Text style={[styles.modalTitle, { color: '#10B981', fontSize: 22 }]}>PRODUCTION REPORT</Text>
                <ScrollView style={{ marginVertical: 10 }}>
                    <ReportRow label="Date" value={new Date().toLocaleDateString('en-GB')} />
                    <ReportRow label="Machine" value={machineName} />
                    <ReportRow label="Shift" value={shift} />
                    <ReportRow label="Semi-Finished Product" value={semiProductName} />
                    <ReportRow label="Machine Start Time" value={machineSessionStart ? formatTime(machineSessionStart) : 'N/A'} />
                    <ReportRow label="Machine Stop Time" value={stopTime ? formatTime(stopTime) : 'N/A'} />
                    
                    <View style={styles.divider} />
                    <Text style={{ color: '#10B981', fontWeight: 'bold', fontSize: 14, marginVertical: 10 }}>MATERIALS USED & BALANCE</Text>
                    {reportMaterials.map((mat: any, index: number) => {
                        const balance = (parseFloat(mat.issued_kg) || 0) - (parseFloat(mat.used_kg) || 0);
                        return (
                            <View key={index} style={{ marginBottom: 15, padding: 10, backgroundColor: '#1E293B', borderRadius: 8 }}>
                                <Text style={{ color: '#94A3B8', fontSize: 12, fontWeight: 'bold' }}>{mat.material_name.toUpperCase()}</Text>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 5 }}>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: '#64748B', fontSize: 10 }}>ISSUED (KG)</Text>
                                        <Text style={{ color: 'white', fontWeight: 'bold' }}>{mat.issued_kg}</Text>
                                    </View>
                                    <View style={{ flex: 1, marginHorizontal: 10 }}>
                                        <Text style={{ color: '#10B981', fontSize: 10 }}>USED (KG)</Text>
                                        <TextInput
                                            style={{ backgroundColor: '#0F172A', color: 'white', padding: 5, borderRadius: 4, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#10B981' }}
                                            value={mat.used_kg.toString()}
                                            onChangeText={(txt) => {
                                                const newMats = [...reportMaterials];
                                                newMats[index].used_kg = txt;
                                                setReportMaterials(newMats);
                                            }}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={{ color: '#64748B', fontSize: 10 }}>BALANCE (KG)</Text>
                                        <Text style={{ color: balance >= 0 ? '#10B981' : '#EF4444', fontWeight: 'bold' }}>{balance.toFixed(2)}</Text>
                                    </View>
                                </View>
                            </View>
                        );
                    })}

                    <View style={styles.divider} />
                    <View style={{ marginVertical: 5 }}>
                        <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: 'bold' }}>TOTAL OUTPUT (PCS)</Text>
                        <TextInput
                            style={{ backgroundColor: '#1E293B', color: 'white', padding: 10, borderRadius: 8, marginTop: 5, fontWeight: 'bold' }}
                            value={count.toString()}
                            onChangeText={(txt) => setCount(parseInt(txt) || 0)}
                            keyboardType="numeric"
                        />
                    </View>

                    <View style={{ marginVertical: 5 }}>
                        <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: 'bold' }}>REJECTION COUNT (PCS)</Text>
                        <TextInput
                            style={{ backgroundColor: '#1E293B', color: 'white', padding: 10, borderRadius: 8, marginTop: 5, fontWeight: 'bold', borderWidth: 1, borderColor: '#334155' }}
                            value={rejectionCount}
                            onChangeText={setRejectionCount}
                            keyboardType="numeric"
                            placeholder="Enter rejection count"
                            placeholderTextColor="#475569"
                        />
                    </View>

                    <View style={{ marginVertical: 5 }}>
                        <Text style={{ color: '#94A3B8', fontSize: 11, fontWeight: 'bold' }}>STOP REASON</Text>
                        <TextInput
                            style={{ backgroundColor: '#1E293B', color: 'white', padding: 10, borderRadius: 8, marginTop: 5 }}
                            value={typedReason}
                            onChangeText={setTypedReason}
                            multiline
                        />
                    </View>

                    <View style={styles.divider} />
                    <ReportRow label="Mold" value={moldType} />
                    <ReportRow label="Cavity" value={cavity} />
                    <ReportRow label="Cycle" value={`${cycleTiming} SEC`} />
                </ScrollView>
                <View style={{ flexDirection: 'row' }}>
                    <TouchableOpacity style={[styles.approveBtn, { flex: 1, backgroundColor: '#334155', marginRight: 10 }]} onPress={onClose}>
                        <Text style={styles.approveBtnText}>CANCEL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.approveBtn, { flex: 2 }]} onPress={onConfirm}>
                        <Text style={styles.approveBtnText}>CONFIRM SEND APPROVAL</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
));

export const AddMaterialsModal = memo(({ visible, onClose, onAdd, dbMaterials, dbColors, addMat1, setAddMat1, addMQty1, setAddMQty1, addMat2, setAddMat2, addMQty2, setAddMQty2, addMat3, setAddMat3, addMQty3, setAddMQty3, addMat4, setAddMat4, addMQty4, setAddMQty4, addCol, setAddCol, addCQty, setAddCQty, isSubmitting }: any) => (
    <Modal animationType="slide" transparent={true} visible={visible}>
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContainer, { width: '90%', maxHeight: '90%' }]}>
                <Text style={styles.modalTitle}>ADD MATERIALS</Text>
                
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
                    {[1, 2, 3, 4].map((num) => {
                        const mValue = [addMat1, addMat2, addMat3, addMat4][num - 1];
                        const setMValue = [setAddMat1, setAddMat2, setAddMat3, setAddMat4][num - 1];
                        const qtyValue = [addMQty1, addMQty2, addMQty3, addMQty4][num - 1];
                        const setQtyValue = [setAddMQty1, setAddMQty2, setAddMQty3, setAddMQty4][num - 1];
                        const isMNone = mValue === 'None';
                        
                        const selectedMatObj = dbMaterials.find((m: any) => m.material_name === mValue);
                        const currentStock = selectedMatObj ? parseFloat(selectedMatObj.closing_stock || "0") : 0;

                        return (
                            <View key={num}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 15 }}>
                                    <Text style={[styles.inputLabel, { marginTop: 0 }]}>MATERIAL {num} & QTY (KGS)</Text>
                                    {!isMNone && (
                                        <View style={styles.stockBox}>
                                            <Text style={[styles.stockValue, currentStock < 50 && { color: '#EF4444' }]}>
                                                STK: {currentStock}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                                <View style={styles.row}>
                                    <View style={[styles.pickerBox, { flex: 2 }]}>
                                        <Picker 
                                            selectedValue={mValue} 
                                            onValueChange={(val) => setMValue(val)} 
                                            style={styles.picker}
                                        >
                                            <Picker.Item label="None" value="None" color="#000000" />
                                            {dbMaterials.map((m: any) => <Picker.Item key={m.id} label={m.material_name} value={m.material_name} color="#000000" />)}
                                        </Picker>
                                    </View>
                                    <TextInput 
                                        style={[styles.input, { flex: 1, marginLeft: 10 }, isMNone && styles.locked]} 
                                        value={isMNone ? '0' : qtyValue} 
                                        onChangeText={setQtyValue} 
                                        keyboardType="numeric" 
                                        editable={!isMNone} 
                                    />
                                </View>
                            </View>
                        );
                    })}

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 15 }}>
                        <Text style={[styles.inputLabel, { marginTop: 0 }]}>COLOR & QTY (KGS)</Text>
                    </View>
                    <View style={styles.row}>
                        <View style={[styles.pickerBox, { flex: 2 }]}>
                            <Picker 
                                selectedValue={addCol} 
                                onValueChange={(val) => setAddCol(val)} 
                                style={styles.picker}
                            >
                                <Picker.Item label="Natural" value="Natural" color="#000000" />
                                {dbColors.map((c: any) => (<Picker.Item key={c.id} label={c.color_name} value={c.color_name} color="#000000" />))}
                            </Picker>
                        </View>
                        <TextInput 
                            style={[styles.input, { flex: 1, marginLeft: 10 }, addCol === 'Natural' && styles.locked]} 
                            value={addCol === 'Natural' ? '0' : addCQty} 
                            onChangeText={setAddCQty} 
                            keyboardType="numeric" 
                            editable={addCol !== 'Natural'} 
                        />
                    </View>
                </ScrollView>

                <View style={[styles.modalBtnRow, { position: 'absolute', bottom: 20, left: 20, right: 20, backgroundColor: '#1E293B', paddingVertical: 10 }]}>
                    <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#334155' }]} onPress={onClose}>
                        <Text style={styles.modalBtnText}>CANCEL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.modalBtn, { backgroundColor: '#3B82F6' }]} 
                        onPress={onAdd}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.modalBtnText}>ADD TO BATCH</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
));

export const LumpsModal = memo(({ visible, onClose, onSave, lumpsKg, setLumpsKg, wastageKg, setWastageKg, isSubmitting }: any) => (
    <Modal animationType="slide" transparent={true} visible={visible}>
        <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>LUMPS & WASTAGE</Text>
                
                <View style={{ marginBottom: 15 }}>
                    <Text style={styles.inputLabel}>LUMPS (KG)</Text>
                    <TextInput 
                        style={styles.input} 
                        value={lumpsKg} 
                        onChangeText={setLumpsKg} 
                        keyboardType="numeric" 
                        placeholder="0.00"
                        placeholderTextColor="#475569"
                    />
                </View>

                <View style={{ marginBottom: 15 }}>
                    <Text style={styles.inputLabel}>WASTAGE / PURGING (KG)</Text>
                    <TextInput 
                        style={styles.input} 
                        value={wastageKg} 
                        onChangeText={setWastageKg} 
                        keyboardType="numeric" 
                        placeholder="0.00"
                        placeholderTextColor="#475569"
                    />
                </View>

                <View style={styles.modalBtnRow}>
                    <TouchableOpacity style={[styles.modalBtn, { backgroundColor: '#334155' }]} onPress={onClose}>
                        <Text style={styles.modalBtnText}>CANCEL</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.modalBtn, { backgroundColor: '#3B82F6' }]} 
                        onPress={onSave}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={styles.modalBtnText}>SAVE DATA</Text>}
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    </Modal>
));

const styles = StyleSheet.create({
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { backgroundColor: '#1E293B', borderRadius: 20, padding: 20, width: '90%', borderWidth: 1, borderColor: '#334155' },
    modalTitle: { fontSize: 16, fontWeight: '900', textAlign: 'center', marginBottom: 15, color: 'white' },
    inputLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '900', marginTop: 10, marginBottom: 5 },
    pickerBox: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
    picker: { color: '#000000' },
    input: { backgroundColor: '#0F172A', borderRadius: 12, borderWidth: 1, borderColor: '#334155', color: 'white', padding: 10, fontWeight: 'bold', fontSize: 13 },
    locked: { opacity: 0.5, backgroundColor: '#334155' },
    modalBtnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
    modalBtn: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', marginHorizontal: 5 },
    modalBtnText: { color: 'white', fontWeight: 'bold' },
    reasonInput: { backgroundColor: '#0F172A', color: 'white', borderRadius: 12, padding: 12, height: 80, textAlignVertical: 'top', marginTop: 10, fontSize: 14 },
    divider: { height: 1, backgroundColor: '#334155', marginVertical: 10 },
    approveBtn: { padding: 20, borderRadius: 20, marginTop: 20, alignItems: 'center', backgroundColor: '#10B981' },
    approveBtnText: { color: 'white', fontWeight: '900' },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', padding: 10 },
    slotItem: { width: '48%', backgroundColor: '#0F172A', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
    slotRecorded: { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)' },
    slotPending: { borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)' },
    slotRangeText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    slotStatusText: { color: '#94A3B8', fontSize: 10, fontWeight: '900', marginTop: 4 },
    slotDataText: { color: '#10B981', fontSize: 10, fontWeight: 'bold', marginTop: 4 },
    stockBox: { backgroundColor: '#0F172A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#334155', marginBottom: 2 },
    stockValue: { fontSize: 10, fontWeight: '900', color: '#10B981' },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
});
