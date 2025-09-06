import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { randomBytes } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import * as argon2 from 'argon2';
import { eq, and, lt } from 'drizzle-orm';
import { z } from 'zod';
import { DatabaseService } from '../database/database.service';
import { ResponseManager } from '../utils/response-manager.utils';
import {
  users,
  userSessions,
  wallets,
  emailVerificationTokens,
  passwordResetTokens,
} from '../database/schema';
import { WalletStatus, Currency } from '../database/schema';
import {
  LoginDto,
  RegisterDto,
  RefreshTokenDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
  ResendVerificationDto,
} from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly dbService: DatabaseService,
  ) {}

  /** User registration */
  public async signUp(body: z.infer<typeof RegisterDto>) {
    const { email, username, firstName, lastName, password } = body;

    // Hash password
    const passwordHash = await argon2.hash(password);

    // Start transaction
    return await this.dbService.db.transaction(async (tx) => {
      // Check if user exists
      const existing = await tx
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (existing.length > 0) {
        throw new ConflictException('User with this email already exists');
      }

      // Insert new user
      const userId = uuidv4();
      await tx.insert(users).values({
        id: userId,
        email,
        username,
        firstName,
        lastName,
        password: passwordHash,
        isActive: true,
        isEmailVerified: false,
        isPhoneVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Initialize wallet for the new user
      await tx.insert(wallets).values({
        id: uuidv4(),
        userId,
        balance: '0',
        currency: Currency.NGN.toString(),
        status: WalletStatus.ACTIVE.toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Generate tokens
      const tokens = this.generateTokens(userId);

      // Create session
      await this.createSession(userId, tokens.refreshToken, tx);

      // Send email verification token
      await this.createEmailVerificationToken(userId, tx);

      return ResponseManager.standardResponse(
        'success',
        201,
        'User created successfully',
        {
          user: { id: userId, email, username, firstName, lastName },
          ...tokens,
        },
      );
    });
  }

  /** User login */
  public async signIn(body: z.infer<typeof LoginDto>) {
    const { email, password } = body;

    const [user] = await this.dbService.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const validPassword = await argon2.verify(user.password, password);
    if (!validPassword) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    // Create session
    await this.createSession(user.id, tokens.refreshToken);

    return ResponseManager.standardResponse(
      'success',
      200,
      'Login successful',
      {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        ...tokens,
      },
    );
  }

  /** Refresh access token */
  // public async refreshToken(body: z.infer<typeof RefreshTokenDto>) {
  //   const [session] = await this.dbService.db
  //     .select()
  //     .from(userSessions)
  //     .where(
  //       and(
  //         eq(userSessions.refreshToken, body.refreshToken),
  //         eq(userSessions.isActive, true),
  //         lt(new Date(), userSessions.expiresAt),
  //       ),
  //     )
  //     .limit(1);

  //   if (!session) throw new UnauthorizedException('Invalid refresh token');

  //   const [user] = await this.dbService.db
  //     .select()
  //     .from(users)
  //     .where(eq(users.id, session.userId))
  //     .limit(1);

  //   if (!user || !user.isActive)
  //     throw new UnauthorizedException('Account is deactivated');

  //   const tokens = this.generateTokens(user.id);

  //   await this.dbService.db
  //     .update(userSessions)
  //     .set({
  //       refreshToken: tokens.refreshToken,
  //       expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  //       updatedAt: new Date(),
  //     })
  //     .where(eq(userSessions.id, session.id));

  //   return ResponseManager.standardResponse(
  //     'success',
  //     200,
  //     'Token refreshed successfully',
  //     tokens,
  //   );
  // }

  // /** Logout current session */
  // public async logout(refreshToken: string) {
  //   await this.dbService.db
  //     .update(userSessions)
  //     .set({ isActive: false, updatedAt: new Date() })
  //     .where(eq(userSessions.refreshToken, refreshToken));

  //   return ResponseManager.standardResponse(
  //     'success',
  //     200,
  //     'Logged out successfully',
  //   );
  // }

  // /** Logout all sessions */
  // public async logoutAll(userId: string) {
  //   await this.dbService.db
  //     .update(userSessions)
  //     .set({ isActive: false, updatedAt: new Date() })
  //     .where(eq(userSessions.userId, userId));

  //   return ResponseManager.standardResponse(
  //     'success',
  //     200,
  //     'Logged out from all devices',
  //   );
  // }

  // /** Forgot password */
  // public async forgotPassword(body: z.infer<typeof ForgotPasswordDto>) {
  //   const [user] = await this.dbService.db
  //     .select()
  //     .from(users)
  //     .where(eq(users.email, body.email))
  //     .limit(1);

  //   if (user) await this.createPasswordResetToken(user.id);

  //   return ResponseManager.standardResponse(
  //     'success',
  //     200,
  //     'If the email exists, a password reset link has been sent',
  //   );
  // }

  // /** Reset password */
  // public async resetPassword(body: z.infer<typeof ResetPasswordDto>) {
  //   const [tokenRecord] = await this.dbService.db
  //     .select()
  //     .from(passwordResetTokens)
  //     .where(
  //       and(
  //         eq(passwordResetTokens.token, body.token),
  //         eq(passwordResetTokens.isUsed, false),
  //         lt(new Date(), passwordResetTokens.expiresAt),
  //       ),
  //     )
  //     .limit(1);

  //   if (!tokenRecord) throw new BadRequestException('Invalid or expired token');

  //   const passwordHash = await argon2.hash(body.newPassword);
  //   await this.dbService.db
  //     .update(users)
  //     .set({ passwordHash, updatedAt: new Date() })
  //     .where(eq(users.id, tokenRecord.userId));

  //   await this.dbService.db
  //     .update(passwordResetTokens)
  //     .set({ isUsed: true })
  //     .where(eq(passwordResetTokens.id, tokenRecord.id));

  //   await this.logoutAll(tokenRecord.userId);

  //   return ResponseManager.standardResponse(
  //     'success',
  //     200,
  //     'Password reset successfully',
  //   );
  // }

  // /** Verify email */
  // public async verifyEmail(body: z.infer<typeof VerifyEmailDto>) {
  //   const [tokenRecord] = await this.dbService.db
  //     .select()
  //     .from(emailVerificationTokens)
  //     .where(
  //       and(
  //         eq(emailVerificationTokens.token, body.token),
  //         eq(emailVerificationTokens.isUsed, false),
  //         lt(new Date(), emailVerificationTokens.expiresAt),
  //       ),
  //     )
  //     .limit(1);

  //   if (!tokenRecord) throw new BadRequestException('Invalid or expired token');

  //   await this.dbService.db
  //     .update(users)
  //     .set({ isEmailVerified: true, updatedAt: new Date() })
  //     .where(eq(users.id, tokenRecord.userId));

  //   await this.dbService.db
  //     .update(emailVerificationTokens)
  //     .set({ isUsed: true })
  //     .where(eq(emailVerificationTokens.id, tokenRecord.id));

  //   return ResponseManager.standardResponse(
  //     'success',
  //     200,
  //     'Email verified successfully',
  //   );
  // }

  // /** Resend verification email */
  // public async resendVerification(body: z.infer<typeof ResendVerificationDto>) {
  //   const [user] = await this.dbService.db
  //     .select()
  //     .from(users)
  //     .where(eq(users.email, body.email))
  //     .limit(1);

  //   if (!user) throw new NotFoundException('User not found');
  //   if (user.isEmailVerified)
  //     throw new BadRequestException('Email already verified');

  //   await this.createEmailVerificationToken(user.id);

  //   return ResponseManager.standardResponse(
  //     'success',
  //     200,
  //     'Verification email sent',
  //   );
  // }

  /** Internal helpers */
  private async createPasswordResetToken(userId: string) {
    await this.dbService.db.insert(passwordResetTokens).values({
      id: uuidv4(),
      userId,
      token: randomBytes(32).toString('hex'),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });
  }

  private generateTokens(userId: string): {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  } {
    const accessToken = this.jwtService.sign(
      { sub: userId, type: 'access' },
      { expiresIn: '15m' },
    );
    const refreshToken = randomBytes(32).toString('hex'); // random string for refresh
    const expiresIn = 15 * 60; // seconds

    return { accessToken, refreshToken, expiresIn };
  }

  private async createEmailVerificationToken(userId: string): Promise<void> {
    const tokenId = uuidv4();
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await this.dbService.db.insert(emailVerificationTokens).values({
      id: tokenId,
      userId,
      token,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
      isUsed: false,
    });
  }

  private async createSession(
    userId: string,
    refreshToken: string,
  ): Promise<void> {
    const sessionId = uuidv4();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await this.dbService.db.insert(userSessions).values({
      id: sessionId,
      userId,
      refreshToken,
      expiresAt,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    });
  }
}
