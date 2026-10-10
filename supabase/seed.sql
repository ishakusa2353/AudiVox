-- ====================================================================
-- AUDIVOX: Seed Data for Initial Setup & Safe Prototyping
-- Target: Supabase / PostgreSQL
-- ====================================================================

-- 1. Initial System Configuration
INSERT INTO public.system_config (key, value, description)
VALUES 
    ('maintenance_mode', '{"is_enabled": false, "message": "AudiVox সার্ভার রক্ষণাবেক্ষণ চলছে। অনুগ্রহ করে ১০ মিনিট পর চেষ্টা করুন।"}'::jsonb, 'System maintenance control'),
    ('general_settings', '{"app_name": "AudiVox", "tagline": "Your Sound. Your Game.", "support_phone": "+8801700000000", "min_client_version": "1.0.0"}'::jsonb, 'General brand settings')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. Sound Categories
INSERT INTO public.sound_categories (id, name, slug, icon_name, sort_order, is_active)
VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Gaming FX', 'gaming-fx', 'Gamepad2', 1, true),
    ('c2222222-2222-2222-2222-222222222222', 'Voice Lines', 'voice-lines', 'Mic', 2, true),
    ('c3333333-3333-3333-3333-333333333333', 'Memes & Fun', 'memes-fun', 'Laugh', 3, true),
    ('c4444444-4444-4444-4444-444444444444', 'Anime & Battle', 'anime-battle', 'Flame', 4, true),
    ('c5555555-5555-5555-5555-555555555555', 'Ambient & Beat', 'ambient-beat', 'Disc', 5, true)
ON CONFLICT (slug) DO NOTHING;

-- 3. Sound Items (Clean audio samples for gaming soundboard)
INSERT INTO public.sound_items (id, category_id, title, description, audio_url, duration_ms, file_format, tags, is_published, play_count)
VALUES
    ('s1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Headshot Strike', 'Crisp sniper kill impact notification sound', 'https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3', 1200, 'mp3', ARRAY['kill', 'sniper', 'impact'], true, 1420),
    ('s2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'Victory Horn', 'Epic fanfare victory sound effect', 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3', 3400, 'mp3', ARRAY['victory', 'win', 'fanfare'], true, 980),
    ('s3333333-3333-3333-3333-333333333333', 'c2222222-2222-2222-2222-222222222222', 'RUSH NOW! Team Call', 'Intense competitive squad rush voice callout', 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', 2100, 'mp3', ARRAY['rush', 'callout', 'squad'], true, 2310),
    ('s4444444-4444-4444-4444-444444444444', 'c3333333-3333-3333-3333-333333333333', 'Sad Trombone Wah-Wah', 'Classic fail meme trombone sting', 'https://assets.mixkit.co/active_storage/sfx/2955/2955-preview.mp3', 2800, 'mp3', ARRAY['meme', 'fail', 'funny'], true, 3120),
    ('s5555555-5555-5555-5555-555555555555', 'c4444444-4444-4444-4444-444444444444', 'Power Surge Aura', 'Super Saiyan anime energy charging SFX', 'https://assets.mixkit.co/active_storage/sfx/2704/2704-preview.mp3', 4200, 'mp3', ARRAY['aura', 'energy', 'anime'], true, 1840)
ON CONFLICT (id) DO NOTHING;

-- 4. Initial Baseline App Releases
INSERT INTO public.app_releases (
    app_target, version_name, version_code, min_supported_version_code, is_mandatory_update,
    update_title, update_notes, apk_download_url, apk_file_size_bytes, apk_sha256, is_published, published_at
)
VALUES
    ('USER', '1.0.0', 100, 100, false, 'AudiVox 1.0.0 Official Launch', 'Initial production release with floating bubble and multi-channel sound mixer.', 'https://qbazzarqiplrqqfytajz.supabase.co/storage/v1/object/public/releases/audivox-user-v1.0.0.apk', 24117248, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', true, now()),
    ('ADMIN', '1.0.0', 100, 100, false, 'AudiVox Admin 1.0.0 Management Suite', 'Initial native Android admin application with live license generator.', 'https://qbazzarqiplrqqfytajz.supabase.co/storage/v1/object/public/releases/audivox-admin-v1.0.0.apk', 21453824, '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a', true, now())
ON CONFLICT (app_target, version_code) DO NOTHING;

-- 5. Safe Development Prototype Licenses (Admin can generate unlimited more via UI/RPC)
INSERT INTO public.licenses (
    license_key, license_type, duration_seconds, is_lifetime, max_devices, is_active, notes
)
VALUES
    ('AVX-VIP9-8821-K992', 'VIP', 2592000, false, 2, true, 'VIP Monthly License (30 Days, 2 Devices)'),
    ('AVX-LIFE-9942-Z771', 'LIFETIME', 0, true, 3, true, 'AudiVox Lifetime Master License (3 Devices)'),
    ('AVX-PRO2-4100-M331', 'CUSTOM', 189020, false, 1, true, 'Custom: 2 Days, 4 Hours, 30 Mins, 20 Secs (1 Device)')
ON CONFLICT (license_key) DO NOTHING;
