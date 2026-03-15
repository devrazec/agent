'use client';

import { useContext } from 'react';
import { GlobalContext } from '../context/GlobalContext';
import Image from 'next/image';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { SignInButton, SignUpButton, UserButton, useAuth } from '@clerk/nextjs';

export default function Top() {
  const { darkMode, setDarkMode } = useContext(GlobalContext);

  const { isSignedIn } = useAuth();

  return (
    <AppBar
      position="fixed"
      sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
    >
      <Toolbar>
        {/* <IconButton color="inherit" edge="start" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton> */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
          <Image src="/logo.png" alt="Logo" width={42} height={42} style={{ objectFit: 'contain' }} />
        </Box>
        <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
          Fluentor
        </Typography>
        {/* <IconButton color="inherit">
          <NotificationsIcon />
        </IconButton> */}
        {!isSignedIn ? (
              <SignInButton mode="modal">
                <Button
                  variant="contained"
                  size="small"
                  // startIcon={<Login variant="Bulk" size={18} />}
                  sx={{
                    bgcolor: '#00A76F',
                    color: '#fff',
                    fontWeight: 700,
                    borderRadius: '0.2rem',
                    textTransform: 'none',
                    px: 2,
                    boxShadow: 'none',
                    '&:hover': { bgcolor: '#007867', boxShadow: 'none' },
                  }}
                >
                  Login
                </Button>
              </SignInButton>
            ) : (
              <UserButton />
            )}
        <IconButton color="inherit" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
        
      </Toolbar>
    </AppBar>
  );
}
