import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SERVER_URL } from '@shared/constants/ApiConfig';
import { fetchWithTimeout } from '@shared/utils/fetchTimeout';
import HourlyReportModal from './hourly_report';
import {
    HourlyGridModal,
    StopReasonModal,
    CloseMachineModal,
    ProductionReportModal,
    AddMaterialsModal,
    LumpsModal
} from './MachineComponents';

export default function MachineDetail() {
    const { id: rawId } = useLocalSearchParams();
    const id = Array.isArray(rawId) ? rawId[0] : rawId;
    const router = useRouter();

    const [dbMaterials, setDbMaterials] = useState<any[]>([]);
    const [dbColors, setDbColors] = useState<any[]>([]);
    const [dbMolds, setDbMolds] = useState<any[]>([]);
    const [dbSemiProducts, setDbSemiProducts] = useState<any[]>([]); // NEW: Semi-Finished Product List State
    const [machineName, setMachineName] = useState(''); // NEW

    const [machineStatus, setMachineStatus] = useState('');
    const [loading, setLoading] = useState(true);

    const [machineConfig, setMachineConfig] = useState({
        shift: 'Day Shift',
        semiProductName: '',
        materialType1: 'None',
        mQty1: '',
        materialType2: 'None',
        mQty2: '',
        materialType3: 'None',
        mQty3: '',
        materialType4: 'None',
        mQty4: '',
        materialColor: 'Natural',
        colorQty: '',
        moldType: '',
        cavity: '',
        cycleTiming: '5'
    });

    const isPaused = machineStatus === 'paused' || machineStatus === 'power_cut';

    // Helper to update config partially
    const updateConfig = useCallback((updates: any) => {
        try {
            setMachineConfig(prev => {
                const hasChanges = Object.keys(updates).some(key => prev[key as keyof typeof prev] !== updates[key]);
                if (!hasChanges) return prev;
                return { ...prev, ...updates };
            });
        } catch (e) {
            console.error("Failed to update machine config:", e);
        }
    }, []);

    const [isRunning, setIsRunning] = useState(false);
    const showLiveView = isRunning || isPaused;
    const [count, setCount] = useState(0);
    const [machineSessionStart, setMachineSessionStart] = useState<string | null>(null);
    const [resumeTime, setResumeTime] = useState<string | null>(null);
    const [stopTime, setStopTime] = useState<string | null>(null);
    const [startTime, setStartTime] = useState<string | null>(null);
    const [addedMaterials, setAddedMaterials] = useState<any[]>([]);
    const [wastage, setWastage] = useState('');
    const [wastageLumps, setWastageLumps] = useState('');

    const [showStopModal, setShowStopModal] = useState(false);
    const [showCloseModal, setShowCloseModal] = useState(false); // NEW
    const [operatorName, setOperatorName] = useState(''); // NEW
    const [rejectionCount, setRejectionCount] = useState('0'); // NEW: Rejection Count State
    const [reportMaterials, setReportMaterials] = useState<any[]>([]); // NEW: Materials for the report
    const [showReport, setShowReport] = useState(false);

    const [showHourlyModal, setShowHourlyModal] = useState(false);
    const [showLumpsModal, setShowLumpsModal] = useState(false);
    const [lumpsKg, setLumpsKg] = useState('');
    const [wastageKg, setWastageKg] = useState('');
    const [isSubmittingLumps, setIsSubmittingLumps] = useState(false);
    const [nextHourRange, setNextHourRange] = useState('');
    const [nextReportDate, setNextReportDate] = useState<string | undefined>(undefined);
    const [frozenCurrentCount, setFrozenCurrentCount] = useState(0);
    const [frozenLastCount, setFrozenLastCount] = useState(0);
    const [frozenIntervalCount, setFrozenIntervalCount] = useState(0);
    const [frozenChecks, setFrozenChecks] = useState({
        chiller: false,
        compressor: false,
        mould: false,
        machine: false,
        remarks: '',
        down_time: '',
        down_reason: '',
        good_parts: '',
        rejects: ''
    });
    const [typedReason, setTypedReason] = useState('');

    const [showManualHourlyModal, setShowManualHourlyModal] = useState(false);
    const [hourlyLogs, setHourlyLogs] = useState<any[]>([]);

    const fetchHourlyLogs = useCallback(async () => {
        if (!id) return;
        try {
            const logsRes = await fetch(`${SERVER_URL}/hourly_logs/today/${id}`);
            
            if (logsRes.ok) {
                const data = await logsRes.json();
                setHourlyLogs(data);
            }
        } catch (e) { console.log("Fetch hourly logs error:", e); }
    }, [id]);

    useEffect(() => {
        if (showManualHourlyModal) {
            fetchHourlyLogs();
        }
    }, [showManualHourlyModal, fetchHourlyLogs]);
    
    // RESET ALL REFS ON MACHINE ID CHANGE (Crucial to prevent data leakage between units)
    useEffect(() => {
        if (!id) return;
        
        // Reset states
        setCount(0);
        setMachineStatus('');
        setLoading(true);
        setIsRunning(false);
        setStartTime(null);
        setMachineSessionStart(null);
        setResumeTime(null);
        setShowHourlyModal(false);
        setNextHourRange('');
        setNextReportDate(undefined);
        setFrozenCurrentCount(0);
        setFrozenLastCount(0);
        setFrozenIntervalCount(0);
        setWastageLumps('');
        setAddedMaterials([]);
        
        // Reset refs
        pendingQueueRef.current = [];
        submittedRangesRef.current = new Set();
        isShowingModal.current = false;
        lastReportHourIndex.current = 0;
        currentSlotWallStartTime.current = new Date().toISOString();
        countRef.current = 0;
        statusRef.current = '';
        isRunningRef.current = false;
        startTimeRef.current = null;
        timingRef.current = 5;
        cavityRef.current = 1;
        machineNameRef.current = '';
        shiftRef.current = 'Day Shift';
        operatorIdRef.current = null;
        isDataLoaded.current = false;
        isIntervalStateLoaded.current = false;
        lastReportTimestamp.current = Date.now();
        baseCount.current = 0;
        lastReportCount.current = 0;
        isPausing.current = false;
        isUpdatingManually.current = false;
        
        // Trigger fresh load
        fetchInventory().then(res => {
            loadState();
        });
    }, [id]);

    // QUEUE FOR HOURLY POPUPS
    const pendingQueueRef = useRef<any[]>([]);
    const submittedRangesRef = useRef<Set<string>>(new Set());
    const isShowingModal = useRef(false);

    useEffect(() => {
        // Main component doesn't need to track current time anymore
        return () => {};
    }, []);

    const processNextReport = useCallback(() => {
        if (isShowingModal.current || pendingQueueRef.current.length === 0) return;

        // NEW: Always sort before showing to ensure oldest first
        pendingQueueRef.current.sort((a, b) => 
            new Date(a.endOfSlotIso).getTime() - new Date(b.endOfSlotIso).getTime()
        );

        // NEW: Only show popup if machine is NOT IDLE/STOPPED (Running or Paused is fine)
        const status = statusRef.current;
        const isActive = status === 'running' || status === 'paused' || status === 'power_cut';
        if (!isActive) return;

        const next = pendingQueueRef.current[0];
        if (!next) {
            isShowingModal.current = false;
            return;
        }
        console.log(`[POPUP-DISPLAY] Range: ${next.range}, Produced: ${next.intervalCount}, Total: ${next.currentCount}, PrevTotal: ${next.lastCount}`);
        
        setNextHourRange(next.range);
        setNextReportDate(next.endOfSlotIso);
        setFrozenCurrentCount(next.currentCount);
        setFrozenLastCount(next.lastCount);
        setFrozenIntervalCount(next.intervalCount);
        setFrozenChecks({
            chiller: !!next.chiller_check,
            compressor: !!next.compressor_check,
            mould: !!next.mould_check,
            machine: !!next.machine_check,
            remarks: next.remarks || '',
            down_time: next.down_time || '',
            down_reason: next.down_reason || '',
            good_parts: '',
            rejects: ''
        });
        currentSlotWallStartTime.current = next.endOfSlotIso;
        
        isShowingModal.current = true;
        setShowHourlyModal(true);
    }, []);

    const onModalClose = useCallback(() => {
        setShowHourlyModal(false);
        isShowingModal.current = false;
        // Remove the one we just showed
        pendingQueueRef.current.shift();
        // Show next if any
        // setTimeout(processNextReport, 500); // DISABLED AUTOMATIC POPUP
    }, [processNextReport]);
    
    // NEW: States for "Add Materials"
    const [showAddMaterialsModal, setShowAddMaterialsModal] = useState(false);
    const [addMat1, setAddMat1] = useState('None');
    const [addMQty1, setAddMQty1] = useState('');
    const [addMat2, setAddMat2] = useState('None');
    const [addMQty2, setAddMQty2] = useState('');
    const [addMat3, setAddMat3] = useState('None');
    const [addMQty3, setAddMQty3] = useState('');
    const [addMat4, setAddMat4] = useState('None');
    const [addMQty4, setAddMQty4] = useState('');
    const [addCol, setAddCol] = useState('Natural');
    const [addCQty, setAddCQty] = useState('');
    const [isSubmittingMaterial, setIsSubmittingMaterial] = useState(false);

    const [operatorId, setOperatorId] = useState<string | null>(null);
    const lastReportHourIndex = useRef(0); // Which hour we last logged (1, 2, 3...)
    const currentSlotWallStartTime = useRef<string>(new Date().toISOString());

    // Stabilizing Refs for Interval
    const countRef = useRef(0);
    const statusRef = useRef('');
    const isRunningRef = useRef(false);
    const startTimeRef = useRef<string | null>(null);
    const timingRef = useRef(5);
    const cavityRef = useRef(1);
    const machineNameRef = useRef('');
    const shiftRef = useRef('Day Shift');
    const operatorIdRef = useRef<string | null>(null);
    const semiProductNameRef = useRef('');
    const materialType1Ref = useRef('None');
    const mQty1Ref = useRef('');
    const materialType2Ref = useRef('None');
    const mQty2Ref = useRef('');
    const materialType3Ref = useRef('None');
    const mQty3Ref = useRef('');
    const materialType4Ref = useRef('None');
    const mQty4Ref = useRef('');
    const materialColorRef = useRef('Natural');
    const colorQtyRef = useRef('');
    const moldTypeRef = useRef('');
    const cavityStateRef = useRef('');
    const cycleTimingRef = useRef('5');

    // Keep refs in sync with state for use in intervals/callbacks
    useEffect(() => {
        shiftRef.current = machineConfig.shift;
        semiProductNameRef.current = machineConfig.semiProductName;
        materialType1Ref.current = machineConfig.materialType1;
        mQty1Ref.current = machineConfig.mQty1;
        materialType2Ref.current = machineConfig.materialType2;
        mQty2Ref.current = machineConfig.mQty2;
        materialType3Ref.current = machineConfig.materialType3;
        mQty3Ref.current = machineConfig.mQty3;
        materialType4Ref.current = machineConfig.materialType4;
        mQty4Ref.current = machineConfig.mQty4;
        materialColorRef.current = machineConfig.materialColor;
        colorQtyRef.current = machineConfig.colorQty;
        moldTypeRef.current = machineConfig.moldType;
        cavityStateRef.current = machineConfig.cavity;
        cycleTimingRef.current = machineConfig.cycleTiming;
    }, [machineConfig]);

    const isDataLoaded = useRef(false);
    const isIntervalStateLoaded = useRef(false); // NEW: Track if hourly baseline is loaded from DB
    const lastReportTimestamp = useRef(Date.now());
    const baseCount = useRef(0);
    const lastReportCount = useRef(0);
    
    const isPausing = useRef(false);
    const isUpdatingManually = useRef(false);

    const formatTimeLocal = (d: Date) => {
        const h = d.getHours().toString().padStart(2, '0');
        const m = d.getMinutes().toString().padStart(2, '0');
        return `${h}:${m}`;
    };

    const fetchInventory = useCallback(async () => {
        try {
            const [matRes, colRes, moldRes, semiRes] = await Promise.all([
                fetchWithTimeout(`${SERVER_URL}/inventory/materials`, {}, 5000),
                fetchWithTimeout(`${SERVER_URL}/inventory/colors`, {}, 5000),
                fetchWithTimeout(`${SERVER_URL}/inventory/molds`, {}, 5000),
                fetchWithTimeout(`${SERVER_URL}/inventory/semi_finished`, {}, 5000)
            ]);
            const materials = await matRes.json();
            const colors = await colRes.json();
            const molds = await moldRes.json();
            const semiProds = await semiRes.json();

            setDbMaterials(materials);
            setDbColors(colors);
            setDbMolds(molds);
            setDbSemiProducts(Array.isArray(semiProds) ? semiProds : []);

            if (molds.length > 0 && !isDataLoaded.current) {
                const initialCavity = molds[0].cavity_count?.toString() || molds[0].cavity_options?.split(',')[0].trim() || "1";
                updateConfig({
                    moldType: molds[0].mold_name,
                    cavity: initialCavity
                });
                cavityRef.current = parseInt(initialCavity) || 1;
            }
            return { materials };
        } catch (e) {
            console.log("Inventory fetch failed", e);
            return { materials: [] };
        }
    }, [id]);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    const loadState = useCallback(async () => {
        if (isUpdatingManually.current || !id) return;

        try {
            // Only fetch from AsyncStorage once if not already set
            if (!operatorIdRef.current) {
                const uid = await AsyncStorage.getItem('user_id');
                const uname = await AsyncStorage.getItem('username');
                if (uid) { setOperatorId(uid); operatorIdRef.current = uid; }
                if (uname) setOperatorName(uname);
            }

            const res = await fetchWithTimeout(`${SERVER_URL}/machines`, {}, 5000);
            const text = await res.text();
            let allMachines;
            try {
                allMachines = JSON.parse(text);
            } catch (e) {
                console.error("Failed to parse machines JSON:", text.substring(0, 100));
                return;
            }
            
            if (!Array.isArray(allMachines)) {
                return;
            }

            const data = allMachines.find((m: any) => m.id && m.id.toString() === id?.toString());

            if (data) {
                const dbStatus = String(data.status).toLowerCase().trim();
                const timing = Math.max(1, parseFloat(data.cycle_timing) || 5);
                const cav = Math.max(1, parseInt(data.cavity) || 1);

                // ENSURE REFS ARE ALWAYS UP TO DATE FROM SERVER
                timingRef.current = timing;
                cavityRef.current = cav;

                const newMachineName = data.machine_name || `UNIT ${id}`;
                setMachineName(prev => prev !== newMachineName ? newMachineName : prev);
                machineNameRef.current = newMachineName;

                setMachineStatus(prev => prev !== dbStatus ? dbStatus : prev);
                statusRef.current = dbStatus;
                
                const dbTotalOutput = Math.max(0, parseInt(data.total_output) || 0);
                const savedAccumulated = Math.max(0, parseInt(data.accumulated_output) || 0);

                // ONLY initialize tracking refs ONCE to prevent overwriting local progress
                if (!isDataLoaded.current) {
                    const dbTotalOutput = Math.max(0, parseInt(data.total_output) || 0);
                    
                    const sTimeStartRaw = data.session_start_time ? new Date(data.session_start_time).getTime() : Date.now();
                    const sTimeStart = isNaN(sTimeStartRaw) ? Date.now() : sTimeStartRaw;
                    
                    const dbLastReportAtRaw = data.last_report_at ? new Date(data.last_report_at).getTime() : sTimeStart;
                    const dbLastReportAt = isNaN(dbLastReportAtRaw) ? sTimeStart : dbLastReportAtRaw;
                    
                    // Priority: If session started AFTER last report, use session start
                    const initialTimestamp = Math.max(dbLastReportAt, sTimeStart);
                    
                    lastReportTimestamp.current = initialTimestamp;
                    currentSlotWallStartTime.current = new Date(isNaN(initialTimestamp) ? Date.now() : initialTimestamp).toISOString();
                    
                    // Initialize from the server's record of the last report's total
                    // ONLY overwrite if server actually has a value to prevent resets on re-entry
                    if (data.last_report_count !== undefined && data.last_report_count !== null) {
                        lastReportCount.current = data.last_report_count;
                    }
                    
                    const elapsedSinceStart = Math.max(0, Date.now() - sTimeStart);
                    lastReportHourIndex.current = Math.floor(elapsedSinceStart / 3600000);
                    
                    const newSessionStart = data.session_start_time || null;
                    setMachineSessionStart(prev => prev !== newSessionStart ? newSessionStart : prev);
                    
                    countRef.current = dbTotalOutput;
                }
                
                // SESSION PERSISTENCE: Only update session variables if not already in a running session
                const isActuallyRunning = dbStatus === 'running';
                const isActuallyStopped = dbStatus === 'idle' || dbStatus === 'stop';

                if (isActuallyRunning) {
                    if (!isRunningRef.current || !isDataLoaded.current) {
                        const sTime = data.resume_time || data.start_time;
                        if (sTime) {
                            const start = new Date(sTime).getTime();
                            if (isNaN(start)) {
                                console.log("Invalid start time:", sTime);
                                return;
                            }
                            const now = new Date().getTime();
                            const diffSeconds = Math.max(0, Math.floor((now - start) / 1000));
                            const safeTiming = Math.max(0.1, timing);
                            const sessionOutput = Math.floor(diffSeconds / safeTiming) * cav;

                            // LIVE CALCULATION: baseCount must be the accumulated (count before this session)
                            // This ensures that when we re-enter, we start from the correct server-side baseline
                            const newCountVal = Math.max(0, savedAccumulated + (isNaN(sessionOutput) ? 0 : sessionOutput));
                            
                            baseCount.current = savedAccumulated;
                            countRef.current = newCountVal;
                            
                            setIsRunning(true);
                            isRunningRef.current = true;
                            setStartTime(sTime);
                            startTimeRef.current = sTime;
                            setResumeTime(prev => prev !== (data.resume_time || null) ? (data.resume_time || null) : prev);
                            if (!showStopModal) isPausing.current = false; 
                        }
                    } else {
                        // SYNC: Even if already running, ensure our local baseline is NOT lagging behind the server's accumulated count
                        // BUT: We only update if the server's version is higher (indicates a sync occurred)
                        if (savedAccumulated > baseCount.current) {
                            baseCount.current = savedAccumulated;
                            // Recalculate current count immediately based on new base
                            const start = new Date(startTimeRef.current || Date.now()).getTime();
                            if (!isNaN(start)) {
                                const elapsedMs = Date.now() - start;
                                const diffSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
                                const safeTiming = Math.max(0.1, timing);
                                const sessionOutput = Math.floor(diffSeconds / safeTiming) * cav;
                                const newTotal = savedAccumulated + (isNaN(sessionOutput) ? 0 : sessionOutput);
                                countRef.current = newTotal;
                            }
                        }
                    }
                } else if (isActuallyStopped) {
                    // Truly stopped - reset session
                    setIsRunning(prev => prev !== false ? false : prev);
                    isRunningRef.current = false;
                    isPausing.current = true; 
                    setStartTime(null);
                    startTimeRef.current = null;
                    // When idle, just show the total_output as frozen
                    baseCount.current = dbTotalOutput;
                    countRef.current = dbTotalOutput;
                } else {
                    // Case: 'paused' or 'power_cut'
                    // We must show the frozen count EXACTLY as recorded on the server (accumulated_output)
                    // This matches the "outside" list view which uses accumulated_output when not running
                    countRef.current = savedAccumulated;
                    baseCount.current = savedAccumulated;

                    setIsRunning(prev => prev !== false ? false : prev); 
                    isRunningRef.current = false;
                    isPausing.current = true; 
                }

                if (!isDataLoaded.current) {
                    if (data.mold_type) updateConfig({ moldType: data.mold_type });
                    if (data.cavity) { 
                        updateConfig({ cavity: data.cavity.toString() }); 
                        cavityRef.current = data.cavity; 
                    }
                    if (data.cycle_timing) { 
                        updateConfig({ cycleTiming: data.cycle_timing.toString() }); 
                        timingRef.current = parseFloat(data.cycle_timing) || 5; 
                    }
                    if (data.semi_finished_product) updateConfig({ semiProductName: data.semi_finished_product });

                    if (dbStatus !== 'idle' && dbStatus !== '') {
                        updateConfig({
                            shift: data.shift || machineConfig.shift,
                            materialType1: data.material_type_1 || 'None',
                            mQty1: data.material_qty_1?.toString() || '',
                            materialType2: data.material_type_2 || 'None',
                            mQty2: data.material_qty_2?.toString() || '',
                            materialType3: data.material_type_3 || 'None',
                            mQty3: data.material_qty_3?.toString() || '',
                            materialType4: data.material_type_4 || 'None',
                            mQty4: data.material_qty_4?.toString() || '',
                            materialColor: data.material_color || 'Natural',
                            colorQty: data.color_qty?.toString() || ''
                        });
                        if (data.shift) shiftRef.current = data.shift;
                    }
                    isDataLoaded.current = true;
                }

                // 1. Fetch latest approved baseline from DB if not already loaded
                if (!isIntervalStateLoaded.current) {
                        try {
                            const baselineRes = await fetchWithTimeout(`${SERVER_URL}/hourly_logs/latest/${id}`, {}, 3000);
                            if (baselineRes.ok) {
                                const baseline = await baselineRes.json();
                                if (baseline) {
                                    const baselineCount = baseline.total_count_at_end || baseline.total_output || 0;
                                    lastReportCount.current = baselineCount;
                                }
                            }
                        } catch (e) { console.log("Baseline fetch failed", e); }

                        // NEW: Fetch all of today's logs to populate submittedRangesRef
                        // This prevents already approved logs from showing up again on re-entry
                        try {
                            const todayRes = await fetchWithTimeout(`${SERVER_URL}/hourly_logs/today/${id}`, {}, 3000);
                            let todayLogs: any[] = [];
                            if (todayRes.ok) {
                                todayLogs = await todayRes.json();
                                todayLogs.forEach((log: any) => {
                                    if (log.status === 'approved') {
                                        submittedRangesRef.current.add(log.hour_range.trim());
                                        
                                        // ADVANCE BASELINE: If this log is later than current baseline, use it
                                        // This prevents local timer from re-generating these same approved slots
                                        const logTime = new Date(log.timestamp).getTime();
                                        if (logTime > lastReportTimestamp.current) {
                                            lastReportTimestamp.current = logTime;
                                            lastReportCount.current = log.total_output || 0;
                                        }
                                    }
                                });
                                if ((!todayLogs || todayLogs.length === 0) && lastReportTimestamp.current < new Date().setHours(0, 0, 0, 0)) {
                                    lastReportCount.current = 0;
                                }
                            }
                        } catch (e) { console.log("Today's logs fetch failed", e); }

                        // 2. Fetch pending logs
                        try {
                        const pendingRes = await fetchWithTimeout(`${SERVER_URL}/hourly_logs/pending/${id}`, {}, 5000);
                        if (pendingRes.ok) {
                            const pendingLogs = await pendingRes.json();
                            let addedAny = false;
                            const nowMs = Date.now();
                            const oneDayAgo = nowMs - 24 * 60 * 60 * 1000;

                            pendingQueueRef.current = []; // CLEAR before re-populating to prevent duplicates

                            pendingLogs.forEach((log: any) => {
                                if (!log || !log.hour_range || !log.timestamp) return;
                                
                                const logTime = new Date(log.timestamp).getTime();
                                // Filter: Show pending logs from last 24 hours
                                if (logTime < oneDayAgo) return;

                                const isDup = pendingQueueRef.current.some(p => p.range.trim() === log.hour_range.trim());
                                const alreadySubmitted = submittedRangesRef.current.has(log.hour_range.trim());
                                if (!isDup && !alreadySubmitted) {
                                    pendingQueueRef.current.push({
                                        range: log.hour_range,
                                        currentCount: log.total_output,
                                        lastCount: log.total_output - log.hourly_output,
                                        intervalCount: log.hourly_output,
                                        endOfSlotIso: log.timestamp,
                                        chiller_check: log.chiller_check,
                                        compressor_check: log.compressor_check,
                                        mould_check: log.mould_check,
                                        machine_check: log.machine_check,
                                        remarks: log.remarks,
                                        down_time: log.down_time,
                                        down_reason: log.down_reason
                                    });
                                    addedAny = true;
                                    
                                    // ADVANCE THE TRACKING REFS to the latest pending log found
                                    // This prevents the 60s interval timer from re-triggering these same windows
                                    if (logTime >= lastReportTimestamp.current) {
                                        lastReportTimestamp.current = logTime;
                                        lastReportCount.current = log.total_output;
                                    }
                                }
                            });
                            
                            if (addedAny) {
                                // SORT BY TIMESTAMP to ensure chronological order
                                pendingQueueRef.current.sort((a, b) => 
                                    new Date(a.endOfSlotIso).getTime() - new Date(b.endOfSlotIso).getTime()
                                );
                                // processNextReport(); // DISABLED AUTOMATIC POPUP
                            }
                        }
                    } catch (e) { console.log("Pending logs fetch failed", e); }
                    finally {
                        isIntervalStateLoaded.current = true; // Mark as loaded so interval can start ONLY AFTER sync
                    }
                }
            }
        } catch (e) { console.log("Load state failed", e); }
        finally { setLoading(false); }
    }, [id, isRunning, showStopModal]);

    const loadStateRef = useRef(loadState);
    const fetchInventoryRef = useRef(fetchInventory);
    useEffect(() => { loadStateRef.current = loadState; }, [loadState]);
    useEffect(() => { fetchInventoryRef.current = fetchInventory; }, [fetchInventory]);

    useEffect(() => { 
        // loadState and fetchInventory are already called in the [id] useEffect above
        // which handles both mount and id changes.
        return () => {};
    }, []); // Only run once on mount

    // Background interval removed per user request to prevent crashes and stop live updates

    const updateDB = useCallback(async (status: string, output: number, reason: string | null = null, sTime: string | null = null, forceSessionStart: string | null = null, forceResume: string | null = null, lastReportAt: string | null = null, forceHourlyUnits: number | null = null, forceLastReportCount: number | null = null) => {
        if (!status || !id) return { success: false, error: "Missing Status or Machine ID" }; // Prevent empty status update
        const safeOutput = Math.max(0, isNaN(output) ? 0 : output);
        try {
            const res = await fetchWithTimeout(`${SERVER_URL}/machine_status/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: status.toLowerCase(),
                    accumulated_output: (status === 'running') ? Math.max(0, baseCount.current) : ((status === 'idle' && safeOutput === 0) ? 0 : safeOutput),
                    total_output: safeOutput,
                    stop_reason: reason || "",
                    start_time: (status === 'running') ? (sTime || startTimeRef.current) : null,
                    session_start_time: forceSessionStart || machineSessionStart,
                    resume_time: forceResume || resumeTime,
                    hourly_units: forceHourlyUnits, // PASS NULL IF NOT EXPLICITLY UPDATED
                    last_report_at: lastReportAt || new Date(isNaN(lastReportTimestamp.current) ? Date.now() : lastReportTimestamp.current).toISOString(),
                    last_report_count: forceLastReportCount !== null ? forceLastReportCount : lastReportCount.current,
                    shift: machineConfig.shift,
                    semi_finished_product: machineConfig.semiProductName,
                    material_type_1: machineConfig.materialType1, material_qty_1: machineConfig.mQty1.toString() || "0",
                    material_type_2: machineConfig.materialType2, material_qty_2: machineConfig.mQty2.toString() || "0",
                    material_type_3: machineConfig.materialType3, material_qty_3: machineConfig.mQty3.toString() || "0",
                    material_type_4: machineConfig.materialType4, material_qty_4: machineConfig.mQty4.toString() || "0",
                    material_color: machineConfig.materialColor, color_qty: machineConfig.colorQty.toString() || "0",
                    mold_type: machineConfig.moldType, cavity: parseInt(machineConfig.cavity) || 1, cycle_timing: parseFloat(machineConfig.cycleTiming) || 0
                }),
            }, 8000);
            const data = await res.json();
            return { success: res.ok, error: data.error };
        } catch (e) { return { success: false, error: "Network Error" }; }
    }, [id, machineSessionStart, resumeTime, machineConfig, lastReportTimestamp]);

    const validateBeforeStart = () => {
        if (!machineConfig.semiProductName || machineConfig.semiProductName === "") { Alert.alert("Error", "Please select a Semi-Finished Product."); return false; }
        const materials = [
            { type: machineConfig.materialType1, qty: machineConfig.mQty1, label: "Material 1" },
            { type: machineConfig.materialType2, qty: machineConfig.mQty2, label: "Material 2" },
            { type: machineConfig.materialType3, qty: machineConfig.mQty3, label: "Material 3" },
            { type: machineConfig.materialType4, qty: machineConfig.mQty4, label: "Material 4" }
        ];
        const activeMaterials = materials.filter(m => m.type !== 'None');
        if (activeMaterials.length === 0) { Alert.alert("Error", "Select at least one material."); return false; }
        for (let m of activeMaterials) {
            const val = parseFloat(m.qty);
            if (!m.qty || isNaN(val) || val <= 0) { Alert.alert("Required", `Please enter a quantity for ${m.label}.`); return false; }
        }
        if (machineConfig.materialColor !== 'Natural') {
            const cQty = parseFloat(machineConfig.colorQty);
            if (!machineConfig.colorQty || isNaN(cQty) || cQty <= 0) { Alert.alert("Required", "Please enter a quantity for the selected Color."); return false; }
        }
        return true;
    };

    const startMachine = async () => {
        isUpdatingManually.current = true;
        const isoNow = new Date().toISOString();
        const nowMs = Date.now();
        
        setCount(0); countRef.current = 0;
        baseCount.current = 0; 
        
        // CRITICAL: Initialize lastReportCount to 0 for a fresh session
        lastReportCount.current = 0; 
        
        isIntervalStateLoaded.current = true;
        lastReportHourIndex.current = 0;
        currentSlotWallStartTime.current = isoNow;
        lastReportTimestamp.current = nowMs;
        
        try {
            const res = await fetchWithTimeout(`${SERVER_URL}/machines/${id}/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shift: machineConfig.shift,
                    semi_finished_product: machineConfig.semiProductName,
                    material_type_1: machineConfig.materialType1, material_qty_1: machineConfig.mQty1.toString() || "0",
                    material_type_2: machineConfig.materialType2, material_qty_2: machineConfig.mQty2.toString() || "0",
                    material_type_3: machineConfig.materialType3, material_qty_3: machineConfig.mQty3.toString() || "0",
                    material_type_4: machineConfig.materialType4, material_qty_4: machineConfig.mQty4.toString() || "0",
                    material_color: machineConfig.materialColor, color_qty: machineConfig.colorQty.toString() || "0",
                    mold_type: machineConfig.moldType, cavity: parseInt(machineConfig.cavity) || 1, cycle_timing: parseFloat(machineConfig.cycleTiming) || 0,
                    session_start_time: isoNow
                })
            }, 10000);

            const data = await res.json();
            if (res.ok) {
                setMachineSessionStart(isoNow);
                setResumeTime(null);
                setStartTime(isoNow); startTimeRef.current = isoNow;
                setIsRunning(true); isRunningRef.current = true;
                setMachineStatus('running'); statusRef.current = 'running';
                isPausing.current = false;
            } else {
                Alert.alert("Error", data.error || "Could not start machine on server.");
            }
        } catch (e) {
            Alert.alert("Error", "Network Error while starting machine");
        }
        setTimeout(() => { isUpdatingManually.current = false; }, 2000);
    };

    const resumeMachine = async () => {
        isUpdatingManually.current = true;
        try {
            const res = await fetchWithTimeout(`${SERVER_URL}/machines/${id}/resume`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            }, 10000);

            if (res.ok) {
                setIsRunning(true);
                isRunningRef.current = true;
                setMachineStatus('running');
                statusRef.current = 'running';
                isPausing.current = false;
                // Note: startTime and resumeTime will be updated on next loadState or we could set them here
                // But loadState runs on interval, so it will sync.
            } else {
                const data = await res.json();
                Alert.alert("Error", data.error || "Could not resume machine.");
            }
        } catch (e) {
            Alert.alert("Error", "Network Error while resuming machine");
        }
        setTimeout(() => { isUpdatingManually.current = false; }, 2000);
    };

    const [selectedSlot, setSelectedSlot] = useState<any>(null);

    const handleToggle = useCallback(async () => {
        if (isPaused) {
            await resumeMachine();
        } else if (!isRunning) {
            if (validateBeforeStart()) { await startMachine(); }
        } else {
            isPausing.current = true;
            setTypedReason(''); setShowStopModal(true);
        }
    }, [isPaused, isRunning, resumeMachine, validateBeforeStart, startMachine]);

    const confirmStop = useCallback(async () => {
        if (!typedReason.trim()) { Alert.alert("Required", "Please type a reason."); return; }
        
        const isoStop = new Date().toISOString();
        setStopTime(isoStop);
        
        // NEW: If there is production since last hourly report, push it to queue as a final partial-hour report
        const currentCountVal = countRef.current;
        const lastCountVal = lastReportCount.current;
        if (currentCountVal > lastCountVal) {
            const now = new Date();
            const startOfSlot = new Date(lastReportTimestamp.current);
            const endOfSlot = now; 
            
            const startH = startOfSlot.getHours();
            const endH = (startH + 1) % 24;
            const rangeStr = `${startH.toString().padStart(2, '0')}:00 - ${endH.toString().padStart(2, '0')}:00`;

            const producedInThisInterval = currentCountVal - lastCountVal;

            pendingQueueRef.current.push({
                range: rangeStr,
                currentCount: currentCountVal,
                lastCount: lastCountVal,
                intervalCount: producedInThisInterval,
                endOfSlotIso: endOfSlot.toISOString(),
                chiller_check: false,
                compressor_check: false,
                mould_check: false,
                machine_check: false,
                remarks: 'Machine Stopped',
                down_time: '',
                down_reason: ''
            });

            // Persist to DB as pending
            fetch(`${SERVER_URL}/hourly_logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    machine_id: id,
                    machine_name: machineNameRef.current,
                    shift: shiftRef.current,
                    operator_id: operatorIdRef.current,
                    hour_range: rangeStr,
                    total_output: currentCountVal,
                    hourly_output: producedInThisInterval,
                    timestamp: endOfSlot.toISOString(),
                    status: 'pending'
                }),
            }).catch(e => console.log("Failed to persist final pending log", e));

            // Advance baseline
            lastReportCount.current = currentCountVal;
            lastReportTimestamp.current = endOfSlot.getTime();

            // Trigger popup
            setTimeout(processNextReport, 500);
        }

        // Do NOT update database here. Wait for report submission.
        setShowStopModal(false);

        // NEW: Fetch all materials issued for this session to get the total Starting quantity
        let aggregatedMaterials = [];
        try {
            // We use the current session start time to fetch all usage logs for this run
            const res = await fetchWithTimeout(`${SERVER_URL}/inventory/usage/${id}/${encodeURIComponent(machineSessionStart || "")}`);
            if (res.ok) {
                const usageLogs = await res.json();
                // Aggregate multiple issues of the same material
                const summaryMap: { [key: string]: { qty: number, category: string } } = {};
                usageLogs.forEach((log: any) => {
                    if (!summaryMap[log.material_name]) {
                        summaryMap[log.material_name] = { qty: 0, category: log.category || 'Materials' };
                    }
                    summaryMap[log.material_name].qty += (parseFloat(log.quantity) || 0);
                });
                
                aggregatedMaterials = Object.entries(summaryMap).map(([name, data]) => ({
                    material_name: name,
                    category: data.category,
                    issued_kg: data.qty.toString(),
                    used_kg: data.qty.toString() // Default used = issued, operator will edit
                }));
            }
        } catch (err) {
            console.error("Fetch Usage Error:", err);
        }

        // Fallback if fetch fails or returns empty (unlikely but safe)
        if (aggregatedMaterials.length === 0) {
            if (machineConfig.materialType1 !== 'None') aggregatedMaterials.push({ material_name: machineConfig.materialType1, issued_kg: machineConfig.mQty1 || "0", used_kg: machineConfig.mQty1 || "0" });
            if (machineConfig.materialType2 !== 'None') aggregatedMaterials.push({ material_name: machineConfig.materialType2, issued_kg: machineConfig.mQty2 || "0", used_kg: machineConfig.mQty2 || "0" });
            if (machineConfig.materialType3 !== 'None') aggregatedMaterials.push({ material_name: machineConfig.materialType3, issued_kg: machineConfig.mQty3 || "0", used_kg: machineConfig.mQty3 || "0" });
            if (machineConfig.materialType4 !== 'None') aggregatedMaterials.push({ material_name: machineConfig.materialType4, issued_kg: machineConfig.mQty4 || "0", used_kg: machineConfig.mQty4 || "0" });
        }

        setReportMaterials(aggregatedMaterials);
        
        // NEW: Fetch all hourly logs for this session to sum up the rejection count
        let totalRejects = 0;
        try {
            const hRes = await fetchWithTimeout(`${SERVER_URL}/hourly_logs/session/${id}/${encodeURIComponent(machineSessionStart || "")}`);
            if (hRes.ok) {
                const hourlyLogs = await hRes.json();
                totalRejects = hourlyLogs.reduce((sum: number, log: any) => sum + (parseInt(log.rejects) || 0), 0);
            }
        } catch (err) {
            console.error("Fetch Session Hourly Logs Error:", err);
        }

        setRejectionCount(totalRejects.toString());
        setShowReport(true);
    }, [typedReason, id, machineSessionStart, machineConfig]);

    // NEW: Function to handle material addition while running
    const handleAddMaterials = useCallback(async () => {
        const materialsToSubtract = [];

        // Check each material field
        const materials = [
            { name: addMat1, qty: addMQty1 },
            { name: addMat2, qty: addMQty2 },
            { name: addMat3, qty: addMQty3 },
            { name: addMat4, qty: addMQty4 },
        ];

        for (const m of materials) {
            const val = parseFloat(m.qty);
            if (m.name !== 'None' && !isNaN(val) && val > 0) {
                materialsToSubtract.push({ material_name: m.name, category: 'Materials', quantity: val });
            }
        }

        // Check color
        const cVal = parseFloat(addCQty);
        if (addCol !== 'Natural' && !isNaN(cVal) && cVal > 0) {
            materialsToSubtract.push({ material_name: addCol, category: 'Colors', quantity: cVal });
        }

        if (materialsToSubtract.length === 0) {
            Alert.alert("Required", "Select at least one material with a valid quantity.");
            isUpdatingManually.current = false;
            return;
        }

        setIsSubmittingMaterial(true);
        try {
            // NEW: SYNC CURRENT COUNT TO SERVER BEFORE SUBTRACTING INVENTORY
            // This ensures that when loadState resumes, it sees the current count as the baseline
            await updateDB(machineStatus, count, null, null, null, null, null, null, null);

            const payload = {
                materials: materialsToSubtract,
                machine_id: id,
                session_start_time: machineSessionStart
            };
            
            const response = await fetchWithTimeout(`${SERVER_URL}/inventory/subtract`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            }, 10000);

            const result = await response.json();
            if (response.ok) {
                Alert.alert("Success", "Materials added successfully.");
                setShowAddMaterialsModal(false);
                // Reset all fields
                setAddMat1('None'); setAddMQty1('');
                setAddMat2('None'); setAddMQty2('');
                setAddMat3('None'); setAddMQty3('');
                setAddMat4('None'); setAddMQty4('');
                setAddCol('Natural'); setAddCQty('');
                fetchInventory(); 
                // Delay resuming loadState to ensure server sync
                setTimeout(() => { isUpdatingManually.current = false; }, 2000);
            } else {
                Alert.alert("Error", result.error || "Failed to add materials.");
                isUpdatingManually.current = false;
            }
        } catch (error: any) {
            Alert.alert("Error", "Check connection.");
            isUpdatingManually.current = false;
        } finally {
            setIsSubmittingMaterial(false);
        }
    }, [id, machineSessionStart, addMat1, addMQty1, addMat2, addMQty2, addMat3, addMQty3, addMat4, addMQty4, addCol, addCQty, machineStatus, count, updateDB, fetchInventory]);

    const handleSaveLumps = useCallback(async () => {
        if (!lumpsKg && !wastageKg) {
            Alert.alert("Required", "Please enter at least one value.");
            return;
        }

        setIsSubmittingLumps(true);
        try {
        const now = new Date();
        const entry_date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            const entry_time = now.toTimeString().split(' ')[0];

            const response = await fetch(`${SERVER_URL}/lumps-wastage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    machine_id: id,
                    operator_id: operatorId,
                    lumps_kg: parseFloat(lumpsKg) || 0,
                    wastage_kg: parseFloat(wastageKg) || 0,
                    entry_date,
                    entry_time
                }),
            });

            if (response.ok) {
                Alert.alert("Success", "Lumps and Wastage data saved successfully.");
                setLumpsKg('');
                setWastageKg('');
                setShowLumpsModal(false);
            } else {
                const error = await response.json();
                Alert.alert("Error", error.message || "Failed to save data.");
            }
        } catch (error) {
            console.error("Save Lumps Error:", error);
            Alert.alert("Error", "An error occurred while saving.");
        } finally {
            setIsSubmittingLumps(false);
        }
    }, [id, operatorId, lumpsKg, wastageKg]);

    const handleSendForApproval = useCallback(async () => {
        // NEW: Actually stop the machine on server only when report is submitted
        isUpdatingManually.current = true;
        const finalCount = count;
        const { success: stopSuccess, error: stopError } = await updateDB('stop', finalCount, typedReason, null, null, null);
        
        if (!stopSuccess) {
            Alert.alert("Error", stopError || "Could not stop machine on server.");
            isUpdatingManually.current = false;
            return;
        }

        // Update local state after successful server stop
        setIsRunning(false); isRunningRef.current = false;
        setMachineStatus('idle'); statusRef.current = 'idle';
        setStartTime(null); startTimeRef.current = null;
        setTimeout(() => { isUpdatingManually.current = false; }, 2000);

        const payload = {
            machine_id: id, shift: machineConfig.shift,
            semi_finished_product: machineConfig.semiProductName, // NEW: Include semi-finished product
            material_type_1: machineConfig.materialType1, material_qty_1: machineConfig.mQty1.toString() || "0",
            material_type_2: machineConfig.materialType2, material_qty_2: machineConfig.mQty2.toString() || "0",
            material_type_3: machineConfig.materialType3, material_qty_3: machineConfig.mQty3.toString() || "0",
            material_type_4: machineConfig.materialType4, material_qty_4: machineConfig.mQty4.toString() || "0",
            material_color: machineConfig.materialColor, color_qty: machineConfig.colorQty.toString() || "0",
            mold_type: machineConfig.moldType, cavity: parseInt(machineConfig.cavity) || 1, cycle_timing: parseFloat(machineConfig.cycleTiming) || 0,
            total_output: count,
            rejection_count: parseInt(rejectionCount) || 0,
            stop_reason: typedReason, // mapped to stop_reason as per backend logic
            start_time: machineSessionStart,
            stop_time: stopTime,
            materials: reportMaterials // NEW: Send detailed materials
        };
        try {
            const response = await fetchWithTimeout(`${SERVER_URL}/production_logs`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            }, 10000);
            if (response.ok) {
                Alert.alert("Success", "Final Report Submitted to Prod Head. Now finalize the shift.");
                setShowReport(false);
                setTimeout(() => setShowCloseModal(true), 500); // Open the Close modal to complete the chain
            }
        } catch (error) { Alert.alert("Error", "Check connection."); }
    }, [id, count, updateDB, typedReason, machineConfig, rejectionCount, machineSessionStart, stopTime, reportMaterials]);

    const formatTime = (isoString: string | null) => {
        if (!isoString) return "N/A";
        try {
            const date = new Date(isoString);
            if (isNaN(date.getTime())) return "N/A";
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch (e) { return "N/A"; }
    };

    // NEW: Weight calculation logic
    const getCavityTotalWeight = () => {
        const mold = dbMolds.find(m => m.mold_name === machineConfig.moldType);
        if (!mold) return 0;
        
        // 1. Use total_weight if available
        if (mold.total_weight) {
            return parseFloat(mold.total_weight) || 0;
        }

        // 2. Fallback to cavity_weights array or string
        if (mold.cavity_weights) {
            if (Array.isArray(mold.cavity_weights)) {
                return mold.cavity_weights.reduce((sum: number, w: any) => sum + (parseFloat(w) || 0), 0);
            }
            if (typeof mold.cavity_weights === 'string') {
                try {
                    // Try parsing as JSON first in case it's a stringified array
                    const parsed = JSON.parse(mold.cavity_weights);
                    if (Array.isArray(parsed)) {
                        return parsed.reduce((sum: number, w: any) => sum + (parseFloat(w) || 0), 0);
                    }
                } catch (e) {}

                const weights = mold.cavity_weights.split(',').map((w: string) => parseFloat(w.trim()) || 0);
                return weights.reduce((sum: number, w: number) => sum + w, 0);
            }
        }
        return 0;
    };

    const cavityTotalWeight = getCavityTotalWeight();
    const totalProdWeightGm = cavityTotalWeight * count;
    const totalProdWeightKg = totalProdWeightGm / 1000;

    const handleCloseMachine = useCallback(async () => {
        if (!operatorName.trim()) { Alert.alert("Required", "Please enter operator name."); return; }

        const payload = {
            machine_id: id,
            machine_name: machineName || `UNIT ${id}`,
            operator_name: operatorName,
            shift: machineConfig.shift,
            product_name: machineConfig.semiProductName, // Using semiProductName as product_name
            semi_finished_product: machineConfig.semiProductName, // Added semi-finished product
            total_production_count: count,
            total_production_weight_gm: totalProdWeightGm,
            total_production_weight_kg: totalProdWeightKg,
            run_start_time: machineSessionStart,
            run_end_time: new Date().toISOString()
        };

        try {
            const response = await fetchWithTimeout(`${SERVER_URL}/operator_report`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            }, 10000);

            if (response.ok) {
                Alert.alert("Success", "Machine closed and report saved.");
                setShowCloseModal(false);
                // After saving the operator report, also call the existing stop logic to clean up machine status
                // We'll mimic the confirmStop logic but without the showReport step
                isUpdatingManually.current = true;
                const finalCount = count;
                const { success: stopSuccess, error: stopError } = await updateDB('stop', finalCount, "MACHINE CLOSED BY OPERATOR", null, machineSessionStart, resumeTime);
                if (stopSuccess) {
                    setIsRunning(false); isRunningRef.current = false;
                    setMachineStatus('idle'); statusRef.current = 'idle';
                    setStartTime(null); startTimeRef.current = null;
                    // Reset fields
                    updateConfig({
                        semiProductName: '',
                        materialType1: 'None', mQty1: '',
                        materialType2: 'None', mQty2: '',
                        materialType3: 'None', mQty3: '',
                        materialType4: 'None', mQty4: '',
                        materialColor: 'Natural', colorQty: '',
                        moldType: '',
                        cavity: '',
                        cycleTiming: '5'
                    });
                    setWastage(''); setWastageLumps(''); setAddedMaterials([]);
                    setCount(0); countRef.current = 0;
                    baseCount.current = 0; lastReportCount.current = 0;
                    isIntervalStateLoaded.current = false; // Reset for next session
                    setMachineSessionStart(null); setResumeTime(null); setStartTime(null); startTimeRef.current = null; setStopTime(null);
                    isDataLoaded.current = false;
                    await updateDB('idle', 0, null, null, null, null);
                    router.back();
                } else {
                    Alert.alert("Error", stopError || "Could not stop machine on server.");
                }
            } else {
                Alert.alert("Error", "Failed to save operator report.");
            }
        } catch (error) {
            Alert.alert("Error", "Check connection.");
        }
    }, [id, machineName, operatorName, machineConfig, count, totalProdWeightGm, totalProdWeightKg, machineSessionStart, resumeTime, updateDB, updateConfig, router]);

    if (loading) {
        return (
            <View style={[styles.outerWrapper, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color="#3B82F6" />
                <Text style={{ color: '#94A3B8', marginTop: 10, fontWeight: 'bold' }}>CONNECTING UNIT {id}...</Text>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.outerWrapper}>
            <StatusBar barStyle="light-content" />
            <HourlyReportModal
                visible={showHourlyModal}
                onClose={onModalClose}
                serverUrl={SERVER_URL}
                currentTotalCount={frozenCurrentCount}
                lastReportCount={frozenLastCount}
                intervalProduction={frozenIntervalCount}
                initialChecks={frozenChecks}
                onSuccess={async (newTotal, newInterval) => {
                    // Update server state using the specific frozen count from the interval
                    // AND update last_report_at to current slot end to prevent reappearance
                    // AND update last_report_count in DB to ensure it persists across navigation
                    const { success } = await updateDB(machineStatus, newTotal, null, null, null, null, currentSlotWallStartTime.current, newInterval, newTotal);
                    
                    if (success) {
                        // Track this specific range as submitted locally to prevent reappearance
                        submittedRangesRef.current.add(nextHourRange.trim());
                        fetchHourlyLogs(); // Refresh manual logs list
                    }
                    
                    onModalClose();
                }}
                onDiscard={async () => {
                    // Just close for now; since it remains 'pending' on server, 
                    // it will be re-fetched by loadState() and added back to queue later.
                    onModalClose();
                }}
                machineData={{ id, name: machineName || `UNIT ${id}`, shift: machineConfig.shift }}
                operatorId={operatorId}
                hourRange={nextHourRange}
                semiFinishedProduct={machineConfig.semiProductName}
                reportDate={nextReportDate}
            />

            <HourlyGridModal 
                visible={showManualHourlyModal}
                setVisible={setShowManualHourlyModal}
                hourlyLogs={hourlyLogs}
                machineId={id}
                operatorId={operatorIdRef.current}
                onSlotPress={(slot: any) => {
                    setSelectedSlot(slot);
                    setShowManualHourlyModal(false);
                    setNextHourRange(slot.range);
                    
                    const log = hourlyLogs.find((l: any) => l.hour_range === slot.range);
                    if (log) {
                        setFrozenLastCount(log.total_output - log.hourly_output);
                        setFrozenIntervalCount(log.hourly_output);
                        setFrozenCurrentCount(log.total_output);
                        setFrozenChecks({
                            chiller: !!log.chiller_check,
                            compressor: !!log.compressor_check,
                            mould: !!log.mould_check,
                            machine: !!log.machine_check,
                            remarks: log.remarks || '',
                            down_time: log.down_time || '',
                            down_reason: log.down_reason || '',
                            good_parts: log.good_parts?.toString() || '',
                            rejects: log.rejects?.toString() || ''
                        });
                        setNextReportDate(log.timestamp);
                    } else {
                        setFrozenLastCount(count); 
                        setFrozenIntervalCount(0);
                        setFrozenChecks({
                            chiller: false,
                            compressor: false,
                            mould: false,
                            machine: false,
                            remarks: '',
                            down_time: '',
                            down_reason: '',
                            good_parts: '',
                            rejects: ''
                        });
                    }
                    setShowHourlyModal(true);
                }}
            />

            <StopReasonModal 
                visible={showStopModal} 
                onClose={() => { isPausing.current = false; setShowStopModal(false); }} 
                onConfirm={confirmStop} 
                typedReason={typedReason} 
                setTypedReason={setTypedReason} 
            />
            
            <CloseMachineModal 
                visible={showCloseModal} 
                onClose={() => setShowCloseModal(false)} 
                onSubmit={handleCloseMachine} 
                count={count} 
                setCount={setCount}
                totalProdWeightGm={totalProdWeightGm} 
                totalProdWeightKg={totalProdWeightKg} 
                cavityTotalWeight={cavityTotalWeight} 
                shift={machineConfig.shift} 
                operatorName={operatorName} 
                setOperatorName={setOperatorName} 
            />

            <ProductionReportModal 
                visible={showReport} 
                onClose={() => { setShowReport(false); isUpdatingManually.current = false; }} 
                onConfirm={handleSendForApproval} 
                reportMaterials={reportMaterials} 
                setReportMaterials={setReportMaterials} 
                count={count} 
                setCount={setCount} 
                rejectionCount={rejectionCount} 
                setRejectionCount={setRejectionCount} 
                typedReason={typedReason} 
                setTypedReason={setTypedReason} 
                machineName={machineName || `UNIT ${id}`} 
                shift={machineConfig.shift} 
                semiProductName={machineConfig.semiProductName} 
                machineSessionStart={machineSessionStart} 
                stopTime={stopTime} 
                totalProdWeightGm={totalProdWeightGm} 
                totalProdWeightKg={totalProdWeightKg} 
                moldType={machineConfig.moldType} 
                cavity={machineConfig.cavity} 
                cycleTiming={machineConfig.cycleTiming} 
                formatTime={formatTime} 
            />

            <AddMaterialsModal 
                visible={showAddMaterialsModal} 
                onClose={() => { 
                    isUpdatingManually.current = false;
                    setShowAddMaterialsModal(false); 
                    setAddMat1('None'); setAddMQty1('');
                    setAddMat2('None'); setAddMQty2('');
                    setAddMat3('None'); setAddMQty3('');
                    setAddMat4('None'); setAddMQty4('');
                    setAddCol('Natural'); setAddCQty('');
                }} 
                onAdd={handleAddMaterials} 
                dbMaterials={dbMaterials} 
                dbColors={dbColors} 
                addMat1={addMat1} setAddMat1={setAddMat1} 
                addMQty1={addMQty1} setAddMQty1={setAddMQty1} 
                addMat2={addMat2} setAddMat2={setAddMat2} 
                addMQty2={addMQty2} setAddMQty2={setAddMQty2} 
                addMat3={addMat3} setAddMat3={setAddMat3} 
                addMQty3={addMQty3} setAddMQty3={setAddMQty3} 
                addMat4={addMat4} setAddMat4={setAddMat4} 
                addMQty4={addMQty4} setAddMQty4={setAddMQty4} 
                addCol={addCol} setAddCol={setAddCol} 
                addCQty={addCQty} setAddCQty={setAddCQty} 
                isSubmitting={isSubmittingMaterial} 
            />

            <LumpsModal 
                visible={showLumpsModal} 
                onClose={() => setShowLumpsModal(false)} 
                onSave={handleSaveLumps} 
                lumpsKg={lumpsKg} setLumpsKg={setLumpsKg} 
                wastageKg={wastageKg} setWastageKg={setWastageKg} 
                isSubmitting={isSubmittingLumps} 
            />

            <View style={styles.headerContainer}>
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity onPress={() => router.replace('/machineries')} style={styles.backTouch}><Text style={styles.backText}>← EXIT</Text></TouchableOpacity>
                    </View>
                    <View style={styles.headerCenter}>
                        <Text style={styles.machineTitle}>UNIT {id} SETUP</Text>
                        <View style={styles.statusRow}>
                            <View style={[styles.statusDot, { backgroundColor: isRunning ? '#10B981' : '#94A3B8' }]} />
                            <Text style={[styles.statusLabel, { color: isRunning ? '#10B981' : '#94A3B8' }]}>{isRunning ? 'RUNNING' : 'IDLE'}</Text>
                        </View>
                    </View>
                    <View style={styles.headerRight}>
                        <TouchableOpacity 
                            style={[styles.lumpsBtn]} 
                            onPress={() => setShowLumpsModal(true)}
                        >
                            <Text style={styles.lumpsBtnText}>LUMPS</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>

            <View style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.scrollBody} showsVerticalScrollIndicator={false}>
                    <View style={styles.formCard}>
                        <Text style={styles.inputLabel}>SHIFT SELECTION</Text>
                        <View style={[styles.pickerBox, showLiveView && styles.locked]}>
                            <Picker 
                                selectedValue={machineConfig.shift} 
                                onValueChange={(val) => updateConfig({ shift: val })} 
                                enabled={!showLiveView} 
                                style={styles.picker}
                            >
                                <Picker.Item label="Day Shift" value="Day Shift" color="#000000" />
                                <Picker.Item label="Night Shift" value="Night Shift" color="#000000" />
                            </Picker>
                        </View>
                        
                        {/* SEMI-FINISHED PRODUCT SELECTION PICKER */}
                        <Text style={styles.inputLabel}>SEMI-FINISHED PRODUCT SELECTION</Text>
                        <View style={[styles.pickerBox, showLiveView && styles.locked]}>
                            <Picker 
                                selectedValue={machineConfig.semiProductName} 
                                onValueChange={(val) => updateConfig({ semiProductName: val })} 
                                enabled={!showLiveView} 
                                style={styles.picker}
                                dropdownIconColor="white"
                            >
                                <Picker.Item label="-- Choose Semi-Finished --" value="" color="#000000" />
                                {Array.isArray(dbSemiProducts) && dbSemiProducts.length > 0 ? (
                                    dbSemiProducts.map((p, idx) => (
                                        <Picker.Item 
                                            key={p.id ? p.id.toString() : idx.toString()} 
                                            label={p.product_name} 
                                            value={p.product_name} 
                                            color="#000000"
                                        />
                                    ))
                                ) : (
                                    <Picker.Item label="Loading..." value="" color="#000000" />
                                )}
                            </Picker>
                        </View>

                        {[1, 2, 3, 4].map((num) => {
                            const mValue = [machineConfig.materialType1, machineConfig.materialType2, machineConfig.materialType3, machineConfig.materialType4][num - 1];
                            const qtyValue = [machineConfig.mQty1, machineConfig.mQty2, machineConfig.mQty3, machineConfig.mQty4][num - 1];
                            const isMNone = mValue === 'None';
                            
                            // Find current stock for the selected material
                            const selectedMatObj = dbMaterials.find(m => m.material_name === mValue);
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
                                        <View style={[styles.pickerBox, { flex: 2 }, showLiveView && styles.locked]}>
                                            <Picker 
                                                selectedValue={mValue} 
                                                onValueChange={(val) => updateConfig({ [`materialType${num}`]: val })} 
                                                enabled={!showLiveView} 
                                                style={styles.picker}
                                            >
                                                <Picker.Item label="None" value="None" color="#000000" />
                                                {dbMaterials.map((m) => <Picker.Item key={m.id} label={m.material_name} value={m.material_name} color="#000000" />)}
                                            </Picker>
                                        </View>
                                        <TextInput 
                                            style={[styles.input, { flex: 1, marginLeft: 10 }, (showLiveView || isMNone) && styles.locked]} 
                                            value={isMNone ? '0' : qtyValue} 
                                            onChangeText={(txt) => updateConfig({ [`mQty${num}`]: txt })} 
                                            keyboardType="numeric" 
                                            editable={!showLiveView && !isMNone} 
                                        />
                                    </View>
                                </View>
                            );
                        })}
                        {/* MATERIAL COLOR & QTY */}
                        {(() => {
                            const selectedColorObj = dbColors.find(c => c.color_name === machineConfig.materialColor);
                            const currentStockCol = selectedColorObj ? parseFloat(selectedColorObj.stock_qty_kgs || "0") : 0;
                            const isNatural = machineConfig.materialColor === 'Natural';
                            
                            return (
                                <View>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 15 }}>
                                        <Text style={[styles.inputLabel, { marginTop: 0 }]}>MATERIAL COLOR & QTY (KGS)</Text>
                                        {!isNatural && (
                                            <View style={styles.stockBox}>
                                                <Text style={[styles.stockValue, currentStockCol < 50 && { color: '#EF4444' }]}>
                                                    STK: {currentStockCol}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.row}>
                                        <View style={[styles.pickerBox, { flex: 2 }, showLiveView && styles.locked]}>
                                            <Picker 
                                                selectedValue={machineConfig.materialColor} 
                                                onValueChange={(val) => updateConfig({ materialColor: val })} 
                                                enabled={!showLiveView} 
                                                style={styles.picker}
                                            >
                                                <Picker.Item label="Natural" value="Natural" color="#000000" />
                                                {dbColors.map((c) => (<Picker.Item key={c.id} label={c.color_name} value={c.color_name} color="#000000" />))}
                                            </Picker>
                                        </View>
                                        <TextInput 
                                            style={[styles.input, { flex: 1, marginLeft: 10 }, (showLiveView || isNatural) && styles.locked]} 
                                            value={isNatural ? '0' : machineConfig.colorQty} 
                                            onChangeText={(txt) => updateConfig({ colorQty: txt })} 
                                            placeholder="Qty" 
                                            placeholderTextColor="#475569" 
                                            keyboardType="numeric" 
                                            editable={!showLiveView && !isNatural} 
                                        />
                                    </View>
                                </View>
                            );
                        })()}
                        <Text style={styles.inputLabel}>MOLD SELECTION</Text>
                        <View style={[styles.pickerBox, showLiveView && styles.locked]}>
                            <Picker 
                                selectedValue={machineConfig.moldType} 
                                onValueChange={(val) => { 
                                    const selected = dbMolds.find(m => m.mold_name === val); 
                                    const newCavity = selected ? (selected.cavity_count?.toString() || selected.cavity_options?.split(',')[0].trim() || "1") : "1";
                                    updateConfig({ moldType: val, cavity: newCavity });
                                    cavityRef.current = parseInt(newCavity) || 1; 
                                }} 
                                enabled={!showLiveView} 
                                style={styles.picker} 
                            >
                                {dbMolds.map((m) => <Picker.Item key={m.id} label={m.mold_name} value={m.mold_name} color="#000000" />)}
                            </Picker>
                        </View>
                        <Text style={styles.inputLabel}>CAVITY COUNT</Text>
                        <View style={[styles.input, styles.locked]}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>{machineConfig.cavity || "1"}</Text>
                        </View>

                        {/* NEW: CAVITY TOTAL WEIGHT DISPLAY */}
                        <Text style={styles.inputLabel}>CAVITY TOTAL WEIGHT (GM)</Text>
                        <View style={[styles.input, styles.locked]}>
                            <Text style={{ color: 'white', fontWeight: 'bold' }}>{cavityTotalWeight.toFixed(2)} GM</Text>
                        </View>
                        <Text style={styles.inputLabel}>TIMING (SECONDS PER CYCLE)</Text>
                        <TextInput 
                            style={[styles.input, showLiveView && styles.locked]} 
                            value={machineConfig.cycleTiming} 
                            onChangeText={(val) => { updateConfig({ cycleTiming: val }); timingRef.current = parseFloat(val) || 5; }} 
                            keyboardType="numeric" 
                            editable={!showLiveView} 
                        />
                    </View>

                    {isRunning && (
                        <>
                            {/* NEW: ADD MATERIALS BUTTON (Only when running) */}
                            <TouchableOpacity 
                                style={[styles.actionBtn, { backgroundColor: '#3B82F6', marginBottom: 15 }]} 
                                onPress={() => {
                                    isUpdatingManually.current = true;
                                    setShowAddMaterialsModal(true);
                                }}
                            >
                                <Text style={styles.btnText}>ADD MATERIALS</Text>
                            </TouchableOpacity>

                            {/* NEW: RECORD HOURLY PRODUCTION BUTTON */}
                            <TouchableOpacity 
                                style={[styles.actionBtn, { backgroundColor: '#3B82F6', marginBottom: 15 }]} 
                                onPress={() => {
                                    isUpdatingManually.current = true;
                                    setShowManualHourlyModal(true);
                                }}
                            >
                                <Text style={styles.btnText}>RECORD HOURLY PRODUCTION</Text>
                            </TouchableOpacity>
                        </>
                    )}

                    {isRunning || isPaused ? (
                        <>
                            {isPaused && (
                                <TouchableOpacity 
                                    style={[styles.actionBtn, { backgroundColor: '#F59E0B', marginBottom: 15 }]} 
                                    onPress={resumeMachine}
                                >
                                    <Text style={styles.btnText}>RESUME MACHINE</Text>
                                </TouchableOpacity>
                            )}
                            <TouchableOpacity 
                                style={[styles.actionBtn, { backgroundColor: '#EF4444' }]} 
                                onPress={() => {
                                    isPausing.current = true;
                                    setTypedReason(''); 
                                    setShowStopModal(true);
                                }}
                            >
                                <Text style={styles.btnText}>STOP MACHINE</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <>
                            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10B981' }]} onPress={handleToggle}>
                                <Text style={styles.btnText}>START MACHINE</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    outerWrapper: { flex: 1, backgroundColor: '#0F172A' },
    headerContainer: { backgroundColor: '#1E293B', paddingTop: 10, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#334155' },
    headerContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 15 },
    headerLeft: { flex: 1, alignItems: 'flex-start' },
    headerCenter: { flex: 2, alignItems: 'center' },
    headerRight: { flex: 1, alignItems: 'flex-end' },
    backTouch: { },
    backText: { color: '#94A3B8', fontWeight: 'bold', fontSize: 11 },
    machineTitle: { color: '#F8FAFC', fontSize: 16, fontWeight: '900' },
    statusRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
    statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
    statusLabel: { fontSize: 11, fontWeight: 'bold' },
    scrollBody: { padding: 15 },
    formCard: { backgroundColor: '#1E293B', borderRadius: 15, padding: 15, marginBottom: 15 },
    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    inputLabel: { color: '#94A3B8', fontSize: 10, fontWeight: '900', marginTop: 10, marginBottom: 5 },
    pickerBox: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#334155' },
    picker: { color: '#000000' },
    input: { backgroundColor: '#0F172A', borderRadius: 12, borderWidth: 1, borderColor: '#334155', color: 'white', padding: 10, fontWeight: 'bold', fontSize: 13 },
    locked: { opacity: 0.5, backgroundColor: '#334155' },
    actionBtn: { height: 55, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    btnText: { color: 'white', fontSize: 16, fontWeight: '900' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center' },
    modalContainer: { backgroundColor: '#1E293B', borderRadius: 20, padding: 20, width: '90%', borderWidth: 1, borderColor: '#334155' },
    modalTitle: { fontSize: 16, fontWeight: '900', textAlign: 'center', marginBottom: 15, color: 'white' },
    reasonInput: { backgroundColor: '#0F172A', color: 'white', borderRadius: 12, padding: 12, height: 80, textAlignVertical: 'top', marginTop: 10, fontSize: 14 },
    modalBtnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
    modalBtn: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center', marginHorizontal: 5 },
    modalBtnText: { color: 'white', fontWeight: 'bold' },
    approveBtn: { padding: 20, borderRadius: 20, marginTop: 20, alignItems: 'center', backgroundColor: '#10B981' },
    approveBtnText: { color: 'white', fontWeight: '900' },
    divider: { height: 1, backgroundColor: '#334155', marginVertical: 10 },
    stockBox: { backgroundColor: '#0F172A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#334155', marginBottom: 2 },
    stockValue: { fontSize: 10, fontWeight: '900', color: '#10B981' },
    gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', padding: 10 },
    slotItem: { width: '48%', backgroundColor: '#0F172A', padding: 15, borderRadius: 12, marginBottom: 15, borderWidth: 1, borderColor: '#334155', alignItems: 'center' },
    slotRecorded: { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)' },
    slotPending: { borderColor: '#3B82F6', backgroundColor: 'rgba(59, 130, 246, 0.1)' },
    slotDisabled: { opacity: 0.5 },
    slotRangeText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
    slotStatusText: { color: '#94A3B8', fontSize: 10, fontWeight: '900', marginTop: 4 },
    slotDataText: { color: '#10B981', fontSize: 10, fontWeight: 'bold', marginTop: 4 },
    lumpsBtn: { backgroundColor: '#3B82F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    lumpsBtnText: { color: 'white', fontWeight: 'bold', fontSize: 10 },
});
