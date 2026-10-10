import React from 'react';
import { Database, Shield, Smartphone, Download } from 'lucide-react';
import { downloadApkDirect } from '../utils/apkDownloader';

interface NavbarProps {
  isLiveConnected: boolean;
  onOpenConfig: () => void;
  activeSection: string;
  onSelectSection: (section: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isLiveConnected,
  onOpenConfig,
  activeSection,
  onSelectSection,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40 text-slate-100">
      {/* Zone 1: Brand wordmark (single element, whitespace-nowrap) */}
      <div className="flex items-center gap-3 shrink-0">
        <img
          src="https://i.ibb.co/TMG8b3Pb/file-425.jpg"
          alt="AudiVox"
          className="w-8 h-8 rounded-lg object-cover ring-1 ring-cyan-500/30"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        <button
          onClick={() => onSelectSection('dashboard')}
          className="text-lg font-bold tracking-tight text-white hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <span>AudiVox</span>
          <span className="text-xs font-medium text-cyan-400 font-mono tracking-normal">ADMIN</span>
        </button>
      </div>

      {/* Zone 2: 4-5 clean single-line nav links */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
        <button
          onClick={() => onSelectSection('dashboard')}
          className={`transition-colors whitespace-nowrap shrink-0 ${activeSection === 'dashboard' ? 'text-cyan-400' : 'hover:text-white'}`}
        >
          ড্যাশবোর্ড (Overview)
        </button>
        <button
          onClick={() => onSelectSection('licenses')}
          className={`transition-colors whitespace-nowrap shrink-0 ${activeSection === 'licenses' ? 'text-cyan-400' : 'hover:text-white'}`}
        >
          লাইসেন্স জেনারেটর
        </button>
        <button
          onClick={() => onSelectSection('users')}
          className={`transition-colors whitespace-nowrap shrink-0 ${activeSection === 'users' ? 'text-cyan-400' : 'hover:text-white'}`}
        >
          ব্যবহারকারী
        </button>
        <button
          onClick={() => onSelectSection('releases')}
          className={`transition-colors whitespace-nowrap shrink-0 ${activeSection === 'releases' ? 'text-cyan-400' : 'hover:text-white'}`}
        >
          APK রিলিজ সেন্টার
        </button>
        <button
          onClick={() => onSelectSection('sounds')}
          className={`transition-colors whitespace-nowrap shrink-0 ${activeSection === 'sounds' ? 'text-cyan-400' : 'hover:text-white'}`}
        >
          সাউন্ড লাইব্রেরি
        </button>
      </nav>

      {/* Zone 3: 1 primary action button + Direct Download triggers */}
      <div className="flex items-center gap-2.5 shrink-0">
        <button
          onClick={() => downloadApkDirect('USER', '1.0.0')}
          className="px-3 py-1.5 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-transform active:scale-95 flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm"
          title="User APK সরাসরি ডাউনলোড করুন"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">User APK</span>
          <span className="sm:hidden">User</span>
        </button>

        <button
          onClick={() => downloadApkDirect('ADMIN', '1.0.0')}
          className="px-3 py-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 rounded-lg transition-transform active:scale-95 flex items-center gap-1.5 whitespace-nowrap shrink-0 shadow-sm"
          title="Admin APK সরাসরি ডাউনলোড করুন"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Admin APK</span>
          <span className="sm:hidden">Admin</span>
        </button>

        <button
          onClick={onOpenConfig}
          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 border border-slate-700/80 hover:border-cyan-500/50 hover:bg-slate-800 text-slate-200 transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <Database className={`w-3.5 h-3.5 ${isLiveConnected ? 'text-emerald-400' : 'text-cyan-400'}`} />
          <span className="hidden md:inline">{isLiveConnected ? 'Supabase Live' : 'Supabase Config'}</span>
        </button>
      </div>
    </header>
  );
};
