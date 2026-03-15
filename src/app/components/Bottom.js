'use client';

import { useRouter, usePathname } from 'next/navigation';
import Paper from '@mui/material/Paper';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import HomeIcon from '@mui/icons-material/Home';
import MicIcon from '@mui/icons-material/Mic';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EditIcon from '@mui/icons-material/Edit';
import HeadphonesIcon from '@mui/icons-material/Headphones';

const navItems = [
  { label: 'Home', icon: <HomeIcon />, href: '/' },
  { label: 'Speak', icon: <MicIcon />, href: '/pages/Speak' },
  { label: 'Read', icon: <MenuBookIcon />, href: '/pages/Read' },
  { label: 'Write', icon: <EditIcon />, href: '/pages/Write' },
  { label: 'Listen', icon: <HeadphonesIcon />, href: '/pages/Listen' },
];

export default function Bottom() {
  const pathname = usePathname();
  const router = useRouter();
  const activeIndex = navItems.findIndex(({ href }) => href === pathname);

  return (
    <Paper
      sx={{
        display: { xs: 'block', md: 'none' },
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
      elevation={3}
    >
      <BottomNavigation
        showLabels
        value={activeIndex}
        onChange={(_, newValue) => router.push(navItems[newValue].href)}
      >
        {navItems.map(({ label, icon }) => (
          <BottomNavigationAction
            key={label}
            label={label}
            icon={icon}
            sx={{
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'primary.contrastText',
                '& .MuiSvgIcon-root': { color: 'primary.contrastText' },
              },
            }}
          />
        ))}
      </BottomNavigation>
    </Paper>
  );
}
