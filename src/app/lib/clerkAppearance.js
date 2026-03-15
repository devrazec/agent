/**
 * Shared Clerk appearance config — matches the Fluentor MUI theme palette.
 * Primary: #00A76F  |  Background light: #F4F6F8  |  Text: #1C252E
 */

export const clerkAppearance = {
  theme: 'simple',
  variables: {
    colorPrimary: '#00A76F',
    colorPrimaryHover: '#007867',
    colorText: '#1C252E',
    colorTextSecondary: '#637381',
    colorTextOnPrimaryBackground: '#FFFFFF',
    colorBackground: '#FFFFFF',
    colorInputBackground: '#F9FAFB',
    colorInputText: '#1C252E',
    colorDanger: '#FF5630',
    colorSuccess: '#22C55E',
    colorWarning: '#FFAB00',
    borderRadius: '0.225rem',
    fontFamily: 'inherit',
    fontSize: '0.9rem',
    spacingUnit: '1rem',
  },
  elements: {
    /* ── Card ── */
    card: {
      boxShadow:
        '0 0 2px 0 rgba(145 158 171 / 0.2), 0 12px 24px -4px rgba(145 158 171 / 0.12)',
      border: '1px solid #F4F6F8',
      borderRadius: '1rem',
      padding: '2rem',
    },

    /* ── Header ── */
    headerTitle: {
      color: '#1C252E',
      fontWeight: 700,
    },
    headerSubtitle: {
      color: '#637381',
    },
    logoImage: {
      filter: 'none',
    },

    /* ── Primary button ── */
    formButtonPrimary: {
      backgroundColor: '#00A76F',
      color: '#FFFFFF',
      fontWeight: 600,
      borderRadius: '0.2rem',
      boxShadow: 'none',
      '&:hover': { backgroundColor: '#007867' },
      '&:focus': { backgroundColor: '#007867', outline: '2px solid #5BE49B' },
      '&:active': { backgroundColor: '#007867' },
    },

    /* ── Social / OAuth buttons ── */
    socialButtonsBlockButton: {
      border: '1px solid #DFE3E8',
      borderRadius: '0.2rem',
      color: '#1C252E',
      '&:hover': { backgroundColor: '#F4F6F8', borderColor: '#C4CDD5' },
    },
    socialButtonsBlockButtonText: {
      fontWeight: 600,
    },

    /* ── Divider ── */
    dividerLine: { backgroundColor: '#DFE3E8' },
    dividerText: { color: '#919EAB' },

    /* ── Inputs ── */
    formFieldInput: {
      border: '1px solid #DFE3E8',
      borderRadius: '0.2rem',
      backgroundColor: '#F9FAFB',
      color: '#1C252E',
      '&:focus': {
        borderColor: '#00A76F',
        boxShadow: '0 0 0 2px rgba(0, 167, 111, 0.2)',
      },
    },
    formFieldLabel: {
      color: '#1C252E',
      fontWeight: 600,
    },
    formFieldHintText: { color: '#919EAB' },
    formFieldErrorText: { color: '#FF5630' },

    /* ── Links ── */
    footerActionLink: {
      color: '#00A76F',
      fontWeight: 600,
      '&:hover': { color: '#007867' },
    },
    identityPreviewEditButton: {
      color: '#00A76F',
      '&:hover': { color: '#007867' },
    },
    formResendCodeLink: {
      color: '#00A76F',
      '&:hover': { color: '#007867' },
    },
    otpCodeFieldInput: {
      border: '1px solid #DFE3E8',
      borderRadius: '0.5rem',
      '&:focus': { borderColor: '#00A76F' },
    },

    /* ── Footer ── */
    footer: { color: '#637381' },
    footerActionText: { color: '#637381' },

    /* ── Badge / tag ── */
    badge: {
      backgroundColor: '#C8FAD6',
      color: '#007867',
    },

    /* ── Alert ── */
    alertText: { color: '#1C252E' },
    alertTextDanger: { color: '#FF5630' },
  },
  signIn: { theme: 'simple' },
};
