import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';
import {
  Settings as SettingsIcon,
  User,
  Mail,
  Lock,
  Bell,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Shield,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, logout } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Notification Preferences state
  const [notifyScoreChanges, setNotifyScoreChanges] = useState(true);
  const [notifyUtilizationSpikes, setNotifyUtilizationSpikes] = useState(true);
  const [notifyMonthlyAudit, setNotifyMonthlyAudit] = useState(true);

  // Delete account confirmation state
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    setPasswordLoading(true);
    try {
      await userService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordSuccess('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.response?.data?.detail || 'Failed to update password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    setDeleteLoading(true);
    try {
      await userService.deleteAccount();
      logout();
    } catch (err: any) {
      alert('Failed to delete account.');
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <SettingsIcon className="w-6 h-6 text-blue-400" />
          <h1 className="text-2xl font-extrabold text-white">Account Settings &amp; Security</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Manage your credentials, notification thresholds, and security preferences.
        </p>
      </div>

      {/* Profile Info Card */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 pb-2 border-b border-slate-800">
          User Identity
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Legal Full Name</span>
            <div className="flex items-center space-x-2 text-sm font-bold text-white">
              <User className="w-4 h-4 text-blue-400" />
              <span>{user?.full_name}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Registered Email</span>
            <div className="flex items-center space-x-2 text-sm font-bold text-white">
              <Mail className="w-4 h-4 text-emerald-400" />
              <span>{user?.email}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Card */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 pb-2 border-b border-slate-800">
          Change Password
        </h3>

        {passwordSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordError && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-xs text-rose-300 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              New Password (min 6 characters)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={passwordLoading}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all disabled:opacity-50"
          >
            {passwordLoading ? 'Updating Password...' : 'Update Password'}
          </button>
        </form>
      </div>

      {/* Notification Preferences */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 pb-2 border-b border-slate-800">
          Financial Alerts &amp; Notifications
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-white">Credit Score Movement Alerts</p>
              <p className="text-[11px] text-slate-400">
                Receive notifications whenever CIBIL score changes are recorded.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifyScoreChanges}
              onChange={(e) => setNotifyScoreChanges(e.target.checked)}
              className="w-4 h-4 accent-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-white">30% Utilization Threshold Warnings</p>
              <p className="text-[11px] text-slate-400">
                Get alerted before card spending crosses into score-damaging ratios.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifyUtilizationSpikes}
              onChange={(e) => setNotifyUtilizationSpikes(e.target.checked)}
              className="w-4 h-4 accent-blue-600 rounded"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
            <div>
              <p className="text-xs font-bold text-white">Monthly Financial Wellness Summary</p>
              <p className="text-[11px] text-slate-400">
                Automated monthly compilation and PDF generation notification.
              </p>
            </div>
            <input
              type="checkbox"
              checked={notifyMonthlyAudit}
              onChange={(e) => setNotifyMonthlyAudit(e.target.checked)}
              className="w-4 h-4 accent-blue-600 rounded"
            />
          </label>
        </div>
      </div>

      {/* Danger Zone: Delete Account */}
      <div className="p-6 bg-rose-950/20 border border-rose-500/20 rounded-2xl shadow-xl space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-rose-400">Danger Zone</h3>
        <p className="text-xs text-slate-400">
          Permanently remove your account, recorded CIBIL score progression history, financial profiles, and AI consultation logs.
        </p>

        <button
          onClick={handleDeleteAccount}
          disabled={deleteLoading}
          className="flex items-center space-x-1.5 px-4 py-2 bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs rounded-xl transition-all"
        >
          <Trash2 className="w-4 h-4" />
          <span>
            {deleteLoading
              ? 'Deleting...'
              : deleteConfirm
              ? 'Are you certain? Click again to confirm'
              : 'Delete My Account'}
          </span>
        </button>
      </div>
    </div>
  );
};
