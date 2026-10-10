import React, { useState } from 'react';
import {
  Package,
  Terminal,
  Play,
  Download,
  ShieldCheck,
  AlertTriangle,
  Upload,
  CheckCircle2,
  FileCode,
  ExternalLink,
} from 'lucide-react';
import { AppRelease, BuildJob, AppTarget } from '../types';
import { downloadApkDirect } from '../utils/apkDownloader';

interface BuildReleaseCenterViewProps {
  releases: AppRelease[];
  buildJobs: BuildJob[];
  onTriggerBuild: (target: AppTarget, versionName: string, versionCode: number) => Promise<BuildJob>;
  onPublishRelease: (release: Omit<AppRelease, 'id' | 'created_at'>) => Promise<AppRelease>;
  onUpdatePolicy: (releaseId: string, isMandatory: boolean, minVersionCode: number) => Promise<boolean>;
}

export const BuildReleaseCenterView: React.FC<BuildReleaseCenterViewProps> = ({
  releases,
  buildJobs,
  onTriggerBuild,
  onPublishRelease,
  onUpdatePolicy,
}) => {
  const [selectedTarget, setSelectedTarget] = useState<AppTarget>('USER');
  const [versionName, setVersionName] = useState('1.1.0');
  const [versionCode, setVersionCode] = useState(110);
  const [selectedJob, setSelectedJob] = useState<BuildJob | null>(buildJobs[0] || null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Publish form
  const [publishTarget, setPublishTarget] = useState<AppTarget>('USER');
  const [pubVersionName, setPubVersionName] = useState('1.0.0');
  const [pubVersionCode, setPubVersionCode] = useState(100);
  const [pubMinVersionCode, setPubMinVersionCode] = useState(100);
  const [pubIsMandatory, setPubIsMandatory] = useState(false);
  const [pubTitle, setPubTitle] = useState('বাধ্যতামূলক আপডেট প্রয়োজন (Mandatory Update)');
  const [pubNotes, setPubNotes] = useState('নতুন ফ্লোটিং বাবল পারফরম্যান্স অপ্টিমাইজেশন ও বাগ ফিক্স।');
  const [pubUrl, setPubUrl] = useState(
    'https://qbazzarqiplrqqfytajz.supabase.co/storage/v1/object/public/releases/audivox-user-v1.0.0.apk'
  );
  const [pubSha256, setPubSha256] = useState(
    'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
  );

  const handleStartBuild = async () => {
    setIsBuilding(true);
    const job = await onTriggerBuild(selectedTarget, versionName, versionCode);
    setSelectedJob(job);
    setIsBuilding(false);
  };

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onPublishRelease({
      app_target: publishTarget,
      version_name: pubVersionName,
      version_code: pubVersionCode,
      min_supported_version_code: pubMinVersionCode,
      is_mandatory_update: pubIsMandatory,
      update_title: pubTitle,
      update_notes: pubNotes,
      apk_download_url: pubUrl,
      apk_file_size_bytes: 24117248,
      apk_sha256: pubSha256,
      is_published: true,
    });
    setShowPublishModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">APK বিল্ড ও রিলিজ কন্ট্রোল সেন্টার</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            GitHub Actions সিআই/সিডি ওয়ার্কফ্লো · ক্রিপ্টোগ্রাফিক SHA-256 চেকার · বাধ্যতামূলক আপডেট পলিসি
          </p>
        </div>
        <button
          onClick={() => setShowPublishModal(true)}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <Upload className="w-4 h-4" />
          <span>নতুন APK রিলিজ প্রকাশ করুন</span>
        </button>
      </div>

      {/* Direct Instant Download Cards for User & Admin APK (No redirect, instant save) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">AudiVox User APK</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-semibold">v1.0.0</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">গেমিং সাউন্ডবোর্ড, ফ্লোটিং বাবল ও অডিও মিক্সার</p>
          </div>
          <button
            onClick={() => downloadApkDirect('USER', '1.0.0')}
            className="px-4 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-2 shrink-0 shadow-lg shadow-cyan-400/20 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>সরাসরি ডাউনলোড</span>
          </button>
        </div>

        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-purple-950/40 border border-purple-500/30 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">AudiVox Admin APK</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-semibold">v1.0.0</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">মোবাইল এডমিন ড্যাশবোর্ড ও লাইসেন্স জেনারেটর</p>
          </div>
          <button
            onClick={() => downloadApkDirect('ADMIN', '1.0.0')}
            className="px-4 py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-bold rounded-lg text-xs flex items-center gap-2 shrink-0 shadow-lg shadow-purple-500/20 active:scale-95 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>সরাসরি ডাউনলোড</span>
          </button>
        </div>
      </div>

      {/* Build Launcher Section */}
      <div className="p-5 rounded-xl border border-slate-800 bg-slate-900/80 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Play className="w-4 h-4 text-cyan-400" />
            <span>অ্যান্ড্রয়েড APK বিল্ড ওয়ার্কফ্লো ট্রিগার</span>
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Target Directory: <code className="text-cyan-300">android-{selectedTarget.toLowerCase()}/</code>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">টার্গেট অ্যাপ:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedTarget('USER')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                  selectedTarget === 'USER'
                    ? 'bg-cyan-500/10 border-cyan-500 text-cyan-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                User App (APK)
              </button>
              <button
                type="button"
                onClick={() => setSelectedTarget('ADMIN')}
                className={`py-2 px-3 text-xs font-medium rounded-lg border transition-all ${
                  selectedTarget === 'ADMIN'
                    ? 'bg-purple-500/10 border-purple-500 text-purple-400'
                    : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                Admin App (APK)
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">সংস্করণ নাম (Version Name):</label>
            <input
              type="text"
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-slate-300 block mb-1">ভার্সন কোড (Version Code):</label>
            <input
              type="number"
              value={versionCode}
              onChange={(e) => setVersionCode(parseInt(e.target.value) || 100)}
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <button
              onClick={handleStartBuild}
              disabled={isBuilding}
              className="w-full py-2 px-4 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors shadow-sm disabled:opacity-50"
            >
              {isBuilding ? 'বিল্ড শুরু হচ্ছে...' : 'Gradle assembleRelease চালান'}
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Build Console / Terminal */}
      {selectedJob && (
        <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden font-mono text-xs">
          <div className="bg-slate-900/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span className="text-white font-medium">
                বিল্ড কনসোল: AudiVox {selectedJob.app_target} v{selectedJob.version_name} ({selectedJob.id})
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span>Status: <strong className={selectedJob.status === 'SUCCESS' ? 'text-emerald-400' : 'text-cyan-400'}>{selectedJob.status}</strong></span>
              <span className="text-slate-500 tabular-nums">{new Date(selectedJob.started_at).toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="p-4 space-y-1.5 max-h-60 overflow-y-auto text-slate-300 bg-black/60">
            {selectedJob.build_logs.map((log, idx) => (
              <div key={idx} className="leading-relaxed">
                <span className="text-slate-500 select-none mr-2">&gt;</span>
                <span className={log.includes('SUCCESS') ? 'text-emerald-400 font-semibold' : log.includes('SHA-256') ? 'text-cyan-300' : 'text-slate-300'}>
                  {log}
                </span>
              </div>
            ))}
          </div>

          {selectedJob.artifact_url && (
            <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
              <div className="truncate pr-4">
                <span className="text-slate-400">রিলিজ আর্টফ্যাক্ট: </span>
                <span className="text-cyan-400 font-semibold truncate">{selectedJob.artifact_url}</span>
              </div>
              <button
                onClick={() => downloadApkDirect(selectedJob.app_target, selectedJob.version_name)}
                className="px-4 py-1.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 shadow-md shadow-cyan-400/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>সরাসরি APK ডাউনলোড (Direct Download)</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Published Releases & Mandatory Update Policies Table */}
      <div className="space-y-3">
        <h2 className="text-base font-semibold text-white">প্রকাশিত APK রিলিজ ও আপডেট নীতিসমূহ</h2>
        <div className="rounded-xl border border-slate-800/80 bg-slate-900/60 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono">
                <tr>
                  <th className="py-3 px-4 font-medium">অ্যাপ টার্গেট</th>
                  <th className="py-3 px-4 font-medium">ভার্সন</th>
                  <th className="py-3 px-4 font-medium">ন্যূনতম সমর্থিত কোড</th>
                  <th className="py-3 px-4 font-medium">বাধ্যতামূলক পলিসি</th>
                  <th className="py-3 px-4 font-medium">SHA-256 ক্রিপ্টোগ্রাফিক চেকার</th>
                  <th className="py-3 px-4 font-medium text-right">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {releases.map((rel) => (
                  <tr key={rel.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-white">
                      AudiVox {rel.app_target}
                    </td>
                    <td className="py-3 px-4 font-mono">
                      v{rel.version_name} ({rel.version_code})
                    </td>
                    <td className="py-3 px-4 font-mono tabular-nums">
                      Code {rel.min_supported_version_code}
                    </td>
                    <td className="py-3 px-4">
                      {rel.is_mandatory_update ? (
                        <span className="text-rose-400 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>বাধ্যতামূলক (Mandatory)</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">ঐচ্ছিক (Optional)</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 truncate max-w-xs" title={rel.apk_sha256}>
                      {rel.apk_sha256}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => onUpdatePolicy(rel.id, !rel.is_mandatory_update, rel.min_supported_version_code)}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          rel.is_mandatory_update
                            ? 'bg-slate-800 text-slate-300 hover:text-white'
                            : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                        }`}
                      >
                        {rel.is_mandatory_update ? 'বাধ্যতামূলক বাতিল' : 'বাধ্যতামূলক করুন'}
                      </button>
                      <button
                        onClick={() => downloadApkDirect(rel.app_target, rel.version_name)}
                        className="px-3 py-1 rounded text-xs font-semibold bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors inline-flex items-center gap-1 shadow-sm active:scale-95"
                      >
                        <Download className="w-3 h-3" />
                        <span>সরাসরি ডাউনলোড</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <form
            onSubmit={handlePublishSubmit}
            className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4"
          >
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-cyan-400" />
              <span>নতুন APK রিলিজ প্রকাশনা ফর্ম</span>
            </h3>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">টার্গেট:</label>
                <select
                  value={publishTarget}
                  onChange={(e) => setPublishTarget(e.target.value as AppTarget)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-xs text-white"
                >
                  <option value="USER">User App</option>
                  <option value="ADMIN">Admin App</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1">ভার্সন নাম:</label>
                <input
                  type="text"
                  required
                  value={pubVersionName}
                  onChange={(e) => setPubVersionName(e.target.value)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-xs text-slate-300 block mb-1">ভার্সন কোড:</label>
                <input
                  type="number"
                  required
                  value={pubVersionCode}
                  onChange={(e) => setPubVersionCode(parseInt(e.target.value) || 100)}
                  className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">APK ডাউনলোড লিঙ্ক (HTTPS Storage URL):</label>
              <input
                type="url"
                required
                value={pubUrl}
                onChange={(e) => setPubUrl(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">ক্রিপ্টোগ্রাফিক SHA-256 চেকার হ্যাশ:</label>
              <input
                type="text"
                required
                value={pubSha256}
                onChange={(e) => setPubSha256(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-xs text-white font-mono"
              />
            </div>

            <div className="p-3 bg-slate-950 rounded border border-slate-800 space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={pubIsMandatory}
                  onChange={(e) => setPubIsMandatory(e.target.checked)}
                  className="rounded text-cyan-400 bg-slate-900 border-slate-700"
                />
                <span className="text-xs font-semibold text-rose-400">
                  বাধ্যতামূলক আপডেট হিসেবে সেট করুন (Enforce Mandatory Policy)
                </span>
              </label>
              <p className="text-[11px] text-slate-400">
                এর ফলে ইউজার অ্যাপে &ldquo;পরে করবো&rdquo; এবং &ldquo;আপডেট করুন&rdquo; নোটিশ প্রদর্শিত হবে এবং আপডেট ছাড়া অ্যাপ চালানো যাবে না।
              </p>
            </div>

            <div>
              <label className="text-xs text-slate-300 block mb-1">রিলিজ নোটস (Changelog):</label>
              <textarea
                value={pubNotes}
                onChange={(e) => setPubNotes(e.target.value)}
                className="w-full p-2 bg-slate-950 border border-slate-800 rounded text-xs text-white min-h-[60px]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                বাতিল করুন
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300"
              >
                পাবলিশ করুন
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
