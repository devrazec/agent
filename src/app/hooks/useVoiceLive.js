'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { AzureKeyCredential } from '@azure/core-auth';
import { VoiceLiveClient } from '@azure/ai-voicelive';

/** Encodes Float32 PCM samples to a 16-bit signed PCM ArrayBuffer. */
function float32ToPcm16(float32Array) {
  const pcm16 = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const clamped = Math.max(-1, Math.min(1, float32Array[i]));
    pcm16[i] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
  }
  return pcm16.buffer;
}

/** Decodes a base64-encoded PCM16 chunk to a Float32Array suitable for Web Audio. */
function decodePcm16Chunk(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const int16 = new Int16Array(bytes.buffer);
  const float32 = new Float32Array(int16.length);
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / (int16[i] < 0 ? 0x8000 : 0x7fff);
  }
  return float32;
}

export const CONNECTION_STATE = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  DISCONNECTING: 'disconnecting',
};

/**
 * React hook that manages an Azure VoiceLive session including microphone
 * capture, real-time audio streaming, and assistant audio playback.
 *
 * @param {Object} options
 * @param {string} options.instructions  – System prompt for the AI assistant
 * @param {string} options.voice        – Azure Neural voice name (e.g. "en-US-AvaNeural")
 * @param {Function} options.onMessage  – Callback fired for each new chat message
 */
export function useVoiceLive({ instructions, voice, onMessage } = {}) {
  const [connectionState, setConnectionState] = useState(CONNECTION_STATE.DISCONNECTED);
  const [error, setError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const sessionRef = useRef(null);
  const subscriptionRef = useRef(null);

  // Audio recording
  const audioContextRef = useRef(null);
  const processorRef = useRef(null);
  const micStreamRef = useRef(null);

  // Audio playback queue
  const playbackContextRef = useRef(null);
  const playbackQueueRef = useRef([]);
  const isPlayingRef = useRef(false);
  const nextPlayTimeRef = useRef(0);

  const SAMPLE_RATE = 16000;
  const SCRIPT_PROCESSOR_SIZE = 4096;

  // ── Audio playback ──────────────────────────────────────────────────────────

  const getPlaybackContext = useCallback(() => {
    if (!playbackContextRef.current || playbackContextRef.current.state === 'closed') {
      playbackContextRef.current = new AudioContext({ sampleRate: SAMPLE_RATE });
    }
    return playbackContextRef.current;
  }, []);

  const scheduleAudioChunk = useCallback(
    (float32Data) => {
      const ctx = getPlaybackContext();
      const buffer = ctx.createBuffer(1, float32Data.length, SAMPLE_RATE);
      buffer.copyToChannel(float32Data, 0);

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);

      const now = ctx.currentTime;
      if (nextPlayTimeRef.current < now) nextPlayTimeRef.current = now;
      source.start(nextPlayTimeRef.current);
      nextPlayTimeRef.current += buffer.duration;
    },
    [getPlaybackContext]
  );

  // ── Start recording from microphone ────────────────────────────────────────

  const startMicrophone = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    micStreamRef.current = stream;

    const ctx = new AudioContext({ sampleRate: SAMPLE_RATE });
    audioContextRef.current = ctx;

    const source = ctx.createMediaStreamSource(stream);
    // ScriptProcessor is deprecated but widely supported; AudioWorklet is the
    // modern alternative – keep it simple here.
    const processor = ctx.createScriptProcessor(SCRIPT_PROCESSOR_SIZE, 1, 1);
    processorRef.current = processor;

    processor.onaudioprocess = (e) => {
      if (!sessionRef.current) return;
      const float32 = e.inputBuffer.getChannelData(0);
      const pcm16Buffer = float32ToPcm16(float32);
      sessionRef.current.sendAudio(pcm16Buffer).catch(() => {});
    };

    source.connect(processor);
    processor.connect(ctx.destination);
  }, []);

  const stopMicrophone = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach((t) => t.stop());
      micStreamRef.current = null;
    }
  }, []);

  // ── Connect / Disconnect ────────────────────────────────────────────────────

  const connect = useCallback(
    async ({ voice: voiceOverride, instructions: instructionsOverride } = {}) => {
      try {
        setError(null);
        setConnectionState(CONNECTION_STATE.CONNECTING);

        // Fetch credentials from the secure server-side token endpoint
        const tokenRes = await fetch('/api/voicelive/token');
        if (!tokenRes.ok) {
          const body = await tokenRes.json().catch(() => ({}));
          throw new Error(body.error || `Failed to fetch VoiceLive token (${tokenRes.status})`);
        }
        const { apiKey, endpoint, model } = await tokenRes.json();

        const credential = new AzureKeyCredential(apiKey);
        const client = new VoiceLiveClient(endpoint, credential);

        const usedVoice = voiceOverride || voice || 'en-US-AvaNeural';
        const usedInstructions =
          instructionsOverride ||
          instructions ||
          'You are a helpful language learning assistant. Speak clearly and naturally.';

        const session = await client.startSession({
          model,
          modalities: ['text', 'audio'],
          instructions: usedInstructions,
          voice: { type: 'azure-standard', name: usedVoice },
          turnDetection: {
            type: 'server_vad',
            threshold: 0.5,
            prefixPaddingMs: 300,
            silenceDurationMs: 500,
          },
          inputAudioFormat: 'pcm16',
          outputAudioFormat: 'pcm16',
          inputAudioTranscription: { model: 'whisper-1' },
        });

        sessionRef.current = session;

        // ── Subscribe to events ──────────────────────────────────────────────
        const sub = session.subscribe({
          onConnected: async () => {
            setConnectionState(CONNECTION_STATE.CONNECTED);
          },

          onDisconnected: async () => {
            setConnectionState(CONNECTION_STATE.DISCONNECTED);
            stopMicrophone();
          },

          onError: async ({ error: err }) => {
            setError(err?.message || 'VoiceLive connection error');
            setConnectionState(CONNECTION_STATE.DISCONNECTED);
            stopMicrophone();
          },

          onInputAudioBufferSpeechStarted: async () => {
            // User started speaking – clear any scheduled assistant playback
            nextPlayTimeRef.current = 0;
          },

          onInputAudioTranscriptionCompleted: async (event) => {
            if (event.transcript?.trim()) {
              onMessage?.({ id: Date.now(), role: 'user', text: event.transcript.trim() });
            }
          },

          onResponseAudioDelta: async (event) => {
            if (event.delta) {
              setIsSpeaking(true);
              const float32 = decodePcm16Chunk(event.delta);
              scheduleAudioChunk(float32);
            }
          },

          onResponseAudioDone: async () => {
            setIsSpeaking(false);
          },

          onResponseAudioTranscriptDelta: async () => {
            // Partial transcript – not shown in chat until done
          },

          onResponseAudioTranscriptDone: async (event) => {
            if (event.transcript?.trim()) {
              onMessage?.({ id: Date.now(), role: 'assistant', text: event.transcript.trim() });
            }
          },

          onServerError: async (event) => {
            setError(event.error?.message || 'Server error from VoiceLive service');
          },
        });

        subscriptionRef.current = sub;

        // Start capturing microphone after session is ready
        await startMicrophone();
        setConnectionState(CONNECTION_STATE.CONNECTED);
      } catch (err) {
        setError(err.message || 'Failed to connect');
        setConnectionState(CONNECTION_STATE.DISCONNECTED);
        stopMicrophone();
      }
    },
    [voice, instructions, onMessage, startMicrophone, stopMicrophone, scheduleAudioChunk]
  );

  const disconnect = useCallback(async () => {
    setConnectionState(CONNECTION_STATE.DISCONNECTING);

    stopMicrophone();

    if (subscriptionRef.current) {
      subscriptionRef.current.stop?.();
      subscriptionRef.current = null;
    }

    if (sessionRef.current) {
      await sessionRef.current.disconnect().catch(() => {});
      sessionRef.current = null;
    }

    if (playbackContextRef.current) {
      await playbackContextRef.current.close().catch(() => {});
      playbackContextRef.current = null;
    }

    nextPlayTimeRef.current = 0;
    setIsSpeaking(false);
    setConnectionState(CONNECTION_STATE.DISCONNECTED);
  }, [stopMicrophone]);

  // Disconnect on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.disconnect().catch(() => {});
      }
      stopMicrophone();
    };
  }, [stopMicrophone]);

  return {
    connectionState,
    isConnected: connectionState === CONNECTION_STATE.CONNECTED,
    isConnecting: connectionState === CONNECTION_STATE.CONNECTING,
    isDisconnecting: connectionState === CONNECTION_STATE.DISCONNECTING,
    isSpeaking,
    error,
    connect,
    disconnect,
  };
}
