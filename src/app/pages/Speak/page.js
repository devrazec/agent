'use client';

import { useState, useRef, useEffect, useContext, useCallback } from 'react';
import { GlobalContext } from '../../context/GlobalContext';
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

export default function SpeakPage() {
  const [input, setInput] = useState('');

  const bottomRef = useRef(null);

  const { mobileDevice } = useContext(GlobalContext);

  const initialMessages = [
    {
      id: 1,
      role: 'assistant',
      text: "Ah, good morning, Alex. Please, have a seat. I'm eager to hear your vision for launching the 'ChronoSync' device.",
    },
    {
      id: 2,
      role: 'user',
      text: "Ah, good morning, Alex. Please, have a seat. I'm eager to hear your vision for launching the 'ChronoSync' device.",
    },
    {
      id: 3,
      role: 'assistant',
      text: "Ah, good morning, Alex. Please, have a seat. I'm eager to hear your vision for launching the 'ChronoSync' device.",
    },
    {
      id: 4,
      role: 'assistant',
      text: "Ah, good morning, Alex. Please, have a seat. I'm eager to hear your vision for launching the 'ChronoSync' device.",
    },
    {
      id: 5,
      role: 'user',
      text: "Ah, good morning, Alex. Please, have a seat. I'm eager to hear your vision for launching the 'ChronoSync' device.",
    },
    {
      id: 6,
      role: 'assistant',
      text: "Ah, good morning, Alex. Please, have a seat. I'm eager to hear your vision for launching the 'ChronoSync' device.",
    },
    {
      id: 7,
      role: 'user',
      text: "Ah, good morning, Alex. Please, have a seat. I'm eager to hear your vision for launching the 'ChronoSync' device.",
    },
    {
      id: 8,
      role: 'user',
      text: "Ah, good morning, Alex. Please, have a seat. I'm eager to hear your vision for launching the 'ChronoSync' device.",
    },
    {
      id: 9,
      role: 'assistant',
      text: "Ah, good morning, Alex. Please, have a seat. I'm eager to hear your vision for launching the 'ChronoSync' device.",
    },
  ];
  const [messages, setMessages] = useState(initialMessages);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    const newMessage = { id: Date.now(), role: 'user', text };
    setMessages((prev) => [...prev, newMessage]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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

            return (
              <Box
                key={msg.id}
                sx={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  mb: 2,
                }}
              >
                {msg.role !== 'user' && (
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

                {msg.role === 'user' && (
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
          <Tooltip title={isConnected ? 'End session' : 'Start session'}>
            <span>
              <IconButton
                color={isConnected ? 'error' : 'primary'}
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
                {isConnected ? <MicOffIcon /> : <MicIcon />}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
    </Layout>
  );
}