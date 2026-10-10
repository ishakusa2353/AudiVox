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
