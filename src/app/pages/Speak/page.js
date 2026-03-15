'use client';

import { useState, useRef, useEffect, useContext } from 'react';
import { GlobalContext } from '../../context/GlobalContext';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Tooltip from '@mui/material/Tooltip';
import MicIcon from '@mui/icons-material/Mic';
import ReplayIcon from '@mui/icons-material/Replay';
import TranslateIcon from '@mui/icons-material/Translate';
import Top from '../../components/Top';
import Left from '../../components/Left';

const initialMessages = [
  {
    id: 1,
    role: 'assistant',
    text: "Ah, good morning, Alex. Please, have a seat. I'm eager to hear your vision for launching the 'ChronoSync' device.",
  },
];

export default function SpeakPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const { mobileDevice } = useContext(GlobalContext);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: Date.now(), role: 'user', text }]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    // Layout: row for desktop, column for mobile
    <Box sx={{ display: 'flex', flexDirection: mobileDevice ? 'column' : 'row', height: '100vh', minHeight: 0 }}>
      {/* Left panel for desktop */}
      {!mobileDevice && (
        <Left />
      )}
      {/* Main content area */}
      <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
        <Top />
        {/* Messages area */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            px: 2,
            py: 1,
            mt: { xs: '56px', sm: '64px' }, // Add margin top for AppBar height
          }}
        >
          {messages.map((msg) => (
            <Box
              key={msg.id}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                mb: 2,
              }}
            >
            {msg.role === 'assistant' && (
              <>
                <Paper
                  elevation={0}
                  sx={{
                    px: 2,
                    py: 1.5,
                    maxWidth: '75%',
                    borderRadius: 3,
                    backgroundColor: 'action.hover',
                  }}
                >
                  <Typography variant="body2">{msg.text}</Typography>
                </Paper>
                <Box sx={{ display: 'flex', flexDirection: 'column', ml: 1, mt: 0.5, gap: 0.5 }}>
                  <Tooltip title="Regenerate">
                    <IconButton size="small">
                      <ReplayIcon fontSize="small" />
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
            )}
          </Box>
        ))}
        <div ref={bottomRef} />
      </Box>

      {/* Input bar */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <TextField
          fullWidth
          size="small"
          placeholder="Aa"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{ '& .MuiOutlinedInput-root': { borderRadius: 6 } }}
        />
        <IconButton
          color="primary"
          onClick={handleSend}
          sx={{
            backgroundColor: 'primary.main',
            color: 'primary.contrastText',
            '&:hover': { backgroundColor: 'primary.dark' },
          }}
        >
          <MicIcon />
        </IconButton>
      </Box>
    </Box>
  );
}

