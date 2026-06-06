import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { usePathname } from 'expo-router';
import { SERVER_URL } from '../constants/ApiConfig';
import { fetchWithTimeout } from '../utils/fetchTimeout';
import HourlyReportModal from '../app/hourly_report';

interface MachineContextType {
    activeMachineId: string | null;
    setActiveMachineId: (id: string | null) => void;
}

const MachineContext = createContext<MachineContextType | undefined>(undefined);

export const MachineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const pathname = usePathname();
    const [activeMachineId, setActiveMachineId] = useState<string | null>(null);
    const [showHourlyModal, setShowHourlyModal] = useState(false);
    
    // Support multiple machines concurrently
    const [pendingMachineIndex, setPendingMachineIndex] = useState(0);
    const [pendingMachines, setPendingMachines] = useState<any[]>([]);

    const [currentTotalCount, setCurrentTotalCount] = useState(0);
    const [frozenIntervalCount, setFrozenIntervalCount] = useState(0);
    const [operatorId, setOperatorId] = useState<string | null>(null);
    const [nextHourRange, setNextHourRange] = useState('');
    
    // Track stats per machine ID
    const machineStats = useRef<Record<string, { lastReportTimestamp: number; lastReportCount: number }>>({});

    const formatTimeLocal = (d: Date) => {
        let h = d.getHours();
        let m = d.getMinutes();
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        const mm = m < 10 ? `0${m}` : m;
        return `${h}:${mm} ${ampm}`;
    };

    /*
    useEffect(() => {
        const interval = setInterval(async () => {
            const userId = await AsyncStorage.getItem('user_id');
            const userRole = await AsyncStorage.getItem('user_role');
            if (!userId || userRole !== 'OPERATOR') return;
            setOperatorId(userId);

            try {
                if (pathname === '/machinedetail' || showHourlyModal) return;

                const res = await fetchWithTimeout(`${SERVER_URL}/machines`, {}, 5000);
                const allMachines = await res.json();
                
                const activeMachines = allMachines.filter((m: any) => 
                    m.status === 'running' || m.status === 'paused' || m.status === 'power_cut'
                );

                const popupsToTrigger: any[] = [];

                activeMachines.forEach((machine: any) => {
                    const mId = String(machine.id);
                    const now = Date.now();
                    const status = machine.status;
                    const timing = parseInt(machine.cycle_timing) || 1;
                    const cav = parseInt(machine.cavity) || 1;
                    const base = parseInt(machine.accumulated_output) || 0;

                    // Initialize tracker for this specific machine if not exists
                    if (!machineStats.current[mId]) {
                        if (machine.session_start_time) {
                            const sessionStart = new Date(machine.session_start_time).getTime();
                            const elapsedSinceStart = now - sessionStart;
                            const intervalsPassed = Math.floor(elapsedSinceStart / 60000);
                            
                            machineStats.current[mId] = {
                                lastReportTimestamp: sessionStart + (intervalsPassed * 60000),
                                lastReportCount: parseInt(machine.hourly_units) || 0
                            };
                        } else {
                            // Fallback if no session start
                            machineStats.current[mId] = {
                                lastReportTimestamp: now,
                                lastReportCount: parseInt(machine.hourly_units) || 0
                            };
                        }
                    }

                    const stats = machineStats.current[mId];
                    const msSinceLastReport = now - stats.lastReportTimestamp;

                    if (msSinceLastReport >= 60000) {
                        const intervalEndMs = stats.lastReportTimestamp + 60000;
                        let countAt60thSecond = base;
                        
                        if (status === 'running' && (machine.resume_time || machine.start_time)) {
                            const start = new Date(machine.resume_time || machine.start_time).getTime();
                            const diffAt60 = Math.floor((intervalEndMs - start) / 1000);
                            countAt60thSecond = base + (Math.floor(diffAt60 / timing) * cav);
                        } else {
                            // If paused, use accumulated output directly
                            countAt60thSecond = base;
                        }

                        const producedInInterval = countAt60thSecond - stats.lastReportCount;
                        const startOfSlot = new Date(stats.lastReportTimestamp);
                        const endOfSlot = new Date(intervalEndMs);
                        
                        popupsToTrigger.push({
                            machineData: { 
                                id: machine.id, 
                                name: machine.machine_name || `UNIT ${machine.id}`, 
                                shift: machine.shift || 'Day Shift' 
                            },
                            currentTotalCount: countAt60thSecond,
                            lastReportCount: stats.lastReportCount,
                            intervalProduction: producedInInterval,
                            hourRange: `${formatTimeLocal(startOfSlot)} - ${formatTimeLocal(endOfSlot)}`,
                            intervalEndMs: intervalEndMs
                        });
                    }
                });

                if (popupsToTrigger.length > 0) {
                    setPendingMachines(popupsToTrigger);
                    setPendingMachineIndex(0);
                    
                    // Set frozen data for the first modal in queue
                    const first = popupsToTrigger[0];
                    setCurrentTotalCount(first.currentTotalCount);
                    setFrozenIntervalCount(first.intervalProduction);
                    setNextHourRange(first.hourRange);
                    setShowHourlyModal(true);
                }
            } catch (e) {
                console.log("Concurrent machine check failed", e);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, [showHourlyModal, pathname]);

    const handleSuccess = async (newCount: number) => {
        const currentMachine = pendingMachines[pendingMachineIndex];
        const mId = String(currentMachine.machineData.id);

        // Update local ref tracker for this machine
        if (machineStats.current[mId]) {
            machineStats.current[mId].lastReportCount = newCount;
            machineStats.current[mId].lastReportTimestamp = currentMachine.intervalEndMs;
        }
        
        // Sync with server
        try {
            await fetchWithTimeout(`${SERVER_URL}/machine_status/${mId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ hourly_units: newCount }),
            }, 5000);
        } catch (e) {}

        // Check if there are more machines in the queue
        const nextIndex = pendingMachineIndex + 1;
        if (nextIndex < pendingMachines.length) {
            const next = pendingMachines[nextIndex];
            setPendingMachineIndex(nextIndex);
            setCurrentTotalCount(next.currentTotalCount);
            setFrozenIntervalCount(next.intervalProduction);
            setNextHourRange(next.hourRange);
            // Modal stays visible
        } else {
            setShowHourlyModal(false);
            setPendingMachines([]);
            setPendingMachineIndex(0);
        }
    };
    */

    const currentMachine = pendingMachines[pendingMachineIndex];

    return (
        <MachineContext.Provider value={{ activeMachineId, setActiveMachineId }}>
            {children}
            {/*
            {currentMachine && (
                <HourlyReportModal
                    visible={showHourlyModal}
                    onClose={() => {
                        setShowHourlyModal(false);
                        setPendingMachines([]);
                        setPendingMachineIndex(0);
                    }}
                    serverUrl={SERVER_URL}
                    currentTotalCount={currentTotalCount}
                    lastReportCount={currentMachine.lastReportCount}
                    intervalProduction={frozenIntervalCount}
                    onSuccess={handleSuccess}
                    machineData={currentMachine.machineData}
                    operatorId={operatorId}
                    hourRange={nextHourRange}
                />
            )}
            */}
        </MachineContext.Provider>
    );
};

export const useMachine = () => {
    const context = useContext(MachineContext);
    if (context === undefined) {
        throw new Error('useMachine must be used within a MachineProvider');
    }
    return context;
};
