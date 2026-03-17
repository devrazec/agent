'use client';

import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

const BOTTOM_NAV_HEIGHT = 56;

export default function Content({ children }) {
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <Toolbar sx={{ flexShrink: 0 }} />
      {children ? (
        <Box sx={{ flexGrow: 1, minHeight: 0 }}>
          {children}
        </Box>
      ) : (
        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            p: 3,
            pb: { xs: `${BOTTOM_NAV_HEIGHT + 24}px`, md: 3 },
          }}
        >
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Dashboard
          </Typography>
          <Grid container spacing={3}>
            {['Overview', 'Activity', 'Reports', 'Tasks'].map((title) => (
              <Grid key={title} size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper sx={{ p: 3, borderRadius: 2 }} elevation={1}>
                  <Typography variant="subtitle1" fontWeight={500}>
                    {title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Content for {title.toLowerCase()} goes here.
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
}
