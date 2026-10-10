import React, { useState } from 'react';
import { Smartphone, ShieldCheck, ShieldAlert, Trash2, Search, CheckCircle2 } from 'lucide-react';
import { DeviceRecord } from '../types';

interface DeviceManagementViewProps {
  devices: DeviceRecord[];
  onRevokeDevice: (deviceId: string) => Promise<boolean>;
}

export const DeviceManagementView: React.FC<DeviceManagementViewProps> = ({
  devices,
  onRevokeDevice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<DeviceRecord | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredDevices = devices.filter((d) => {
    const q = searchTerm.toLowerCase();
    return (
      d.user_name.toLowerCase().includes(q) ||
      d.device_model.toLowerCase().includes(q) ||
      d.device_fingerprint.toLowerCase().includes(q) ||
      d.license_key.toLowerCase().includes(q)
    );
  });

  const handleRevoke = async (device: DeviceRecord) => {
    setIsProcessing(true);
    await onRevokeDevice(device.id);
    setIsProcessing(false);
    setSelectedDevice(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">ডিভাইস ফ্লিট ও লিমিট ম্যানেজমেন্ট</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            সার্ভার-সাইড ডিভাইস লিমিট নিয়ন্ত্রণ · SHA-256 হার্ডওয়্যার ফিঙ্গারপ্রিন্ট ট্র্যাকিং · রিমোট রিভোকেশন
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ডিভাইস মডেল, ফিঙ্গারপ্রিন্ট বা ইউজার খুঁজুন..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>
        <div className="text-xs text-slate-400">
          মোট সংযুক্ত ডিভাইস: <span className="text-purple-400 font-mono font-medium">{filteredDevices.length}</span> টি
        </div>
      </div>

      {/* Devices Table */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3 px-4 font-medium">ডিভাইস মডেল ও প্ল্যাটফর্ম</th>
                <th className="py-3 px-4 font-medium">হার্ডওয়্যার ফিঙ্গারপ্রিন্ট</th>
                <th className="py-3 px-4 font-medium">যুক্ত ব্যবহারকারী</th>
                <th className="py-3 px-4 font-medium">লাইসেন্স কি</th>
                <th className="py-3 px-4 font-medium">সর্বশেষ সক্রিয়</th>
                <th className="py-3 px-4 font-medium">স্ট্যাটাস</th>
                <th className="py-3 px-4 font-medium text-right">পদক্ষেপ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredDevices.map((dev) => (
                <tr key={dev.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-white flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{dev.device_model}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                      {dev.os_version} · App v{dev.app_version}
                    </div>
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-400 select-all">
                    {dev.device_fingerprint}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-white font-medium">{dev.user_name}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{dev.user_phone}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-cyan-300 text-xs">
                    {dev.license_key}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-400 tabular-nums">
                    {new Date(dev.last_active_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    {dev.is_revoked ? (
                      <span className="text-rose-400 font-medium">অননুমোদিত (Revoked)</span>
                    ) : (
                      <span className="text-emerald-400 font-medium">অনুমোদিত (Authorized)</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right">
                    {!dev.is_revoked && (
                      <button
                        onClick={() => setSelectedDevice(dev)}
                        className="px-2.5 py-1 rounded text-xs font-medium bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                      >
                        ডিভাইস বাতিল
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Revoke Confirmation Modal */}
      {selectedDevice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <span>ডিভাইস অনুমোদন বাতিল নিশ্চিতকরণ</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              আপনি কি নিশ্চিত যে <span className="text-white font-semibold">{selectedDevice.device_model}</span> (ইউজার:{' '}
              {selectedDevice.user_name}) ডিভাইসটির লাইসেন্স এক্সেস স্থায়ীভাবে বন্ধ করতে চান? এর ফলে উক্ত ফোনে AudiVox অডিও প্লেয়ার আর চলবে না।
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedDevice(null)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                বাতিল করুন
              </button>
              <button
                onClick={() => handleRevoke(selectedDevice)}
                disabled={isProcessing}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 transition-colors"
              >
                {isProcessing ? 'বাতিল করা হচ্ছে...' : 'অনুমোদন বাতিল করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
