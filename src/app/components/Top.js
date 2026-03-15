'use client';

import Image from 'next/image';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Box from '@mui/material/Box';

export default function Top() {
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
        <IconButton color="inherit" edge="end">
          <AccountCircleIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
