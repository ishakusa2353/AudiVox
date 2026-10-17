import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { UserManagementView } from './components/UserManagementView';
import { LicenseManagementView } from './components/LicenseManagementView';
import { DeviceManagementView } from './components/DeviceManagementView';
import { SoundLibraryView } from './components/SoundLibraryView';
import { BuildReleaseCenterView } from './components/BuildReleaseCenterView';
import { MaintenanceView } from './components/MaintenanceView';
import { AuditLogsView } from './components/AuditLogsView';
import { SchemaView } from './components/SchemaView';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { UserAppSimulator, UserAppScreen } from './components/UserAppSimulator';
import { AdminAppSimulator, AdminAppScreen } from './components/AdminAppSimulator';
import { ShowcaseGalleryView } from './components/ShowcaseGalleryView';
import { supabaseService } from './services/supabaseService';
import {
  UserProfile,
  License,
  DeviceRecord,
  SoundItem,
  AppRelease,
  AuditLog,
  BuildJob,
  MaintenanceConfig,
  AppTarget,
} from './types';

export default function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(supabaseService.isLiveConnected());
  const [userSimScreen, setUserSimScreen] = useState<UserAppScreen>('home');
  const [adminSimScreen, setAdminSimScreen] = useState<AdminAppScreen>('dashboard');

  // App data state
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [licenses, setLicenses] = useState<License[]>([]);
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [sounds, setSounds] = useState<SoundItem[]>([]);
  const [releases, setReleases] = useState<AppRelease[]>([]);
  const [buildJobs, setBuildJobs] = useState<BuildJob[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceConfig>({
    is_enabled: false,
    message: '',
    updated_at: '',
  });
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const loadAllData = async () => {
    const [u, l, d, s, r, b, m, a] = await Promise.all([
      supabaseService.getUsers(),
      supabaseService.getLicenses(),
      supabaseService.getDevices(),
      supabaseService.getSounds(),
      supabaseService.getReleases(),
      supabaseService.getBuildJobs(),
      supabaseService.getMaintenanceConfig(),
      supabaseService.getAuditLogs(),
    ]);

    setUsers(u);
    setLicenses(l);
    setDevices(d);
    setSounds(s);
    setReleases(r);
    setBuildJobs(b);
    setMaintenance(m);
    setAuditLogs(a);
  };

  useEffect(() => {
    loadAllData();
  }, [isLiveConnected]);

  // Handlers
  const handleToggleUserSuspension = async (userId: string, reason?: string) => {
    const res = await supabaseService.toggleUserSuspension(userId, reason);
    if (res) await loadAllData();
    return res;
  };

  const handleCreateLicense = async (lic: Omit<License, 'id' | 'created_at'>) => {
    const created = await supabaseService.createLicense(lic);
    await loadAllData();
    return created;
  };

  const handleToggleLicenseStatus = async (
    licenseId: string,
    action: 'suspend' | 'revoke' | 'activate'
  ) => {
    const res = await supabaseService.toggleLicenseStatus(licenseId, action);
    if (res) await loadAllData();
    return res;
  };

  const handleRevokeDevice = async (deviceId: string) => {
    const res = await supabaseService.revokeDevice(deviceId);
    if (res) await loadAllData();
    return res;
  };

  const handleCreateSound = async (sound: Omit<SoundItem, 'id' | 'created_at' | 'play_count'>) => {
    const created = await supabaseService.createSound(sound);
    await loadAllData();
    return created;
  };

  const handleToggleSoundPublish = async (soundId: string) => {
    const res = await supabaseService.toggleSoundPublish(soundId);
    if (res) await loadAllData();
    return res;
  };

  const handleDeleteSound = async (soundId: string) => {
    const res = await supabaseService.deleteSound(soundId);
    if (res) await loadAllData();
    return res;
  };

  const handleTriggerBuild = async (target: AppTarget, vName: string, vCode: number) => {
    const job = await supabaseService.triggerBuild(target, vName, vCode);
    await loadAllData();
    return job;
  };

  const handlePublishRelease = async (rel: Omit<AppRelease, 'id' | 'created_at'>) => {
    const created = await supabaseService.publishRelease(rel);
    await loadAllData();
    return created;
  };

  const handleUpdateReleasePolicy = async (
    relId: string,
    isMandatory: boolean,
    minCode: number
  ) => {
    const res = await supabaseService.updateReleasePolicy(relId, isMandatory, minCode);
    if (res) await loadAllData();
    return res;
  };

  const handleUpdateMaintenance = async (enabled: boolean, message: string) => {
    const res = await supabaseService.updateMaintenance(enabled, message);
    if (res) await loadAllData();
    return res;
  };

  const handleLaunchScreen = (type: 'USER' | 'ADMIN' | 'WEBSITE', screenKey?: string) => {
    if (type === 'USER') {
      if (screenKey) setUserSimScreen(screenKey as any);
      setActiveSection('user_app_sim');
    } else if (type === 'ADMIN') {
      if (screenKey) setAdminSimScreen(screenKey as any);
      setActiveSection('admin_app_sim');
    } else {
      if (screenKey) setActiveSection(screenKey);
      else setActiveSection('dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/20 selection:text-cyan-300">
      {/* Top Navbar adhering to Top Bar Contract */}
      <Navbar
        isLiveConnected={isLiveConnected}
        onOpenConfig={() => setIsConfigOpen(true)}
        activeSection={activeSection}
        onSelectSection={setActiveSection}
      />

      {/* Main Content Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar activeSection={activeSection} onSelectSection={setActiveSection} />

        {/* Viewport Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {activeSection === 'showcase' && (
            <ShowcaseGalleryView onSelectScreenForSimulator={handleLaunchScreen} />
          )}

          {activeSection === 'user_app_sim' && (
            <UserAppSimulator
              initialScreen={userSimScreen}
              onNavigateExternal={setActiveSection}
            />
          )}

          {activeSection === 'admin_app_sim' && (
            <AdminAppSimulator
              initialScreen={adminSimScreen}
              onNavigateExternal={setActiveSection}
            />
          )}

          {activeSection === 'dashboard' && (
            <DashboardView
              users={users}
              licenses={licenses}
              devices={devices}
              releases={releases}
              auditLogs={auditLogs}
              onNavigate={setActiveSection}
            />
          )}

          {activeSection === 'users' && (
            <UserManagementView
              users={users}
              onToggleSuspension={handleToggleUserSuspension}
            />
          )}

          {activeSection === 'licenses' && (
            <LicenseManagementView
              licenses={licenses}
              onCreateLicense={handleCreateLicense}
              onToggleStatus={handleToggleLicenseStatus}
            />
          )}

          {activeSection === 'devices' && (
            <DeviceManagementView
              devices={devices}
              onRevokeDevice={handleRevokeDevice}
            />
          )}

          {activeSection === 'sounds' && (
            <SoundLibraryView
              sounds={sounds}
              onCreateSound={handleCreateSound}
              onTogglePublish={handleToggleSoundPublish}
              onDeleteSound={handleDeleteSound}
            />
          )}

          {activeSection === 'releases' && (
            <BuildReleaseCenterView
              releases={releases}
              buildJobs={buildJobs}
              onTriggerBuild={handleTriggerBuild}
              onPublishRelease={handlePublishRelease}
              onUpdatePolicy={handleUpdateReleasePolicy}
            />
          )}

          {activeSection === 'maintenance' && (
            <MaintenanceView
              config={maintenance}
              onUpdateMaintenance={handleUpdateMaintenance}
            />
          )}

          {activeSection === 'audit' && <AuditLogsView logs={auditLogs} />}

          {activeSection === 'schema' && <SchemaView />}
        </main>
      </div>

      {/* Supabase Configuration Modal */}
      <SupabaseConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onConnectionChange={(conn) => setIsLiveConnected(conn)}
      />

      {/* Mobile Phone Bottom Navigation Bar (Glassmorphic, Android style) */}
      <nav className="lg:hidden sticky bottom-0 z-40 bg-slate-950/85 backdrop-blur-xl border-t border-slate-800/80 px-2 py-2 flex items-center justify-around shadow-2xl">
        <button
          onClick={() => setActiveSection('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            activeSection === 'dashboard' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <span className="text-base">📊</span>
          <span>ওয়েবসাইট</span>
        </button>
        <button
          onClick={() => setActiveSection('user_app_sim')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            activeSection === 'user_app_sim' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <span className="text-base">📱</span>
          <span>User App</span>
        </button>
        <button
          onClick={() => setActiveSection('admin_app_sim')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            activeSection === 'admin_app_sim' ? 'text-purple-400 font-bold' : 'text-slate-400'
          }`}
        >
          <span className="text-base">🛡️</span>
          <span>Admin App</span>
        </button>
        <button
          onClick={() => setActiveSection('dashboard')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            activeSection === 'dashboard' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <span className="text-base">📊</span>
          <span>ওয়েবসাইট</span>
        </button>
        <button
          onClick={() => setActiveSection('licenses')}
          className={`flex flex-col items-center gap-1 py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
            activeSection === 'licenses' ? 'text-cyan-400 font-bold' : 'text-slate-400'
          }`}
        >
          <span className="text-base">🔑</span>
          <span>লাইসেন্স</span>
        </button>
      </nav>
    </div>
  );
}
