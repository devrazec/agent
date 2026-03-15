import { SignIn } from '@clerk/nextjs';
import { Box } from '@mui/material';

export default function SignInPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(135deg, #C8FAD6 0%, #f0fdf4 50%, #FFFFFF 100%)',
      }}
    >
      <SignIn fallbackRedirectUrl="/" signUpUrl="/sign-up" />
    </Box>
  );
}
