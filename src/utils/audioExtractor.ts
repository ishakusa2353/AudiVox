/**
 * AudiVox Audio & Media Extractor
 * - Handles Audio files (MP3, WAV, OGG, M4A, AAC, FLAC)
 * - Handles Video files (MP4, MKV, WebM, MOV, 3GP) and extracts the audio track as a lossless WAV Blob
 * - Handles Sound Cover Image upload & thumbnail generation
 */

export interface ExtractedMedia {
  audioBlob: Blob;
  audioUrl: string;
  durationMs: number;
  format: string;
  fileSizeBytes: number;
  suggestedTitle: string;
  sourceType: 'AUDIO' | 'VIDEO_EXTRACTED';
}

/**
 * Extracts audio from any user-selected audio or video file from device gallery / storage.
 */
export async function processMediaFile(file: File): Promise<ExtractedMedia> {
  const isVideo = file.type.startsWith('video/') || /\.(mp4|mkv|webm|mov|3gp|avi|m4v)$/i.test(file.name);
  const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');

  if (isVideo) {
    // Decode audio track from video file using Web Audio API
    return await extractAudioFromVideo(file, cleanTitle);
  } else {
    // Process audio file directly
    return await processAudioFile(file, cleanTitle);
  }
}

/**
 * Decodes the audio track from a video file into a WAV PCM Blob.
 */
async function extractAudioFromVideo(file: File, suggestedTitle: string): Promise<ExtractedMedia> {
  const arrayBuffer = await file.arrayBuffer();
  const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  const audioContext = new AudioContextClass();

  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const durationMs = Math.round(audioBuffer.duration * 1000);
    const wavBlob = audioBufferToWav(audioBuffer);
    const audioUrl = URL.createObjectURL(wavBlob);

    return {
      audioBlob: wavBlob,
      audioUrl,
      durationMs,
      format: 'wav',
      fileSizeBytes: wavBlob.size,
      suggestedTitle,
      sourceType: 'VIDEO_EXTRACTED',
    };
  } finally {
    if (audioContext.state !== 'closed') {
      audioContext.close().catch(() => {});
    }
  }
}

/**
 * Reads standard audio file and determines duration & metadata.
 */
async function processAudioFile(file: File, suggestedTitle: string): Promise<ExtractedMedia> {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'mp3';
  const audioUrl = URL.createObjectURL(file);

  // Measure duration using Audio element
  const durationMs = await new Promise<number>((resolve) => {
    const audio = new Audio();
    audio.src = audioUrl;
    audio.onloadedmetadata = () => {
      resolve(Math.round((audio.duration || 2.5) * 1000));
    };
    audio.onerror = () => {
      resolve(3000); // Fallback 3s
    };
  });

  return {
    audioBlob: file,
    audioUrl,
    durationMs,
    format: ext,
    fileSizeBytes: file.size,
    suggestedTitle,
    sourceType: 'AUDIO',
  };
}

/**
 * Encodes an AudioBuffer into standard 16-bit PCM WAV Blob
 */
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = Math.min(buffer.numberOfChannels, 2);
  const sampleRate = buffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const length = buffer.length * blockAlign;
  const arrayBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(arrayBuffer);

  // RIFF identifier
  writeString(view, 0, 'RIFF');
  // RIFF chunk length
  view.setUint32(4, 36 + length, true);
  // RIFF type
  writeString(view, 8, 'WAVE');
  // format chunk identifier
  writeString(view, 12, 'fmt ');
  // format chunk length
  view.setUint32(16, 16, true);
  // sample format (1 = PCM)
  view.setUint16(20, format, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, sampleRate * blockAlign, true);
  // block align
  view.setUint16(32, blockAlign, true);
  // bits per sample
  view.setUint16(34, bitDepth, true);
  // data chunk identifier
  writeString(view, 36, 'data');
  // data chunk length
  view.setUint32(40, length, true);

  // Interleave channels & write 16-bit PCM samples
  let offset = 44;
  const channels: Float32Array[] = [];
  for (let i = 0; i < numChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  for (let i = 0; i < buffer.length; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      let sample = channels[ch][i];
      sample = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }
  }

  return new Blob([arrayBuffer], { type: 'audio/wav' });
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Resizes and converts user uploaded cover image to lightweight Data URL thumbnail
 */
export async function processCoverImage(file: File, maxDim = 320): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Converts a Blob to a Base64 data URL
 */
export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Generates an in-memory, self-contained 16-bit PCM WAV Data URL for gaming sounds.
 * Guarantees 100% instant, reliable playback with no network/CORS dependency.
 */
export function createSynthWavDataUrl(
  soundType: 'headshot' | 'victory' | 'rush' | 'sad' | 'power'
): string {
  const sampleRate = 22050;
  let duration = 0.5;
  if (soundType === 'victory') duration = 1.0;
  else if (soundType === 'sad') duration = 1.2;
  else if (soundType === 'power') duration = 0.9;
  else if (soundType === 'rush') duration = 0.6;
  else duration = 0.45;

  const numSamples = Math.floor(sampleRate * duration);
  const buffer = new Int16Array(numSamples);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    let sample = 0;

    if (soundType === 'headshot') {
      const freq = 1100 * Math.exp(-t * 14) + 90;
      const env = Math.exp(-t * 11);
      const noise = (Math.random() * 2 - 1) * Math.exp(-t * 22) * 0.35;
      sample = (Math.sin(2 * Math.PI * freq * t) * 0.65 + noise) * env;
    } else if (soundType === 'victory') {
      let freq = 523.25; // C5
      if (t > 0.22) freq = 659.25; // E5
      if (t > 0.45) freq = 783.99; // G5
      if (t > 0.68) freq = 1046.5; // C6
      const env = Math.max(0, 1 - ((t % 0.22) / 0.22) * 0.85);
      sample = (Math.sin(2 * Math.PI * freq * t) * 0.5 + Math.sin(4 * Math.PI * freq * t) * 0.2) * env;
    } else if (soundType === 'rush') {
      const step = Math.floor(t / 0.14);
      const subT = t - step * 0.14;
      const freq = 880 + (step % 3) * 180;
      const env = Math.exp(-subT * 14);
      sample = (Math.sin(2 * Math.PI * freq * t) > 0 ? 0.4 : -0.4) * env;
    } else if (soundType === 'sad') {
      let freq = 311.13; // Eb4
      if (t > 0.28) freq = 293.66; // D4
      if (t > 0.56) freq = 277.18; // Db4
      if (t > 0.84) freq = 261.63 * Math.max(0.7, 1 - (t - 0.84) * 0.5); // C4 pitch bend down
      const env = Math.max(0, 1 - ((t % 0.28) / 0.28) * 0.55);
      sample = Math.sin(2 * Math.PI * freq * t) * 0.55 * env;
    } else {
      // power surge
      const freq = 120 + Math.pow(t / duration, 2) * 650;
      const vibrato = Math.sin(2 * Math.PI * 16 * t) * 25;
      const env = Math.min(1, t * 4) * Math.max(0, 1 - t / duration);
      sample = (Math.sin(2 * Math.PI * (freq + vibrato) * t) * 0.5 + Math.sin(2 * Math.PI * freq * 0.5 * t) * 0.25) * env;
    }

    sample = Math.max(-1, Math.min(1, sample));
    buffer[i] = sample < 0 ? sample * 32768 : sample * 32767;
  }

  // Create standard WAV header
  const byteRate = sampleRate * 2;
  const blockAlign = 2;
  const dataSize = numSamples * 2;
  const header = new ArrayBuffer(44);
  const v = new DataView(header);
  v.setUint32(0, 0x52494646, false); // RIFF
  v.setUint32(4, 36 + dataSize, true);
  v.setUint32(8, 0x57415645, false); // WAVE
  v.setUint32(12, 0x666d7420, false); // fmt
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); // PCM
  v.setUint16(22, 1, true); // Mono
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, byteRate, true);
  v.setUint16(32, blockAlign, true);
  v.setUint16(34, 16, true); // 16 bit
  v.setUint32(36, 0x64617461, false); // data
  v.setUint32(40, dataSize, true);

  const bytes = new Uint8Array(44 + dataSize);
  bytes.set(new Uint8Array(header), 0);
  bytes.set(new Uint8Array(buffer.buffer), 44);

  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return 'data:audio/wav;base64,' + btoa(binary);
}

/**
 * Web Audio API synthesizer for instant gaming audio playback.
 * Guaranteed to play even if remote media fails, is offline, or lacks CORS headers.
 */
export function playSynthesizedGameSound(categoryOrTitle: string, onEnded?: () => void): () => void {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) {
      if (onEnded) onEnded();
      return () => {};
    }

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    const lower = (categoryOrTitle || '').toLowerCase();

    if (
      lower.includes('headshot') ||
      lower.includes('sniper') ||
      lower.includes('impact') ||
      lower.includes('kill')
    ) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1100, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.35);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.36);

      setTimeout(() => {
        try { ctx.close(); } catch (e) {}
        if (onEnded) onEnded();
      }, 380);

      return () => {
        try { osc.stop(); ctx.close(); } catch (e) {}
      };
    } else if (lower.includes('victory') || lower.includes('win') || lower.includes('fanfare')) {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.3, now);
      masterGain.connect(ctx.destination);

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.15);

        gain.gain.setValueAtTime(0, now + idx * 0.15);
        gain.gain.linearRampToValueAtTime(0.35, now + idx * 0.15 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.15 + 0.65);

        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now + idx * 0.15);
        osc.stop(now + idx * 0.15 + 0.7);
      });

      setTimeout(() => {
        try { ctx.close(); } catch (e) {}
        if (onEnded) onEnded();
      }, 1300);

      return () => {
        try { ctx.close(); } catch (e) {}
      };
    } else if (lower.includes('rush') || lower.includes('squad') || lower.includes('voice')) {
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.35, now);
      masterGain.connect(ctx.destination);

      [0, 0.18, 0.36].forEach((delay, i) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(880 + i * 140, now + delay);
        g.gain.setValueAtTime(0.25, now + delay);
        g.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.12);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(now + delay);
        osc.stop(now + delay + 0.13);
      });

      setTimeout(() => {
        try { ctx.close(); } catch (e) {}
        if (onEnded) onEnded();
      }, 750);

      return () => {
        try { ctx.close(); } catch (e) {}
      };
    } else if (
      lower.includes('sad') ||
      lower.includes('fail') ||
      lower.includes('trombone') ||
      lower.includes('meme')
    ) {
      const freqs = [311.13, 293.66, 277.18, 261.63];
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.3, now);
      masterGain.connect(ctx.destination);

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now + idx * 0.32);
        if (idx === 3) {
          osc.frequency.linearRampToValueAtTime(freq * 0.85, now + idx * 0.32 + 0.5);
        }

        g.gain.setValueAtTime(0.25, now + idx * 0.32);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.32 + (idx === 3 ? 0.6 : 0.3));

        osc.connect(g);
        g.connect(masterGain);
        osc.start(now + idx * 0.32);
        osc.stop(now + idx * 0.32 + (idx === 3 ? 0.65 : 0.31));
      });

      setTimeout(() => {
        try { ctx.close(); } catch (e) {}
        if (onEnded) onEnded();
      }, 1800);

      return () => {
        try { ctx.close(); } catch (e) {}
      };
    } else {
      // Power surge / Anime Aura
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(850, now + 0.7);

      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.45);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.85);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.86);

      setTimeout(() => {
        try { ctx.close(); } catch (e) {}
        if (onEnded) onEnded();
      }, 950);

      return () => {
        try { osc.stop(); ctx.close(); } catch (e) {}
      };
    }
  } catch (err) {
    if (onEnded) onEnded();
    return () => {};
  }
}

