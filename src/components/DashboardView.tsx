import React from 'react';
import {
  Users,
  Key,
  Smartphone,
  Package,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { UserProfile, License, DeviceRecord, AppRelease, AuditLog } from '../types';

interface DashboardViewProps {
  users: UserProfile[];
  licenses: License[];
  devices: DeviceRecord[];
  releases: AppRelease[];
  auditLogs: AuditLog[];
  onNavigate: (section: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  users,
  licenses,
  devices,
  releases,
  auditLogs,
  onNavigate,
}) => {
  const activeLicenses = licenses.filter(l => l.is_active && !l.is_suspended && !l.is_revoked).length;
  const expiredLicenses = licenses.filter(l => !l.is_lifetime && l.expires_at && new Date(l.expires_at) < new Date()).length;
  const suspendedUsers = users.filter(u => u.is_suspended).length;
  const activeDevices = devices.filter(d => !d.is_revoked).length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">AudiVox এডমিন ড্যাশবোর্ড</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            সিস্টেম ওভারভিউ · লাইসেন্স অ্যাক্টিভেশন · ডিভাইস কন্ট্রোল · রিলিজ স্ট্যাটাস
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('licenses')}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shadow-sm shadow-cyan-500/10"
          >
            + নতুন লাইসেন্স কি তৈরি করুন
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Metric Cards (High density, tabular numerals, unboxed) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>মোট নিবন্ধিত ইউজার</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-white">{users.length}</span>
            <span className="text-xs text-slate-400">অ্যাকাউন্ট</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {suspendedUsers} জন সাময়িক স্থগিত (Suspended)
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>সক্রিয় লাইসেন্স</span>
            <Key className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">{activeLicenses}</span>
            <span className="text-xs text-slate-400">/ {licenses.length} মোট</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {expiredLicenses} টি মেয়াদোত্তীর্ণ লাইসেন্স
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>অনলাইন ডিভাইস ফ্লিট</span>
            <Smartphone className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-purple-300">{activeDevices}</span>
            <span className="text-xs text-slate-400">ডিভাইস যুক্ত</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            হার্ডওয়্যার ফিঙ্গারপ্রিন্ট সংরক্ষিত
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>রিলিজ ও আপডেট সংস্করণ</span>
            <Package className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-white">v1.0.0</span>
            <span className="text-xs text-cyan-400 font-mono">LIVE</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            User & Admin APK বিল্ড প্রস্তুত
          </div>
        </div>
      </div>

      {/* Main Grid: License Quick Table & Recent Security Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Licenses Table (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">সর্বশেষ লাইসেন্স অ্যাক্টিভেশনসমূহ</h2>
            <button
              onClick={() => onNavigate('licenses')}
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>সকল লাইসেন্স দেখুন</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono">
                  <tr>
                    <th className="py-3 px-4 font-medium">লাইসেন্স কি (License Key)</th>
                    <th className="py-3 px-4 font-medium">টাইপ</th>
                    <th className="py-3 px-4 font-medium">ব্যবহারকারী</th>
                    <th className="py-3 px-4 font-medium">ডিভাইস লিমিট</th>
                    <th className="py-3 px-4 font-medium">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {licenses.slice(0, 5).map((lic) => (
                    <tr key={lic.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-cyan-300">
                        {lic.license_key}
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-300">{lic.license_type}</span>
                        {lic.is_lifetime && <span className="text-purple-400 ml-1 font-mono text-[10px]">LIFETIME</span>}
                      </td>
                      <td className="py-3 px-4 text-slate-300">
                        {lic.assigned_to_name ? (
                          <div>
                            <div>{lic.assigned_to_name}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{lic.assigned_to_phone}</div>
                          </div>
                        ) : (
                          <span className="text-slate-500 italic">আনঅ্যাসাইনড</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono tabular-nums">
                        {lic.active_devices || 0} / {lic.max_devices}
                      </td>
                      <td className="py-3 px-4">
                        {lic.is_revoked ? (
                          <span className="text-rose-400 font-medium">বাতিলকৃত (Revoked)</span>
                        ) : lic.is_suspended ? (
                          <span className="text-amber-400 font-medium">স্থগিত (Suspended)</span>
                        ) : (
                          <span className="text-emerald-400 font-medium">সক্রিয় (Active)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Security & Audit Stream */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">সিকিউরিটি ও অডিট ইভেন্ট</h2>
            <button
              onClick={() => onNavigate('audit')}
              className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>লগ দেখুন</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4 space-y-3">
            {auditLogs.slice(0, 5).map((log) => (
              <div key={log.id} className="pb-3 border-b border-slate-800/50 last:border-0 last:pb-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono text-cyan-300 font-medium">{log.action}</span>
                  <span className="text-[11px] text-slate-500 font-mono tabular-nums">
                    {new Date(log.created_at).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Actor: <span className="text-slate-200 font-medium">{log.actor_name}</span>
                  {log.entity_id && (
                    <span className="text-slate-400 ml-1">· Entity: {log.entity_id}</span>
                  )}
                </div>
                {log.ip_address && (
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                    IP: {log.ip_address}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
