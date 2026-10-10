import React, { useState, useRef } from 'react';
import { Music, Play, Square, Plus, Trash2, Globe, EyeOff, Volume2 } from 'lucide-react';
import { SoundItem } from '../types';

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

  // New Sound Form
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Gaming FX');
  const [newUrl, setNewUrl] = useState('');
  const [newTags, setNewTags] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const categories = ['All', 'Gaming FX', 'Voice Lines', 'Memes & Fun', 'Anime & Battle'];

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

  const handleAddSound = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newUrl.trim()) return;

    setIsSubmitting(true);
    await onCreateSound({
      title: newTitle.trim(),
      category_name: newCategory,
      audio_url: newUrl.trim(),
      duration_ms: 2500,
      file_format: 'mp3',
      file_size_bytes: 64000,
      tags: newTags.split(',').map((t) => t.trim()).filter(Boolean),
      is_published: true,
    });
    setIsSubmitting(false);
    setShowAddModal(false);
    setNewTitle('');
    setNewUrl('');
    setNewTags('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">সাউন্ড লাইব্রেরি ও অডিও ম্যানেজমেন্ট</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            গেমিং সাউন্ড ইফেক্ট ক্যাটাগরি · পাবলিশ/আনপাবলিশ কন্ট্রোল · অডিও প্রিভিউ প্লেয়ার
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন সাউন্ড আপলোড করুন</span>
        </button>
      </div>

      {/* Category Pills (Interactive filter controls) */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-lg overflow-x-auto w-fit">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === cat
                ? 'bg-slate-800 text-cyan-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
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
              className={`p-4 rounded-xl border transition-all ${
                isPlaying
                  ? 'bg-slate-900 border-cyan-500/50 shadow-lg shadow-cyan-500/5'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePlay(sound)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center transition-all ${
                      isPlaying
                        ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/20'
                        : 'bg-slate-800 text-cyan-400 hover:bg-slate-700'
                    }`}
                  >
                    {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                  </button>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{sound.title}</h3>
                    <div className="text-xs text-slate-400 mt-0.5">
                      <span>{sound.category_name}</span>
                      <span className="mx-1.5">·</span>
                      <span className="font-mono tabular-nums">{(sound.duration_ms / 1000).toFixed(1)}s</span>
                      <span className="mx-1.5">·</span>
                      <span className="font-mono tabular-nums">{sound.play_count.toLocaleString()} plays</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => onTogglePublish(sound.id)}
                  title={sound.is_published ? 'আনপাবলিশ করুন' : 'পাবলিশ করুন'}
                  className="text-slate-500 hover:text-cyan-400 transition-colors p-1"
                >
                  {sound.is_published ? (
                    <Globe className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-600" />
                  )}
                </button>
              </div>

              {sound.tags.length > 0 && (
                <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
                  {sound.tags.map((tag) => (
                    <span key={tag}>#{tag}</span>
                  ))}
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                <span className={sound.is_published ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                  {sound.is_published ? 'অ্যাপে প্রকাশিত (Live)' : 'খসড়া (Draft)'}
                </span>
                <button
                  onClick={() => onDeleteSound(sound.id)}
                  className="text-slate-500 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Sound Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <form
            onSubmit={handleAddSound}
            className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 space-y-4"
          >
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Music className="w-5 h-5 text-cyan-400" />
              <span>সাউন্ড লাইব্রেরিতে নতুন অডিও যোগ করুন</span>
            </h3>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">সাউন্ডের নাম (Title):</label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="যেমন: Double Kill Voice Line"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">ক্যাটাগরি:</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
              >
                <option value="Gaming FX">Gaming FX</option>
                <option value="Voice Lines">Voice Lines</option>
                <option value="Memes & Fun">Memes & Fun</option>
                <option value="Anime & Battle">Anime & Battle</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">অডিও ফাইল URL (MP3/WAV/OGG):</label>
              <input
                type="url"
                required
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://.../audio.mp3"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">ট্যাগসমূহ (কমা দিয়ে পৃথক করুন):</label>
              <input
                type="text"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                placeholder="kill, sniper, victory"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white"
              >
                বাতিল করুন
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-lg text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 transition-colors"
              >
                {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
