'use client';

import Link from 'next/link';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import HomeIcon from '@mui/icons-material/Home';
import MicIcon from '@mui/icons-material/Mic';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import EditIcon from '@mui/icons-material/Edit';
import HeadphonesIcon from '@mui/icons-material/Headphones';

const DRAWER_WIDTH = 240;

const mainNavItems = [
    { text: 'Home', icon: <HomeIcon />, href: '/' },
    { text: 'Speak', icon: <MicIcon />, href: '/pages/Speak' },
    { text: 'Read', icon: <MenuBookIcon />, href: '/pages/Read' },
    { text: 'Write', icon: <EditIcon />, href: '/pages/Write' },
    { text: 'Listen', icon: <HeadphonesIcon />, href: '/pages/Listen' },
];

export default function Left() {
    return (
        <Drawer
            variant="permanent"
            sx={{
                display: { xs: 'none', md: 'block' },
                width: DRAWER_WIDTH,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width: DRAWER_WIDTH,
                    boxSizing: 'border-box',
                },
            }}
        >
            <Toolbar />
            <List>
                {mainNavItems.map(({ text, icon, href }) => (
                    <ListItem key={text} disablePadding>
                        <ListItemButton component={Link} href={href}>
                            <ListItemIcon>{icon}</ListItemIcon>
                            <ListItemText primary={text} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
            
        </Drawer>
    );
}
