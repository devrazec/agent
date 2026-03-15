'use client';

import { useContext } from 'react';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  const { isSignedIn } = useAuth();

  // Map route to page title
  const getPageTitle = (path) => {
    if (path === '/') return 'Home';
    if (path === '/Speak') return 'Speak';
    if (path === '/Profile') return 'Profile';
    if (path === '/Settings') return 'Settings';
    // Add more mappings as needed
    // Remove leading slash and capitalize
    return path.replace('/', '').replace(/^[a-z]/, (m) => m.toUpperCase()) || 'Fluentor';
  };
  const pageTitle = getPageTitle(pathname);

  return (
    <AppBar
      position="fixed"

      sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            // bgcolor: darkMode ? '#121212' : '#ffffff',
            
            backgroundColor: '#00a76f1f',
            backdropFilter: 'blur(4px)',
            borderBottom: '1px solid', borderColor: 'divider'
      
          }}

    >
      <Toolbar>
        {/* <IconButton color="inherit" edge="start" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton> */}
        <Box sx={{ display: 'flex', alignItems: 'center', mr: 1 }}>
          <Image src="/logo.png" alt="Logo" width={42} height={42} style={{ objectFit: 'contain' }} />
        </Box>
        <Typography variant="h6" fontWeight={700} noWrap component="div" sx={{ color: darkMode ? '#ffffff' : '#121212', flexGrow: 1 }}>
          {pageTitle}
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
        <IconButton color="primary" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
        </IconButton>
        
      </Toolbar>
    </AppBar>
  );
}
