export class BrowserAudioProcessor {
  constructor(onAudioChunk) {
    this.onAudioChunk = onAudioChunk;
    this.audioContext = null;
    this.mediaStream = null;
    this.scriptProcessor = null;
    // Scheduled playback — tracks the next available start time in the AudioContext timeline
    this._nextPlayTime = 0;
  }

  async startCapture() {
    this.audioContext = new AudioContext({ sampleRate: 24000 });
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: { sampleRate: 24000, channelCount: 1, echoCancellation: true },
    });

    const source = this.audioContext.createMediaStreamSource(this.mediaStream);
    this.scriptProcessor = this.audioContext.createScriptProcessor(1024, 1, 1);

    this.scriptProcessor.onaudioprocess = (e) => {
      const float32 = e.inputBuffer.getChannelData(0);
      const pcm16 = float32ToPcm16(float32);
      const base64 = arrayBufferToBase64(pcm16.buffer);
      this.onAudioChunk(base64);
    };

    source.connect(this.scriptProcessor);
    this.scriptProcessor.connect(this.audioContext.destination);
  }

  /**
   * Queues a base64-encoded PCM16 audio chunk for gapless playback using the
   * Web Audio API's scheduled-start mechanism. Each buffer is started exactly
   * when the previous one ends, eliminating the gaps introduced by awaiting
   * Promise-based sequential playback.
   */
  queueAudio(base64) {
    if (!this.audioContext) return;

    const pcm = base64ToArrayBuffer(base64);
    const audioBuffer = pcm16ToAudioBuffer(pcm, this.audioContext);

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(this.audioContext.destination);

    const now = this.audioContext.currentTime;
    // If the schedule has fallen behind real time, reset to now
    if (this._nextPlayTime < now) this._nextPlayTime = now;

    source.start(this._nextPlayTime);
    this._nextPlayTime += audioBuffer.duration;
  }

  clearPlaybackQueue() {
    // Reset the schedule baseline; the next queued chunk will use AudioContext.currentTime
    // as the start point (see the `if (_nextPlayTime < now)` guard in queueAudio).
    this._nextPlayTime = 0;
  }

  stop() {
    this.scriptProcessor?.disconnect();
    this.mediaStream?.getTracks().forEach((t) => t.stop());
    this.audioContext?.close();
    this.audioContext = null;
    this._nextPlayTime = 0;
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function float32ToPcm16(float32) {
  const pcm = new Int16Array(float32.length);
  for (let i = 0; i < float32.length; i++) {
    const s = Math.max(-1, Math.min(1, float32[i]));
    pcm[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return pcm;
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function base64ToArrayBuffer(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

function pcm16ToAudioBuffer(pcm, ctx) {
  const int16 = new Int16Array(pcm);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) float32[i] = int16[i] / 32768;
  const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
  audioBuffer.copyToChannel(float32, 0);
  return audioBuffer;
}
