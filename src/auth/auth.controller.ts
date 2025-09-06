import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { z } from 'zod';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ResendVerificationDto,
  AuthResponseDto,
  TokenResponseDto,
  LogoutResponseDto,
  MessageResponseDto,
} from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /** User registration */
  @Post('signup')
  public async signUp(
    @Body(new ZodValidationPipe(RegisterDto)) body: z.infer<typeof RegisterDto>,
  ) {
    return this.authService.signUp(body);
  }

  /** User login */
  @Post('signin')
  @HttpCode(HttpStatus.OK)
  public async signIn(
    @Body(new ZodValidationPipe(LoginDto)) body: z.infer<typeof LoginDto>,
  ) {
    return this.authService.signIn(body);
  }

  // /** Refresh access token */
  // @Post('refresh')
  // @HttpCode(HttpStatus.OK)
  // public async refreshToken(
  //   @Body(new ZodValidationPipe(RefreshTokenDto))
  //   body: z.infer<typeof RefreshTokenDto>,
  // ): Promise<TokenResponseDto> {
  //   return this.authService.refreshToken(body);
  // }

  // /** Logout current session */
  // @Post('logout')
  // @UseGuards(JwtAuthGuard)
  // @HttpCode(HttpStatus.OK)
  // public async logout(@Request() req): Promise<LogoutResponseDto> {
  //   return { message: 'Logged out successfully' };
  // }

  // /** Logout all sessions */
  // @Post('logout-all')
  // @UseGuards(JwtAuthGuard)
  // @HttpCode(HttpStatus.OK)
  // public async logoutAll(@Request() req): Promise<LogoutResponseDto> {
  //   return this.authService.logoutAll(req.user.id);
  // }

  // /** Forgot password */
  // @Post('forgot-password')
  // @HttpCode(HttpStatus.OK)
  // public async forgotPassword(
  //   @Body(new ZodValidationPipe(ForgotPasswordDto))
  //   body: z.infer<typeof ForgotPasswordDto>,
  // ): Promise<MessageResponseDto> {
  //   return this.authService.forgotPassword(body);
  // }

  // /** Reset password */
  // @Post('reset-password')
  // @HttpCode(HttpStatus.OK)
  // public async resetPassword(
  //   @Body(new ZodValidationPipe(ResetPasswordDto))
  //   body: z.infer<typeof ResetPasswordDto>,
  // ): Promise<MessageResponseDto> {
  //   return this.authService.resetPassword(body);
  // }

  // /** Verify email */
  // @Post('verify-email')
  // @HttpCode(HttpStatus.OK)
  // public async verifyEmail(
  //   @Body(new ZodValidationPipe(VerifyEmailDto))
  //   body: z.infer<typeof VerifyEmailDto>,
  // ): Promise<MessageResponseDto> {
  //   return this.authService.verifyEmail(body);
  // }

  // /** Resend email verification */
  // @Post('resend-verification')
  // @HttpCode(HttpStatus.OK)
  // public async resendVerification(
  //   @Body(new ZodValidationPipe(ResendVerificationDto))
  //   body: z.infer<typeof ResendVerificationDto>,
  // ): Promise<MessageResponseDto> {
  //   return this.authService.resendVerification(body);
  // }
}
