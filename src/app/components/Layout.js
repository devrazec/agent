'use client';

import Box from '@mui/material/Box';
import Top from './Top';
import Left from './Left';
import Content from './Content';
import Bottom from './Bottom';

export default function Layout({ children }) {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Top />
      <Left />
      <Content>{children}</Content>
      <Bottom />
    </Box>
  );
}
