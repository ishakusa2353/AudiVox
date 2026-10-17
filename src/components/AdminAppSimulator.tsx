import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield,
  Users,
  Key,
  Music,
  Package,
  Wrench,
  Search,
  Plus,
  Play,
  Download,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ChevronRight,
  RefreshCw,
  LogOut,
  Smartphone,
  Eye,
  Terminal,
  Activity,
  Layers,
  Check,
} from 'lucide-react';
import { downloadApkDirect } from '../utils/apkDownloader';

export type AdminAppScreen =
  | 'login'
  | 'dashboard'
  | 'users'
  | 'licenses'
  | 'sounds'
  | 'maintenance'
  | 'build'
  | 'releases';

interface AdminAppSimulatorProps {
  initialScreen?: AdminAppScreen;
  onNavigateExternal?: (view: string) => void;
}

export const AdminAppSimulator: React.FC<AdminAppSimulatorProps> = ({
  initialScreen = 'dashboard',
  onNavigateExternal,
}) => {
  const [currentScreen, setCurrentScreen] = useState<AdminAppScreen>(initialScreen);
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  // Search & filters
  const [searchQuery, setSearchQuery] = useState('');
  const [activeBuildTarget, setActiveBuildTarget] = useState<'USER' | 'ADMIN'>('USER');
  const [activeReleaseTarget, setActiveReleaseTarget] = useState<'USER' | 'ADMIN'>('USER');

  // Interactive build simulation state
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildPercent, setBuildPercent] = useState(65);
  const [showLogsDrawer, setShowLogsDrawer] = useState(false);

  // License create modal state
  const [showCreateLicense, setShowCreateLicense] = useState(false);
  const [newLicenseType, setNewLicenseType] = useState('PRO');
  const [newLicenseDuration, setNewLicenseDuration] = useState('30_DAYS');

  // Maintenance state
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('System is currently undergoing routine maintenance.');
  const [savedMaintenanceFeedback, setSavedMaintenanceFeedback] = useState(false);

  // Mock Admin Data matching official showcase poster
  const [stats, setStats] = useState({
    users: 1240,
    activeLicenses: 982,
    suspended: 128,
    devices: 450,
  });

  const [adminUsers, setAdminUsers] = useState([
    { id: 'u1', name: 'Rakib Hasan', profileId: '84573219', phone: '01737 123456', status: 'ACTIVE' },
    { id: 'u2', name: 'Sadia Islam', profileId: '21948102', phone: '01819 654321', status: 'SUSPENDED' },
    { id: 'u3', name: 'Nayeem Ahmed', profileId: '76110482', phone: '01912 998877', status: 'ACTIVE' },
    { id: 'u4', name: 'Tanjila Akter', profileId: '31920947', phone: '01611 334455', status: 'ACTIVE' },
  ]);

  const [adminLicenses, setAdminLicenses] = useState([
    { id: 'lic-1', key: 'AV-738291', type: 'Lifetime', status: 'ACTIVE', devices: '1/1' },
    { id: 'lic-2', key: 'AV-192837', type: '2 Days 4h', status: 'EXPIRED', devices: '0/1' },
    { id: 'lic-3', key: 'AV-564738', type: 'Pro Plan', status: 'ACTIVE', devices: '2/2' },
    { id: 'lic-4', key: 'AV-918273', type: 'Custom', status: 'ACTIVE', devices: '1/3' },
  ]);

  const [adminSounds, setAdminSounds] = useState([
    { id: 'as-1', title: 'Headshot Strike', category: 'Gaming', isPublished: true },
    { id: 'as-2', title: 'Victory Horn', category: 'Gaming', isPublished: true },
    { id: 'as-3', title: 'Anime Power', category: 'Anime', isPublished: true },
    { id: 'as-4', title: 'Sad Wah-Wah', category: 'Meme', isPublished: false },
  ]);

  const triggerMockBuild = () => {
    setIsBuilding(true);
    setBuildPercent(15);
    const interval = setInterval(() => {
      setBuildPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBuilding(false);
          return 100;
        }
        return prev + 20;
      });
    }, 600);
  };

  const handleCreateLicenseSubmit = () => {
    const randomKey = `AV-${Math.floor(100000 + Math.random() * 900000)}`;
    setAdminLicenses([
      { id: `lic-${Date.now()}`, key: randomKey, type: newLicenseType, status: 'ACTIVE', devices: '0/1' },
      ...adminLicenses,
    ]);
    setShowCreateLicense(false);
  };

  const adminScreensList: { id: AdminAppScreen; label: string }[] = [
    { id: 'login', label: '11. Admin Login (অ্যাডমিন লগইন)' },
    { id: 'dashboard', label: '12. Admin Dashboard (সিস্টেম মেট্রিক্স)' },
    { id: 'users', label: '13. User Management (ইউজার ও আইডি)' },
    { id: 'licenses', label: '14. License Generator (কাস্টম মেয়াদ)' },
    { id: 'sounds', label: '15. Soundboard Control (পাবলিশ টগল)' },
    { id: 'maintenance', label: '16. Maintenance Mode (সার্ভার লক)' },
    { id: 'build', label: '17. APK Build Center (৬৫% প্রগ্রেস)' },
    { id: 'releases', label: '18. Release Center (APK ডাউনলোড)' },
  ];

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-6 w-full max-w-2xl mx-auto select-none">
      {/* Top Controller Header for the Admin App */}
      <div className="w-full max-w-[420px] mb-4 bg-slate-900/90 border border-purple-500/30 rounded-2xl p-3 backdrop-blur-xl shadow-lg flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              AudiVox Admin App
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono">
              Native Admin
            </span>
          </div>

          <a
            href="/downloads/audivox-admin-v1.0.0.apk"
            download="audivox-admin-v1.0.0.apk"
            className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[11px] font-mono flex items-center gap-1 shadow-md shadow-purple-600/20 transition-all active:scale-95"
          >
            <Download className="w-3 h-3" />
            <span>Download APK</span>
          </a>
        </div>

        {/* Screen Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium shrink-0">স্ক্রিন সিলেক্ট:</span>
          <select
            value={currentScreen}
            onChange={(e) => {
              setCurrentScreen(e.target.value as AdminAppScreen);
            }}
            className="flex-1 bg-slate-950 border border-slate-700/80 text-purple-300 text-xs rounded-xl px-2.5 py-1.5 font-mono focus:outline-none focus:border-purple-400 cursor-pointer"
          >
            {adminScreensList.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-950 text-slate-200">
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Phone Case Frame */}
      <div className="w-[360px] sm:w-[380px] h-[780px] bg-slate-950 rounded-[44px] border-[5px] border-slate-800 shadow-[0_0_60px_rgba(168,85,247,0.25)] relative overflow-hidden flex flex-col ring-1 ring-purple-500/20">
        
        {/* Phone Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-6 bg-slate-900 rounded-b-2xl z-50 flex items-center justify-center gap-3 border-b border-slate-800">
          <div className="w-10 h-1 bg-slate-700 rounded-full" />
          <div className="w-3 h-3 bg-slate-950 rounded-full ring-1 ring-purple-500/30 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-purple-500/40 rounded-full" />
          </div>
        </div>

        {/* Status Bar */}
        <div className="pt-7 px-6 pb-2 flex items-center justify-between text-[11px] font-mono text-slate-400 z-40 bg-slate-950/70 backdrop-blur-md shrink-0">
          <span className="font-semibold text-slate-200">09:41</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-purple-400 font-bold font-mono">ADMIN APK</span>
            <div className="w-5 h-2.5 border border-slate-500 rounded-sm p-0.5 flex items-center">
              <div className="w-full h-full bg-purple-400 rounded-xs" />
            </div>
          </div>
        </div>

        {/* Viewport Content */}
        <div className="flex-1 overflow-y-auto relative bg-[#060814] text-slate-100 flex flex-col scrollbar-none">
          <AnimatePresence mode="wait">

            {/* 11. Admin App Login */}
            {currentScreen === 'login' && (
              <motion.div
                key="admin-login"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex-1 p-6 flex flex-col justify-between"
              >
                <div className="text-center pt-8">
                  <div className="relative inline-block mb-3">
                    <img
                      src="https://i.ibb.co/TMG8b3Pb/file-425.jpg"
                      alt="AudiVox"
                      className="w-16 h-16 mx-auto rounded-2xl object-cover ring-2 ring-purple-500/50"
                    />
                    <span className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-purple-600 text-white text-[10px] font-bold rounded-md font-mono shadow-md">
                      ADMIN
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-2">AudiVox Admin</h2>
                  <p className="text-xs text-purple-300 font-mono mt-0.5">Secure Admin Access</p>
                </div>

                <div className="space-y-4 my-auto">
                  <div>
                    <label className="text-[11px] text-slate-400 uppercase font-mono">Admin ID / Email</label>
                    <input
                      type="text"
                      defaultValue="admin@audivox.io"
                      className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-purple-400 outline-hidden font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 uppercase font-mono">Password</label>
                    <input
                      type="password"
                      defaultValue="••••••••••••"
                      className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-purple-400 outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-3 pb-4">
                  <button
                    onClick={() => setCurrentScreen('dashboard')}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-sm shadow-lg shadow-purple-500/25 active:scale-95 transition-all"
                  >
                    Login to Admin Panel
                  </button>
                  <p className="text-center text-xs text-slate-500 hover:text-slate-400 cursor-pointer">
                    Forgot Password?
                  </p>
                </div>
              </motion.div>
            )}

            {/* 12. Admin Dashboard */}
            {currentScreen === 'dashboard' && (
              <motion.div
                key="admin-dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 space-y-4"
              >
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <div>
                    <h2 className="text-base font-bold text-white flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-400" />
                      <span>Admin Dashboard</span>
                    </h2>
                    <p className="text-[11px] text-slate-400">Total Stats & Fleet Monitor</p>
                  </div>
                  <button
                    onClick={() => setCurrentScreen('login')}
                    className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {/* 4 Total Stats Cards matching screen 12 */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div
                    onClick={() => setCurrentScreen('users')}
                    className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-cyan-950/30 border border-cyan-500/30 cursor-pointer hover:border-cyan-400 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">USERS</span>
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="text-xl font-bold font-mono text-white mt-1.5">{stats.users.toLocaleString()}</div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5">↑ +12% this week</div>
                  </div>

                  <div
                    onClick={() => setCurrentScreen('licenses')}
                    className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-purple-950/30 border border-purple-500/30 cursor-pointer hover:border-purple-400 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">ACTIVE LICENSES</span>
                      <Key className="w-3.5 h-3.5 text-purple-400" />
                    </div>
                    <div className="text-xl font-bold font-mono text-white mt-1.5">{stats.activeLicenses.toLocaleString()}</div>
                    <div className="text-[10px] text-purple-300 font-mono mt-0.5">98.2% valid</div>
                  </div>

                  <div
                    onClick={() => setCurrentScreen('users')}
                    className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-rose-950/30 border border-rose-500/30 cursor-pointer hover:border-rose-400 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">SUSPENDED</span>
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                    </div>
                    <div className="text-xl font-bold font-mono text-white mt-1.5">{stats.suspended}</div>
                    <div className="text-[10px] text-rose-400 font-mono mt-0.5">Review required</div>
                  </div>

                  <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900 to-emerald-950/30 border border-emerald-500/30">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 font-mono">DEVICES</span>
                      <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-xl font-bold font-mono text-white mt-1.5">{stats.devices}</div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">Active connections</div>
                  </div>
                </div>

                {/* Quick Navigation Hub */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-slate-400 uppercase font-mono">Management Hub</div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'users', label: 'User Fleet', icon: Users, color: 'text-cyan-400' },
                      { id: 'licenses', label: 'Licenses', icon: Key, color: 'text-purple-400' },
                      { id: 'sounds', label: 'Soundboard', icon: Music, color: 'text-pink-400' },
                      { id: 'build', label: 'APK Build Center', icon: Package, color: 'text-amber-400' },
                      { id: 'releases', label: 'Releases', icon: Download, color: 'text-emerald-400' },
                      { id: 'maintenance', label: 'Maintenance', icon: Wrench, color: 'text-blue-400' },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setCurrentScreen(item.id as AdminAppScreen)}
                          className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center gap-2.5 text-left transition-all"
                        >
                          <Icon className={`w-4 h-4 ${item.color}`} />
                          <span className="text-xs font-semibold text-slate-200">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="pt-2">
                  <div className="text-xs font-bold text-slate-400 uppercase font-mono mb-2">Recent Activity</div>
                  <div className="space-y-2">
                    {[
                      { action: 'New user registered', time: '2 hours ago', meta: '01737 123456' },
                      { action: 'License created', time: '4 hours ago', meta: 'AV-738291 (Lifetime)' },
                      { action: 'Sound uploaded', time: '6 hours ago', meta: 'Headshot Strike' },
                    ].map((act, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-800/80 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-semibold text-slate-200">{act.action}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{act.meta}</div>
                        </div>
                        <span className="text-[10px] text-purple-400 font-mono">{act.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 13. User Management */}
            {currentScreen === 'users' && (
              <motion.div
                key="admin-users"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-cyan-400" />
                    <span>Users</span>
                  </h3>
                  <button
                    onClick={() => setCurrentScreen('dashboard')}
                    className="text-[11px] text-purple-400 font-mono hover:underline"
                  >
                    ← Back
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by ID or phone..."
                    className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-cyan-400 outline-hidden font-mono"
                  />
                </div>

                <div className="space-y-2 pt-1">
                  {adminUsers
                    .filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.phone.includes(searchQuery))
                    .map((user, idx) => {
                      const isActive = user.status === 'ACTIVE';
                      return (
                        <div key={`admin-user-${user.id}-${idx}`} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-2">
                              <span>{user.name}</span>
                              <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold font-mono ${isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                                {user.status}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              ID: {user.profileId} · {user.phone}
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setAdminUsers(adminUsers.map(u => u.id === user.id ? { ...u, status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' } : u));
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono transition-colors ${
                              isActive ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30' : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                            }`}
                          >
                            {isActive ? 'Suspend' : 'Activate'}
                          </button>
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            )}

            {/* 14. License Management */}
            {currentScreen === 'licenses' && (
              <motion.div
                key="admin-licenses"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Key className="w-4 h-4 text-purple-400" />
                    <span>Licenses</span>
                  </h3>
                  <button
                    onClick={() => setShowCreateLicense(true)}
                    className="px-2.5 py-1 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-lg flex items-center gap-1 shadow-md shadow-purple-600/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create License</span>
                  </button>
                </div>

                <div className="space-y-2 pt-1">
                  {adminLicenses.map((lic, idx) => {
                    const isActive = lic.status === 'ACTIVE';
                    return (
                      <div key={`admin-lic-${lic.id}-${idx}`} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold font-mono text-purple-300 flex items-center gap-2">
                            <span>{lic.key}</span>
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold font-mono ${isActive ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                              {lic.status}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {lic.type} · Devices: {lic.devices}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setAdminLicenses(adminLicenses.map(l => l.id === lic.id ? { ...l, status: l.status === 'ACTIVE' ? 'EXPIRED' : 'ACTIVE' } : l));
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-800 text-[10px] text-slate-300 hover:text-white"
                        >
                          {isActive ? 'Expire' : 'Restore'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* 15. Sound Management */}
            {currentScreen === 'sounds' && (
              <motion.div
                key="admin-sounds"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Music className="w-4 h-4 text-pink-400" />
                    <span>Sounds</span>
                  </h3>
                  <button
                    onClick={() => {
                      const title = prompt('সাউন্ডের নাম লিখুন:');
                      if (title) {
                        setAdminSounds([{ id: `as-${Date.now()}`, title, category: 'Gaming', isPublished: true }, ...adminSounds]);
                      }
                    }}
                    className="px-2.5 py-1 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Sound</span>
                  </button>
                </div>

                <div className="space-y-2 pt-1">
                  {adminSounds.map((snd, idx) => (
                    <div key={`admin-snd-${snd.id}-${idx}`} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold text-white">{snd.title}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{snd.category}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${snd.isPublished ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                          {snd.isPublished ? 'Published' : 'Hidden'}
                        </span>
                        <button
                          onClick={() => {
                            setAdminSounds(adminSounds.map(s => s.id === snd.id ? { ...s, isPublished: !s.isPublished } : s));
                          }}
                          className="px-2 py-1 rounded-lg bg-slate-800 text-[10px] text-slate-300 hover:text-white"
                        >
                          Toggle
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 16. Maintenance Mode */}
            {currentScreen === 'maintenance' && (
              <motion.div
                key="admin-maintenance"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Wrench className="w-4 h-4 text-blue-400" />
                    <span>Maintenance Mode</span>
                  </h3>
                  <button
                    onClick={() => setCurrentScreen('dashboard')}
                    className="text-[11px] text-purple-400 font-mono hover:underline"
                  >
                    ← Back
                  </button>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-white">Enable Maintenance</div>
                    <div className="text-[10px] text-slate-400">অ্যাপ ইউজারদের মেইনটেন্যান্স স্ক্রিন দেখাবে</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={maintenanceEnabled}
                    onChange={(e) => setMaintenanceEnabled(e.target.checked)}
                    className="w-5 h-5 accent-purple-500 rounded"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 uppercase font-mono">Message</label>
                  <textarea
                    rows={3}
                    value={maintenanceMessage}
                    onChange={(e) => setMaintenanceMessage(e.target.value)}
                    className="w-full mt-1 p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:border-purple-400 outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-mono">Start Time</label>
                    <input
                      type="text"
                      defaultValue="2026-10-17 10:00"
                      className="w-full mt-1 p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase font-mono">End Time</label>
                    <input
                      type="text"
                      defaultValue="2026-10-17 12:30"
                      className="w-full mt-1 p-2 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-white font-mono"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSavedMaintenanceFeedback(true);
                    setTimeout(() => setSavedMaintenanceFeedback(false), 2000);
                  }}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/20 active:scale-95 transition-all"
                >
                  {savedMaintenanceFeedback ? 'Saved Successfully ✓' : 'Save Configuration'}
                </button>
              </motion.div>
            )}

            {/* 17. APK Build Center (screen 17) */}
            {currentScreen === 'build' && (
              <motion.div
                key="admin-build"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-400" />
                    <span>Build & Release</span>
                  </h3>
                  <button
                    onClick={() => setCurrentScreen('dashboard')}
                    className="text-[11px] text-purple-400 font-mono hover:underline"
                  >
                    ← Back
                  </button>
                </div>

                {/* Target Switcher */}
                <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
                  <button
                    onClick={() => setActiveBuildTarget('USER')}
                    className={`py-1.5 rounded-lg transition-all ${
                      activeBuildTarget === 'USER' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400'
                    }`}
                  >
                    User App
                  </button>
                  <button
                    onClick={() => setActiveBuildTarget('ADMIN')}
                    className={`py-1.5 rounded-lg transition-all ${
                      activeBuildTarget === 'ADMIN' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400'
                    }`}
                  >
                    Admin App
                  </button>
                </div>

                {/* Build Progress Box matching screen 17 */}
                <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      {isBuilding ? 'Build In Progress...' : 'Ready to Build'}
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-400">{buildPercent}%</span>
                  </div>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full"
                      animate={{ width: `${buildPercent}%` }}
                    />
                  </div>

                  {/* Checklist */}
                  <div className="space-y-1.5 text-xs text-slate-300 font-mono pt-1">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Check className="w-3.5 h-3.5" />
                      <span>Installing dependencies...</span>
                    </div>
                    <div className="flex items-center gap-2 text-cyan-300">
                      <Check className="w-3.5 h-3.5" />
                      <span>Building APK bytecode...</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-600 inline-block" />
                      <span>Signing with Release Keystore...</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={triggerMockBuild}
                      className="flex-1 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs active:scale-95 transition-all"
                    >
                      Trigger New Build
                    </button>
                    <button
                      onClick={() => setShowLogsDrawer(!showLogsDrawer)}
                      className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold font-mono"
                    >
                      {showLogsDrawer ? 'Hide Logs' : 'View Logs'}
                    </button>
                  </div>
                </div>

                {/* Live Build Logs Console */}
                {showLogsDrawer && (
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[10px] text-slate-400 space-y-1">
                    <div>[CI] Starting Android build daemon...</div>
                    <div className="text-cyan-400">[CI] aapt packaging AndroidManifest.xml & resources</div>
                    <div className="text-purple-400">[CI] javac compiled classes to Java 8 bytecode</div>
                    <div className="text-emerald-400">[CI] dx compiled classes.dex (35.1 KB)</div>
                    <div className="text-amber-400">[CI] apksigner signed with v1, v2, v3 schemes</div>
                  </div>
                )}
              </motion.div>
            )}

            {/* 18. Release Center (screen 18) */}
            {currentScreen === 'releases' && (
              <motion.div
                key="admin-releases"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Download className="w-4 h-4 text-emerald-400" />
                    <span>Releases</span>
                  </h3>
                  <button
                    onClick={() => setCurrentScreen('dashboard')}
                    className="text-[11px] text-purple-400 font-mono hover:underline"
                  >
                    ← Back
                  </button>
                </div>

                <div className="grid grid-cols-2 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs font-semibold">
                  <button
                    onClick={() => setActiveReleaseTarget('USER')}
                    className={`py-1.5 rounded-lg transition-all ${
                      activeReleaseTarget === 'USER' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-400'
                    }`}
                  >
                    User
                  </button>
                  <button
                    onClick={() => setActiveReleaseTarget('ADMIN')}
                    className={`py-1.5 rounded-lg transition-all ${
                      activeReleaseTarget === 'ADMIN' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400'
                    }`}
                  >
                    Admin
                  </button>
                </div>

                {/* Published v1.2.0 */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-cyan-950/40 border border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold text-white">v1.2.0</div>
                      <div className="text-[10px] text-slate-400 font-mono">Published · 2.5 MB</div>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                      Published
                    </span>
                  </div>

                  <button
                    onClick={() => downloadApkDirect(activeReleaseTarget, '1.2.0')}
                    className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-400/20 active:scale-95 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download APK</span>
                  </button>
                </div>

                {/* Previous v1.1.0 */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white">v1.1.0</div>
                    <div className="text-[10px] text-slate-400 font-mono">&gt; 2.3 MB</div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">Previous</span>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Create License Modal */}
        {showCreateLicense && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 p-4 flex flex-col justify-end">
            <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">Create New License</h3>
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-mono">License Type</label>
                <select
                  value={newLicenseType}
                  onChange={(e) => setNewLicenseType(e.target.value)}
                  className="w-full mt-1 p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                >
                  <option value="Lifetime">Lifetime (No Expiry)</option>
                  <option value="Pro Plan">Pro Plan (30 Days)</option>
                  <option value="Custom">Custom Plan</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setShowCreateLicense(false)}
                  className="py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateLicenseSubmit}
                  className="py-2.5 rounded-xl bg-purple-600 text-white font-bold text-xs"
                >
                  Generate Key
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Android Gesture Bar */}
        <div className="py-2 flex justify-center bg-slate-950 z-50">
          <div className="w-28 h-1 bg-slate-700 rounded-full" />
        </div>
      </div>
    </div>
  );
};
