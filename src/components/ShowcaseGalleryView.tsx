import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Smartphone,
  Shield,
  Layers,
  Sparkles,
  Play,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Maximize2,
  ExternalLink,
  Flame,
  Key,
  Music,
  Sliders,
  Settings,
  Download,
  AlertTriangle,
  WifiOff,
  Wrench,
  Radio,
  FileCode2,
  Users,
  Package,
} from 'lucide-react';
import { UserAppScreen } from './UserAppSimulator';
import { AdminAppScreen } from './AdminAppSimulator';

interface ShowcaseItem {
  id: number;
  title: string;
  bengaliTitle: string;
  category: 'USER_APP' | 'ADMIN_APP' | 'OVERLAY' | 'ADMIN_WEBSITE';
  description: string;
  targetScreen?: string;
  badge: string;
  badgeColor: string;
  icon: any;
}

const SHOWCASE_ITEMS: ShowcaseItem[] = [
  // 1 to 10: User App
  {
    id: 1,
    title: 'Splash Screen',
    bengaliTitle: 'স্প্ল্যাশ স্ক্রিন',
    category: 'USER_APP',
    description: 'AudiVox অফিশিয়াল লোগো, অরা পালস অ্যানিমেশন, সাউন্ডওয়েভ বার ও ব্র্যান্ডিং।',
    targetScreen: 'splash',
    badge: 'Screen 01',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    icon: Sparkles,
  },
  {
    id: 2,
    title: 'Welcome / Intro',
    bengaliTitle: 'ওয়েলকাম ও ইন্ট্রো',
    category: 'USER_APP',
    description: 'গেমিং হেডফোন গ্রাফিক, ওয়েলকাম কার্ড ও ওয়ান-ট্যাপ লগইন / রেজিস্টার অপশন।',
    targetScreen: 'welcome',
    badge: 'Screen 02',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    icon: Music,
  },
  {
    id: 3,
    title: 'Register',
    bengaliTitle: 'রেজিস্ট্রেশন স্ক্রিন',
    category: 'USER_APP',
    description: 'ফুল নেম, ফোন নম্বর, পাসওয়ার্ড এবং কনফার্ম পাসওয়ার্ড ফিল্ড দিয়ে অ্যাকাউন্ট তৈরি।',
    targetScreen: 'register',
    badge: 'Screen 03',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    icon: Smartphone,
  },
  {
    id: 4,
    title: 'Login',
    bengaliTitle: 'লগইন স্ক্রিন',
    category: 'USER_APP',
    description: 'ভেরিফায়েড ফোন নম্বর ও সিকিউর পাসওয়ার্ড অথেন্টিকেশন ইন্টারফেস।',
    targetScreen: 'login',
    badge: 'Screen 04',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    icon: Key,
  },
  {
    id: 5,
    title: 'License Activation',
    bengaliTitle: 'লাইসেন্স অ্যাক্টিভেশন',
    category: 'USER_APP',
    description: 'লাইসেন্স কি ভ্যালিডেশন, প্রো/ভিআইপি প্ল্যান ডিটেকশন ও রিয়েল-টাইম আনলক।',
    targetScreen: 'activation',
    badge: 'Screen 05',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    icon: Key,
  },
  {
    id: 6,
    title: 'Home Screen',
    bengaliTitle: 'হোম ড্যাশবোর্ড',
    category: 'USER_APP',
    description: 'ইউজার প্রোফাইল হেডার, ফিচার্ড সাউন্ডস ক্যারোসেল, ক্যাটাগরি গ্রিড ও রিসেন্ট সাউন্ডস।',
    targetScreen: 'home',
    badge: 'Screen 06',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    icon: Flame,
  },
  {
    id: 7,
    title: 'Sounds Library',
    bengaliTitle: 'সাউন্ড লাইব্রেরি',
    category: 'USER_APP',
    description: 'সার্চ বার, ক্যাটাগরি ফিল্টার ও রিয়েল-টাইম সিন্থেসাইজড সাউন্ড প্লেয়ার।',
    targetScreen: 'sounds',
    badge: 'Screen 07',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    icon: Music,
  },
  {
    id: 8,
    title: 'Favorites',
    bengaliTitle: 'ফেভারিট সাউন্ডস',
    category: 'USER_APP',
    description: 'প্রিয় গেমিং সাউন্ডের কুইক-অ্যাক্সেস বুকমার্ক ও প্লেব্যাক কন্ট্রোল।',
    targetScreen: 'favorites',
    badge: 'Screen 08',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    icon: Music,
  },
  {
    id: 9,
    title: 'Audio Mixer',
    bengaliTitle: 'অডিও মিক্সার',
    category: 'USER_APP',
    description: 'মাস্টার ভলিউম, মিউজিক ও এফেক্টসের ইন্টারেক্টিভ স্লাইডার ও সাউন্ড টেস্ট।',
    targetScreen: 'mixer',
    badge: 'Screen 09',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    icon: Sliders,
  },
  {
    id: 10,
    title: 'Settings',
    bengaliTitle: 'সেটিংস',
    category: 'USER_APP',
    description: 'প্রোফাইল, ফ্লোটিং বাবল টগল, আপডেট চেক, অফলাইন টেস্ট ও লগআউট অপশন।',
    targetScreen: 'settings',
    badge: 'Screen 10',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    icon: Settings,
  },

  // 11 to 18: Admin App
  {
    id: 11,
    title: 'Admin App Login',
    bengaliTitle: 'অ্যাডমিন লগইন',
    category: 'ADMIN_APP',
    description: 'অ্যাডমিন ব্যাজ, সিকিউর অ্যাডমিন আইডি/ইমেইল ও পাসওয়ার্ড অথেন্টিকেশন।',
    targetScreen: 'login',
    badge: 'Screen 11',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    icon: Shield,
  },
  {
    id: 12,
    title: 'Admin Dashboard',
    bengaliTitle: 'অ্যাডমিন ড্যাশবোর্ড',
    category: 'ADMIN_APP',
    description: 'টোটাল ইউজার্স (১,২৪০), অ্যাক্টিভ লাইসেন্স (৯৮২), ডিভাইস ও রিসেন্ট অ্যাক্টিভিটি।',
    targetScreen: 'dashboard',
    badge: 'Screen 12',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    icon: Shield,
  },
  {
    id: 13,
    title: 'User Management',
    bengaliTitle: 'ইউজার ম্যানেজমেন্ট',
    category: 'ADMIN_APP',
    description: 'ইউজার সার্চ, প্রোফাইল আইডি, ফোন নম্বর ও ওয়ান-ট্যাপ সাসপেন্ড/অ্যাক্টিভেট।',
    targetScreen: 'users',
    badge: 'Screen 13',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    icon: Users,
  },
  {
    id: 14,
    title: 'License Management',
    bengaliTitle: 'লাইসেন্স জেনারেটর',
    category: 'ADMIN_APP',
    description: 'লাইফটাইম, ৩০ দিনের প্রো বা কাস্টম লাইসেন্স কি তৈরি ও মেয়াদ ব্যবস্থাপনা।',
    targetScreen: 'licenses',
    badge: 'Screen 14',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    icon: Key,
  },
  {
    id: 15,
    title: 'Sound Management',
    bengaliTitle: 'সাউন্ডবোর্ড কন্ট্রোল',
    category: 'ADMIN_APP',
    description: 'গেমিং সাউন্ডের পাবলিশ/আনপাবলিশ স্ট্যাটাস টগল ও নতুন সাউন্ড সংযোজন।',
    targetScreen: 'sounds',
    badge: 'Screen 15',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    icon: Music,
  },
  {
    id: 16,
    title: 'Maintenance Mode',
    bengaliTitle: 'রক্ষণাবেক্ষণ নিয়ন্ত্রণ',
    category: 'ADMIN_APP',
    description: 'সিস্টেম মেইনটেন্যান্স সুইচ, কাস্টম নোটিশ মেসেজ ও সময়সূচী নির্ধারণ।',
    targetScreen: 'maintenance',
    badge: 'Screen 16',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    icon: Wrench,
  },
  {
    id: 17,
    title: 'APK Build Center',
    bengaliTitle: 'APK বিল্ড সেন্টার',
    category: 'ADMIN_APP',
    description: 'ইউজার ও অ্যাডমিন APK টার্গেট সিলেকশন, অ্যানিমেটেড ৬৫% বিল্ড বার ও লাইভ লগ।',
    targetScreen: 'build',
    badge: 'Screen 17',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    icon: Package,
  },
  {
    id: 18,
    title: 'Release Center',
    bengaliTitle: 'রিলিজ ও ডাউনলোড সেন্টার',
    category: 'ADMIN_APP',
    description: 'v1.2.0 পাবলিশড সংস্করণ, রিলিজ হিস্টোরি ও সরাসরি APK ডাউনলোড।',
    targetScreen: 'releases',
    badge: 'Screen 18',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    icon: Download,
  },

  // 19 to 26: Overlays & Modals
  {
    id: 19,
    title: 'Profile Modal',
    bengaliTitle: 'ইউজার প্রোফাইল কার্ড',
    category: 'OVERLAY',
    description: '৮ ডিজিট প্রোফাইল আইডি কপি বাটন, লাইসেন্স কি ভিউ টগল ও প্ল্যান ডিটেইলস।',
    targetScreen: 'profile',
    badge: 'Screen 19',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    icon: Smartphone,
  },
  {
    id: 20,
    title: 'Add Custom Sound',
    bengaliTitle: 'কাস্টম অডিও সংযোজন',
    category: 'OVERLAY',
    description: 'ডিভাইস স্টোরেজ বা গ্যালারি থেকে সরাসরি MP3, WAV বা ভিডিও সাউন্ড সংযোজন।',
    targetScreen: 'add_custom',
    badge: 'Screen 20',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    icon: Music,
  },
  {
    id: 21,
    title: 'Floating Sound Bubble',
    bengaliTitle: 'ফ্লোটিং বাবল ওভারলে',
    category: 'OVERLAY',
    description: 'গেমের স্ক্রিনের ওপর ভেসে থাকা বাবল যা নিমেষেই কুইক সাউন্ড ড্রয়ার খুলে দেয়।',
    targetScreen: 'floating_bubble',
    badge: 'Screen 21',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    icon: Sparkles,
  },
  {
    id: 22,
    title: 'Update Notice',
    bengaliTitle: 'আপডেট নোটিশ ডায়ালগ',
    category: 'OVERLAY',
    description: 'নতুন সংস্করণ উপলব্ধ নোটিশ ও "পরে করবো" বা "আপডেট করুন" অ্যাকশন বাটন।',
    targetScreen: 'update_notice',
    badge: 'Screen 22',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    icon: Download,
  },
  {
    id: 23,
    title: 'Download & Install',
    bengaliTitle: 'ডাউনলোড ও ইনস্টলেশন বার',
    category: 'OVERLAY',
    description: '২.৫ মেগাবাইট / ৩.৩ মেগাবাইট প্রগ্রেস বার ও চেকসাম ভেরিফিকেশন সাকসেস।',
    targetScreen: 'download_install',
    badge: 'Screen 23',
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    icon: Download,
  },
  {
    id: 24,
    title: 'After Update Success',
    bengaliTitle: 'আপডেট সফল স্ক্রিন',
    category: 'OVERLAY',
    description: 'সফল আপডেটের গ্লোয়িং চেকমার্ক ও "Go to Home" নেভিগেশন বাটন।',
    targetScreen: 'after_update',
    badge: 'Screen 24',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    icon: CheckCircle2,
  },
  {
    id: 25,
    title: 'Under Maintenance',
    bengaliTitle: 'রক্ষণাবেক্ষণ স্ট্যাটাস',
    category: 'OVERLAY',
    description: 'অ্যানিমেটেড রেঞ্চ আইকন, সম্ভাব্য শেষ সময় ও সিস্টেম আপগ্রেড নোটিশ।',
    targetScreen: 'maintenance_screen',
    badge: 'Screen 25',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    icon: AlertTriangle,
  },
  {
    id: 26,
    title: 'Offline / Error',
    bengaliTitle: 'নো ইন্টারনেট / অফলাইন',
    category: 'OVERLAY',
    description: 'ইন্টারনেট বিচ্ছিন্নতার সময় সতর্কবার্তা এবং রিস্টোর বা রিট্রাই বাটন।',
    targetScreen: 'offline_screen',
    badge: 'Screen 26',
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    icon: WifiOff,
  },

  // 27 to 30: Admin Website
  {
    id: 27,
    title: 'Admin Website Dashboard',
    bengaliTitle: 'ওয়েবসাইট অ্যাডমিন ড্যাশবোর্ড',
    category: 'ADMIN_WEBSITE',
    description: 'ফুল ডেস্কটপ সাইডবার, গ্রোথ চার্ট, লাইসেন্স স্ট্যাটাস রিং ও ৪টি মূল মেমরি কার্ড।',
    targetScreen: 'dashboard',
    badge: 'Screen 27',
    badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/30',
    icon: Layers,
  },
  {
    id: 28,
    title: 'APK Build Progress (Web)',
    bengaliTitle: 'ক্লাউড APK বিল্ড কনসোল',
    category: 'ADMIN_WEBSITE',
    description: 'লাইভ টার্মিনাল লগস, নির্ভরতা যাচাইকরণ ও বিল্ড প্রগ্রেস ট্র্যাকার।',
    targetScreen: 'releases',
    badge: 'Screen 28',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    icon: Package,
  },
  {
    id: 29,
    title: 'Download Section',
    bengaliTitle: 'সরাসরি APK ডাউনলোড',
    category: 'ADMIN_WEBSITE',
    description: 'AudiVox User APK (v1.3.0) এবং Admin APK (v1.2.0) ওয়ান-ক্লিক ইনস্ট্যান্ট সেভ।',
    targetScreen: 'releases',
    badge: 'Screen 29',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    icon: Download,
  },
  {
    id: 30,
    title: 'Key Features Architecture',
    bengaliTitle: 'সম্পূর্ণ আর্কিটেকচার হাইলাইটস',
    category: 'ADMIN_WEBSITE',
    description: 'Supabase Real-time Sync, Jetpack Compose Native APKs, এবং গ্লাস ও নিয়ন থিম।',
    targetScreen: 'schema',
    badge: 'Screen 30',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    icon: FileCode2,
  },
];

interface ShowcaseGalleryViewProps {
  onSelectScreenForSimulator: (type: 'USER' | 'ADMIN' | 'WEBSITE', screenKey?: string) => void;
}

export const ShowcaseGalleryView: React.FC<ShowcaseGalleryViewProps> = ({
  onSelectScreenForSimulator,
}) => {
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'USER_APP' | 'ADMIN_APP' | 'OVERLAY' | 'ADMIN_WEBSITE'>('ALL');
  const [presentationSlideIndex, setPresentationSlideIndex] = useState<number | null>(null);

  const filteredItems = SHOWCASE_ITEMS.filter(
    (item) => activeFilter === 'ALL' || item.category === activeFilter
  );

  const currentSlide = presentationSlideIndex !== null ? SHOWCASE_ITEMS[presentationSlideIndex] : null;

  const nextSlide = () => {
    if (presentationSlideIndex !== null) {
      setPresentationSlideIndex((presentationSlideIndex + 1) % SHOWCASE_ITEMS.length);
    }
  };

  const prevSlide = () => {
    if (presentationSlideIndex !== null) {
      setPresentationSlideIndex(
        (presentationSlideIndex - 1 + SHOWCASE_ITEMS.length) % SHOWCASE_ITEMS.length
      );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Hero Showcase Banner matching the reference poster */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 border border-cyan-500/30 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full bg-cyan-400/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-400/40 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>30-Screen Complete Architecture Blueprint</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              AudiVox <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">UI/UX Showcase</span>
            </h1>
            <p className="text-slate-400 text-sm max-w-2xl">
              User App (Screens 1–10) · Admin App (Screens 11–18) · Overlays &amp; In-App Modals (Screens 19–26) · Admin Website (Screens 27–30).
              প্রত্যেকটি স্ক্রিনে স্মুথ মাইক্রো-ইন্টারেকশন এবং অ্যানিমেশন সংযুক্ত।
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => setPresentationSlideIndex(0)}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 hover:from-cyan-300 hover:to-purple-400 text-slate-950 font-bold text-sm shadow-lg shadow-cyan-400/20 flex items-center gap-2 active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>স্লাইড শো শুরু করুন (Slide Presentation)</span>
            </button>
          </div>
        </div>

        {/* Feature Pills from Poster */}
        <div className="relative z-10 flex flex-wrap items-center gap-2 pt-6 mt-6 border-t border-slate-800/80">
          {[
            { label: 'Modern Design', color: 'text-cyan-300' },
            { label: 'Dark Mode', color: 'text-purple-300' },
            { label: 'Glassmorphism', color: 'text-sky-300' },
            { label: 'Smooth Animation', color: 'text-pink-300' },
            { label: 'Fully Responsive', color: 'text-emerald-300' },
            { label: 'Supabase Real-time', color: 'text-amber-300' },
          ].map((feat, i) => (
            <span
              key={i}
              className={`px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-semibold ${feat.color}`}
            >
              ✓ {feat.label}
            </span>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'ALL', label: 'All 30 Screens' },
          { id: 'USER_APP', label: '1. User App (Screens 1–10)' },
          { id: 'ADMIN_APP', label: '2. Admin App (Screens 11–18)' },
          { id: 'OVERLAY', label: '3. Overlays & Modals (19–26)' },
          { id: 'ADMIN_WEBSITE', label: '4. Admin Website (27–30)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 ${
              activeFilter === tab.id
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 30 Screens Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={`${item.id}-${idx}`}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/40 hover:bg-slate-900/90 transition-all flex flex-col justify-between shadow-lg group relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold border ${item.badgeColor}`}>
                    {item.badge}
                  </span>
                  <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-400 group-hover:text-slate-950 transition-colors">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {item.title}
                </h3>
                <div className="text-[11px] text-cyan-400/80 font-medium mt-0.5">
                  {item.bengaliTitle}
                </div>

                <p className="text-xs text-slate-400 mt-2 line-clamp-3 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
                <button
                  onClick={() => setPresentationSlideIndex(item.id - 1)}
                  className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Preview</span>
                </button>

                <button
                  onClick={() => {
                    if (item.category === 'ADMIN_APP') {
                      onSelectScreenForSimulator('ADMIN', item.targetScreen);
                    } else if (item.category === 'ADMIN_WEBSITE') {
                      onSelectScreenForSimulator('WEBSITE', item.targetScreen);
                    } else {
                      onSelectScreenForSimulator('USER', item.targetScreen);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-cyan-400/10 hover:bg-cyan-400 text-cyan-300 hover:text-slate-950 text-xs font-bold flex items-center gap-1 transition-all"
                >
                  <span>Launch Screen</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Fullscreen Interactive Slide Presentation Modal */}
      <AnimatePresence>
        {presentationSlideIndex !== null && currentSlide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-8"
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl relative flex flex-col justify-between max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-mono px-3 py-1 rounded-full font-bold border ${currentSlide.badgeColor}`}>
                    {currentSlide.badge} of 30
                  </span>
                  <span className="text-xs text-slate-400 font-mono uppercase tracking-wider">
                    {currentSlide.category}
                  </span>
                </div>
                <button
                  onClick={() => setPresentationSlideIndex(null)}
                  className="text-xs px-3 py-1 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
                >
                  Close (ESC)
                </button>
              </div>

              {/* Main Content Showcase */}
              <div className="py-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <h2 className="text-3xl font-extrabold text-white">
                    {currentSlide.title}
                  </h2>
                  <div className="text-lg text-cyan-400 font-semibold">
                    {currentSlide.bengaliTitle}
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {currentSlide.description}
                  </p>

                  <div className="pt-4 flex items-center gap-3">
                    <button
                      onClick={() => {
                        const s = currentSlide;
                        setPresentationSlideIndex(null);
                        if (s.category === 'ADMIN_APP') {
                          onSelectScreenForSimulator('ADMIN', s.targetScreen);
                        } else if (s.category === 'ADMIN_WEBSITE') {
                          onSelectScreenForSimulator('WEBSITE', s.targetScreen);
                        } else {
                          onSelectScreenForSimulator('USER', s.targetScreen);
                        }
                      }}
                      className="px-5 py-2.5 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-400/20 active:scale-95 transition-all"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>লাইভ সিমুলেটরে এই স্ক্রিনটি টেস্ট করুন</span>
                    </button>
                  </div>
                </div>

                {/* Visual Art Box simulating the screen appearance */}
                <div className="p-8 rounded-3xl bg-slate-950/80 border border-cyan-500/30 flex flex-col items-center justify-center text-center relative overflow-hidden group">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 mb-4 shadow-xl">
                    <currentSlide.icon className="w-12 h-12" />
                  </div>
                  <div className="text-sm font-bold text-white">{currentSlide.title}</div>
                  <div className="text-xs text-slate-400 font-mono mt-1">AudiVox Native Engine · Screen #{currentSlide.id}</div>
                </div>
              </div>

              {/* Navigation Footer */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={prevSlide}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous Slide</span>
                </button>

                <div className="text-xs text-slate-500 font-mono">
                  {presentationSlideIndex + 1} / {SHOWCASE_ITEMS.length}
                </div>

                <button
                  onClick={nextSlide}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-2"
                >
                  <span>Next Slide</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
