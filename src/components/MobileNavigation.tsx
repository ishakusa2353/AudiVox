import React, { useState } from 'react';
import {
  LayoutDashboard,
  Key,
  Users,
  Package,
  Menu,
  X,
  Smartphone,
  Music,
  Wrench,
  ShieldAlert,
  FileCode2,
  Download,
  Database,
} from 'lucide-react';
import { downloadApkDirect } from '../utils/apkDownloader';

interface MobileNavigationProps {
  activeSection: string;
  onSelectSection: (section: string) => void;
  isLiveConnected: boolean;
  onOpenConfig: () => void;
}

export const MobileNavigation: React.FC<MobileNavigationProps> = ({
  activeSection,
  onSelectSection,
  isLiveConnected,
  onOpenConfig,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'licenses', label: 'লাইসেন্স', icon: Key },
    { id: 'users', label: 'ইউজার', icon: Users },
    { id: 'releases', label: 'রিলিজ', icon: Package },
  ];

  const allSections = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', sublabel: 'System Overview & Stats', icon: LayoutDashboard },
    { id: 'licenses', label: 'লাইসেন্স জেনারেটর', sublabel: 'Custom Duration & Limits', icon: Key },
    { id: 'users', label: 'ব্যবহারকারী তালিকা', sublabel: '8-Digit Profile ID & Status', icon: Users },
    { id: 'devices', label: 'ডিভাইস ফ্লিট', sublabel: 'Hardware Fingerprints', icon: Smartphone },
    { id: 'sounds', label: 'সাউন্ডবোর্ড লাইব্রেরি', sublabel: 'Audio Preview & Categories', icon: Music },
    { id: 'releases', label: 'APK রিলিজ সেন্টার', sublabel: 'Build Jobs & Updates', icon: Package },
    { id: 'maintenance', label: 'রক্ষণাবেক্ষণ নিয়ন্ত্রণ', sublabel: 'Maintenance Lock', icon: Wrench },
    { id: 'audit', label: 'সিকিউরিটি অডিট লগ', sublabel: 'Immutable Audit Trail', icon: ShieldAlert },
    { id: 'schema', label: 'Supabase SQL স্কিমা', sublabel: 'Database Schema & RLS', icon: FileCode2 },
  ];

  const handleSelect = (id: string) => {
    onSelectSection(id);
    setIsMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Glassmorphic Bottom Navigation Bar (Visible only on mobile < lg) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/85 backdrop-blur-xl border-t border-white/10 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-bottom">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 min-w-[64px] min-h-[48px] rounded-xl transition-all ${
                isActive
                  ? 'text-cyan-400 bg-cyan-500/10 border border-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span className="text-[10px] font-medium mt-1 whitespace-nowrap">{tab.label}</span>
            </button>
          );
        })}

        {/* More / Menu Drawer Toggle */}
        <button
          onClick={() => setIsMenuOpen(true)}
          className={`flex flex-col items-center justify-center py-1.5 px-3 min-w-[64px] min-h-[48px] rounded-xl transition-all ${
            isMenuOpen || !mainTabs.some((t) => t.id === activeSection)
              ? 'text-purple-400 bg-purple-500/10 border border-purple-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Menu className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-1">মেনু</span>
        </button>
      </nav>

      {/* Mobile Slide-Up Full Drawer (Glassmorphic) */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end bg-black/80 backdrop-blur-md">
          <div
            className="w-full max-h-[85vh] bg-slate-950/95 backdrop-blur-2xl border-t border-cyan-500/30 rounded-t-3xl p-5 overflow-y-auto space-y-4 shadow-2xl"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <img
                  src="https://i.ibb.co/TMG8b3Pb/file-425.jpg"
                  alt="AudiVox"
                  className="w-7 h-7 rounded-lg object-cover"
                />
                <div>
                  <h3 className="text-sm font-bold text-white">AudiVox এডমিন কন্ট্রোল</h3>
                  <p className="text-[11px] text-cyan-400 font-mono">Mobile Touch Menu</p>
                </div>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick 1-Tap APK Downloads on Phone */}
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-cyan-500/20 space-y-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase font-mono">
                সরাসরি ফোনে APK ডাউনলোড (No Redirect)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => downloadApkDirect('USER', '1.0.0')}
                  className="py-2.5 px-3 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shadow-cyan-400/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>User APK</span>
                </button>
                <button
                  onClick={() => downloadApkDirect('ADMIN', '1.0.0')}
                  className="py-2.5 px-3 rounded-xl bg-purple-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md shadow-purple-600/20"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Admin APK</span>
                </button>
              </div>
            </div>

            {/* All 9 Navigation Panels */}
            <div className="space-y-1">
              <div className="text-[11px] font-semibold text-slate-500 uppercase font-mono px-2 py-1">
                ম্যানেজমেন্ট সেকশন
              </div>
              {allSections.map((sec) => {
                const Icon = sec.icon;
                const isActive = activeSection === sec.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => handleSelect(sec.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all min-h-[48px] ${
                      isActive
                        ? 'bg-cyan-500/10 text-cyan-400 font-semibold border border-cyan-500/30'
                        : 'text-slate-300 hover:bg-slate-900/60 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                    <div className="truncate">
                      <div className="text-xs font-medium text-white">{sec.label}</div>
                      <div className="text-[10px] text-slate-400 truncate">{sec.sublabel}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Supabase status in drawer */}
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Database className={`w-3.5 h-3.5 ${isLiveConnected ? 'text-emerald-400' : 'text-cyan-400'}`} />
                <span>{isLiveConnected ? 'Supabase সংযুক্ত' : 'Supabase সেটআপ'}</span>
              </span>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenConfig();
                }}
                className="text-cyan-400 hover:underline text-[11px]"
              >
                কনফিগারেশন
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
