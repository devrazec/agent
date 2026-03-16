'use client';

import { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { io } from 'socket.io-client';
import { GlobalContext } from '../../context/GlobalContext';
import { BrowserAudioProcessor } from '../../lib/audio-processor';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import Chip from '@mui/material/Chip';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TranslateIcon from '@mui/icons-material/Translate';
import Layout from '../../components/Layout';

const BOTTOM_NAV_HEIGHT = 56;

const STATUS_CONFIG = {
  idle:       { label: 'Idle',        color: 'default'   },
  connecting: { label: 'Connecting…', color: 'warning'   },
  ready:      { label: 'Ready',       color: 'success'   },
  listening:  { label: 'Listening',   color: 'info'      },
  thinking:   { label: 'Thinking…',   color: 'warning'   },
  speaking:   { label: 'Speaking',    color: 'secondary' },
  error:      { label: 'Error',       color: 'error'     },
};

export default function SpeakPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);

  const bottomRef = useRef(null);
  const socketRef = useRef(null);
  const audioRef = useRef(null);

  const { mobileDevice } = useContext(GlobalContext);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      audioRef.current?.stop();
    };
  }, []);

  const addMessage = useCallback((role, text) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role, text }]);
  }, []);

  const connectSession = useCallback(async () => {
    // Guard against duplicate connections
    if (socketRef.current?.connected) return;

    setStatus('connecting');
    setError(null);

    const res = await fetch('/api/voice-token');
    const { token } = await res.json();

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

    const socket = io(socketUrl, {
      path: '/api/voice',
      auth: { token },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket.io connected');
    });

    socket.on('connect_error', (err) => {
      setError(err.message);
      setStatus('error');
      socketRef.current?.disconnect();
      socketRef.current = null;
    });

    socket.on('disconnect', () => {
      setStatus('idle');
      setError(null);
      audioRef.current?.stop();
      audioRef.current = null;
    });

    socket.on('session_ready', async ({ agentName }) => {
      setStatus('ready');
      addMessage('system', `Connected to agent: ${agentName}`);
      audioRef.current = new BrowserAudioProcessor((base64) => {
        socket.emit('audio_chunk', { audio: base64 });
      });
      await audioRef.current.startCapture();
    });

    socket.on('speech_started', () => {
      setStatus('listening');
      audioRef.current?.clearPlaybackQueue();
    });

    socket.on('speech_stopped', () => setStatus('thinking'));

    socket.on('user_transcript', ({ text }) => addMessage('user', text));

    socket.on('agent_transcript', ({ text }) => addMessage('assistant', text));

    // Synchronous — let queueAudio handle async internally
    socket.on('audio_delta', ({ delta }) => {
      setStatus('speaking');
      audioRef.current?.queueAudio(delta);
    });

    socket.on('audio_done', () => setStatus('ready'));

    socket.on('voice_error', ({ message }) => {
      setError(message);
      setStatus('error');
    });
  }, [addMessage]);

  const disconnectSession = useCallback(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    audioRef.current?.stop();
    audioRef.current = null;
    setStatus('idle');
    setError(null);
  }, []);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    addMessage('user', text);
    socketRef.current?.emit('text_input', { text });
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isConnected = status !== 'idle' && status !== 'error';
  const isConnecting = status === 'connecting';
  const { label: statusLabel, color: statusColor } = STATUS_CONFIG[status];

  return (
    <Layout>
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

        {/* ── Status bar ── */}
        <Box
          sx={{
            px: 3,
            py: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Chip label={statusLabel} color={statusColor} size="small" />
          {error && (
            <Typography variant="caption" color="error">
              {error}
            </Typography>
          )}
        </Box>

        {/* ── Messages area ── */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            p: 3,
            pb: { xs: `${BOTTOM_NAV_HEIGHT + 24}px`, md: 3 },
          }}
        >
          {messages.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ textAlign: 'center', mt: 10 }}
            >
              Press the mic button to start a session
            </Typography>
          )}

          {messages.map((msg) => {
            if (msg.role === 'system') {
              return (
                <Typography
                  key={msg.id}
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', textAlign: 'center', mb: 2 }}
                >
                  {msg.text}
                </Typography>
              );
            }

            const isUser = msg.role === 'user';
            return (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: isUser ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                {!isUser && (
                  <>
                    <Paper
                      elevation={0}
                      sx={{
                        px: 2,
                        py: 1.5,
                        flexGrow: 1,
                        borderRadius: 3,
                        backgroundColor: 'action.hover',
                      }}
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
                        <IconButton size="small">
                          <PlayArrowIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Translate">
                        <IconButton size="small">
                          <TranslateIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </>
                )}

                {isUser && (
                  <>
                    <Paper
                      elevation={0}
                      sx={{
                        px: 2,
                        py: 1.5,
                        maxWidth: '75%',
                        borderRadius: 3,
                        backgroundColor: 'primary.main',
                        color: 'primary.contrastText',
                      }}
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
                        <IconButton size="small">
                          <PlayArrowIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Translate">
                        <IconButton size="small">
                          <TranslateIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </>
                )}
              </Box>
            );
          })}
          <div ref={bottomRef} />
        </Box>

        {/* ── Input bar ── */}
        <Box
          sx={{
            px: 3,
            py: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            borderTop: '1px solid',
            borderColor: 'divider',
            flexShrink: 0,
          }}
        >
          <TextField
            fullWidth
            size="small"
            placeholder="Aa"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!isConnected}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 6 } }}
          />
          <Tooltip title={isConnecting ? 'Connecting…' : isConnected ? 'End session' : 'Start session'}>
            <span>
              <IconButton
                disabled={isConnecting}
                color={isConnected ? 'error' : 'primary'}
                onClick={isConnected ? disconnectSession : connectSession}
                sx={{
                  backgroundColor: isConnected ? 'error.main' : 'primary.main',
                  color: 'primary.contrastText',
                  '&:hover': {
                    backgroundColor: isConnected ? 'error.dark' : 'primary.dark',
                  },
                  '&.Mui-disabled': {
                    backgroundColor: 'action.disabledBackground',
                  },
                }}
              >
                {isConnecting
                  ? <MicIcon sx={{ opacity: 0.5 }} />
                  : isConnected
                    ? <MicOffIcon />
                    : <MicIcon />
                }
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
    </Layout>
  );
}