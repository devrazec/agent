export class BrowserAudioProcessor {
  constructor(onAudioChunk) {
    this.onAudioChunk = onAudioChunk;
    this.audioContext = null;
    this.mediaStream = null;
    this.scriptProcessor = null;
    this.playbackQueue = [];
    this.isPlaying = false;
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

  async queueAudio(base64) {
    if (!this.audioContext) return;
    const pcm = base64ToArrayBuffer(base64);
    const audioBuffer = pcm16ToAudioBuffer(pcm, this.audioContext);
    this.playbackQueue.push(audioBuffer);
    if (!this.isPlaying) this.drainQueue();
  }

  async drainQueue() {
    if (!this.audioContext) return;
    this.isPlaying = true;
    while (this.playbackQueue.length > 0) {
      const buffer = this.playbackQueue.shift();
      await playBuffer(this.audioContext, buffer);
    }
    this.isPlaying = false;
  }

  clearPlaybackQueue() {
    this.playbackQueue = [];
  }

  stop() {
    this.scriptProcessor?.disconnect();
    this.mediaStream?.getTracks().forEach((t) => t.stop());
    this.audioContext?.close();
    this.audioContext = null;
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
  let binary = "";
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

function playBuffer(ctx, buffer) {
  return new Promise((resolve) => {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.onended = resolve;
    source.start();
  });
}