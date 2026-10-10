import React, { useState, useRef } from 'react';
import {
  Music,
  Play,
  Square,
  Plus,
  Trash2,
  Globe,
  EyeOff,
  UploadCloud,
  Film,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Volume2,
} from 'lucide-react';
import { SoundItem } from '../types';
import { processMediaFile, processCoverImage, blobToDataUrl, ExtractedMedia } from '../utils/audioExtractor';

interface SoundLibraryViewProps {
  sounds: SoundItem[];
  onCreateSound: (sound: Omit<SoundItem, 'id' | 'created_at' | 'play_count'>) => Promise<SoundItem>;
  onTogglePublish: (soundId: string) => Promise<boolean>;
  onDeleteSound: (soundId: string) => Promise<boolean>;
}

export const SoundLibraryView: React.FC<SoundLibraryViewProps> = ({
  sounds,
  onCreateSound,
  onTogglePublish,
  onDeleteSound,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [playingSoundId, setPlayingSoundId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Sound Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Gaming FX');
  const [newTags, setNewTags] = useState('');
  const [customAudioUrl, setCustomAudioUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [detectedDurationMs, setDetectedDurationMs] = useState<number>(2500);
  const [detectedFormat, setDetectedFormat] = useState<string>('mp3');
  const [detectedSizeBytes, setDetectedSizeBytes] = useState<number>(64000);
  const [sourceType, setSourceType] = useState<'AUDIO' | 'VIDEO_EXTRACTED'>('AUDIO');

  // Processing state
  const [isProcessingMedia, setIsProcessingMedia] = useState(false);
  const [processingStatusText, setProcessingStatusText] = useState('');
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Modal preview player
  const [modalAudioPlaying, setModalAudioPlaying] = useState(false);
  const modalAudioRef = useRef<HTMLAudioElement | null>(null);

  // Main list player
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const categories = ['All', 'Gaming FX', 'Voice Lines', 'Memes & Fun', 'Anime & Battle', 'Custom Uploads'];

  const filteredSounds = sounds.filter(
    (s) => selectedCategory === 'All' || s.category_name === selectedCategory
  );

  const handlePlay = (sound: SoundItem) => {
    if (playingSoundId === sound.id) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setPlayingSoundId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(sound.audio_url);
      audioRef.current = audio;
      setPlayingSoundId(sound.id);
      audio.play().catch((err) => {
        console.error('Audio playback error:', err);
        setPlayingSoundId(null);
      });
      audio.onended = () => {
        setPlayingSoundId(null);
      };
    }
  };

  const handleMediaFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingMedia(true);
    setMediaError(null);
    const isVideo = file.type.startsWith('video/') || /\.(mp4|mkv|webm|mov|3gp)$/i.test(file.name);
    setProcessingStatusText(
      isVideo
        ? 'ভিডিও ফাইল থেকে অডিও ট্র্যাক এক্সট্র্যাক্ট করা হচ্ছে...'
        : 'অডিও ফাইল প্রসেসিং ও মেটাডাটা রিড করা হচ্ছে...'
    );

    try {
      const result: ExtractedMedia = await processMediaFile(file);
      
      // Convert audio blob to permanent data URL so it works offline & saves properly
      let finalAudioUrl = result.audioUrl;
      try {
        if (result.audioBlob.size < 8 * 1024 * 1024) {
          finalAudioUrl = await blobToDataUrl(result.audioBlob);
        }
      } catch (err) {
        console.warn('Failed to convert to data url, using object url:', err);
      }

      setCustomAudioUrl(finalAudioUrl);
      setDetectedDurationMs(result.durationMs);
      setDetectedFormat(result.format);
      setDetectedSizeBytes(result.fileSizeBytes);
      setSourceType(result.sourceType);

      if (!newTitle) {
        setNewTitle(result.suggestedTitle);
      }
      setProcessingStatusText(
        result.sourceType === 'VIDEO_EXTRACTED'
          ? '✓ ভিডিও থেকে সফলভাবে অডিও এক্সট্র্যাক্ট হয়েছে!'
          : '✓ অডিও ফাইল প্রস্তুত!'
      );
    } catch (err: any) {
      console.error('Media processing error:', err);
      setMediaError(`ফাইল প্রসেস করতে ব্যর্থ হয়েছে: ${err.message || 'অপরিচিত ত্রুটি'}`);
    } finally {
      setIsProcessingMedia(false);
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await processCoverImage(file);
      setCoverImageUrl(dataUrl);
    } catch (err) {
      console.error('Cover image error:', err);
    }
  };

  const toggleModalPreview = () => {
    if (!customAudioUrl) return;

    if (modalAudioPlaying) {
      if (modalAudioRef.current) {
        modalAudioRef.current.pause();
        modalAudioRef.current.currentTime = 0;
      }
      setModalAudioPlaying(false);
    } else {
      if (!modalAudioRef.current) {
        modalAudioRef.current = new Audio(customAudioUrl);
        modalAudioRef.current.onended = () => setModalAudioPlaying(false);
      } else {
        modalAudioRef.current.src = customAudioUrl;
      }
      modalAudioRef.current.play().then(() => {
        setModalAudioPlaying(true);
      }).catch((e) => {
        console.error('Preview error:', e);
        setModalAudioPlaying(false);
      });
    }
  };

  const handleAddSound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !customAudioUrl.trim()) {
      setMediaError('দয়া করে সাউন্ডের নাম দিন এবং অডিও/ভিডিও ফাইল নির্বাচন করুন');
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateSound({
        title: newTitle.trim(),
        category_name: newCategory,
        audio_url: customAudioUrl.trim(),
        cover_image_url: coverImageUrl || undefined,
        source_type: sourceType,
        duration_ms: detectedDurationMs,
        file_format: detectedFormat,
        file_size_bytes: detectedSizeBytes,
        tags: newTags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
        is_published: true,
      });

      // Cleanup
      if (modalAudioRef.current) {
        modalAudioRef.current.pause();
        modalAudioRef.current = null;
      }
      setShowAddModal(false);
      setNewTitle('');
      setCustomAudioUrl('');
      setCoverImageUrl(null);
      setNewTags('');
      setMediaError(null);
      setProcessingStatusText('');
    } catch (err: any) {
      setMediaError(`সাউন্ড সেভ করতে সমস্যা হয়েছে: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Music className="w-5 h-5" />
            </span>
            <span>সাউন্ড লাইব্রেরি ও অডিও ম্যানেজমেন্ট</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ডিভাইসের গ্যালারি থেকে সরাসরি অডিও বা ভিডিও সাউন্ড আপলোড · কভার ছবি · লাইভ অডিও প্লেয়ার
          </p>
        </div>
        <button
          onClick={() => {
            setMediaError(null);
            setProcessingStatusText('');
            setShowAddModal(true);
          }}
          className="px-4 py-2.5 text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 rounded-xl transition-all shadow-lg shadow-cyan-500/10 active:scale-95 flex items-center gap-2 whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>গ্যালারি থেকে সাউন্ড যুক্ত করুন</span>
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-900/70 backdrop-blur-md border border-slate-800/80 rounded-xl overflow-x-auto w-full sm:w-fit scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap shrink-0 ${
              selectedCategory === cat
                ? 'bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Sounds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSounds.map((sound) => {
          const isPlaying = playingSoundId === sound.id;
          return (
            <div
              key={sound.id}
              className={`p-4 rounded-2xl border transition-all relative overflow-hidden backdrop-blur-xl ${
                isPlaying
                  ? 'bg-slate-900/90 border-cyan-500/50 shadow-xl shadow-cyan-500/10'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/80 shadow-lg'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {/* Thumbnail / Cover Art */}
                  <div className="relative shrink-0">
                    {sound.cover_image_url ? (
                      <img
                        src={sound.cover_image_url}
                        alt={sound.title}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700/60 shadow-md"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 via-purple-500/10 to-slate-900 border border-slate-700/60 flex items-center justify-center text-cyan-400">
                        <Music className="w-5 h-5" />
                      </div>
                    )}

                    {/* Play/Stop Button overlay */}
                    <button
                      onClick={() => handlePlay(sound)}
                      title={isPlaying ? 'বন্ধ করুন' : 'প্লে করুন'}
                      className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        isPlaying
                          ? 'bg-cyan-400 text-slate-950 shadow-md scale-105'
                          : 'bg-slate-950/90 text-cyan-400 border border-cyan-500/30 hover:bg-cyan-400 hover:text-slate-950'
                      }`}
                    >
                      {isPlaying ? (
                        <Square className="w-2.5 h-2.5 fill-current" />
                      ) : (
                        <Play className="w-2.5 h-2.5 fill-current ml-0.5" />
                      )}
                    </button>
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">{sound.title}</h3>
                    <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span className="text-cyan-400 font-medium">{sound.category_name}</span>
                      <span>·</span>
                      <span className="font-mono tabular-nums">{(sound.duration_ms / 1000).toFixed(1)}s</span>
                      <span>·</span>
                      <span className="uppercase text-[10px] px-1.5 py-0.2 bg-slate-800 rounded text-slate-300 font-mono">
                        {sound.file_format || 'MP3'}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onTogglePublish(sound.id)}
                  title={sound.is_published ? 'আনপাবলিশ করুন' : 'পাবলিশ করুন'}
                  className="text-slate-500 hover:text-cyan-400 transition-colors p-1 shrink-0"
                >
                  {sound.is_published ? (
                    <Globe className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-600" />
                  )}
                </button>
              </div>

              {sound.tags && sound.tags.length > 0 && (
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400 font-mono flex-wrap">
                  {sound.tags.map((tag) => (
                    <span key={tag} className="px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-300">
                      #{tag}
                    </span>
                  ))}
                  {sound.source_type === 'VIDEO_EXTRACTED' && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      🎬 Video Track
                    </span>
                  )}
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className={sound.is_published ? 'text-emerald-400 font-medium flex items-center gap-1' : 'text-slate-500'}>
                  <span className={`w-1.5 h-1.5 rounded-full ${sound.is_published ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
                  {sound.is_published ? 'অ্যাপে প্রকাশিত (Live)' : 'খসড়া (Draft)'}
                </span>
                <button
                  onClick={() => onDeleteSound(sound.id)}
                  className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Sound Modal (Gallery Audio & Video Extractor with Cover Image) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
          <form
            onSubmit={handleAddSound}
            className="bg-slate-900 border border-slate-800/90 rounded-2xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl relative my-auto"
          >
            {/* Modal Title */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Music className="w-5 h-5 text-cyan-400" />
                <span>ডিভাইস থেকে নতুন সাউন্ড যুক্ত করুন</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  if (modalAudioRef.current) {
                    modalAudioRef.current.pause();
                    modalAudioRef.current = null;
                  }
                  setShowAddModal(false);
                }}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Media File Picker (Audio or Video) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ১. অডিও বা ভিডিও ফাইল নির্বাচন করুন (গ্যালারি / ডিভাইস):
              </label>

              <input
                ref={fileInputRef}
                type="file"
                accept="audio/*,video/*"
                onChange={handleMediaFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className={`p-4 rounded-xl border-2 border-dashed cursor-pointer transition-all text-center flex flex-col items-center justify-center gap-2 ${
                  customAudioUrl
                    ? 'border-emerald-500/50 bg-emerald-500/5 hover:bg-emerald-500/10'
                    : 'border-slate-700 bg-slate-950/60 hover:border-cyan-500/50 hover:bg-slate-950'
                }`}
              >
                {isProcessingMedia ? (
                  <div className="flex flex-col items-center py-2 text-cyan-400">
                    <Loader2 className="w-7 h-7 animate-spin mb-1" />
                    <span className="text-xs font-medium">{processingStatusText}</span>
                  </div>
                ) : customAudioUrl ? (
                  <div className="flex flex-col items-center py-1">
                    <CheckCircle2 className="w-7 h-7 text-emerald-400 mb-1" />
                    <span className="text-xs font-bold text-emerald-300">
                      ফাইল প্রস্তুত ({detectedFormat.toUpperCase()} · {(detectedDurationMs / 1000).toFixed(1)}s)
                    </span>
                    <span className="text-[11px] text-slate-400 mt-0.5">
                      অন্য ফাইল নির্বাচন করতে ক্লিক করুন
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 shadow-sm">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">গ্যালারি / ডিভাইস ফাইল ব্রাউজ করুন</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        অডিও (MP3, WAV, M4A, OGG) অথবা ভিডিও (MP4, MKV, WebM)
                      </p>
                    </div>
                    <span className="text-[10px] text-cyan-400/90 font-medium px-2 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/20">
                      ভিডিও দিলে স্বয়ংক্রিয়ভাবে অডিও নিষ্কাশন হবে
                    </span>
                  </>
                )}
              </div>

              {/* Status or Preview Button */}
              {customAudioUrl && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <Volume2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span className="text-xs text-slate-300 truncate font-mono">
                      {sourceType === 'VIDEO_EXTRACTED' ? 'ভিডিও এক্সট্র্যাক্ট অডিও' : 'অডিও ফাইল'} ({(detectedDurationMs / 1000).toFixed(1)}s)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={toggleModalPreview}
                    className="px-3 py-1 text-xs font-semibold rounded-md bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    {modalAudioPlaying ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
                    <span>{modalAudioPlaying ? 'থামান' : 'প্রিভিউ প্লে'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Cover Image Picker */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                ২. সাউন্ডের কভার ছবি (ঐচ্ছিক — গ্যালারি থেকে ছবি):
              </label>

              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />

              <div className="flex items-center gap-3">
                {coverImageUrl ? (
                  <div className="relative group shrink-0">
                    <img
                      src={coverImageUrl}
                      alt="Cover preview"
                      className="w-16 h-16 rounded-xl object-cover border border-cyan-500/50 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={() => setCoverImageUrl(null)}
                      className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shadow-md"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:border-cyan-500/40 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-2 transition-all"
                  >
                    <ImageIcon className="w-4 h-4 text-cyan-400" />
                    <span>গ্যালারি থেকে কভার ছবি নির্বাচন করুন</span>
                  </button>
                )}
                {coverImageUrl && (
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    ছবি পরিবর্তন করুন
                  </button>
                )}
              </div>
            </div>

            {/* Sound Name / Title */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ৩. সাউন্ডের নাম (Sound Title):
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="যেমন: Double Kill Sniper FX"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 transition-all font-medium"
              />
            </div>

            {/* Category Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">ক্যাটাগরি:</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Gaming FX">Gaming FX</option>
                  <option value="Voice Lines">Voice Lines</option>
                  <option value="Memes & Fun">Memes & Fun</option>
                  <option value="Anime & Battle">Anime & Battle</option>
                  <option value="Custom Uploads">Custom Uploads</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">ট্যাগসমূহ:</label>
                <input
                  type="text"
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  placeholder="kill, headshot, meme"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            {/* Error Display */}
            {mediaError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{mediaError}</span>
              </div>
            )}

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  if (modalAudioRef.current) {
                    modalAudioRef.current.pause();
                    modalAudioRef.current = null;
                  }
                  setShowAddModal(false);
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                বাতিল করুন
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !customAudioUrl || isProcessingMedia}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-cyan-300 hover:from-cyan-300 hover:to-cyan-200 transition-all shadow-lg shadow-cyan-500/15 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সাউন্ড সংরক্ষণ করুন'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
