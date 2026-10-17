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

      {/* Zone 2: Mode Switcher & Navigation Links */}
      <nav className="hidden md:flex items-center gap-2 text-xs font-semibold">
        <button
          onClick={() => onSelectSection('showcase')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
            activeSection === 'showcase'
              ? 'bg-gradient-to-r from-cyan-500/25 to-purple-500/25 border border-cyan-400/50 text-cyan-300 shadow-md'
              : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>🖼️ ৩০-স্ক্রিন শোকেস (Showcase)</span>
        </button>

        <button
          onClick={() => onSelectSection('user_app_sim')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
            activeSection === 'user_app_sim'
              ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-cyan-400" />
          <span>📱 User App (Phone)</span>
        </button>

        <button
          onClick={() => onSelectSection('admin_app_sim')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
            activeSection === 'admin_app_sim'
              ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300 shadow-sm'
              : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent'
          }`}
        >
          <Shield className="w-3.5 h-3.5 text-purple-400" />
          <span>🛡️ Admin App (Phone)</span>
        </button>

        <button
          onClick={() => onSelectSection('dashboard')}
          className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 ${
            activeSection === 'dashboard'
              ? 'bg-slate-900 border border-slate-700 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
          }`}
        >
          <span>🖥️ Admin Website</span>
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
