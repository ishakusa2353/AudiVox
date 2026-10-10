export type LicenseType = 'TIMED' | 'VIP' | 'PRO' | 'LIFETIME' | 'CUSTOM';

export type AppTarget = 'USER' | 'ADMIN';

export type BuildStatus = 'QUEUED' | 'BUILDING' | 'SUCCESS' | 'FAILED';

export interface UserProfile {
  id: string;
  profile_id: string; // 8-digit server code
  full_name: string;
  phone_number: string;
  is_admin: boolean;
  is_suspended: boolean;
  suspension_reason?: string;
  created_at: string;
  updated_at: string;
  // joined info
  active_license_key?: string;
  license_type?: LicenseType;
  license_expires_at?: string;
  is_lifetime?: boolean;
  device_count?: number;
}

export interface License {
  id: string;
  license_key: string;
  license_type: LicenseType;
  duration_seconds: number;
  is_lifetime: boolean;
  max_devices: number;
  is_active: boolean;
  is_suspended: boolean;
  is_revoked: boolean;
  revocation_reason?: string;
  notes?: string;
  created_at: string;
  // activation details
  assigned_to_name?: string;
  assigned_to_phone?: string;
  activated_at?: string;
  expires_at?: string;
  active_devices?: number;
}

export interface DeviceRecord {
  id: string;
  profile_id: string;
  user_name: string;
  user_phone: string;
  license_key: string;
  device_fingerprint: string;
  device_model: string;
  os_version: string;
  app_version: string;
  is_revoked: boolean;
  registered_at: string;
  last_active_at: string;
}

export interface SoundItem {
  id: string;
  category_id?: string;
  category_name?: string;
  title: string;
  description?: string;
  audio_url: string;
  cover_image_url?: string;
  source_type?: 'AUDIO' | 'VIDEO_EXTRACTED';
  duration_ms: number;
  file_format: string;
  file_size_bytes: number;
  tags: string[];
  is_published: boolean;
  play_count: number;
  created_at: string;
}

export interface AppRelease {
  id: string;
  app_target: AppTarget;
  version_name: string;
  version_code: number;
  min_supported_version_code: number;
  is_mandatory_update: boolean;
  update_title: string;
  update_notes: string;
  apk_download_url: string;
  apk_file_size_bytes: number;
  apk_sha256: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details: Record<string, any>;
  ip_address?: string;
  created_at: string;
}

export interface BuildJob {
  id: string;
  app_target: AppTarget;
  branch: string;
  commit_sha: string;
  status: BuildStatus;
  version_name: string;
  version_code: number;
  artifact_url?: string;
  artifact_sha256?: string;
  build_logs: string[];
  started_at: string;
  completed_at?: string;
}

export interface MaintenanceConfig {
  is_enabled: boolean;
  message: string;
  updated_at: string;
}
