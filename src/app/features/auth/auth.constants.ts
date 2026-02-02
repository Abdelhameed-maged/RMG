export const AUTH_ROUTES = {
  EMAIL: '/auth/email',
  PASSWORD: '/auth/password',
  OTP: '/auth/otp'
} as const;

export const AUTH_ERRORS = {
  REQUIRED: 'This field is required',
  EMAIL_INVALID: 'Please enter a valid email',
  PASSWORD_MIN_LENGTH: 'Password must be at least 6 characters',
  OTP_INVALID: 'Please enter a valid OTP',
  OTP_LENGTH: 'OTP must be 6 digits'
} as const;

export const AUTH_MESSAGES = {
  EMAIL_SENT: 'Verification code sent to your email',
  OTP_RESENT: 'Verification code resent',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out successfully'
} as const;
