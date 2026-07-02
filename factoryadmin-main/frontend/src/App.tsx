import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthProvider';
import { useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Inventory from './pages/Inventory';
import Machines from './pages/Machines';
import Production from './pages/Production';
import QC from './pages/QC';
import SalesApprovals from './pages/SalesApprovals';
import SalesHistory from './pages/SalesHistory';
import Dispatch from './pages/Dispatch';
import PurchaseRequests from './pages/PurchaseRequests';
import PurchaseApprovals from './pages/PurchaseApprovals';
import PurchaseHistory from './pages/PurchaseHistory';
import Accounts from './pages/Accounts';
import AdminProfile from './pages/AdminProfile';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import Privacy from './pages/Privacy';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/privacy" element={<Privacy />} />
                    
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Dashboard />} />
                        <Route path="users" element={<Users />} />
                        <Route path="inventory" element={<Inventory />} />
                        <Route path="machines" element={<Machines />} />
                        <Route path="production" element={<Production />} />
                        <Route path="qc" element={<QC />} />
                        <Route path="sales-approvals" element={<SalesApprovals />} />
                        <Route path="sales-history" element={<SalesHistory />} />
                        <Route path="dispatch" element={<Dispatch />} />
                        <Route path="purchase-requests" element={<PurchaseRequests />} />
                        <Route path="purchase-approvals" element={<PurchaseApprovals />} />
                        <Route path="purchase-history" element={<PurchaseHistory />} />
                        <Route path="accounts" element={<Accounts />} />
                        <Route path="attendance" element={<Attendance />} />
                        <Route path="reports" element={<Reports />} />
                        <Route path="admin-profile" element={<AdminProfile />} />
                    </Route>

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
};

export default App;
