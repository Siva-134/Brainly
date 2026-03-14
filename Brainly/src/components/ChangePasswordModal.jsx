import { useState } from 'react';
import { X, Lock, Check } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import api from '../api';

export const ChangePasswordModal = ({ open, onClose }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const handleSubmit = async () => {
        setError('');
        setSuccess('');

        if (!oldPassword || !newPassword || !confirmPassword) {
            setError('All fields are required');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await api.post('/change-password', {
                oldPassword,
                newPassword
            });
            setSuccess('Password changed successfully');
            setTimeout(() => {
                onClose();
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setSuccess('');
            }, 1500);
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#1a1b2e] w-full max-w-md p-6 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 relative animate-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="text-center mb-6">
                    <div className="bg-indigo-100 dark:bg-indigo-500/20 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600 dark:text-indigo-400">
                        <Lock className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Change Password</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Update your account password
                    </p>
                </div>

                <div className="space-y-4">
                    <div>
                        <Input
                            placeholder="Current Password"
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <Input
                            placeholder="New Password"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <Input
                            placeholder="Confirm New Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full"
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/50 rounded-lg text-red-600 dark:text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-900/50 rounded-lg text-green-600 dark:text-green-400 text-sm text-center flex items-center justify-center gap-2">
                            <Check className="w-4 h-4" />
                            {success}
                        </div>
                    )}

                    <Button
                        variant="primary"
                        size="lg"
                        fullWidth
                        onClick={handleSubmit}
                        loading={loading}
                        disabled={loading || success}
                        className="mt-2"
                    >
                        Update Password
                    </Button>
                </div>
            </div>
        </div>
    );
};
