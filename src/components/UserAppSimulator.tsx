import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  Music,
  Heart,
  Sliders,
  Settings,
  Play,
  Square,
  Search,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Eye,
  EyeOff,
  Flame,
  Sparkles,
  Smartphone,
  Shield,
  Key,
  User,
  ArrowRight,
  LogOut,
  RefreshCw,
  Plus,
  AlertTriangle,
  WifiOff,
  Download,
  CheckCircle2,
  X,
  ChevronRight,
  Radio,
  FileAudio,
} from 'lucide-react';
import { playSynthesizedGameSound } from '../utils/audioExtractor';

export type UserAppScreen =
  | 'splash'
  | 'welcome'
  | 'register'
  | 'login'
  | 'activation'
  | 'home'
  | 'sounds'
  | 'favorites'
  | 'mixer'
  | 'settings'
  | 'profile'
  | 'add_custom'
  | 'floating_bubble'
  | 'update_notice'
  | 'download_install'
  | 'after_update'
  | 'maintenance_screen'
  | 'offline_screen';

interface UserAppSimulatorProps {
  initialScreen?: UserAppScreen;
  onNavigateExternal?: (view: string) => void;
}

export const UserAppSimulator: React.FC<UserAppSimulatorProps> = ({
  initialScreen = 'home',
  onNavigateExternal,
}) => {
  const [currentScreen, setCurrentScreen] = useState<UserAppScreen>(initialScreen);
  const [activeTab, setActiveTab] = useState<'home' | 'sounds' | 'favorites' | 'mixer' | 'settings'>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<UserAppScreen | null>(null);

  // User state
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [hasLicense, setHasLicense] = useState(true);
  const [licenseKeyInput, setLicenseKeyInput] = useState('AVX-VIP-8821-X490');
  const [licenseError, setLicenseError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [showLicenseKey, setShowLicenseKey] = useState(false);

  // Mixer state
  const [masterVolume, setMasterVolume] = useState(85);
  const [musicVolume, setMusicVolume] = useState(65);
  const [effectsVolume, setEffectsVolume] = useState(90);

  // Floating bubble simulation state
  const [bubbleOpen, setBubbleOpen] = useState(false);
  const [bubblePosition, setBubblePosition] = useState({ x: 260, y: 160 });

  // Download simulation progress
  const [downloadProgress, setDownloadProgress] = useState(65);
  const [isInstalling, setIsInstalling] = useState(false);

  const synthStopRef = useRef<(() => void) | null>(null);

  // Sound Library mock dataset matching official poster
  const [sounds, setSounds] = useState([
    {
      id: 's-booyah',
      title: 'Booyah! Win Shout',
      category: 'Gaming',
      size: '2.4 MB',
      duration: '1.2s',
      isFavorite: true,
      soundType: 'victory',
      featured: true,
    },
    {
      id: 's-headshot',
      title: 'Headshot Strike',
      category: 'Gaming',
      size: '1.8 MB',
      duration: '0.8s',
      isFavorite: true,
      soundType: 'headshot',
      featured: true,
    },
    {
      id: 's-victory',
      title: 'Victory Horn Fanfare',
      category: 'Gaming',
      size: '3.1 MB',
      duration: '3.4s',
      isFavorite: true,
      soundType: 'victory',
      featured: true,
    },
    {
      id: 's-anime',
      title: 'Anime Power Surge',
      category: 'Anime',
      size: '3.2 MB',
      duration: '2.5s',
      isFavorite: false,
      soundType: 'power',
      featured: false,
    },
    {
      id: 's-sad',
      title: 'Sad Wah-Wah Trombone',
      category: 'Meme',
      size: '2.1 MB',
      duration: '2.8s',
      isFavorite: false,
      soundType: 'sad',
      featured: false,
    },
    {
      id: 's-rush',
      title: 'Squad Rush Callout',
      category: 'Voice',
      size: '2.7 MB',
      duration: '1.5s',
      isFavorite: true,
      soundType: 'rush',
      featured: false,
    },
  ]);

  const categories = ['All', 'Gaming', 'Meme', 'Voice', 'Anime', 'Effects'];

  const handlePlaySound = (sound: typeof sounds[0]) => {
    if (synthStopRef.current) {
      synthStopRef.current();
      synthStopRef.current = null;
    }

    if (playingSoundId === sound.id) {
      setPlayingSoundId(null);
      return;
    }

    setPlayingSoundId(sound.id);
    synthStopRef.current = playSynthesizedGameSound(sound.soundType, () => {
      setPlayingSoundId(null);
      synthStopRef.current = null;
    });
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSounds((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isFavorite: !s.isFavorite } : s))
    );
  };

  const copyProfileId = () => {
    navigator.clipboard.writeText('84573219');
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Sync initial screen if changed externally
  useEffect(() => {
    if (initialScreen) {
      if (
        [
          'profile',
          'add_custom',
          'floating_bubble',
          'update_notice',
          'download_install',
          'after_update',
          'maintenance_screen',
          'offline_screen',
        ].includes(initialScreen)
      ) {
        setActiveModal(initialScreen);
      } else {
        setCurrentScreen(initialScreen);
        if (['home', 'sounds', 'favorites', 'mixer', 'settings'].includes(initialScreen)) {
          setActiveTab(initialScreen as any);
        }
      }
    }
  }, [initialScreen]);

  const userScreensList: { id: UserAppScreen; label: string; badge: string }[] = [
    { id: 'splash', label: '01. Splash Screen (অ্যানিমেশন ও ব্র্যান্ডিং)', badge: 'Screen 01' },
    { id: 'welcome', label: '02. Welcome / Intro (গেমিং হেডফোন)', badge: 'Screen 02' },
    { id: 'register', label: '03. Registration (ইউজার রেজিস্টার)', badge: 'Screen 03' },
    { id: 'login', label: '04. Login (ফোন ও পাসওয়ার্ড লগইন)', badge: 'Screen 04' },
    { id: 'activation', label: '05. License Activation (লাইসেন্স কি)', badge: 'Screen 05' },
    { id: 'home', label: '06. Home Dashboard (ফিচার্ড সাউন্ডস)', badge: 'Screen 06' },
    { id: 'sounds', label: '07. Sound Library (সার্চ ও ফিল্টার)', badge: 'Screen 07' },
    { id: 'favorites', label: '08. Favorites (পছন্দের সাউন্ডবোর্ড)', badge: 'Screen 08' },
    { id: 'mixer', label: '09. Audio Mixer (ভলিউম কন্ট্রোলার)', badge: 'Screen 09' },
    { id: 'settings', label: '10. Settings & Preferences', badge: 'Screen 10' },
    { id: 'profile', label: '19. Profile Modal (৮-ডিজিট আইডি)', badge: 'Screen 19' },
    { id: 'add_custom', label: '20. Add Custom Sound (কাস্টম অডিও)', badge: 'Screen 20' },
    { id: 'floating_bubble', label: '21. Floating Sound Bubble (ওভারলে)', badge: 'Screen 21' },
    { id: 'update_notice', label: '22. Mandatory Update Notice', badge: 'Screen 22' },
    { id: 'download_install', label: '23. Download & Install Bar', badge: 'Screen 23' },
    { id: 'after_update', label: '24. After Update Success', badge: 'Screen 24' },
    { id: 'maintenance_screen', label: '25. System Maintenance', badge: 'Screen 25' },
    { id: 'offline_screen', label: '26. Offline Screen', badge: 'Screen 26' },
  ];

  return (
    <div className="flex flex-col items-center justify-center p-2 sm:p-6 w-full max-w-2xl mx-auto select-none">
      {/* Top Controller Header for the User App */}
      <div className="w-full max-w-[420px] mb-4 bg-slate-900/90 border border-cyan-500/30 rounded-2xl p-3 backdrop-blur-xl shadow-lg flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              AudiVox User App
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
              Live Phone
            </span>
          </div>

          <a
            href="/downloads/audivox-user-v1.0.0.apk"
            download="audivox-user-v1.0.0.apk"
            className="px-2.5 py-1 rounded-lg bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-[11px] font-mono flex items-center gap-1 shadow-md shadow-cyan-400/20 transition-all active:scale-95"
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
              const val = e.target.value as UserAppScreen;
              if (['profile', 'add_custom', 'floating_bubble', 'update_notice', 'download_install', 'after_update', 'maintenance_screen', 'offline_screen'].includes(val)) {
                setActiveModal(val);
              } else {
                setActiveModal(null);
                setCurrentScreen(val);
                if (['home', 'sounds', 'favorites', 'mixer', 'settings'].includes(val)) {
                  setActiveTab(val as any);
                }
              }
            }}
            className="flex-1 bg-slate-950 border border-slate-700/80 text-cyan-300 text-xs rounded-xl px-2.5 py-1.5 font-mono focus:outline-none focus:border-cyan-400 cursor-pointer"
          >
            {userScreensList.map((s) => (
              <option key={s.id} value={s.id} className="bg-slate-950 text-slate-200">
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Phone Case Frame */}
      <div className="w-[360px] sm:w-[380px] h-[780px] bg-slate-950 rounded-[44px] border-[5px] border-slate-800 shadow-[0_0_60px_rgba(6,182,212,0.25)] relative overflow-hidden flex flex-col ring-1 ring-cyan-500/20">
        
        {/* Phone Speaker & Dynamic Camera Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-6 bg-slate-900 rounded-b-2xl z-50 flex items-center justify-center gap-3 border-b border-slate-800">
          <div className="w-10 h-1 bg-slate-700 rounded-full" />
          <div className="w-3 h-3 bg-slate-950 rounded-full ring-1 ring-cyan-500/30 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-cyan-500/40 rounded-full" />
          </div>
        </div>

        {/* Android Top Status Bar */}
        <div className="pt-7 px-6 pb-2 flex items-center justify-between text-[11px] font-mono text-slate-400 z-40 bg-slate-950/70 backdrop-blur-md shrink-0">
          <span className="font-semibold text-slate-200">09:41</span>
          <div className="flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span className="text-[10px] text-cyan-300 font-bold">5G</span>
            <div className="w-5 h-2.5 border border-slate-500 rounded-sm p-0.5 flex items-center">
              <div className="w-full h-full bg-cyan-400 rounded-xs" />
            </div>
          </div>
        </div>

        {/* Screen Content Viewport with Framer Motion transitions */}
        <div className="flex-1 overflow-y-auto relative bg-[#060a14] text-slate-100 flex flex-col scrollbar-none">
          <AnimatePresence mode="wait">
            
            {/* 1. Splash Screen */}
            {currentScreen === 'splash' && (
              <motion.div
                key="splash"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.4 }}
                className="flex-1 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 to-purple-600 rounded-3xl blur-2xl opacity-60 animate-pulse" />
                  <img
                    src="https://i.ibb.co/TMG8b3Pb/file-425.jpg"
                    alt="AudiVox"
                    className="w-28 h-28 rounded-3xl object-cover relative z-10 border-2 border-cyan-400/50 shadow-2xl"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 bg-clip-text text-transparent">
                  AudiVox
                </h1>
                <p className="text-sm font-medium text-slate-400 mt-2 font-mono">
                  Your Sound. Your Game.
                </p>

                {/* Animated sound bars */}
                <div className="flex items-center gap-1.5 mt-8 h-8">
                  {[0.4, 0.9, 0.6, 1.0, 0.7, 0.3, 0.8].map((val, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: ['20%', '100%', '30%'] }}
                      transition={{ duration: 0.8 + i * 0.15, repeat: Infinity, ease: 'easeInOut' }}
                      className="w-1.5 bg-gradient-to-t from-cyan-500 to-purple-500 rounded-full"
                    />
                  ))}
                </div>

                <button
                  onClick={() => setCurrentScreen('welcome')}
                  className="mt-12 w-full py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-purple-600 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
                >
                  শুরু করুন (Get Started)
                </button>
              </motion.div>
            )}

            {/* 2. Welcome / Intro */}
            {currentScreen === 'welcome' && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 flex flex-col p-6 justify-between"
              >
                <div className="pt-6 text-center">
                  <div className="w-20 h-20 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 shadow-lg shadow-cyan-500/10">
                    <Music className="w-10 h-10 text-cyan-400 animate-bounce" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Welcome to AudiVox</h2>
                  <p className="text-xs text-slate-400 mt-1">Your Sound. Your Game.</p>
                </div>

                {/* Gaming Graphic Visual */}
                <div className="my-auto py-8 text-center relative">
                  <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-tr from-cyan-500/20 via-purple-500/10 to-transparent flex items-center justify-center border border-cyan-500/20">
                    <Radio className="w-24 h-24 text-cyan-400/80 animate-pulse" />
                  </div>
                  <div className="mt-4 text-xs font-mono text-cyan-300">
                    গেমিং রিয়্যাকশন সাউন্ডবোর্ড ও ফ্লোটিং বাবল
                  </div>
                </div>

                <div className="space-y-3 pb-4">
                  <button
                    onClick={() => setCurrentScreen('login')}
                    className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-400/25 active:scale-95 transition-all"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setCurrentScreen('register')}
                    className="w-full py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-semibold text-sm active:scale-95 transition-all"
                  >
                    Register
                  </button>
                </div>
              </motion.div>
            )}

            {/* 3. Register */}
            {currentScreen === 'register' && (
              <motion.div
                key="register"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 p-6 flex flex-col justify-between"
              >
                <div>
                  <h2 className="text-xl font-bold text-white">Create Account</h2>
                  <p className="text-xs text-slate-400 mt-0.5">নতুন অ্যাকাউন্ট তৈরি করুন</p>

                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="text-[11px] text-slate-400 uppercase font-mono">Full Name</label>
                      <input
                        type="text"
                        defaultValue="Rakib Hasan"
                        className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm focus:border-cyan-400 outline-hidden"
                        placeholder="আপনার নাম"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 uppercase font-mono">Phone Number</label>
                      <input
                        type="tel"
                        defaultValue="01737 123456"
                        className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm focus:border-cyan-400 outline-hidden font-mono"
                        placeholder="017XXXXXXXX"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 uppercase font-mono">Password</label>
                      <input
                        type="password"
                        defaultValue="••••••••"
                        className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm focus:border-cyan-400 outline-hidden"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-400 uppercase font-mono">Confirm Password</label>
                      <input
                        type="password"
                        defaultValue="••••••••"
                        className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm focus:border-cyan-400 outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 space-y-3">
                  <button
                    onClick={() => setCurrentScreen('activation')}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-400/20 active:scale-95 transition-all"
                  >
                    Register
                  </button>
                  <p className="text-center text-xs text-slate-400">
                    Already have an account?{' '}
                    <button
                      onClick={() => setCurrentScreen('login')}
                      className="text-cyan-400 font-semibold hover:underline"
                    >
                      Login
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {/* 4. Login */}
            {currentScreen === 'login' && (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 p-6 flex flex-col justify-between"
              >
                <div>
                  <div className="text-center pt-4 mb-6">
                    <img
                      src="https://i.ibb.co/TMG8b3Pb/file-425.jpg"
                      alt="AudiVox"
                      className="w-14 h-14 mx-auto rounded-2xl object-cover ring-2 ring-cyan-500/40 mb-3"
                    />
                    <h2 className="text-xl font-bold text-white">Welcome Back!</h2>
                    <p className="text-xs text-slate-400 mt-0.5">Login to your account</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[11px] text-slate-400 uppercase font-mono">Phone Number</label>
                      <input
                        type="tel"
                        defaultValue="01737 123456"
                        className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm focus:border-cyan-400 outline-hidden font-mono"
                      />
                    </div>
                    <div>
                      <div className="flex justify-between items-center">
                        <label className="text-[11px] text-slate-400 uppercase font-mono">Password</label>
                        <button className="text-[11px] text-cyan-400 hover:underline">Forgot Password?</button>
                      </div>
                      <input
                        type="password"
                        defaultValue="••••••••"
                        className="w-full mt-1 px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-sm focus:border-cyan-400 outline-hidden"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 space-y-3">
                  <button
                    onClick={() => {
                      if (!hasLicense) {
                        setCurrentScreen('activation');
                      } else {
                        setCurrentScreen('home');
                        setActiveTab('home');
                      }
                    }}
                    className="w-full py-3 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-400/25 active:scale-95 transition-all"
                  >
                    Login
                  </button>
                  <p className="text-center text-xs text-slate-400">
                    Don't have an account?{' '}
                    <button
                      onClick={() => setCurrentScreen('register')}
                      className="text-cyan-400 font-semibold hover:underline"
                    >
                      Create Account
                    </button>
                  </p>
                </div>
              </motion.div>
            )}

            {/* 5. License Activation */}
            {currentScreen === 'activation' && (
              <motion.div
                key="activation"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex-1 p-6 flex flex-col justify-between text-center"
              >
                <div>
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-4 mt-6">
                    <Key className="w-8 h-8 text-cyan-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">Activate License</h2>
                  <p className="text-xs text-slate-400 mt-1">Enter your license key to continue</p>

                  <div className="mt-8 text-left">
                    <label className="text-[11px] text-slate-400 uppercase font-mono">Enter License Key</label>
                    <input
                      type="text"
                      value={licenseKeyInput}
                      onChange={(e) => setLicenseKeyInput(e.target.value)}
                      placeholder="AV-XXXXXXXXXX"
                      className="w-full mt-1.5 px-4 py-3 rounded-xl bg-slate-900 border border-cyan-500/40 text-center font-mono text-cyan-300 font-bold tracking-wider text-sm outline-hidden focus:ring-2 focus:ring-cyan-500/30"
                    />
                    {licenseError && (
                      <p className="text-xs text-rose-400 mt-1.5 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>{licenseError}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pb-4">
                  <button
                    onClick={() => {
                      if (!licenseKeyInput.trim()) {
                        setLicenseError('দয়া করে সঠিক লাইসেন্স কি প্রদান করুন');
                        return;
                      }
                      setHasLicense(true);
                      setCurrentScreen('home');
                      setActiveTab('home');
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-400/25 active:scale-95 transition-all"
                  >
                    Activate
                  </button>
                  <button className="text-xs text-slate-500 hover:text-slate-300">Need help?</button>
                </div>
              </motion.div>
            )}

            {/* 6. Home Screen */}
            {currentScreen === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 space-y-4"
              >
                {/* User Header Profile Card */}
                <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-cyan-950/30 border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      onClick={() => setActiveModal('profile')}
                      className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-purple-600 p-0.5 cursor-pointer"
                    >
                      <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-cyan-400 font-bold text-sm">
                        R
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>Hi, Rakib!</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                        <span>ID: 84573219</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                      Active
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                      Premium
                    </span>
                  </div>
                </div>

                {/* Featured Sounds Slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Featured Sounds</span>
                    </h3>
                  </div>

                  <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                    {sounds.filter((s) => s.featured).map((sound, idx) => {
                      const isPlaying = playingSoundId === sound.id;
                      return (
                        <div
                          key={`featured-${sound.id}-${idx}`}
                          onClick={() => handlePlaySound(sound)}
                          className={`w-28 p-3 rounded-2xl border shrink-0 cursor-pointer transition-all ${
                            isPlaying
                              ? 'bg-gradient-to-b from-cyan-500/30 to-purple-500/20 border-cyan-400 shadow-lg shadow-cyan-500/20'
                              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2 mx-auto">
                            {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                          </div>
                          <div className="text-center">
                            <div className="text-xs font-bold text-white truncate">{sound.title}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">{sound.duration}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Categories Row */}
                <div>
                  <div className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-2">
                    Categories
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { name: 'Gaming', icon: Radio },
                      { name: 'Meme', icon: Sparkles },
                      { name: 'Effects', icon: Sliders },
                      { name: 'Voice', icon: Music },
                    ].map((cat) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={cat.name}
                          onClick={() => {
                            setSelectedCategory(cat.name);
                            setCurrentScreen('sounds');
                            setActiveTab('sounds');
                          }}
                          className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 flex flex-col items-center gap-1 text-center transition-all"
                        >
                          <Icon className="w-4 h-4 text-cyan-400" />
                          <span className="text-[10px] text-slate-300 font-medium">{cat.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Recently Played */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                      Recently Played
                    </span>
                    <button
                      onClick={() => {
                        setCurrentScreen('sounds');
                        setActiveTab('sounds');
                      }}
                      className="text-[11px] text-cyan-400 hover:underline font-mono"
                    >
                      See All
                    </button>
                  </div>

                  <div className="space-y-2">
                    {sounds.slice(0, 3).map((sound, idx) => {
                      const isPlaying = playingSoundId === sound.id;
                      return (
                        <div
                          key={`top-${sound.id}-${idx}`}
                          onClick={() => handlePlaySound(sound)}
                          className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isPlaying
                              ? 'bg-cyan-950/40 border-cyan-400/50'
                              : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                              {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white">{sound.title}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{sound.category} · {sound.duration}</div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => toggleFavorite(sound.id, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            <Heart className={`w-3.5 h-3.5 ${sound.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Floating Bubble Quick Launcher Bar */}
                <div
                  onClick={() => setActiveModal('floating_bubble')}
                  className="p-3 rounded-xl bg-gradient-to-r from-purple-900/40 via-slate-900 to-cyan-950/40 border border-cyan-500/30 flex items-center justify-between cursor-pointer hover:border-cyan-400 transition-all shadow-md"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-cyan-400/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Floating Sound Bubble</div>
                      <div className="text-[10px] text-slate-400">স্ক্রিনের উপর ফ্লোটিং বাবল টেস্ট করুন</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-cyan-400" />
                </div>
              </motion.div>
            )}

            {/* 7. Sounds Library Screen */}
            {currentScreen === 'sounds' && (
              <motion.div
                key="sounds"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 space-y-3"
              >
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search sounds..."
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-white placeholder-slate-500 focus:border-cyan-400 outline-hidden"
                  />
                </div>

                {/* Category Pills */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                        selectedCategory === cat
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                          : 'bg-slate-900/60 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Sounds List */}
                <div className="space-y-2 pt-1">
                    {sounds
                    .filter(
                      (s) =>
                        (selectedCategory === 'All' || s.category === selectedCategory) &&
                        s.title.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((sound, idx) => {
                      const isPlaying = playingSoundId === sound.id;
                      return (
                        <div
                          key={`sound-lib-${sound.id}-${idx}`}
                          onClick={() => handlePlaySound(sound)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isPlaying
                              ? 'bg-gradient-to-r from-cyan-950/40 to-purple-950/30 border-cyan-400'
                              : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                              {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                            </div>
                            <div>
                              <div className="text-xs font-bold text-white">{sound.title}</div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {sound.category} · {sound.size} · {sound.duration}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={(e) => toggleFavorite(sound.id, e)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors"
                          >
                            <Heart className={`w-4 h-4 ${sound.isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
                          </button>
                        </div>
                      );
                    })}
                </div>
              </motion.div>
            )}

            {/* 8. Favorites Screen */}
            {currentScreen === 'favorites' && (
              <motion.div
                key="favorites"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 space-y-3"
              >
                <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
                    <span>Favorites</span>
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">
                    {sounds.filter((s) => s.isFavorite).length} sounds
                  </span>
                </div>

                <div className="space-y-2">
                  {sounds.filter((s) => s.isFavorite).map((sound, idx) => {
                    const isPlaying = playingSoundId === sound.id;
                    return (
                      <div
                        key={`fav-${sound.id}-${idx}`}
                        onClick={() => handlePlaySound(sound)}
                        className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isPlaying
                            ? 'bg-rose-950/30 border-rose-400/50'
                            : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                            {isPlaying ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{sound.title}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{sound.category} · {sound.duration}</div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => toggleFavorite(sound.id, e)}
                          className="p-1 text-rose-500"
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* 9. Audio Mixer Screen */}
            {currentScreen === 'mixer' && (
              <motion.div
                key="mixer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-5 space-y-6"
              >
                <div className="text-center pb-2">
                  <h3 className="text-base font-bold text-white flex items-center justify-center gap-2">
                    <Sliders className="w-4 h-4 text-cyan-400" />
                    <span>Audio Mixer</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">গেম এবং সাউন্ডবোর্ড ভলিউম ব্যালেন্স</p>
                </div>

                {/* Sliders */}
                <div className="space-y-5">
                  {/* Master Volume */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-300">Master Volume</span>
                      <span className="text-cyan-400 font-mono">{masterVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={masterVolume}
                      onChange={(e) => setMasterVolume(Number(e.target.value))}
                      className="w-full accent-cyan-400"
                    />
                  </div>

                  {/* Music Volume */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-300">Music</span>
                      <span className="text-purple-400 font-mono">{musicVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={musicVolume}
                      onChange={(e) => setMusicVolume(Number(e.target.value))}
                      className="w-full accent-purple-400"
                    />
                  </div>

                  {/* Effects Volume */}
                  <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-300">Effects</span>
                      <span className="text-emerald-400 font-mono">{effectsVolume}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={effectsVolume}
                      onChange={(e) => setEffectsVolume(Number(e.target.value))}
                      className="w-full accent-emerald-400"
                    />
                  </div>
                </div>

                {/* Quick Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => handlePlaySound(sounds[0])}
                    className="py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Play Test</span>
                  </button>
                  <button
                    onClick={() => {
                      if (synthStopRef.current) {
                        synthStopRef.current();
                        synthStopRef.current = null;
                      }
                      setPlayingSoundId(null);
                    }}
                    className="py-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Pause</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (synthStopRef.current) {
                      synthStopRef.current();
                      synthStopRef.current = null;
                    }
                    setPlayingSoundId(null);
                  }}
                  className="w-full py-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold text-xs active:scale-95 transition-all"
                >
                  Stop All Sounds
                </button>
              </motion.div>
            )}

            {/* 10. Settings Screen */}
            {currentScreen === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-4 space-y-4"
              >
                <div className="pb-1 border-b border-slate-800">
                  <h3 className="text-sm font-bold text-white">Settings</h3>
                  <p className="text-[11px] text-slate-400">অ্যাপের সেটিংস ও প্রেফারেন্স</p>
                </div>

                <div className="space-y-1.5">
                  {[
                    { label: 'My Profile', sub: 'ID: 84573219', icon: User, action: () => setActiveModal('profile') },
                    { label: 'Floating Bubble', sub: 'ওভারলে চালু ও বন্ধ', icon: Sparkles, action: () => setActiveModal('floating_bubble') },
                    { label: 'Add Custom Sound', sub: 'ডিভাইস থেকে অডিও বা ভিডিও অ্যাড', icon: Plus, action: () => setActiveModal('add_custom') },
                    { label: 'Check Update', sub: 'v1.3.0 Available', icon: Download, action: () => setActiveModal('update_notice') },
                    { label: 'Maintenance Mode', sub: 'সিস্টেম স্ট্যাটাস', icon: AlertTriangle, action: () => setActiveModal('maintenance_screen') },
                    { label: 'Offline Mode Test', sub: 'নেটওয়ার্ক ফলব্যাক', icon: WifiOff, action: () => setActiveModal('offline_screen') },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.label}
                        onClick={item.action}
                        className="w-full p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-cyan-500/30 flex items-center justify-between text-left transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-cyan-400">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{item.label}</div>
                            <div className="text-[10px] text-slate-400">{item.sub}</div>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentScreen('welcome')}
                  className="w-full py-3 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center justify-center gap-2 transition-all mt-4"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* 5-Destination Native Mobile Bottom Navigation Bar */}
        {['home', 'sounds', 'favorites', 'mixer', 'settings'].includes(currentScreen) && (
          <div className="h-16 bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 px-2 flex items-center justify-around shrink-0 z-40">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'sounds', label: 'Sounds', icon: Music },
              { id: 'favorites', label: 'Favorites', icon: Heart },
              { id: 'mixer', label: 'Mixer', icon: Sliders },
              { id: 'settings', label: 'Settings', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    setCurrentScreen(tab.id as any);
                  }}
                  className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
                    isActive ? 'text-cyan-400 scale-105' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  <span className="text-[10px] font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Interactive Modals and Overlay Simulations (Screens 19 to 26) */}
        <AnimatePresence>
          {activeModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-50 p-4 flex flex-col justify-end"
            >
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="bg-slate-900 border border-slate-700/80 rounded-3xl p-5 shadow-2xl relative max-h-[90%] overflow-y-auto"
              >
                {/* Close Button */}
                <button
                  onClick={() => setActiveModal(null)}
                  className="absolute top-4 right-4 w-7 h-7 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* 19. Profile Modal */}
                {activeModal === 'profile' && (
                  <div className="space-y-4 pt-2">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-cyan-400 to-purple-600 p-0.5 mb-2">
                        <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-300 font-bold text-xl">
                          R
                        </div>
                      </div>
                      <h3 className="text-base font-bold text-white">Rakib Hasan</h3>
                      <p className="text-xs text-slate-400 font-mono">01737******</p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-500 font-mono">PROFILE ID</div>
                          <div className="text-xs font-mono font-bold text-cyan-300">84573219</div>
                        </div>
                        <button
                          onClick={copyProfileId}
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-mono flex items-center gap-1"
                        >
                          {copiedId ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-slate-500 font-mono">LICENSE KEY</div>
                          <div className="text-xs font-mono font-bold text-slate-200">
                            {showLicenseKey ? 'AV-LIFE-9942-Z771' : 'AV-••••••••••••'}
                          </div>
                        </div>
                        <button
                          onClick={() => setShowLicenseKey(!showLicenseKey)}
                          className="p-1.5 text-slate-400 hover:text-cyan-400"
                        >
                          {showLicenseKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                        <span className="text-slate-400">License Type</span>
                        <span className="font-bold text-purple-400">Pro Lifetime</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 20. Add Custom Sound */}
                {activeModal === 'add_custom' && (
                  <div className="space-y-4 pt-2">
                    <h3 className="text-base font-bold text-white">Add Custom Sound</h3>
                    <p className="text-xs text-slate-400">ফোন স্টোরেজ বা গ্যালারি থেকে অডিও ফাইল যুক্ত করুন</p>

                    <div className="p-6 rounded-2xl border-2 border-dashed border-cyan-500/40 bg-cyan-500/5 text-center cursor-pointer hover:border-cyan-400 transition-colors">
                      <FileAudio className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
                      <div className="text-xs font-bold text-slate-200">Select Audio File</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">(mp3, wav, ogg)</div>
                    </div>

                    <div>
                      <label className="text-[11px] text-slate-400 font-mono">Sound Name</label>
                      <input
                        type="text"
                        defaultValue="Custom Kill SFX"
                        className="w-full mt-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                      />
                    </div>

                    <button
                      onClick={() => setActiveModal(null)}
                      className="w-full py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs"
                    >
                      Add Sound to Library
                    </button>
                  </div>
                )}

                {/* 21. Floating Bubble Overlay Drawer */}
                {activeModal === 'floating_bubble' && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center font-bold">
                          A
                        </div>
                        <h3 className="text-sm font-bold text-white">Quick Sounds (Overlay)</h3>
                      </div>
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/20 px-2 py-0.5 rounded-full">
                        ACTIVE
                      </span>
                    </div>

                    <div className="space-y-2">
                      {sounds.slice(0, 3).map((sound, idx) => (
                        <div
                          key={`bubble-${sound.id}-${idx}`}
                          onClick={() => handlePlaySound(sound)}
                          className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-cyan-400"
                        >
                          <span className="text-xs font-bold text-white">{sound.title}</span>
                          <Play className="w-4 h-4 text-cyan-400 fill-current" />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() => {
                          if (synthStopRef.current) synthStopRef.current();
                          setPlayingSoundId(null);
                        }}
                        className="py-2 rounded-xl bg-rose-500/20 text-rose-400 text-xs font-bold"
                      >
                        Stop All
                      </button>
                      <button
                        onClick={() => setActiveModal(null)}
                        className="py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                      >
                        Close Bubble
                      </button>
                    </div>
                  </div>
                )}

                {/* 22. Update Notice */}
                {activeModal === 'update_notice' && (
                  <div className="text-center space-y-4 pt-2">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300">
                      <Download className="w-7 h-7 animate-bounce" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">New Version Available!</h3>
                      <p className="text-xs text-cyan-400 font-mono mt-0.5">Version: 1.3.0</p>
                      <p className="text-xs text-slate-400 mt-2">
                        Important fixes and high-performance gaming soundboard updates.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <button
                        onClick={() => setActiveModal(null)}
                        className="py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                      >
                        পরে করবো
                      </button>
                      <button
                        onClick={() => setActiveModal('download_install')}
                        className="py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-400/20"
                      >
                        আপডেট করুন
                      </button>
                    </div>
                  </div>
                )}

                {/* 23. Download & Install */}
                {activeModal === 'download_install' && (
                  <div className="text-center space-y-4 pt-2">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                      <Download className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white">Downloading...</h3>
                      <p className="text-xs text-slate-400 font-mono mt-1">2.5 MB / 3.3 MB</p>
                    </div>

                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full w-[75%]" />
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/30 flex items-center justify-center gap-2 text-xs text-emerald-400 font-mono">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verifying file... Checksum matched ✓</span>
                    </div>

                    <button
                      onClick={() => setActiveModal('after_update')}
                      className="w-full py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs"
                    >
                      Installing...
                    </button>
                  </div>
                )}

                {/* 24. After Update Success */}
                {activeModal === 'after_update' && (
                  <div className="text-center space-y-4 pt-2">
                    <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">App Updated!</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        You are now using the latest version of AudiVox (v1.3.0).
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveModal(null)}
                      className="w-full py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs shadow-md shadow-cyan-400/20"
                    >
                      Go to Home
                    </button>
                  </div>
                )}

                {/* 25. Maintenance Screen */}
                {activeModal === 'maintenance_screen' && (
                  <div className="text-center space-y-4 pt-2">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
                      <AlertTriangle className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Under Maintenance</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        We'll be back soon! Server upgrade is underway.
                      </p>
                      <p className="text-xs font-mono text-amber-400 mt-2 font-bold">
                        Estimated Time: 2 hours 30 minutes
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveModal(null)}
                      className="w-full py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                    >
                      Dismiss
                    </button>
                  </div>
                )}

                {/* 26. Offline Screen */}
                {activeModal === 'offline_screen' && (
                  <div className="text-center space-y-4 pt-2">
                    <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/20 border border-rose-400/40 flex items-center justify-center text-rose-300">
                      <WifiOff className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">No Internet</h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Please check your network connection and try again.
                      </p>
                    </div>
                    <button
                      onClick={() => setActiveModal(null)}
                      className="w-full py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs"
                    >
                      Retry Connection
                    </button>
                  </div>
                )}

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Android Gesture Bar */}
        <div className="py-2 flex justify-center bg-slate-950 z-50">
          <div className="w-28 h-1 bg-slate-700 rounded-full" />
        </div>
      </div>
    </div>
  );
};
