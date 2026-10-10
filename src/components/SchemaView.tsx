import React, { useState } from 'react';
import { Copy, Check, Download, FileCode, Database } from 'lucide-react';

interface SchemaViewProps {
  onCopySuccess?: () => void;
}

export const SchemaView: React.FC<SchemaViewProps> = () => {
  const [copied, setCopied] = useState(false);

  const sampleSql = `-- AUDIVOX: MASTER SUPABASE SQL SCHEMA (v1.0.0)
-- Target: Supabase SQL Editor
-- File: supabase/schema.sql

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS
CREATE TYPE license_type_enum AS ENUM ('TIMED', 'VIP', 'PRO', 'LIFETIME', 'CUSTOM');
CREATE TYPE app_target_enum AS ENUM ('USER', 'ADMIN');
CREATE TYPE build_status_enum AS ENUM ('QUEUED', 'BUILDING', 'SUCCESS', 'FAILED');

-- 3. PROFILES TABLE (Normalized Phone + 8-Digit Server Profile ID)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    profile_id CHAR(8) NOT NULL UNIQUE,
    full_name VARCHAR(120) NOT NULL,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    is_admin BOOLEAN NOT NULL DEFAULT false,
    is_suspended BOOLEAN NOT NULL DEFAULT false,
    suspension_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. LICENSES (Days, Hours, Mins, Secs custom duration + device limits)
CREATE TABLE IF NOT EXISTS public.licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_key VARCHAR(64) NOT NULL UNIQUE,
    license_type license_type_enum NOT NULL DEFAULT 'CUSTOM',
    duration_seconds BIGINT NOT NULL DEFAULT 86400,
    is_lifetime BOOLEAN NOT NULL DEFAULT false,
    max_devices INT NOT NULL DEFAULT 1 CHECK (max_devices >= 1 AND max_devices <= 20),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_suspended BOOLEAN NOT NULL DEFAULT false,
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. LICENSE ACTIVATIONS & SESSIONS
CREATE TABLE IF NOT EXISTS public.license_activations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_id UUID NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    activated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_active_license_per_user UNIQUE (profile_id, license_id)
);

-- 6. REGISTERED DEVICES & HARDWARE FINGERPRINTS
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    license_id UUID NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
    device_fingerprint VARCHAR(128) NOT NULL,
    device_model VARCHAR(100),
    os_version VARCHAR(50),
    app_version VARCHAR(30),
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_device_per_license_user UNIQUE (profile_id, license_id, device_fingerprint)
);

-- 7. SYSTEM CONFIG, MAINTENANCE & RELEASES
CREATE TABLE IF NOT EXISTS public.system_config (
    key VARCHAR(64) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.app_releases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_target app_target_enum NOT NULL DEFAULT 'USER',
    version_name VARCHAR(30) NOT NULL,
    version_code INT NOT NULL,
    min_supported_version_code INT NOT NULL DEFAULT 1,
    is_mandatory_update BOOLEAN NOT NULL DEFAULT false,
    update_title VARCHAR(150) NOT NULL DEFAULT 'আপডেট উপলভ্য (Update Available)',
    update_notes TEXT,
    apk_download_url TEXT NOT NULL,
    apk_file_size_bytes BIGINT NOT NULL DEFAULT 0,
    apk_sha256 VARCHAR(64) NOT NULL,
    is_published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. SOUND LIBRARY & FAVORITES
CREATE TABLE IF NOT EXISTS public.sound_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(80) NOT NULL,
    slug VARCHAR(80) NOT NULL UNIQUE,
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.sound_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.sound_categories(id),
    title VARCHAR(120) NOT NULL,
    audio_url TEXT NOT NULL,
    duration_ms INT NOT NULL DEFAULT 0,
    file_format VARCHAR(10) NOT NULL DEFAULT 'mp3',
    tags TEXT[] DEFAULT '{}',
    is_published BOOLEAN NOT NULL DEFAULT true,
    play_count BIGINT NOT NULL DEFAULT 0
);

-- 9. AUDIT LOGS (Immutable)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id),
    action VARCHAR(80) NOT NULL,
    entity_type VARCHAR(60) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Complete file is available in /supabase/schema.sql
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sampleSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Supabase SQL স্কিমা ও নিরাপত্তা পলিসি</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            সম্পূর্ণ পোস্টগ্রিসকিউএল স্কিমা · রো লেভেল সিকিউরিটি (RLS) · ৮ ডিজিট প্রোফাইল আইডি ট্রিগার · সার্ভার লাইসেন্স আরপিসি
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'কপি সম্পন্ন হয়েছে!' : 'সম্পূর্ণ SQL কপি করুন'}</span>
          </button>
        </div>
      </div>

      {/* Execution Instructions Banner */}
      <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-2 leading-relaxed">
        <div className="font-bold text-white flex items-center gap-2">
          <Database className="w-4 h-4 text-cyan-400" />
          <span>Supabase ড্যাশবোর্ডে স্কিমা রান করার সঠিক নির্দেশিকা:</span>
        </div>
        <ol className="list-decimal list-inside space-y-1 text-slate-400 pl-1">
          <li>আপনার Supabase ড্যাশবোর্ডে প্রবেশ করুন (<code className="text-cyan-300">https://qbazzarqiplrqqfytajz.supabase.co</code>)।</li>
          <li>বাম পাশের মেনু থেকে <strong>SQL Editor</strong> ট্যাবে ক্লিক করুন।</li>
          <li><strong>New Query</strong> তৈরি করুন এবং নিচের SQL সম্পূর্ণ পেস্ট করুন (বা প্রজেক্টের <code className="text-cyan-300">/supabase/schema.sql</code> ফাইলটি ওপেন করুন)।</li>
          <li><strong>RUN</strong> বাটনে ক্লিক করে এক্সেকিউট করুন।</li>
          <li>ঐচ্ছিক প্রাথমিক ডেমো ডেটার জন্য এরপর <code className="text-cyan-300">/supabase/seed.sql</code> রান করুন।</li>
        </ol>
      </div>

      {/* Code Box */}
      <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden font-mono text-xs">
        <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between text-slate-400">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span className="text-white font-medium">supabase/schema.sql</span>
          </div>
          <span className="text-[11px] text-slate-500">PostgreSQL DDL + RLS + Stored Procedures</span>
        </div>
        <pre className="p-4 text-slate-300 max-h-[460px] overflow-y-auto leading-relaxed select-all bg-black/40">
          {sampleSql}
        </pre>
      </div>
    </div>
  );
};
