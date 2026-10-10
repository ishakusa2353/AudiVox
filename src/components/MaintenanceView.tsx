import React, { useState } from 'react';
import { Wrench, AlertTriangle, CheckCircle2, Shield, Eye } from 'lucide-react';
import { MaintenanceConfig } from '../types';

interface MaintenanceViewProps {
  config: MaintenanceConfig;
  onUpdateMaintenance: (isEnabled: boolean, message: string) => Promise<boolean>;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  config,
  onUpdateMaintenance,
}) => {
  const [isEnabled, setIsEnabled] = useState(config.is_enabled);
  const [message, setMessage] = useState(config.message);
  const [isSaving, setIsSaving] = useState(false);
  const [successToast, setSuccessToast] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    await onUpdateMaintenance(isEnabled, message);
    setIsSaving(false);
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">সার্ভার রক্ষণাবেক্ষণ ব্যবস্থাপনা (Maintenance Mode)</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            সরাসরি সার্ভার-লেভেল মেইনটেন্যান্স লক · ইউজার ব্রডকাস্ট মেসেজ · রিয়েল-টাইম স্টেট সিঙ্ক
          </p>
        </div>
      </div>

      {successToast && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>রক্ষণাবেক্ষণ কনফিগারেশন সফলভাবে আপডেট করা হয়েছে!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Configuration Form */}
        <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-400" />
                <span>মেইনটেন্যান্স সুইচ (Maintenance Toggle)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                সক্রিয় করলে সাধারণ ব্যবহারকারীরা অডিও সাউন্ডবোর্ডে প্রবেশ করতে পারবে না
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setIsEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              ব্যবহারকারীদের জন্য সম্প্রচারিত নোটিশ বার্তা (Broadcast Message):
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 min-h-[120px] leading-relaxed"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              এটি সরাসরি AudiVox Android User App-এর স্ক্রিনে প্রদর্শিত হবে।
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-2.5 px-4 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSaving ? 'সংরক্ষণ করা হচ্ছে...' : 'সেটিংস সেভ করুন (Save Configuration)'}
          </button>
        </div>

        {/* Right: Live Preview in Mobile Frame */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 font-mono">
            <Eye className="w-4 h-4 text-cyan-400" />
            <span>ইউজার অ্যাপে লাইভ প্রিভিউ (User App Preview)</span>
          </div>

          <div className="max-w-xs mx-auto rounded-3xl border-4 border-slate-800 bg-slate-950 p-6 shadow-2xl relative min-h-[380px] flex flex-col justify-center items-center text-center">
            <div className="w-16 h-1 bg-slate-800 rounded-full mb-8"></div>

            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-base font-bold text-white mb-2">
              {isEnabled ? 'সিস্টেম রক্ষণাবেক্ষণ চলছে' : 'সার্ভার স্বাভাবিকভাবে চালু'}
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed px-2">
              {isEnabled ? message : 'বর্তমানে কোনো রক্ষণাবেক্ষণ সক্রিয় নেই। অডিও ইঞ্জিন সম্পূর্ণ কার্যকর।'}
            </p>

            {isEnabled && (
              <div className="mt-6 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-mono">
                Admin Code: AUDIVOX-503
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
