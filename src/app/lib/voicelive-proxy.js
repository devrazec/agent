import {
  VoiceLiveClient,
  KnownInputAudioFormat,
  KnownOutputAudioFormat,
  KnownModality,
  KnownTurnDetectionType,
} from '@azure/ai-voicelive';
import { AzureKeyCredential } from '@azure/core-auth';

export async function createVoiceLiveProxy(socket) {
  const credential = new AzureKeyCredential(process.env.AZURE_VOICELIVE_API_KEY_1);

  const client = new VoiceLiveClient(
    process.env.AZURE_VOICELIVE_ENDPOINT,
    credential,
  );

  // Session config uses camelCase property names — the SDK serialises them to
  // snake_case before sending to the service. Passing snake_case directly would
  // leave those fields undefined in the TypeScript model and they would be dropped.
  const sessionConfig = {
    model: process.env.AZURE_VOICELIVE_MODEL,
    modalities: [KnownModality.Text, KnownModality.Audio],
    inputAudioFormat: KnownInputAudioFormat.Pcm16,
    outputAudioFormat: KnownOutputAudioFormat.Pcm16,
    turnDetection: {
      type: KnownTurnDetectionType.AzureSemanticVad,
      endOfUtteranceDetection: {
        model: 'semantic_detection_v1_multilingual',
      },
    },
    inputAudioEchoCancellation: { type: 'server_echo_cancellation' },
    inputAudioNoiseReduction: { type: 'azure_deep_noise_suppression' },
  };

  let session;
  try {
    session = await client.startSession(sessionConfig);
  } catch (err) {
    console.error('Failed to start VoiceLive session:', err);
    socket.emit('voice_error', { message: 'Failed to connect to Azure VoiceLive' });
    socket.disconnect();
    return;
  }

  // ── Azure → browser ───────────────────────────────────────────────────────
  const subscription = session.subscribe({
    onSessionUpdated: async (event) => {
      socket.emit('session_ready', { agentName: event.session?.agent?.name ?? 'Agent' });
    },
    onConversationItemInputAudioTranscriptionCompleted: async (event) => {
      socket.emit('user_transcript', { text: event.transcript ?? '' });
    },
    onResponseAudioTranscriptDone: async (event) => {
      socket.emit('agent_transcript', { text: event.transcript ?? '' });
    },
    onResponseAudioDelta: async (event) => {
      socket.emit('audio_delta', { delta: event.delta });
    },
    onResponseAudioDone: async () => {
      socket.emit('audio_done');
    },
    onInputAudioBufferSpeechStarted: async () => {
      socket.emit('speech_started');
    },
    onInputAudioBufferSpeechStopped: async () => {
      socket.emit('speech_stopped');
    },
    onError: async (event) => {
      socket.emit('voice_error', { message: event.error?.message ?? 'Unknown error' });
    },
  });

  // ── Browser → Azure ───────────────────────────────────────────────────────
  socket.on('audio_chunk', async ({ audio }) => {
    try {
      await session.sendAudio(Buffer.from(audio, 'base64'));
    } catch (err) {
      console.error('Failed to forward audio chunk:', err);
    }
  });

  // ── Cleanup ───────────────────────────────────────────────────────────────
  socket.on('disconnect', async () => {
    // VoiceLiveSubscription exposes .close() for cleanup
    await subscription?.close?.();
    try {
      await session.disconnect();
    } catch (err) {
      console.error('Error disconnecting session:', err);
    }
  });
}
