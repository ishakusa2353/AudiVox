import React, { useState } from 'react';
import { Search, UserX, UserCheck, ShieldAlert, Smartphone, Key } from 'lucide-react';
import { UserProfile } from '../types';

interface UserManagementViewProps {
  users: UserProfile[];
  onToggleSuspension: (userId: string, reason?: string) => Promise<boolean>;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  onToggleSuspension,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredUsers = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    return (
      u.full_name.toLowerCase().includes(q) ||
      u.phone_number.includes(q) ||
      u.profile_id.includes(q)
    );
  });

  const handleToggle = async (user: UserProfile) => {
    setIsProcessing(true);
    await onToggleSuspension(user.id, actionReason || 'Admin administrative toggle');
    setIsProcessing(false);
    setSelectedUser(null);
    setActionReason('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">ব্যবহারকারী ব্যবস্থাপনা (User Management)</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            সার্ভার-জেনারেটেড ৮ ডিজিট প্রোফাইল আইডি · এক ফোন নম্বরে একক অ্যাকাউন্ট নীতি · সাসপেনশন কন্ট্রোল
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="নাম, ফোন নম্বর বা ৮-ডিজিট প্রোফাইল আইডি খুঁজুন..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>
        <div className="text-xs text-slate-400">
          মোট পাওয়া গেছে: <span className="text-cyan-400 font-mono font-medium">{filteredUsers.length}</span> জন
        </div>
      </div>

      {/* Users High-Density Table */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3 px-4 font-medium">প্রোফাইল আইডি (8-Digit)</th>
                <th className="py-3 px-4 font-medium">পূর্ণ নাম</th>
                <th className="py-3 px-4 font-medium">ফোন নম্বর (E.164)</th>
                <th className="py-3 px-4 font-medium">লাইসেন্স কি</th>
                <th className="py-3 px-4 font-medium">ডিভাইস সংখ্যা</th>
                <th className="py-3 px-4 font-medium">অ্যাকাউন্ট স্ট্যাটাস</th>
                <th className="py-3 px-4 font-medium text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredUsers.map((user, idx) => (
                <tr key={`${user.id || 'usr'}-${idx}`} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-cyan-400">
                    {user.profile_id}
                  </td>
                  <td className="py-3 px-4 font-medium text-white">
                    {user.full_name}
                    {user.is_admin && (
                      <span className="ml-1.5 text-[10px] text-purple-400 font-mono font-semibold">ADMIN</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-300">
                    {user.phone_number}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">
                    {user.active_license_key ? (
                      <span className="text-cyan-300">{user.active_license_key}</span>
                    ) : (
                      <span className="text-slate-500 italic">কোনো লাইসেন্স নেই</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-mono tabular-nums">
                    {user.device_count || 0} টি ডিভাইস
                  </td>
                  <td className="py-3 px-4">
                    {user.is_suspended ? (
                      <span className="text-rose-400 font-medium">স্থগিত (Suspended)</span>
                    ) : (
                      <span className="text-emerald-400 font-medium">সক্রিয় (Active)</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        user.is_suspended
                          ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                      }`}
                    >
                      {user.is_suspended ? 'পুনরায় সক্রিয় করুন' : 'স্থগিত করুন'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspension / Action Confirmation Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">
              {selectedUser.is_suspended ? 'অ্যাকাউন্ট পুনর্বহাল নিশ্চিতকরণ' : 'অ্যাকাউন্ট সাময়িক স্থগিতকরণ'}
            </h3>
            <p className="text-xs text-slate-400">
              ইউজার: <span className="text-white font-medium">{selectedUser.full_name}</span> (ID: {selectedUser.profile_id})
            </p>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                অডিট কারণ বা মন্তব্য (Reason for audit trail):
              </label>
              <textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="যেমন: ডিভাইস শেয়ারিং লঙ্ঘন অথবা ব্যবহারকারীর অনুরোধ..."
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 min-h-[80px]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                বাতিল করুন
              </button>
              <button
                onClick={() => handleToggle(selectedUser)}
                disabled={isProcessing}
                className={`px-4 py-2 rounded-lg text-xs font-semibold text-white transition-colors ${
                  selectedUser.is_suspended
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-rose-600 hover:bg-rose-500'
                }`}
              >
                {isProcessing ? 'প্রক্রিয়াকরণ হচ্ছে...' : 'নিশ্চিত করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
