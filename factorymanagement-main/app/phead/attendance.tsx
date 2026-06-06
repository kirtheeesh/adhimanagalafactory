import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
    Alert, FlatList,
    KeyboardAvoidingView,
    Linking,
    Modal,
    Platform,
    ScrollView,
    StatusBar, StyleSheet, Text, TextInput, TouchableOpacity, View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// Import your central API config
import { SERVER_URL } from '@shared/constants/ApiConfig';
import PHeadFooter from '@shared/components/PHeadFooter';

// Helper Components
const AttendanceGraph = ({ employees }: { employees: any[] }) => {
    // Defensive filtering to prevent crashes
    const presentCount = employees.filter(e => e && e.status === 'Present').length;
    const totalCount = employees.filter(e => !!e).length || 1;
    const absentCount = employees.filter(e => e && (e.status === 'Absent' || !e.status)).length;
    const halfDayCount = employees.filter(e => e && e.status === 'Half Day').length;

    const data = [
        { label: 'P', value: presentCount, color: '#10B981' },
        { label: 'HD', value: halfDayCount, color: '#F59E0B' },
        { label: 'A', value: absentCount, color: '#EF4444' },
    ];

    return (
        <View style={styles.graphCard}>
            <Text style={styles.graphTitle}>Attendance Flow</Text>
            <View style={styles.graphContainer}>
                {data.map((item, index) => {
                    // Ensure height is a valid number and not NaN
                    const rawHeight = (item.value / totalCount) * 100;
                    const height = isNaN(rawHeight) ? 5 : Math.max(5, rawHeight);
                    return (
                        <View key={index} style={styles.barWrapper}>
                            <View style={[styles.bar, { height: `${height}%`, backgroundColor: item.color }]} />
                            <Text style={styles.barLabel}>{item.label}</Text>
                            <Text style={styles.barValue}>{item.value}</Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
};

export default function AttendanceEnroll() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    
    // Refs for Web Date Pickers
    const fromDateRef = React.useRef<any>(null);
    const toDateRef = React.useRef<any>(null);
    
    // Main Screen States
    const getSystemShift = () => {
        const hour = new Date().getHours();
        return (hour >= 8 && hour < 20) ? 'Day' : 'Night';
    };

    const [selectedShift, setSelectedShift] = useState(getSystemShift());
    const [selectedCategory, setSelectedCategory] = useState<'skilled att' | 'unskilled att' | null>(null);
    const [employees, setEmployees] = useState<any[]>([]); 
    const [allEmployees, setAllEmployees] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Management Modal States
    const [showManageModal, setShowManageModal] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState<any>(null);
    const [manageShift, setManageShift] = useState('General');
    const [manageGender, setManageGender] = useState('Male');
    const [manageRole, setManageRole] = useState('OPERATOR');
    const [manageCategory, setManageCategory] = useState<'unskilled att' | 'skilled att'>('unskilled att');
    const [manageId, setManageId] = useState('');
    const [manageName, setManageName] = useState('');
    const [deleteId, setDeleteId] = useState('');

    // Report Modal States
    const [showMonthlyModal, setShowMonthlyModal] = useState(false);
    const [reportShift, setReportShift] = useState('Day');
    const [fromDate, setFromDate] = useState(new Date());
    const [toDate, setToDate] = useState(new Date());
    const [showPicker, setShowPicker] = useState<'from' | 'to' | null>(null);

    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showGenderModal, setShowGenderModal] = useState(false);
    const [showManageCategoryModal, setShowManageCategoryModal] = useState(false);
    const [showShiftSelectModal, setShowShiftSelectModal] = useState(false);
    const [showReportShiftModal, setShowReportShiftModal] = useState(false);

    const formatDateLocal = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const today = formatDateLocal(new Date());

    useEffect(() => { 
        // Update shift based on time periodically
        const shiftTimer = setInterval(() => {
            const currentShift = getSystemShift();
            if (selectedShift !== currentShift) {
                setSelectedShift(currentShift);
            }
        }, 60000);
        
        console.log("!!! ATTENANCE SCREEN LOADED - VER 3 !!!");
        fetchEmployees(); 
        return () => clearInterval(shiftTimer);
    }, [selectedShift]);

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const [shiftRes, allRes] = await Promise.all([
                fetch(`${SERVER_URL}/all-employees/${selectedShift}?_=${Date.now()}`),
                fetch(`${SERVER_URL}/all-employees/summary?_=${Date.now()}`) // Reuse the summary endpoint or fetch all
            ]);
            
            const shiftData = await shiftRes.json();
            const allData = await allRes.json();
            
            setEmployees(Array.isArray(shiftData) ? shiftData : []);
            setAllEmployees(Array.isArray(allData) ? allData : []);
        } catch (error: any) { 
            console.error(`[ERR] ${error.message}`);
            setEmployees([]); 
            setAllEmployees([]);
        }
        finally { setLoading(false); }
    };

    const attendanceStats = useMemo(() => {
        const stats = {
            Day: { present: 0, absent: 0 },
            Night: { present: 0, absent: 0 }
        };

        allEmployees.forEach(emp => {
            if (!emp) return;
            const shift = emp.assigned_shift || 'Day';
            const isPresent = emp.status === 'Present' || (emp.is_checked_in && !['Absent', 'Half Day'].includes(emp.status));
            
            if (shift === 'Day' || shift === 'Night') {
                if (isPresent) stats[shift].present++;
                else stats[shift].absent++;
            }
        });
        return stats;
    }, [allEmployees]);

    // Auto-generate next Staff ID (e.g., OP001, PR001)
    const generateNextId = (role: string = manageRole) => {
        const prefix = role.substring(0, 2).toUpperCase();
        if (employees.length === 0) return `${prefix}001`;
        
        // Find all numeric parts of IDs that match the prefix
        const ids = employees
            .map(emp => {
                if (!emp) return 0;
                const regex = new RegExp(`${prefix}(\\d+)`, 'i');
                const match = emp.staff_id?.match(regex);
                return match ? parseInt(match[1]) : 0;
            })
            .filter(n => n > 0);
        
        const maxId = ids.length > 0 ? Math.max(...ids) : 0;
        const nextNum = maxId + 1;
        return `${prefix}${nextNum.toString().padStart(3, '0')}`;
    };

    // Update manageId when modal opens or role changes
    useEffect(() => {
        if (showManageModal) {
            setManageId(generateNextId());
        }
    }, [showManageModal, employees, manageRole]);

    // MANAGEMENT: ADD OPERATOR
    const handleAddOperator = async () => {
        console.log("[ADD] Button Pressed");
        const cleanId = manageId.toUpperCase().trim() || generateNextId();
        const cleanName = manageName.trim();
        console.log(`[ADD] ID: "${cleanId}", Name: "${cleanName}", Gender: "${manageGender}"`);

        if (!cleanName) {
            Alert.alert("Error", "Please enter a name");
            return;
        }

        const exists = employees.some(emp => emp.staff_id?.toUpperCase() === cleanId);
        if (exists) {
            console.log("[ADD] ID already exists in local state");
            Alert.alert("ID Exists", "Generated ID already exists. Please try again.");
            return;
        }

        try {
            const url = `${SERVER_URL}/operators/add`;
            console.log(`[ADD] Fetching ${url}`);
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    operator_id: cleanId, 
                    name: cleanName, 
                    assigned_shift: selectedShift, // Default to current shift
                    gender: manageGender,
                    role: manageRole,
                    category: manageCategory
                })
            });
            console.log(`[ADD] Status: ${res.status}`);
            if (res.ok) {
                Alert.alert("Success", `Staff added with ID: ${cleanId}`);
                setManageId(''); setManageName('');
                fetchEmployees();
            } else {
                const errData = await res.json();
                console.error("[ADD] Error Data:", errData);
                Alert.alert("Error", errData.error || "Failed to add staff");
            }
        } catch (e: any) { 
            console.error("[ADD] Catch Error:", e.message);
            Alert.alert("Error", "Connection failed: " + e.message); 
        }
    };

    // MANAGEMENT: DELETE OPERATOR
    const handleRemoveOperator = async (id: string) => {
        const formattedId = id.toUpperCase().trim();
        
        if (!formattedId) {
            Alert.alert("Error", "Please enter a staff ID");
            return;
        }

        try {
            // Find in current list or fetch from server to get full details
            let target = employees.find((emp: any) => emp.staff_id?.toUpperCase() === formattedId);

            if (!target) {
                // If not in current shift, try fetching ALL employees to find them
                const res = await fetch(`${SERVER_URL}/operators/search/${formattedId}`);
                if (res.ok) {
                    target = await res.json();
                }
            }

            if (!target) {
                Alert.alert("Not Found", `No staff with ID ${formattedId} found.`);
                return;
            }

            setStaffToDelete(target);
            setShowConfirmDelete(true);
        } catch (e) {
            console.error("Delete Prep Error:", e);
            Alert.alert("Error", "Could not verify staff details.");
        }
    };

    const confirmDeleteStaff = async () => {
        if (!staffToDelete) return;
        
        try {
            const res = await fetch(`${SERVER_URL}/operators/remove/${staffToDelete.staff_id}`, { method: 'DELETE' });
            if (res.ok) {
                Alert.alert("Deleted", "Staff removed successfully.");
                setShowConfirmDelete(false);
                setStaffToDelete(null);
                setDeleteId('');
                fetchEmployees();
            } else {
                Alert.alert("Error", "Could not delete from server.");
            }
        } catch (e) { 
            Alert.alert("Error", "Server Connection Failed"); 
        }
    };

    const handleFetchReport = () => {
        const f = formatDateLocal(fromDate);
        const t = formatDateLocal(toDate);
        const url = `${SERVER_URL}/attendance/report?from=${f}&to=${t}`;
        Linking.openURL(url).catch(() => Alert.alert("Error", "Check Connection."));
    };

    const handleWebDateChange = (val: string, setter: (d: Date) => void) => {
        if (!val) return;
        const [y, m, d] = val.split('-').map(Number);
        setter(new Date(y, m - 1, d));
    };

    const onDateChange = (event: any, selectedDate?: Date) => {
        if (Platform.OS === 'android') {
            setShowPicker(null);
        }
        
        if (selectedDate) {
            if (showPicker === 'from') setFromDate(selectedDate);
            if (showPicker === 'to') setToDate(selectedDate);
        }
    };

    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(timer);
    }, []);

    const handleToggleAttendance = async (emp: any, forcedStatus?: string) => {
        try {
            const res = await fetch(`${SERVER_URL}/attendance/toggle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    staff_id: emp.staff_id, 
                    staff_name: emp.name, 
                    shift: selectedShift,
                    forced_status: forcedStatus
                })
            });
            const data = await res.json();
            if (data.success) {
                setEmployees(prev => (prev || []).map(e => 
                    (e && e.staff_id === emp.staff_id) 
                    ? { 
                        ...e, 
                        is_checked_in: data.is_checked_in, 
                        total_minutes: data.total_minutes, 
                        od_minutes: data.od_minutes,
                        last_check_in: data.last_check_in,
                        status: data.status
                      } 
                    : e
                ));
            }
        } catch (e) { Alert.alert("Error", "Toggle failed"); }
    };

    const formatTime = (mins: number) => {
        const h = Math.floor(mins / 60);
        const m = mins % 60;
        return `${h}h ${m}m`;
    };

    const getShiftTarget = (gender: any) => {
        return String(gender || '').toLowerCase() === 'female' ? 10 : 12;
    };

    const filteredEmployees = useMemo(() => {
        return employees.filter(emp => {
            if (!emp) return false;
            if (!selectedCategory) return true;
            
            if (emp.category) {
                return emp.category === selectedCategory;
            }

            const role = String(emp.role || '').toUpperCase();
            const isDaily = [
                'SEWAGE HELPER', 'WATCHMAN', 'WATCHMEN', 'SALES', 'ACCOUNTS', 
                'VAN DRIVER', 'UNSKILL LABOUR', 'UNSKILLEDLABOUR', 'PACKING', 
                'QUALITY', 'SUPERVISOR'
            ].includes(role);
            
            if (selectedCategory === 'unskilled att') return isDaily;
            if (selectedCategory === 'skilled att') return !isDaily;
            
            return true;
        });
    }, [employees, selectedCategory]);

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" />
            
            <View style={[styles.headerRow, { paddingTop: Math.max(insets.top, 5) }]}>
                <TouchableOpacity 
                    onPress={() => {
                        if (selectedCategory) {
                            setSelectedCategory(null);
                        } else {
                            router.replace('/phead');
                        }
                    }} 
                    style={styles.iconBtn}
                >
                    <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <View style={{flex:1, marginLeft: 15}}>
                    <Text style={styles.title}>Attendance</Text>
                    <Text style={styles.dateText}>{today}</Text>
                </View>
                <TouchableOpacity onPress={() => setShowManageModal(true)} style={[styles.headerBtn, {backgroundColor: '#475569'}]}>
                    <Ionicons name="settings" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowMonthlyModal(true)} style={[styles.headerBtn, {backgroundColor: '#3B82F6', marginLeft: 10}]}>
                    <Ionicons name="calendar" size={20} color="white" />
                </TouchableOpacity>
            </View>

            <View style={styles.categoryToggleContainer}>
                <TouchableOpacity 
                    style={styles.dropdownBtn}
                    onPress={() => setShowRoleModal(true)}
                >
                    <Text style={styles.dropdownBtnText}>
                        {selectedCategory === 'unskilled att' ? 'UNSKILLED ATT' : (selectedCategory === 'skilled att' ? 'SKILLED ATT' : 'SELECT CATEGORY')}
                    </Text>
                    <Ionicons name="chevron-down" size={20} color="#3B82F6" />
                </TouchableOpacity>

                {selectedCategory && (
                    <TouchableOpacity 
                        style={[styles.dropdownBtn, { marginLeft: 10 }]}
                        onPress={() => setShowShiftSelectModal(true)}
                    >
                        <Text style={styles.dropdownBtnText}>{selectedShift.toUpperCase()} SHIFT</Text>
                        <Ionicons name="chevron-down" size={20} color="#3B82F6" />
                    </TouchableOpacity>
                )}
            </View>

            {!selectedCategory ? (
                <View style={{ flex: 1, justifyContent: 'center' }}>
                    <View style={styles.statsContainer}>
                        <View style={styles.statsCard}>
                            <View style={styles.statsHeader}>
                                <Ionicons name="sunny" size={14} color="#F59E0B" style={{ marginRight: 6 }} />
                                <Text style={styles.statsHeaderText}>DAY SHIFT</Text>
                            </View>
                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <Text style={[styles.statValue, { color: '#10B981' }]}>{attendanceStats.Day.present}</Text>
                                    <Text style={styles.statLabel}>PRESENT</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={[styles.statValue, { color: '#EF4444' }]}>{attendanceStats.Day.absent}</Text>
                                    <Text style={styles.statLabel}>ABSENT</Text>
                                </View>
                            </View>
                        </View>

                        <View style={styles.statsCard}>
                            <View style={styles.statsHeader}>
                                <Ionicons name="moon" size={14} color="#6366F1" style={{ marginRight: 6 }} />
                                <Text style={styles.statsHeaderText}>NIGHT SHIFT</Text>
                            </View>
                            <View style={styles.statsRow}>
                                <View style={styles.statItem}>
                                    <Text style={[styles.statValue, { color: '#10B981' }]}>{attendanceStats.Night.present}</Text>
                                    <Text style={styles.statLabel}>PRESENT</Text>
                                </View>
                                <View style={styles.statDivider} />
                                <View style={styles.statItem}>
                                    <Text style={[styles.statValue, { color: '#EF4444' }]}>{attendanceStats.Night.absent}</Text>
                                    <Text style={styles.statLabel}>ABSENT</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                    <AttendanceGraph employees={employees} />
                    <View style={{ padding: 40, alignItems: 'center' }}>
                        <Ionicons name="finger-print" size={60} color="#334155" />
                        <Text style={{ color: '#64748B', marginTop: 15, textAlign: 'center', fontWeight: 'bold' }}>
                            Select a category above to manage attendance records.
                        </Text>
                    </View>
                </View>
            ) : (
                <View style={{ flex: 1 }}>
                    <View style={styles.listHeaderRow}>
                        <TouchableOpacity onPress={() => setSelectedCategory(null)} style={styles.backToStatsBtn}>
                            <Ionicons name="stats-chart" size={16} color="#3B82F6" style={{ marginRight: 4 }} />
                            <Text style={styles.backToStatsText}>VIEW ANALYTICS</Text>
                        </TouchableOpacity>
                    </View>

                    <FlatList
                        data={filteredEmployees}
                        keyExtractor={(item, index) => item.staff_id?.toString() || index.toString()}
                        onRefresh={fetchEmployees}
                        refreshing={loading}
                        contentContainerStyle={{ paddingBottom: 150 }}
                        ListEmptyComponent={
                            <View style={{ alignItems: 'center', marginTop: 50 }}>
                                <Text style={{ color: '#64748B' }}>No staff found for this category.</Text>
                            </View>
                        }
                        renderItem={({ item }) => {
                        // Ensure item is not null and has staff_id
                        if (!item || !item.staff_id) return null;
                        
                        const gender = item.gender || 'Male';
                        const target = getShiftTarget(gender);
                        
                        // Defensive parsing for total_minutes
                        let totalMinsVal = 0;
                        try {
                            totalMinsVal = parseFloat(item.total_minutes) || 0;
                            if (isNaN(totalMinsVal)) totalMinsVal = 0;
                        } catch (e) {
                            totalMinsVal = 0;
                        }
                        
                        let displayMins = totalMinsVal;
                        
                        if (item.is_checked_in && item.last_check_in) {
                            try {
                                const lastDate = new Date(item.last_check_in);
                                if (!isNaN(lastDate.getTime())) {
                                    const diff = (now?.getTime() || Date.now()) - lastDate.getTime();
                                    const runningMins = Math.max(0, Math.floor(diff / 60000));
                                    displayMins += runningMins;
                                }
                            } catch (e) {
                                console.error("Date parse error", e);
                            }
                        }

                        // Ensure displayMins is not NaN after calculation
                        if (typeof displayMins !== 'number' || isNaN(displayMins)) displayMins = 0;

                        // Role Logic
                        const role = String(item.role || '').toUpperCase();
                        let isDailyRole = [
                            'SEWAGE HELPER', 'WATCHMAN', 'WATCHMEN', 'SALES', 'ACCOUNTS', 
                            'VAN DRIVER', 'UNSKILL LABOUR', 'UNSKILLEDLABOUR', 'PACKING', 
                            'QUALITY', 'SUPERVISOR'
                        ].includes(role);

                        // If category is provided, it overrides role-based logic
                        if (item.category === 'unskilled att') isDailyRole = true;
                        if (item.category === 'skilled att') isDailyRole = false;

                        // Real-time Status Calculation
                        const isFemale = String(gender).toLowerCase() === 'female';
                        const presentThreshold = isFemale ? 480 : 600; // 8h vs 10h
                        const halfDayThreshold = isFemale ? 300 : 360; // 5h vs 6h
                        
                        let currentStatus = 'Absent';
                        const isMarked = isDailyRole && !!item.status;
                        
                        if (isDailyRole) {
                            currentStatus = String(item.status || 'Not Marked');
                        } else {
                            if (displayMins >= presentThreshold) {
                                currentStatus = 'Present';
                            } else if (displayMins >= halfDayThreshold) {
                                currentStatus = 'Half Day';
                            }
                        }

                        // OD Calculation (Real-time)
                        const dutyTargetMins = isFemale ? 600 : 720;
                        let displayOD = 0;
                        try {
                            displayOD = Math.max(0, (displayMins - dutyTargetMins) / 60);
                            if (isNaN(displayOD) || !isFinite(displayOD)) displayOD = 0;
                        } catch (e) {
                            displayOD = 0;
                        }
                        
                        const isWorkingElsewhere = !!(item.is_checked_in && item.attendance_shift && item.attendance_shift !== selectedShift);

                        return (
                            <View style={styles.card}>
                                <View style={{flex: 1}}>
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <Text style={styles.nameText} numberOfLines={1}>{String(item.name || 'Unknown')}</Text>
                                        <View style={{
                                            backgroundColor: currentStatus === 'Present' ? '#065F46' : (currentStatus === 'Half Day' ? '#92400E' : (currentStatus === 'Not Marked' ? '#334155' : '#991B1B')), 
                                            paddingHorizontal: 6, 
                                            paddingVertical: 2, 
                                            borderRadius: 4, 
                                            marginLeft: 8
                                        }}>
                                            <Text style={{
                                                color: currentStatus === 'Present' ? '#34D399' : (currentStatus === 'Half Day' ? '#FBBF24' : (currentStatus === 'Not Marked' ? '#94A3B8' : '#F87171')), 
                                                fontSize: 10, 
                                                fontWeight: 'bold'
                                            }}>{String(currentStatus || '').toUpperCase()}</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.idText}>ID: {String(item.staff_id || 'N/A')} | {String(item.role || 'N/A')}</Text>
                                    {!isDailyRole && (
                                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                            <Text style={styles.timeText}>Time: {formatTime(displayMins)} / {target}h</Text>
                                            {displayOD > 0 && (
                                                <Text style={[styles.timeText, {color: '#F59E0B', marginLeft: 10}]}>
                                                    OD: {displayOD.toFixed(1)}h
                                                </Text>
                                            )}
                                        </View>
                                    )}
                                </View>
                                <View style={{alignItems: 'center', marginLeft: 10}}>
                                    {isWorkingElsewhere && (
                                        <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 4}}>
                                            <Ionicons name="warning" size={14} color="#FBBF24" style={{marginRight: 4}} />
                                            <Text style={{color: '#FBBF24', fontSize: 11, fontWeight: 'bold'}}>Working in {String(item.attendance_shift)}</Text>
                                        </View>
                                    )}
                                    
                                    {isDailyRole ? (
                                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                            <TouchableOpacity 
                                                onPress={() => !isWorkingElsewhere && handleToggleAttendance(item, 'Present')} 
                                                disabled={isWorkingElsewhere || isMarked}
                                                style={[
                                                    styles.toggleBtn, 
                                                    styles.bgGreen,
                                                    { marginRight: 6 },
                                                    (isWorkingElsewhere || isMarked) && { opacity: 0.5, backgroundColor: currentStatus === 'Present' ? '#065F46' : '#1E293B' }
                                                ]}
                                            >
                                                <Text style={styles.toggleBtnText}>PRESENT</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity 
                                                onPress={() => !isWorkingElsewhere && handleToggleAttendance(item, 'Absent')} 
                                                disabled={isWorkingElsewhere || isMarked}
                                                style={[
                                                    styles.toggleBtn, 
                                                    styles.bgRed,
                                                    (isWorkingElsewhere || isMarked) && { opacity: 0.5, backgroundColor: currentStatus === 'Absent' ? '#991B1B' : '#1E293B' }
                                                ]}
                                            >
                                                <Text style={styles.toggleBtnText}>ABSENT</Text>
                                            </TouchableOpacity>
                                        </View>
                                    ) : (
                                        <TouchableOpacity 
                                            onPress={() => !isWorkingElsewhere && handleToggleAttendance(item)} 
                                            disabled={isWorkingElsewhere}
                                            style={[
                                                styles.toggleBtn, 
                                                item.is_checked_in ? styles.bgRed : styles.bgGreen,
                                                isWorkingElsewhere && { opacity: 0.5 }
                                            ]}
                                        >
                                            <Text style={styles.toggleBtnText}>
                                                {isWorkingElsewhere ? "Working" : (item.is_checked_in ? "Check Out" : "Check In")}
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        );
                    }}
                />
            </View>
            )}

            <PHeadFooter />

            {/* ROLE SELECTION MODAL */}
            <Modal visible={showRoleModal} transparent animationType="slide">
                <View style={styles.dropdownModalOverlay}>
                    <View style={styles.dropdownModalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>SELECT CATEGORY/ROLE</Text>
                            <TouchableOpacity onPress={() => setShowRoleModal(false)}>
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {!showManageModal ? (
                                <>
                                    <TouchableOpacity 
                                        style={[styles.dropdownItem, selectedCategory === 'unskilled att' && styles.activeDropdownItem]}
                                        onPress={() => { setSelectedCategory('unskilled att'); setShowRoleModal(false); }}
                                    >
                                        <Text style={[styles.dropdownItemText, selectedCategory === 'unskilled att' && styles.activeDropdownItemText]}>UNSKILLED ATT</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.dropdownItem, selectedCategory === 'skilled att' && styles.activeDropdownItem]}
                                        onPress={() => { setSelectedCategory('skilled att'); setShowRoleModal(false); }}
                                    >
                                        <Text style={[styles.dropdownItemText, selectedCategory === 'skilled att' && styles.activeDropdownItemText]}>SKILLED ATT</Text>
                                    </TouchableOpacity>
                                </>
                            ) : (
                                ['OPERATOR', 'PRODUCT HEAD', 'ACCOUNTS', 'SALES', 'QUALITY', 'PACKING', 'SUPERVISOR', 'WATCHMAN', 'VAN DRIVER', 'SEWAGE HELPER'].map((r) => (
                                    <TouchableOpacity 
                                        key={r}
                                        style={[styles.dropdownItem, manageRole === r && styles.activeDropdownItem]}
                                        onPress={() => { setManageRole(r); setShowRoleModal(false); }}
                                    >
                                        <Text style={[styles.dropdownItemText, manageRole === r && styles.activeDropdownItemText]}>{r}</Text>
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* GENDER SELECTION MODAL */}
            <Modal visible={showGenderModal} transparent animationType="slide">
                <View style={styles.dropdownModalOverlay}>
                    <View style={styles.dropdownModalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>SELECT GENDER</Text>
                            <TouchableOpacity onPress={() => setShowGenderModal(false)}>
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                        {['Male', 'Female'].map((g) => (
                            <TouchableOpacity 
                                key={g}
                                style={[styles.dropdownItem, manageGender === g && styles.activeDropdownItem]}
                                onPress={() => { setManageGender(g); setShowGenderModal(false); }}
                            >
                                <Text style={[styles.dropdownItemText, manageGender === g && styles.activeDropdownItemText]}>{g}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            {/* MANAGE CATEGORY SELECTION MODAL */}
            <Modal visible={showManageCategoryModal} transparent animationType="slide">
                <View style={styles.dropdownModalOverlay}>
                    <View style={styles.dropdownModalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>SELECT CATEGORY</Text>
                            <TouchableOpacity onPress={() => setShowManageCategoryModal(false)}>
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                        {['unskilled att', 'skilled att'].map((c) => (
                            <TouchableOpacity 
                                key={c}
                                style={[styles.dropdownItem, manageCategory === c && styles.activeDropdownItem]}
                                onPress={() => { setManageCategory(c as any); setShowManageCategoryModal(false); }}
                            >
                                <Text style={[styles.dropdownItemText, manageCategory === c && styles.activeDropdownItemText]}>
                                    {c === 'unskilled att' ? 'UNSKILLED ATT' : 'SKILLED ATT'}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            {/* SHIFT SELECTION MODAL (MAIN) */}
            <Modal visible={showShiftSelectModal} transparent animationType="slide">
                <View style={styles.dropdownModalOverlay}>
                    <View style={styles.dropdownModalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>SELECT SHIFT</Text>
                            <TouchableOpacity onPress={() => setShowShiftSelectModal(false)}>
                                <Ionicons name="close" size={24} color="white" />
                            </TouchableOpacity>
                        </View>
                        {['Day', 'Night'].map((s) => (
                            <TouchableOpacity 
                                key={s}
                                style={[styles.dropdownItem, selectedShift === s && styles.activeDropdownItem]}
                                onPress={() => { setSelectedShift(s); setShowShiftSelectModal(false); }}
                            >
                                <Text style={[styles.dropdownItemText, selectedShift === s && styles.activeDropdownItemText]}>{s} SHIFT</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </Modal>

            <Modal visible={showManageModal} transparent animationType="slide">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 150 }}>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#334155'}}>
                                <TouchableOpacity onPress={() => setShowManageModal(false)} style={{ padding: 5 }}>
                                    <Ionicons name="arrow-back" size={28} color="white" />
                                </TouchableOpacity>
                                <Text style={[styles.modalTitle, { marginBottom: 0, marginLeft: 10, textAlign: 'left', flex: 1 }]}>Staff Management</Text>
                            </View>
                            
                            <View style={styles.manageCard}>
                                <Text style={styles.cardLabel}>ADD NEW STAFF</Text>
                                <View style={{ position: 'relative' }}>
                                    <TextInput 
                                        style={[styles.input, { backgroundColor: '#F1F5F9', color: '#64748B' }]} 
                                        placeholder="Staff ID" 
                                        value={manageId} 
                                        editable={false} 
                                    />
                                    <Ionicons name="lock-closed" size={16} color="#94A3B8" style={{ position: 'absolute', right: 12, top: 14 }} />
                                </View>
                                <TextInput style={styles.input} placeholder="Full Name" placeholderTextColor="#64748B" value={manageName} onChangeText={setManageName} />
                                
                                <Text style={styles.label}>ROLE</Text>
                                <TouchableOpacity 
                                    style={[styles.dropdownBtn, { backgroundColor: '#1E293B', marginBottom: 15 }]}
                                    onPress={() => setShowRoleModal(true)}
                                >
                                    <Text style={styles.dropdownBtnText}>{manageRole}</Text>
                                    <Ionicons name="chevron-down" size={20} color="#3B82F6" />
                                </TouchableOpacity>

                                <Text style={styles.label}>GENDER</Text>
                                <TouchableOpacity 
                                    style={[styles.dropdownBtn, { backgroundColor: '#1E293B', marginBottom: 15 }]}
                                    onPress={() => setShowGenderModal(true)}
                                >
                                    <Text style={styles.dropdownBtnText}>{manageGender}</Text>
                                    <Ionicons name="chevron-down" size={20} color="#3B82F6" />
                                </TouchableOpacity>

                                <Text style={styles.label}>CATEGORY</Text>
                                <TouchableOpacity 
                                    style={[styles.dropdownBtn, { backgroundColor: '#1E293B', marginBottom: 15 }]}
                                    onPress={() => setShowManageCategoryModal(true)}
                                >
                                    <Text style={styles.dropdownBtnText}>{manageCategory.toUpperCase()}</Text>
                                    <Ionicons name="chevron-down" size={20} color="#3B82F6" />
                                </TouchableOpacity>

                                <TouchableOpacity onPress={handleAddOperator} style={styles.addBtn}><Text style={styles.btnLabel}>SAVE STAFF</Text></TouchableOpacity>
                            </View>

                            <View style={[styles.manageCard, {marginTop: 20}]}>
                                <Text style={styles.cardLabel}>DELETE STAFF</Text>
                                <TextInput style={styles.input} placeholder="Enter ID to remove" placeholderTextColor="#64748B" value={deleteId} onChangeText={setDeleteId} autoCapitalize="characters" />
                                <TouchableOpacity onPress={() => handleRemoveOperator(deleteId)} style={styles.deleteBtn}><Text style={styles.btnLabel}>DELETE</Text></TouchableOpacity>
                            </View>

                            <TouchableOpacity onPress={() => setShowManageModal(false)} style={styles.closeBtn}><Text style={styles.btnLabel}>CLOSE</Text></TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* CONFIRM DELETE MODAL */}
            <Modal visible={showConfirmDelete} transparent animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { padding: 30, width: '80%' }]}>
                        <Ionicons name="alert-circle" size={50} color="#EF4444" style={{ alignSelf: 'center', marginBottom: 15 }} />
                        <Text style={[styles.modalTitle, { color: 'white', marginBottom: 10 }]}>Confirm Delete</Text>
                        <Text style={{ color: '#94A3B8', textAlign: 'center', marginBottom: 20, fontSize: 14 }}>
                            Are you sure you want to remove this staff member?
                        </Text>
                        
                        <View style={{ backgroundColor: '#0F172A', padding: 15, borderRadius: 15, marginBottom: 25, borderWidth: 1, borderColor: '#334155' }}>
                            <Text style={{ color: '#64748B', fontSize: 11, fontWeight: 'bold' }}>STAFF DETAILS</Text>
                            <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', marginTop: 8 }}>{staffToDelete?.name}</Text>
                            <Text style={{ color: '#3B82F6', fontSize: 14, marginTop: 4 }}>ID: {staffToDelete?.staff_id}</Text>
                            <Text style={{ color: '#64748B', fontSize: 12, marginTop: 4 }}>Shift: {staffToDelete?.assigned_shift} | {staffToDelete?.gender}</Text>
                        </View>

                        <View style={{ flexDirection: 'row' }}>
                            <TouchableOpacity 
                                onPress={() => setShowConfirmDelete(false)} 
                                style={{ flex: 1, padding: 15, borderRadius: 12, backgroundColor: '#334155', marginRight: 10, alignItems: 'center' }}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>CANCEL</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                onPress={confirmDeleteStaff} 
                                style={{ flex: 1, padding: 15, borderRadius: 12, backgroundColor: '#EF4444', alignItems: 'center' }}
                            >
                                <Text style={{ color: 'white', fontWeight: 'bold' }}>DELETE</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal visible={showMonthlyModal} transparent animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Attendance Report</Text>

                        {Platform.OS === 'web' ? (
                            <View style={{marginTop: 10}}>
                                <Text style={styles.label}>From</Text>
                                <View style={{ position: 'relative', height: 50, marginBottom: 15 }}>
                                    <TouchableOpacity 
                                        activeOpacity={0.7}
                                        style={styles.datePickerBtn}
                                        onPress={() => fromDateRef.current?.showPicker?.()}
                                    >
                                        <Ionicons name="calendar" size={18} color="#3B82F6" style={{ marginRight: 10 }} />
                                        <Text style={styles.dateValue}>{formatDateLocal(fromDate)}</Text>
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
                                                zIndex: -1, // Keep it behind but accessible via ref
                                                border: 'none',
                                                pointerEvents: 'none'
                                            }}
                                            value={formatDateLocal(fromDate)}
                                            onChange={(e: any) => handleWebDateChange(e.target.value, setFromDate)}
                                        />
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.label}>To</Text>
                                <View style={{ position: 'relative', height: 50, marginBottom: 15 }}>
                                    <TouchableOpacity 
                                        activeOpacity={0.7}
                                        style={styles.datePickerBtn}
                                        onPress={() => toDateRef.current?.showPicker?.()}
                                    >
                                        <Ionicons name="calendar" size={18} color="#3B82F6" style={{ marginRight: 10 }} />
                                        <Text style={styles.dateValue}>{formatDateLocal(toDate)}</Text>
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
                                            value={formatDateLocal(toDate)}
                                            onChange={(e: any) => handleWebDateChange(e.target.value, setToDate)}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : (
                            <>
                                <Text style={styles.label}>From</Text>
                                <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowPicker('from')}>
                                    <Text style={styles.dateValue}>{formatDateLocal(fromDate)}</Text>
                                </TouchableOpacity>
                                <Text style={styles.label}>To</Text>
                                <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowPicker('to')}>
                                    <Text style={styles.dateValue}>{formatDateLocal(toDate)}</Text>
                                </TouchableOpacity>
                                {showPicker && <DateTimePicker value={showPicker === 'from' ? fromDate : toDate} mode="date" display="default" onChange={onDateChange} />}
                            </>
                        )}

                        <TouchableOpacity onPress={handleFetchReport} style={styles.fetchBtn}><Text style={styles.btnLabel}>FETCH</Text></TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowMonthlyModal(false)} style={styles.closeBtn}><Text style={styles.btnLabel}>CANCEL</Text></TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#1e1b4b' },
    headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, marginTop: 5, paddingHorizontal: 15 },
    iconBtn: { padding: 6, backgroundColor: '#1E293B', borderRadius: 10 },
    headerBtn: { padding: 10, borderRadius: 10 },
    title: { color: 'white', fontSize: 18, fontWeight: 'bold' },
    dateText: { color: '#64748B', fontSize: 11 },
    categoryToggleContainer: {
        flexDirection: 'row',
        paddingHorizontal: 15,
        marginBottom: 12
    },
    dropdownBtn: { 
        flex: 1,
        backgroundColor: '#1E293B', 
        paddingVertical: 10, 
        paddingHorizontal: 15, 
        borderRadius: 10, 
        borderWidth: 1, 
        borderColor: '#334155',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    dropdownBtnText: { color: '#3B82F6', fontSize: 13, fontWeight: 'bold' },
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
    listHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        marginBottom: 8
    },
    backToStatsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 8
    },
    backToStatsText: {
        color: '#3B82F6',
        fontSize: 10,
        fontWeight: 'bold'
    },
    shiftContainerCompact: {
        flexDirection: 'row',
        backgroundColor: '#1E293B',
        borderRadius: 8,
        padding: 2,
        width: 100
    },
    tabCompact: {
        flex: 1,
        paddingVertical: 4,
        alignItems: 'center',
        borderRadius: 6
    },
    activeTabCompact: {
        backgroundColor: '#3B82F6'
    },
    tabTextCompact: {
        color: '#64748B',
        fontWeight: 'bold',
        fontSize: 10
    },
    graphCard: {
        backgroundColor: '#1E293B',
        marginHorizontal: 15,
        padding: 12,
        borderRadius: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#334155'
    },
    graphTitle: {
        color: 'white',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 10
    },
    graphContainer: {
        flexDirection: 'row',
        height: 80,
        alignItems: 'flex-end',
        justifyContent: 'space-around',
        paddingBottom: 15
    },
    barWrapper: {
        alignItems: 'center',
        width: 50
    },
    bar: {
        width: 25,
        borderRadius: 4,
        marginBottom: 4
    },
    barLabel: {
        color: '#64748B',
        fontSize: 9,
        fontWeight: 'bold'
    },
    barValue: {
        color: 'white',
        fontSize: 10,
        fontWeight: 'bold',
        marginTop: 2
    },
    card: { backgroundColor: '#1E293B', padding: 12, borderRadius: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', marginHorizontal: 15 },
    nameText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    idText: { color: '#64748B', fontSize: 11 },
    timeText: { color: '#3B82F6', fontSize: 11, marginTop: 4, fontWeight: '500' },
    toggleBtn: { paddingVertical: 4, paddingHorizontal: 6, borderRadius: 6, minWidth: 60, alignItems: 'center' },
    toggleBtnText: { color: 'white', fontWeight: 'bold', fontSize: 9 },
    bgGreen: { backgroundColor: '#10B981' },
    bgRed: { backgroundColor: '#EF4444' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
    modalContent: { backgroundColor: '#1E293B', width: '95%', padding: 20, borderRadius: 20, maxHeight: '85%' },
    modalTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
    manageCard: { backgroundColor: '#0F172A', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
    cardLabel: { color: '#3B82F6', fontSize: 10, fontWeight: 'bold', marginBottom: 10 },
    modalShiftToggle: { flexDirection: 'row', backgroundColor: '#0F172A', borderRadius: 10, padding: 4, marginBottom: 15, borderWidth: 1, borderColor: '#334155' },
    modalTab: { flex: 1, padding: 10, alignItems: 'center', borderRadius: 8 },
    modalActiveTab: { backgroundColor: '#3B82F6' },
    modalTabText: { color: '#64748B', fontSize: 11, fontWeight: 'bold' },
    input: { backgroundColor: '#1E293B', color: 'white', padding: 15, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: '#334155' },
    addBtn: { backgroundColor: '#10B981', padding: 12, borderRadius: 12, alignItems: 'center' },
    deleteBtn: { backgroundColor: '#EF4444', padding: 12, borderRadius: 12, alignItems: 'center' },
    label: { color: '#64748B', fontSize: 10, marginBottom: 5 },
    datePickerBtn: { backgroundColor: '#0F172A', padding: 12, borderRadius: 12, marginBottom: 15, flexDirection: 'row', alignItems: 'center' },
    dateValue: { color: 'white', fontWeight: 'bold' },
    fetchBtn: { backgroundColor: '#10B981', padding: 14, borderRadius: 15, alignItems: 'center', marginTop: 10 },
    closeBtn: { backgroundColor: '#475569', padding: 12, borderRadius: 15, alignItems: 'center', marginTop: 15 },
    statsContainer: { 
        flexDirection: 'row', 
        paddingHorizontal: 15, 
        marginBottom: 15,
        justifyContent: 'space-between'
    },
    statsCard: { 
        width: '48%', 
        backgroundColor: '#1E293B', 
        borderRadius: 15, 
        padding: 12,
        borderWidth: 1,
        borderColor: '#334155'
    },
    statsHeader: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        marginBottom: 8
    },
    statsHeaderText: { 
        color: '#94A3B8', 
        fontSize: 10, 
        fontWeight: '900',
        letterSpacing: 0.5
    },
    statsRow: { 
        flexDirection: 'row', 
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    statItem: { 
        alignItems: 'center',
        flex: 1
    },
    statValue: { 
        fontSize: 16, 
        fontWeight: '900',
        marginBottom: 2
    },
    statLabel: { 
        color: '#64748B', 
        fontSize: 8, 
        fontWeight: 'bold'
    },
    statDivider: { 
        width: 1, 
        height: 20, 
        backgroundColor: '#334155',
        marginHorizontal: 4
    },
});