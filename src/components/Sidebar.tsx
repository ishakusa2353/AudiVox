import React from 'react';
import {
  LayoutDashboard,
  Users,
  Key,
  Smartphone,
  Music,
  Package,
  Wrench,
  ShieldAlert,
  FileCode2,
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSelectSection: (section: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSelectSection }) => {
  const navItems = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', sublabel: 'Dashboard', icon: LayoutDashboard },
    { id: 'users', label: 'ইউজার ম্যানেজমেন্ট', sublabel: 'Users & Profile ID', icon: Users },
    { id: 'licenses', label: 'লাইসেন্স জেনারেটর', sublabel: 'Custom Keys & Limits', icon: Key },
    { id: 'devices', label: 'ডিভাইস ফ্লিট', sublabel: 'Device Limits & Fingerprints', icon: Smartphone },
    { id: 'sounds', label: 'সাউন্ডবোর্ড লাইব্রেরি', sublabel: 'Audio SFX & Categories', icon: Music },
    { id: 'releases', label: 'APK রিলিজ ও বিল্ড সেন্টার', sublabel: 'Build Jobs & Mandatory Updates', icon: Package },
    { id: 'maintenance', label: 'রক্ষণাবেক্ষণ নিয়ন্ত্রণ', sublabel: 'Maintenance Mode', icon: Wrench },
    { id: 'audit', label: 'সিকিউরিটি অডিট লগ', sublabel: 'Immutable Audit Trail', icon: ShieldAlert },
    { id: 'schema', label: 'Supabase SQL স্কিমা', sublabel: 'PostgreSQL DDL & Policies', icon: FileCode2 },
  ];

  return (
    <aside className="w-64 shrink-0 bg-slate-950 border-r border-slate-800/80 p-4 flex flex-col justify-between hidden lg:flex min-h-[calc(100vh-57px)]">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider font-mono">
          অ্যাডমিন কনসোল
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors text-left ${
                isActive
                  ? 'bg-slate-900 text-cyan-400 font-medium border border-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <div className="truncate">
                <div className="truncate leading-tight text-slate-200">{item.label}</div>
                <div className="text-[11px] text-slate-500 truncate">{item.sublabel}</div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-800/80">
        <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
          <div className="text-xs font-medium text-slate-300">AudiVox Engine v1.0.0</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Your Sound. Your Game.</div>
        </div>
      </div>
    </aside>
  );
};
