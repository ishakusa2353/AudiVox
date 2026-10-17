import React, { useState } from 'react';
import { Key, Plus, ShieldAlert, CheckCircle2, Clock, Smartphone, RefreshCw } from 'lucide-react';
import { License, LicenseType } from '../types';

interface LicenseManagementViewProps {
  licenses: License[];
  onCreateLicense: (license: Omit<License, 'id' | 'created_at'>) => Promise<License>;
  onToggleStatus: (licenseId: string, action: 'suspend' | 'revoke' | 'activate') => Promise<boolean>;
}

export const LicenseManagementView: React.FC<LicenseManagementViewProps> = ({
  licenses,
  onCreateLicense,
  onToggleStatus,
}) => {
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [selectedType, setSelectedType] = useState<LicenseType>('CUSTOM');
  const [isLifetime, setIsLifetime] = useState(false);

  // Exact custom duration inputs (days, hours, minutes, seconds)
  const [customDays, setCustomDays] = useState(2);
  const [customHours, setCustomHours] = useState(4);
  const [customMinutes, setCustomMinutes] = useState(30);
  const [customSeconds, setCustomSeconds] = useState(20);

  const [maxDevices, setMaxDevices] = useState(2);
  const [licenseNotes, setLicenseNotes] = useState('');
  const [generatedKeyPreview, setGeneratedKeyPreview] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Generate unique formatted license key
  const generateRandomKey = (type: string) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const randPart = (len: number) =>
      Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    const prefix = isLifetime ? 'LIFE' : type.slice(0, 4);
    return `AVX-${prefix}-${randPart(4)}-${randPart(4)}`;
  };

  const openGenerator = () => {
    const key = generateRandomKey(selectedType);
    setGeneratedKeyPreview(key);
    setShowGeneratorModal(true);
  };

  const handleCreate = async () => {
    setIsGenerating(true);
    const totalSeconds =
      customDays * 86400 + customHours * 3600 + customMinutes * 60 + customSeconds;

    const key = generatedKeyPreview || generateRandomKey(selectedType);

    await onCreateLicense({
      license_key: key,
      license_type: isLifetime ? 'LIFETIME' : selectedType,
      duration_seconds: isLifetime ? 0 : totalSeconds,
      is_lifetime: isLifetime,
      max_devices: maxDevices,
      is_active: true,
      is_suspended: false,
      is_revoked: false,
      notes: licenseNotes || `Created via Admin Portal (${customDays}d ${customHours}h ${customMinutes}m ${customSeconds}s)`,
    });

    setIsGenerating(false);
    setShowGeneratorModal(false);
    setSuccessToast(`লাইসেন্স কি ${key} সফলভাবে তৈরি হয়েছে!`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">লাইসেন্স ম্যানেজমেন্ট ও অ্যাক্টিভেশন সিস্টেম</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            সার্ভার অথরিটেটিভ টাইম ভ্যালিডেশন · দিন, ঘণ্টা, মিনিট ও সেকেন্ড কাস্টম মেয়াদ · ডিভাইস লিমিটেশন
          </p>
        </div>
        <button
          onClick={openGenerator}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন লাইসেন্স তৈরি করুন</span>
        </button>
      </div>

      {successToast && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Licenses Table */}
      <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono">
              <tr>
                <th className="py-3 px-4 font-medium">লাইসেন্স কি</th>
                <th className="py-3 px-4 font-medium">টাইপ</th>
                <th className="py-3 px-4 font-medium">মেয়াদ ও সময়সীমা</th>
                <th className="py-3 px-4 font-medium">অনুমোদিত ডিভাইস</th>
                <th className="py-3 px-4 font-medium">বরাদ্দকৃত গ্রাহক</th>
                <th className="py-3 px-4 font-medium">স্ট্যাটাস</th>
                <th className="py-3 px-4 font-medium text-right">ম্যানেজমেন্ট</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {licenses.map((lic, idx) => {
                const totalSec = lic.duration_seconds;
                const d = Math.floor(totalSec / 86400);
                const h = Math.floor((totalSec % 86400) / 3600);
                const m = Math.floor((totalSec % 3600) / 60);
                const s = totalSec % 60;

                return (
                  <tr key={`${lic.id || 'lic'}-${idx}`} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-cyan-300 select-all">
                      {lic.license_key}
                    </td>
                    <td className="py-3 px-4">
                      {lic.is_lifetime ? (
                        <span className="text-purple-400 font-mono font-semibold">LIFETIME</span>
                      ) : (
                        <span className="text-slate-300 font-medium">{lic.license_type}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-300">
                      {lic.is_lifetime ? (
                        <span className="text-slate-400">সীমাহীন (Unbounded)</span>
                      ) : (
                        <span>{d}d {h}h {m}m {s}s</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums">
                      {lic.active_devices || 0} / {lic.max_devices} ডিভাইস
                    </td>
                    <td className="py-3 px-4">
                      {lic.assigned_to_name ? (
                        <div>
                          <div className="font-medium text-white">{lic.assigned_to_name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{lic.assigned_to_phone}</div>
                        </div>
                      ) : (
                        <span className="text-slate-500 italic">এখনও সক্রিয় হয়নি</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {lic.is_revoked ? (
                        <span className="text-rose-400 font-medium">বাতিল (Revoked)</span>
                      ) : lic.is_suspended ? (
                        <span className="text-amber-400 font-medium">স্থগিত (Suspended)</span>
                      ) : (
                        <span className="text-emerald-400 font-medium">সক্রিয় (Active)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {!lic.is_revoked && (
                        <>
                          <button
                            onClick={() => onToggleStatus(lic.id, 'suspend')}
                            className="px-2.5 py-1 rounded text-[11px] font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors"
                          >
                            {lic.is_suspended ? 'স্থগিত প্রত্যাহার' : 'স্থগিত'}
                          </button>
                          <button
                            onClick={() => onToggleStatus(lic.id, 'revoke')}
                            className="px-2.5 py-1 rounded text-[11px] font-medium bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors"
                          >
                            বাতিল করুন
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generator Modal */}
      {showGeneratorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-cyan-400" />
                <span>নতুন লাইসেন্স কি তৈরি করুন</span>
              </h3>
              <button
                onClick={() => setShowGeneratorModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            {/* Generated Key Box */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-between">
              <div>
                <div className="text-[10px] text-slate-500 uppercase font-mono">লাইসেন্স কি প্রিভিউ</div>
                <div className="font-mono text-base font-bold text-cyan-400 tracking-wider">
                  {generatedKeyPreview}
                </div>
              </div>
              <button
                onClick={() => setGeneratedKeyPreview(generateRandomKey(selectedType))}
                className="p-2 text-slate-400 hover:text-cyan-400 rounded transition-colors"
                title="নতুন কি তৈরি করুন"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* License Type Selector */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-300">লাইসেন্স ক্যাটাগরি:</label>
              <div className="grid grid-cols-4 gap-2">
                {(['CUSTOM', 'VIP', 'PRO', 'LIFETIME'] as LicenseType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setSelectedType(type);
                      setIsLifetime(type === 'LIFETIME');
                      setGeneratedKeyPreview(generateRandomKey(type));
                    }}
                    className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                      (type === 'LIFETIME' && isLifetime) || (selectedType === type && !isLifetime)
                        ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Duration Inputs (Days, Hours, Minutes, Seconds) */}
            {!isLifetime && (
              <div className="space-y-2 p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
                <div className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  <span>কাস্টম সময়কাল (দিন, ঘণ্টা, মিনিট ও সেকেন্ড):</span>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-1">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">দিন (Days)</label>
                    <input
                      type="number"
                      min="0"
                      value={customDays}
                      onChange={(e) => setCustomDays(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-center text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">ঘণ্টা (Hours)</label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      value={customHours}
                      onChange={(e) => setCustomHours(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-center text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">মিনিট (Mins)</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={customMinutes}
                      onChange={(e) => setCustomMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-center text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">সেকেন্ড (Secs)</label>
                    <input
                      type="number"
                      min="0"
                      max="59"
                      value={customSeconds}
                      onChange={(e) => setCustomSeconds(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-center text-sm font-mono text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
                <div className="text-[11px] text-slate-400 pt-1 font-mono">
                  মোট সময়কাল:{' '}
                  <span className="text-cyan-300">
                    {(customDays * 86400 + customHours * 3600 + customMinutes * 60 + customSeconds).toLocaleString()}{' '}
                    সেকেন্ড
                  </span>
                </div>
              </div>
            )}

            {/* Max Devices Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>সর্বোচ্চ অনুমোদিত ডিভাইস সীমা:</span>
                <span className="font-mono font-bold text-cyan-400">{maxDevices} টি ফোন/ডিভাইস</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={maxDevices}
                onChange={(e) => setMaxDevices(parseInt(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>১ টি ডিভাইস</span>
                <span>৫ টি ডিভাইস</span>
                <span>১০ টি ডিভাইস</span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">অভ্যন্তরীণ নোট (Notes):</label>
              <input
                type="text"
                value={licenseNotes}
                onChange={(e) => setLicenseNotes(e.target.value)}
                placeholder="যেমন: প্রমোশনাল টুর্নামেন্ট লাইসেন্স..."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowGeneratorModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                বাতিল করুন
              </button>
              <button
                type="button"
                onClick={handleCreate}
                disabled={isGenerating}
                className="px-5 py-2 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-sm"
              >
                {isGenerating ? 'তৈরি হচ্ছে...' : 'লাইসেন্স ইস্যু করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
