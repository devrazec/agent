'use client';

import { useState, useRef, useEffect, useContext } from 'react';
import { GlobalContext } from '../../context/GlobalContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TranslateIcon from '@mui/icons-material/Translate';
import StopIcon from '@mui/icons-material/Stop';
import Layout from '../../components/Layout';

const BOTTOM_NAV_HEIGHT = 56;

function WaveformAnimation() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: '3px', height: 24 }}>
      {[...Array(9)].map((_, i) => (
        <Box
          key={i}
          sx={{
            width: 3,
            borderRadius: 1,
            bgcolor: 'text.secondary',
            animation: `waveBar 0.8s ease-in-out ${(i * 0.09).toFixed(2)}s infinite alternate`,
            '@keyframes waveBar': {
              '0%': { height: '4px' },
              '100%': { height: '20px' },
            },
          }}
        />
      ))}
    </Box>
  );
}

function encodeWAV(audioBuffer) {
  const sampleRate = audioBuffer.sampleRate;
  const samples = audioBuffer.getChannelData(0);
  const dataLength = samples.length * 2;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);
  const writeStr = (off, str) => {
    for (let i = 0; i < str.length; i++) view.setUint8(off + i, str.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataLength, true);
  let offset = 44;
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    offset += 2;
  }
  return new Blob([buffer], { type: 'audio/wav' });
}

export default function SpeakPage() {
  const bottomRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const { mobileDevice } = useContext(GlobalContext);

  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      text: "Ah, good morning, Alex. Please, have a seat. I'm eager to hear your vision for launching the 'ChronoSync' device.",
    },
  ]);
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mediaRecorder.mimeType });
        await sendAudio(blob);
      };
      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'system', text: 'Microphone access denied.' },
      ]);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const sendAudio = async (rawBlob) => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
    const referenceText = lastAssistant?.text ?? '';
    setIsLoading(true);
    try {
      const arrayBuffer = await rawBlob.arrayBuffer();
      const audioCtx = new AudioContext();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      audioCtx.close();
      const wavBlob = encodeWAV(audioBuffer);

      const formData = new FormData();
      formData.append('audio', wavBlob, 'recording.wav');
      formData.append('referenceText', referenceText);
      formData.append('scripted', 'true');

      const res = await fetch('/api/speak', { method: 'POST', body: formData });
      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), role: 'system', text: data.error || 'Get result failed!' },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), role: 'user', text: data.recognized_text, scores: data },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'system', text: 'Get result failed!' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* ── Messages area ── */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            p: 3,
            pb: { xs: `${BOTTOM_NAV_HEIGHT + 24}px`, md: 3 },
          }}
        >
          {messages.map((msg) => {
            if (msg.role === 'system') {
              return (
                <Box key={msg.id} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Box
                    component="img"
                    src="/img/avatar.jpg"
                    alt="avatar"
                    sx={{ width: 40, height: 40, borderRadius: '50%', mr: 1.5, flexShrink: 0, objectFit: 'cover' }}
                  />
                  <Paper elevation={0} sx={{ px: 2, py: 1.5, borderRadius: 3, bgcolor: 'action.hover' }}>
                    <Typography variant="body2" color="error.main">{msg.text}</Typography>
                  </Paper>
                </Box>
              );
            }

            if (msg.role === 'assistant') {
              return (
                <Box key={msg.id} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Box
                    component="img"
                    src="/img/avatar.jpg"
                    alt="avatar"
                    sx={{ width: 40, height: 40, borderRadius: '50%', mr: 1.5, flexShrink: 0, objectFit: 'cover' }}
                  />
                  <Paper
                    elevation={0}
                    sx={{ px: 2, py: 1.5, borderRadius: 3, bgcolor: 'action.hover', flexGrow: 1 }}
                  >
                    <Typography variant="body2">{msg.text}</Typography>
                  </Paper>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: mobileDevice ? 'column' : 'row',
                      ml: 1,
                      mt: 0.5,
                      gap: 0.5,
                    }}
                  >
                    <Tooltip title="Play">
                      <IconButton size="small"><PlayArrowIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Translate">
                      <IconButton size="small"><TranslateIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              );
            }

            if (msg.role === 'user') {
              return (
                <Box key={msg.id} sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: mobileDevice ? 'column' : 'row',
                      mr: 1,
                      mt: 0.5,
                      gap: 0.5,
                    }}
                  >
                    <Tooltip title="Play">
                      <IconButton size="small"><PlayArrowIcon fontSize="small" /></IconButton>
                    </Tooltip>
                    <Tooltip title="Translate">
                      <IconButton size="small"><TranslateIcon fontSize="small" /></IconButton>
                    </Tooltip>
                  </Box>
                  <Paper
                    elevation={0}
                    sx={{
                      px: 2,
                      py: 1.5,
                      maxWidth: '75%',
                      borderRadius: 3,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                    }}
                  >
                    <Typography variant="body2">{msg.text}</Typography>
                  </Paper>
                </Box>
              );
            }

            return null;
          })}
          <div ref={bottomRef} />
        </Box>

        {/* ── Bottom bar ── */}
        <Box
          sx={{
            px: 3,
            py: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          {isRecording ? (
            <Paper
              elevation={3}
              sx={{
                px: 3,
                py: 2,
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1.5,
                minWidth: 280,
              }}
            >
              <IconButton
                onClick={stopRecording}
                sx={{
                  bgcolor: 'error.main',
                  color: 'white',
                  width: 48,
                  height: 48,
                  '&:hover': { bgcolor: 'error.dark' },
                }}
              >
                <StopIcon />
              </IconButton>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <WaveformAnimation />
                <Typography variant="body2" color="text.secondary">
                  Recording... stop talking to send
                </Typography>
              </Box>
            </Paper>
          ) : (
            <Button
              variant="outlined"
              onClick={startRecording}
              disabled={isLoading}
              sx={{ borderRadius: 6, textTransform: 'none' }}
            >
              {isLoading ? 'Processing…' : 'Assess my response'}
            </Button>
          )}
        </Box>
      </Box>
    </Layout>
  );
}