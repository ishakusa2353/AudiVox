-- ====================================================================
-- AUDIVOX: YOUR SOUND. YOUR GAME.
-- Master Database Schema, Security Policies (RLS), Functions & Triggers
-- Target: Supabase / PostgreSQL 15+
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUMS & DOMAINS
DO $$ BEGIN
    CREATE TYPE license_type_enum AS ENUM ('TIMED', 'VIP', 'PRO', 'LIFETIME', 'CUSTOM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE app_target_enum AS ENUM ('USER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE build_status_enum AS ENUM ('QUEUED', 'BUILDING', 'SUCCESS', 'FAILED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ====================================================================
-- 3. PROFILES & USER ACCOUNTS
-- ====================================================================
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

-- Index for normalized phone lookup and Profile ID lookup
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone_number);
CREATE INDEX IF NOT EXISTS idx_profiles_profile_id ON public.profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON public.profiles(is_admin);

-- ====================================================================
-- 4. LICENSES & LICENSE ALLOCATION
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_key VARCHAR(64) NOT NULL UNIQUE,
    license_type license_type_enum NOT NULL DEFAULT 'CUSTOM',
    -- Custom duration expressed in seconds (supports arbitrary combinations of days, hours, mins, secs)
    duration_seconds BIGINT NOT NULL DEFAULT 86400,
    is_lifetime BOOLEAN NOT NULL DEFAULT false,
    max_devices INT NOT NULL DEFAULT 1 CHECK (max_devices >= 1 AND max_devices <= 20),
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_suspended BOOLEAN NOT NULL DEFAULT false,
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    revocation_reason TEXT,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_licenses_key ON public.licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_active ON public.licenses(is_active, is_suspended, is_revoked);

-- ====================================================================
-- 5. LICENSE ACTIVATIONS & SESSIONS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.license_activations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_id UUID NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    activated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ, -- NULL for lifetime licenses
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_active_license_per_user UNIQUE (profile_id, license_id)
);

CREATE INDEX IF NOT EXISTS idx_activations_profile ON public.license_activations(profile_id);
CREATE INDEX IF NOT EXISTS idx_activations_license ON public.license_activations(license_id);
CREATE INDEX IF NOT EXISTS idx_activations_expires ON public.license_activations(expires_at);

-- ====================================================================
-- 6. REGISTERED DEVICES & LIMIT CONTROL
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    license_id UUID NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
    device_fingerprint VARCHAR(128) NOT NULL,
    device_model VARCHAR(100),
    os_version VARCHAR(50),
    app_version VARCHAR(30),
    is_revoked BOOLEAN NOT NULL DEFAULT false,
    revoked_at TIMESTAMPTZ,
    registered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    last_active_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_device_per_license_user UNIQUE (profile_id, license_id, device_fingerprint)
);

CREATE INDEX IF NOT EXISTS idx_devices_profile ON public.devices(profile_id);
CREATE INDEX IF NOT EXISTS idx_devices_license ON public.devices(license_id);
CREATE INDEX IF NOT EXISTS idx_devices_fingerprint ON public.devices(device_fingerprint);

-- ====================================================================
-- 7. SOUND CATEGORIES & SOUND ITEMS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.sound_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(80) NOT NULL,
    slug VARCHAR(80) NOT NULL UNIQUE,
    icon_name VARCHAR(50) DEFAULT 'Music',
    sort_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.sound_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.sound_categories(id) ON DELETE SET NULL,
    title VARCHAR(120) NOT NULL,
    description TEXT,
    audio_url TEXT NOT NULL,
    duration_ms INT NOT NULL DEFAULT 0,
    file_format VARCHAR(10) NOT NULL DEFAULT 'mp3',
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    tags TEXT[] DEFAULT '{}',
    is_published BOOLEAN NOT NULL DEFAULT true,
    play_count BIGINT NOT NULL DEFAULT 0,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sounds_category ON public.sound_items(category_id);
CREATE INDEX IF NOT EXISTS idx_sounds_published ON public.sound_items(is_published);

-- User favorites synchronized across devices (if online)
CREATE TABLE IF NOT EXISTS public.user_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    sound_id UUID NOT NULL REFERENCES public.sound_items(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_favorite UNIQUE (profile_id, sound_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.user_favorites(profile_id);

-- ====================================================================
-- 8. SYSTEM CONFIGURATION & MAINTENANCE
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.system_config (
    key VARCHAR(64) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- ====================================================================
-- 9. APP RELEASES & MANDATORY UPDATE POLICY
-- ====================================================================
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
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_version_per_target UNIQUE (app_target, version_code)
);

CREATE INDEX IF NOT EXISTS idx_releases_target ON public.app_releases(app_target, is_published);

-- ====================================================================
-- 10. NOTIFICATIONS & BROADCASTS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    target_audience VARCHAR(30) NOT NULL DEFAULT 'ALL',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- ====================================================================
-- 11. SECURITY & AUDIT LOGS (IMMUTABLE)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action VARCHAR(80) NOT NULL,
    entity_type VARCHAR(60) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(45),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON public.audit_logs(action);

-- ====================================================================
-- 12. APK BUILD JOBS & WORKFLOW RECORDS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.build_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    app_target app_target_enum NOT NULL DEFAULT 'USER',
    branch VARCHAR(60) NOT NULL DEFAULT 'main',
    commit_sha VARCHAR(40),
    triggered_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    status build_status_enum NOT NULL DEFAULT 'QUEUED',
    artifact_url TEXT,
    artifact_sha256 VARCHAR(64),
    build_logs TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_builds_status ON public.build_jobs(status, created_at DESC);

-- ====================================================================
-- 13. SERVER-SIDE PROCEDURES & TRUSTED FUNCTIONS
-- ====================================================================

-- Function: Generate secure 8-digit numeric Profile ID
CREATE OR REPLACE FUNCTION public.fn_generate_profile_id()
RETURNS CHAR(8)
LANGUAGE plpgsql
AS $$
DECLARE
    new_id CHAR(8);
    id_exists BOOLEAN;
BEGIN
    LOOP
        -- Generates an 8-digit number between 10000000 and 99999999
        new_id := (floor(random() * (99999999 - 10000000 + 1) + 10000000))::text;
        SELECT EXISTS(SELECT 1 FROM public.profiles WHERE profile_id = new_id) INTO id_exists;
        IF NOT id_exists THEN
            RETURN new_id;
        END IF;
    END LOOP;
END;
$$;

-- Function: Check whether calling user is an authorized administrator
CREATE OR REPLACE FUNCTION public.fn_is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND is_admin = true AND is_suspended = false
    );
$$;

-- Function: Server-authoritative license activation & device verification
-- Validates key, checks expiration against authoritative server clock,
-- enforces device limits, and registers the device safely.
CREATE OR REPLACE FUNCTION public.fn_activate_license(
    p_license_key VARCHAR(64),
    p_device_fingerprint VARCHAR(128),
    p_device_model VARCHAR(100),
    p_os_version VARCHAR(50),
    p_app_version VARCHAR(30)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_profile RECORD;
    v_license RECORD;
    v_activation RECORD;
    v_active_devices_count INT;
    v_device RECORD;
    v_new_expires_at TIMESTAMPTZ;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'UNAUTHORIZED', 'message', 'Please sign in to activate a license.');
    END IF;

    -- Verify user profile
    SELECT * INTO v_profile FROM public.profiles WHERE id = v_user_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'PROFILE_NOT_FOUND', 'message', 'User profile does not exist.');
    END IF;

    IF v_profile.is_suspended THEN
        RETURN jsonb_build_object('success', false, 'error', 'USER_SUSPENDED', 'message', 'Account is suspended. Contact support.');
    END IF;

    -- Lookup license key
    SELECT * INTO v_license FROM public.licenses WHERE UPPER(TRIM(license_key)) = UPPER(TRIM(p_license_key));
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'INVALID_LICENSE', 'message', 'License key not found or invalid.');
    END IF;

    IF NOT v_license.is_active OR v_license.is_suspended OR v_license.is_revoked THEN
        RETURN jsonb_build_object('success', false, 'error', 'LICENSE_DISABLED', 'message', 'License is suspended or revoked.');
    END IF;

    -- Check if license is already bound to another profile
    SELECT * INTO v_activation FROM public.license_activations WHERE license_id = v_license.id;
    IF FOUND AND v_activation.profile_id <> v_user_id THEN
        RETURN jsonb_build_object('success', false, 'error', 'LICENSE_ALREADY_USED', 'message', 'This license is already bound to another account.');
    END IF;

    -- Calculate expiration based on server now()
    IF v_license.is_lifetime THEN
        v_new_expires_at := NULL;
    ELSE
        IF FOUND THEN
            -- License was already activated for this user; check if already expired
            IF v_activation.expires_at IS NOT NULL AND v_activation.expires_at < now() THEN
                RETURN jsonb_build_object('success', false, 'error', 'LICENSE_EXPIRED', 'message', 'This license has expired.');
            END IF;
            v_new_expires_at := v_activation.expires_at;
        ELSE
            -- First time activation: calculate exact expiration from server clock
            v_new_expires_at := now() + (v_license.duration_seconds || ' seconds')::interval;
        END IF;
    END IF;

    -- Check registered active devices for this license
    SELECT COUNT(*) INTO v_active_devices_count
    FROM public.devices
    WHERE license_id = v_license.id AND is_revoked = false AND device_fingerprint <> p_device_fingerprint;

    IF v_active_devices_count >= v_license.max_devices THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'DEVICE_LIMIT_EXCEEDED',
            'message', format('Device limit reached (%s/%s). Please revoke another device in settings.', v_active_devices_count, v_license.max_devices)
        );
    END IF;

    -- Upsert activation
    INSERT INTO public.license_activations (license_id, profile_id, activated_at, expires_at, is_active)
    VALUES (v_license.id, v_user_id, now(), v_new_expires_at, true)
    ON CONFLICT (profile_id, license_id)
    DO UPDATE SET is_active = true;

    -- Register or update device
    INSERT INTO public.devices (
        profile_id, license_id, device_fingerprint, device_model, os_version, app_version, is_revoked, last_active_at
    )
    VALUES (
        v_user_id, v_license.id, p_device_fingerprint, p_device_model, p_os_version, p_app_version, false, now()
    )
    ON CONFLICT (profile_id, license_id, device_fingerprint)
    DO UPDATE SET
        device_model = p_device_model,
        os_version = p_os_version,
        app_version = p_app_version,
        is_revoked = false,
        last_active_at = now();

    -- Log activation event in audit logs
    INSERT INTO public.audit_logs (actor_id, action, entity_type, entity_id, details)
    VALUES (
        v_user_id,
        'LICENSE_ACTIVATION',
        'licenses',
        v_license.id::text,
        jsonb_build_object(
            'device_fingerprint', p_device_fingerprint,
            'device_model', p_device_model,
            'expires_at', v_new_expires_at,
            'is_lifetime', v_license.is_lifetime
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'license_id', v_license.id,
        'license_key', v_license.license_key,
        'license_type', v_license.license_type,
        'is_lifetime', v_license.is_lifetime,
        'expires_at', v_new_expires_at,
        'server_time', now(),
        'max_devices', v_license.max_devices,
        'active_devices', v_active_devices_count + 1
    );
END;
$$;

-- Function: Server-side check of user license status & remaining duration
CREATE OR REPLACE FUNCTION public.fn_get_user_license_status()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_activation RECORD;
    v_license RECORD;
    v_remaining_seconds BIGINT;
    v_days INT;
    v_hours INT;
    v_minutes INT;
    v_seconds INT;
    v_devices_count INT;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('has_license', false, 'status', 'UNAUTHENTICATED');
    END IF;

    SELECT a.*, l.license_key, l.license_type, l.is_lifetime, l.is_suspended, l.is_revoked, l.max_devices
    INTO v_activation
    FROM public.license_activations a
    JOIN public.licenses l ON a.license_id = l.id
    WHERE a.profile_id = v_user_id AND a.is_active = true
    ORDER BY a.created_at DESC
    LIMIT 1;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('has_license', false, 'status', 'NO_LICENSE');
    END IF;

    IF v_activation.is_revoked OR v_activation.is_suspended THEN
        RETURN jsonb_build_object('has_license', false, 'status', 'REVOKED_OR_SUSPENDED');
    END IF;

    SELECT COUNT(*) INTO v_devices_count
    FROM public.devices
    WHERE license_id = v_activation.license_id AND profile_id = v_user_id AND is_revoked = false;

    IF v_activation.is_lifetime THEN
        RETURN jsonb_build_object(
            'has_license', true,
            'status', 'ACTIVE',
            'is_lifetime', true,
            'license_type', v_activation.license_type,
            'license_key_masked', concat(left(v_activation.license_key, 4), '-****-****-', right(v_activation.license_key, 4)),
            'devices_registered', v_devices_count,
            'max_devices', v_activation.max_devices,
            'server_time', now()
        );
    END IF;

    -- Time remaining calculation
    IF v_activation.expires_at < now() THEN
        RETURN jsonb_build_object(
            'has_license', false,
            'status', 'EXPIRED',
            'is_lifetime', false,
            'expires_at', v_activation.expires_at,
            'server_time', now()
        );
    END IF;

    v_remaining_seconds := EXTRACT(EPOCH FROM (v_activation.expires_at - now()))::bigint;
    v_days := v_remaining_seconds / 86400;
    v_hours := (v_remaining_seconds % 86400) / 3600;
    v_minutes := (v_remaining_seconds % 3600) / 60;
    v_seconds := v_remaining_seconds % 60;

    RETURN jsonb_build_object(
        'has_license', true,
        'status', 'ACTIVE',
        'is_lifetime', false,
        'license_type', v_activation.license_type,
        'license_key_masked', concat(left(v_activation.license_key, 4), '-****-****-', right(v_activation.license_key, 4)),
        'expires_at', v_activation.expires_at,
        'remaining_seconds', v_remaining_seconds,
        'remaining_formatted', jsonb_build_object(
            'days', v_days,
            'hours', v_hours,
            'minutes', v_minutes,
            'seconds', v_seconds
        ),
        'devices_registered', v_devices_count,
        'max_devices', v_activation.max_devices,
        'server_time', now()
    );
END;
$$;

-- Function: Client policy check (Maintenance mode + Version policy)
CREATE OR REPLACE FUNCTION public.fn_check_app_policy(
    p_app_target app_target_enum,
    p_current_version_code INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_maintenance JSONB;
    v_is_maintenance BOOLEAN := false;
    v_maintenance_message TEXT := 'সিস্টেম রক্ষণাবেক্ষণ চলছে। দয়া করে কিছুক্ষণ পরে আবার চেষ্টা করুন।';
    v_release RECORD;
BEGIN
    -- Check maintenance config
    SELECT value INTO v_maintenance FROM public.system_config WHERE key = 'maintenance_mode';
    IF FOUND THEN
        v_is_maintenance := COALESCE((v_maintenance->>'is_enabled')::boolean, false);
        v_maintenance_message := COALESCE(v_maintenance->>'message', v_maintenance_message);
    END IF;

    IF v_is_maintenance THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'is_maintenance', true,
            'maintenance_message', v_maintenance_message
        );
    END IF;

    -- Check latest release
    SELECT * INTO v_release
    FROM public.app_releases
    WHERE app_target = p_app_target AND is_published = true
    ORDER BY version_code DESC
    LIMIT 1;

    IF NOT FOUND THEN
        -- No releases configured, allow current version
        RETURN jsonb_build_object(
            'allowed', true,
            'is_maintenance', false,
            'update_required', false
        );
    END IF;

    -- Mandatory update evaluation
    IF p_current_version_code < v_release.min_supported_version_code OR
       (v_release.is_mandatory_update AND p_current_version_code < v_release.version_code) THEN
        RETURN jsonb_build_object(
            'allowed', false,
            'is_maintenance', false,
            'update_required', true,
            'is_mandatory', true,
            'latest_version_name', v_release.version_name,
            'latest_version_code', v_release.version_code,
            'update_title', v_release.update_title,
            'update_notes', v_release.update_notes,
            'apk_download_url', v_release.apk_download_url,
            'apk_file_size_bytes', v_release.apk_file_size_bytes,
            'apk_sha256', v_release.apk_sha256
        );
    END IF;

    -- Optional update available
    IF p_current_version_code < v_release.version_code THEN
        RETURN jsonb_build_object(
            'allowed', true,
            'is_maintenance', false,
            'update_required', false,
            'optional_update_available', true,
            'latest_version_name', v_release.version_name,
            'latest_version_code', v_release.version_code,
            'update_title', v_release.update_title,
            'update_notes', v_release.update_notes,
            'apk_download_url', v_release.apk_download_url,
            'apk_sha256', v_release.apk_sha256
        );
    END IF;

    RETURN jsonb_build_object(
        'allowed', true,
        'is_maintenance', false,
        'update_required', false,
        'optional_update_available', false
    );
END;
$$;

-- ====================================================================
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_activations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sound_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sound_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_releases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_jobs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.fn_is_admin());

CREATE POLICY "Users can update permitted fields of own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND is_admin = (SELECT is_admin FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins have full access to profiles"
    ON public.profiles FOR ALL
    USING (public.fn_is_admin());

-- Licenses Policies:
-- Non-admins cannot read or generate arbitrary license lists directly.
CREATE POLICY "Admins have full access to licenses"
    ON public.licenses FOR ALL
    USING (public.fn_is_admin());

-- License Activations Policies:
CREATE POLICY "Users can view own license activations"
    ON public.license_activations FOR SELECT
    USING (auth.uid() = profile_id OR public.fn_is_admin());

CREATE POLICY "Admins have full access to activations"
    ON public.license_activations FOR ALL
    USING (public.fn_is_admin());

-- Devices Policies:
CREATE POLICY "Users can view and manage their own registered devices"
    ON public.devices FOR SELECT
    USING (auth.uid() = profile_id OR public.fn_is_admin());

CREATE POLICY "Users can revoke their own devices"
    ON public.devices FOR UPDATE
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Admins have full access to devices"
    ON public.devices FOR ALL
    USING (public.fn_is_admin());

-- Sound Categories & Items:
CREATE POLICY "Public can view active sound categories"
    ON public.sound_categories FOR SELECT
    USING (is_active = true OR public.fn_is_admin());

CREATE POLICY "Admins manage sound categories"
    ON public.sound_categories FOR ALL
    USING (public.fn_is_admin());

CREATE POLICY "Users can read published sound items"
    ON public.sound_items FOR SELECT
    USING (is_published = true OR public.fn_is_admin());

CREATE POLICY "Admins manage sound items"
    ON public.sound_items FOR ALL
    USING (public.fn_is_admin());

-- User Favorites:
CREATE POLICY "Users manage own favorites"
    ON public.user_favorites FOR ALL
    USING (auth.uid() = profile_id)
    WITH CHECK (auth.uid() = profile_id);

-- System Config & Releases:
CREATE POLICY "Anyone can read system config"
    ON public.system_config FOR SELECT
    USING (true);

CREATE POLICY "Admins manage system config"
    ON public.system_config FOR ALL
    USING (public.fn_is_admin());

CREATE POLICY "Anyone can read published releases"
    ON public.app_releases FOR SELECT
    USING (is_published = true OR public.fn_is_admin());

CREATE POLICY "Admins manage app releases"
    ON public.app_releases FOR ALL
    USING (public.fn_is_admin());

-- Notifications:
CREATE POLICY "Users read active notifications"
    ON public.notifications FOR SELECT
    USING (is_active = true OR public.fn_is_admin());

CREATE POLICY "Admins manage notifications"
    ON public.notifications FOR ALL
    USING (public.fn_is_admin());

-- Audit Logs (Admins only read, append-only via trusted functions):
CREATE POLICY "Admins can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (public.fn_is_admin());

CREATE POLICY "Admins can view and manage build jobs"
    ON public.build_jobs FOR ALL
    USING (public.fn_is_admin());
