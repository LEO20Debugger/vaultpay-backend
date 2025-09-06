import { z } from 'zod';

export const LoginDto = z.object({
  email: z.string(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
  rememberMe: z.boolean().optional(),
});

export const RegisterDto = z.object({
  email: z.string(),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be at most 50 characters')
    .refine(
      (val) => /^[a-zA-Z0-9_]+$/.test(val),
      'Username can only contain letters, numbers, and underscores',
    ),
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(100, 'First name must be at most 100 characters'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(100, 'Last name must be at most 100 characters'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
  phone: z
    .string()
    .refine(
      (val) => /^\+?[1-9]\d{1,14}$/.test(val),
      'Phone number must be a valid international format',
    )
    .optional(),
});

export const RefreshTokenDto = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const ForgotPasswordDto = z.object({
  email: z.string(),
});

export const ResetPasswordDto = z.object({
  token: z.string().min(1, 'Token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be at most 128 characters'),
});

export const VerifyEmailDto = z.object({
  token: z.string().min(1, 'Token is required'),
});

export const ResendVerificationDto = z.object({
  email: z.string(),
});

// Response DTOs (no validation needed for responses)
export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
  };
  expiresIn: number;
}

export interface TokenResponseDto {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LogoutResponseDto {
  message: string;
}

export interface MessageResponseDto {
  message: string;
}
