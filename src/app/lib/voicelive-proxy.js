import {
  VoiceLiveClient,
  KnownServerEventType,
  KnownInputAudioFormat,
  KnownOutputAudioFormat,
  KnownModality,
  KnownTurnDetectionType,
} from '@azure/ai-voicelive';
import { AzureKeyCredential } from '@azure/core-auth';

export async function createVoiceLiveProxy(socket) {
  const credential = new AzureKeyCredential(process.env.AZURE_VOICELIVE_API_KEY_1);

  const client = new VoiceLiveClient(
    process.env.AZURE_VOICELIVE_ENDPOINT,        // no NEXT_PUBLIC_ prefix
    credential,
    { apiVersion: '2026-01-01-preview' }
  );

  const sessionConfig = {
    model: process.env.AZURE_VOICELIVE_MODEL,    // no NEXT_PUBLIC_ prefix
    modalities: [KnownModality.Text, KnownModality.Audio],
    input_audio_format: KnownInputAudioFormat.Pcm16,
    output_audio_format: KnownOutputAudioFormat.Pcm16,
    turn_detection: {
      type: KnownTurnDetectionType.AzureSemanticVad,
      end_of_utterance_detection: {
        model: 'semantic_detection_v1_multilingual',
      },
    },
    input_audio_echo_cancellation: { type: 'server_echo_cancellation' },
    input_audio_noise_reduction: { type: 'azure_deep_noise_suppression' },
  };

  let session;
  try {
    session = await client.startSession(sessionConfig, {
      agentConnectionString: process.env.AZURE_VOICELIVE_CONNECTION_STRING, // no NEXT_PUBLIC_
    });
  } catch (err) {
    console.error('Failed to start VoiceLive session:', err);
    socket.emit('voice_error', { message: 'Failed to connect to Azure VoiceLive' });
    socket.disconnect();
    return;
  }

  // ── Azure → browser ───────────────────────────────────────────────────────
  const subscription = session.subscribe({
    onSessionUpdated: (event) => {
      socket.emit('session_ready', { agentName: event.session?.agent?.name ?? 'Agent' });
    },
    onConversationItemInputAudioTranscriptionCompleted: (event) => {
      socket.emit('user_transcript', { text: event.transcript ?? '' });
    },
    onResponseAudioTranscriptDone: (event) => {
      socket.emit('agent_transcript', { text: event.transcript ?? '' });
    },
    onResponseAudioDelta: (event) => {
      socket.emit('audio_delta', { delta: event.delta });
    },
    onResponseAudioDone: () => {
      socket.emit('audio_done');
    },
    onInputAudioBufferSpeechStarted: () => {
      socket.emit('speech_started');
    },
    onInputAudioBufferSpeechStopped: () => {
      socket.emit('speech_stopped');
    },
    onError: (event) => {
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
    subscription?.unsubscribe?.();
    try {
      await session.disconnect();
    } catch (err) {
      console.error('Error disconnecting session:', err);
    }
  });
}