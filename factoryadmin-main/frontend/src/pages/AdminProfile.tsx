import React, { useState, useEffect } from 'react';
import api from '../api/client';
import { 
    User, 
    CreditCard, 
    Lock,
    Save,
    Plus,
    Trash2,
    AlertCircle,
    CheckCircle2,
    Edit2,
    Building2,
    Phone,
    MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface BankAccount {
    id?: number;
    account_name: string;
    account_number: string;
    bank_name: string;
    ifsc_code: string;
    balance?: number;
}

interface Profile {
    name: string;
    gst_number: string;
    address: string;
    phone_number: string;
    alternate_phone_number: string;
}

const AdminProfile: React.FC = () => {
    const [profile, setProfile] = useState<Profile>({
        name: '',
        gst_number: '',
        address: '',
        phone_number: '',
        alternate_phone_number: ''
    });
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api.get('admin/profile');
            if (res.data.profile) {
                setProfile({
                    name: res.data.profile.name || '',
                    gst_number: res.data.profile.gst_number || '',
                    address: res.data.profile.address || '',
                    phone_number: res.data.profile.phone_number || '',
                    alternate_phone_number: res.data.profile.alternate_phone_number || ''
                });
            }
            setBankAccounts(res.data.bankAccounts || []);
        } catch {
            console.error('Error fetching profile');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.post('admin/profile', { ...profile, bankAccounts });
            setMessage({ type: 'success', text: 'Profile updated successfully' });
            setIsEditing(false);
            setTimeout(() => setMessage(null), 3000);
        } catch {
            setMessage({ type: 'error', text: 'Failed to update profile' });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }
        setSaving(true);
        try {
            await api.post('admin/change-password', {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword
            });
            setMessage({ type: 'success', text: 'Password changed successfully' });
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to change password';
            setMessage({ type: 'error', text: errorMessage });
        } finally {
            setSaving(false);
        }
    };

    const addBankAccount = () => {
        setBankAccounts([...bankAccounts, { account_name: '', account_number: '', bank_name: '', ifsc_code: '' }]);
    };

    const removeBankAccount = (index: number) => {
        setBankAccounts(bankAccounts.filter((_, i) => i !== index));
    };

    const updateBankAccount = (index: number, field: keyof BankAccount, value: string) => {
        const updated = [...bankAccounts];
        updated[index] = { ...updated[index], [field]: value };
        setBankAccounts(updated);
    };

    if (loading) return <div className="flex justify-center p-12">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 lg:space-y-8 pb-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight uppercase leading-tight">Admin Profile</h1>
                <AnimatePresence>
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className={`w-full sm:w-auto flex items-center gap-2 px-4 py-2 rounded-xl shadow-lg ${
                                message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                            }`}
                        >
                            {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                            <span className="text-[10px] lg:text-sm font-bold uppercase tracking-wide">{message.text}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                {/* Profile Section */}
                <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                    <section className="bg-white p-6 lg:p-8 rounded-2xl lg:rounded-[2rem] border border-slate-100 shadow-soft overflow-hidden relative">
                        <div className="flex items-center gap-3 mb-6 lg:mb-8">
                            <div className="p-2.5 lg:p-3 bg-orange-50 text-[#e85c24] rounded-xl lg:rounded-2xl">
                                <User size={20} className="lg:w-6 lg:h-6" />
                            </div>
                            <h2 className="text-lg lg:text-xl font-black text-slate-900 uppercase tracking-tight">Identity Details</h2>
                        </div>

                        {!isEditing ? (
                            <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8">
                                    <div className="space-y-1">
                                        <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Full Name</p>
                                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm lg:text-base uppercase tracking-tight">
                                            <User size={14} className="text-slate-300 lg:w-4 lg:h-4" />
                                            <span>{profile.name || 'Not Set'}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">GST Number</p>
                                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm lg:text-base uppercase tracking-tight">
                                            <Building2 size={14} className="text-slate-300 lg:w-4 lg:h-4" />
                                            <span>{profile.gst_number || 'Not Set'}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Phone Number</p>
                                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm lg:text-base tracking-tight">
                                            <Phone size={14} className="text-slate-300 lg:w-4 lg:h-4" />
                                            <span>{profile.phone_number || 'Not Set'}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Alt. Phone</p>
                                        <div className="flex items-center gap-2 text-slate-900 font-bold text-sm lg:text-base tracking-tight">
                                            <Phone size={14} className="text-slate-300 lg:w-4 lg:h-4" />
                                            <span>{profile.alternate_phone_number || 'None'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[8px] lg:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Registered Address</p>
                                    <div className="flex gap-2 text-slate-900 font-bold text-sm lg:text-base tracking-tight leading-relaxed">
                                        <MapPin size={14} className="text-slate-300 mt-1 shrink-0 lg:w-4 lg:h-4" />
                                        <span className="uppercase">{profile.address || 'No address provided'}</span>
                                    </div>
                                </div>

                                <div className="pt-6 lg:pt-8 border-t border-slate-50">
                                    <div className="flex items-center gap-3 mb-4 lg:mb-6">
                                        <div className="p-2.5 lg:p-3 bg-blue-50 text-blue-600 rounded-xl lg:rounded-2xl">
                                            <CreditCard size={20} className="lg:w-6 lg:h-6" />
                                        </div>
                                        <h2 className="text-lg lg:text-xl font-black text-slate-900 uppercase tracking-tight">Financial Hub</h2>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3 lg:gap-4">
                                        {bankAccounts.length > 0 ? (
                                            bankAccounts.map((acc, i) => (
                                                <div key={i} className="p-4 lg:p-6 bg-slate-50 rounded-2xl lg:rounded-3xl border border-transparent hover:border-slate-100 transition-all group">
                                                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-y-4 gap-x-4 lg:gap-x-8">
                                                        <div className="space-y-1">
                                                            <p className="text-[7px] lg:text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Holder Name</p>
                                                            <p className="text-[11px] lg:text-sm font-black text-slate-900 uppercase leading-tight mt-1">{acc.account_name}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[7px] lg:text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Account Number</p>
                                                            <p className="text-[11px] lg:text-sm font-black text-slate-900 leading-none mt-1">{acc.account_number}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[7px] lg:text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">Bank Detail</p>
                                                            <p className="text-[11px] lg:text-sm font-black text-slate-900 uppercase leading-tight mt-1">{acc.bank_name}</p>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <p className="text-[7px] lg:text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">IFSC Branch</p>
                                                            <p className="text-[11px] lg:text-sm font-black text-slate-900 leading-none mt-1 uppercase">{acc.ifsc_code}</p>
                                                        </div>
                                                        <div className="space-y-1 col-span-2 mt-2 pt-2 border-t border-slate-100/50">
                                                            <p className="text-[7px] lg:text-[8px] font-black text-emerald-500 uppercase tracking-widest leading-none">Current Balance</p>
                                                            <p className="text-sm lg:text-lg font-black text-emerald-600 leading-none mt-1">₹{Number(acc.balance || 0).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-6 lg:py-8 text-slate-400 font-bold uppercase tracking-widest text-[9px] lg:text-[10px] border-2 border-dashed border-slate-100 rounded-2xl">
                                                No bank accounts registered
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4 lg:pt-6">
                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="w-full sm:w-auto flex items-center justify-center gap-2 lg:gap-3 px-6 lg:px-8 py-3.5 lg:py-4 bg-slate-900 text-white rounded-xl lg:rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                                    >
                                        <Edit2 size={16} className="lg:w-[18px] lg:h-[18px]" />
                                        Update Details
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleProfileSave} className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                        <input
                                            type="text"
                                            value={profile.name}
                                            onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-[#e85c24]/10 transition-all font-bold text-slate-900"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">GST Number</label>
                                        <input
                                            type="text"
                                            value={profile.gst_number}
                                            onChange={(e) => setProfile({ ...profile, gst_number: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-[#e85c24]/10 transition-all font-bold text-slate-900"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number</label>
                                        <input
                                            type="tel"
                                            value={profile.phone_number}
                                            onChange={(e) => setProfile({ ...profile, phone_number: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-[#e85c24]/10 transition-all font-bold text-slate-900"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Alt. Phone (Optional)</label>
                                        <input
                                            type="tel"
                                            value={profile.alternate_phone_number}
                                            onChange={(e) => setProfile({ ...profile, alternate_phone_number: e.target.value })}
                                            className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-[#e85c24]/10 transition-all font-bold text-slate-900"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Address</label>
                                    <textarea
                                        value={profile.address}
                                        onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-4 focus:ring-[#e85c24]/10 transition-all font-bold text-slate-900 resize-none"
                                    />
                                </div>

                                {/* Bank Accounts Section (Editing) */}
                                <div className="pt-6 border-t border-slate-50">
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                                                <CreditCard size={24} />
                                            </div>
                                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Bank Accounts</h2>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addBankAccount}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-colors"
                                        >
                                            <Plus size={16} /> Add Account
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {bankAccounts.map((acc, index) => (
                                            <div key={index} className="p-6 bg-slate-50 rounded-[1.5rem] relative group border border-transparent hover:border-slate-200 transition-all">
                                                <button
                                                    type="button"
                                                    onClick={() => removeBankAccount(index)}
                                                    className="absolute top-4 right-4 p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <div className="space-y-1.5">
                                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Account Name</label>
                                                        <input
                                                            type="text"
                                                            value={acc.account_name}
                                                            onChange={(e) => updateBankAccount(index, 'account_name', e.target.value)}
                                                            className="w-full px-4 py-2 bg-white border-none rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-xs"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Account Number</label>
                                                        <input
                                                            type="text"
                                                            value={acc.account_number}
                                                            onChange={(e) => updateBankAccount(index, 'account_number', e.target.value)}
                                                            className="w-full px-4 py-2 bg-white border-none rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-xs"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Bank Name</label>
                                                        <input
                                                            type="text"
                                                            value={acc.bank_name}
                                                            onChange={(e) => updateBankAccount(index, 'bank_name', e.target.value)}
                                                            className="w-full px-4 py-2 bg-white border-none rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-xs"
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">IFSC Code</label>
                                                        <input
                                                            type="text"
                                                            value={acc.ifsc_code}
                                                            onChange={(e) => updateBankAccount(index, 'ifsc_code', e.target.value)}
                                                            className="w-full px-4 py-2 bg-white border-none rounded-xl focus:ring-4 focus:ring-blue-500/10 transition-all font-bold text-xs"
                                                            required
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase tracking-[0.2em] hover:bg-slate-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex-[2] flex items-center justify-center gap-3 px-8 py-4 bg-[#e85c24] text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg shadow-[#e85c24]/20 hover:bg-[#d44d1a] transition-all disabled:opacity-50"
                                    >
                                        <Save size={20} />
                                        {saving ? 'Saving...' : 'Commit Changes'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </section>
                </div>

                {/* Password Change Form */}
                <div className="space-y-8">
                    <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-soft">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl">
                                <Lock size={24} />
                            </div>
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Security</h2>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
                                <input
                                    type="password"
                                    value={passwords.currentPassword}
                                    onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#e85c24]/20 transition-all font-bold text-slate-900"
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Password</label>
                                <input
                                    type="password"
                                    value={passwords.newPassword}
                                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#e85c24]/20 transition-all font-bold text-slate-900"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwords.confirmPassword}
                                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-[#e85c24]/20 transition-all font-bold text-slate-900"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-slate-800 transition-all disabled:opacity-50"
                            >
                                <Lock size={18} />
                                {saving ? 'Processing...' : 'Change Password'}
                            </button>
                        </form>
                    </section>

                    <div className="bg-amber-50 p-6 rounded-[1.5rem] border border-amber-100">
                        <div className="flex gap-3">
                            <AlertCircle className="text-amber-500 shrink-0" size={20} />
                            <div>
                                <h3 className="text-xs font-black text-amber-900 uppercase tracking-tight mb-1">Security Tip</h3>
                                <p className="text-[10px] text-amber-700 font-bold leading-relaxed uppercase tracking-tight">
                                    Use a strong password with at least 8 characters, including symbols and numbers.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile;
