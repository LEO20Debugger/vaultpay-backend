import {
  mysqlTable,
  varchar,
  decimal,
  timestamp,
  int,
  text,
  boolean,
  index,
} from 'drizzle-orm/mysql-core';

/** ENUMS */
export const WalletStatus = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  CLOSED: 'closed',
} as const;

export const Currency = {
  USD: 'USD',
  NGN: 'NGN',
  EUR: 'EUR',
} as const;

/** USERS TABLE */
export const users = mysqlTable('users', {
  id: varchar('id', { length: 36 }).primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  password: varchar('password', { length: 255 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  isEmailVerified: boolean('is_email_verified').notNull().default(false),
  isPhoneVerified: boolean('is_phone_verified').notNull().default(false),
  lastLoginAt: timestamp('last_login_at'),
  deleted: boolean('deleted').notNull().default(false),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

// USER INDEXES
export const usersEmailIdx = index('email_idx').on(users.email);
export const usersUsernameIdx = index('username_idx').on(users.username);
export const usersPhoneIdx = index('phone_idx').on(users.phone);
export const usersDeletedIdx = index('deleted_idx').on(users.deleted);

/** USER PASSWORDS TABLE */
export const userPasswords = mysqlTable('user_passwords', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  salt: varchar('salt', { length: 255 }).notNull(),
  deleted: boolean('deleted').notNull().default(false),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

// USER PASSWORD INDEXES
export const userPasswordsUserIdIdx = index('user_password_user_id_idx').on(
  userPasswords.userId,
);

/** USER SESSIONS TABLE */
export const userSessions = mysqlTable('user_sessions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  refreshToken: varchar('refresh_token', { length: 500 }).notNull(),
  deviceInfo: text('device_info'),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  isActive: boolean('is_active').notNull().default(true),
  expiresAt: timestamp('expires_at').notNull(),
  deleted: boolean('deleted').notNull().default(false),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

// USER SESSION INDEXES
export const userSessionsUserIdIdx = index('user_session_user_id_idx').on(
  userSessions.userId,
);

/** EMAIL VERIFICATION TOKENS TABLE */
export const emailVerificationTokens = mysqlTable('email_verification_tokens', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  isUsed: boolean('is_used').notNull().default(false),
  deleted: boolean('deleted').notNull().default(false),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

// EMAIL VERIFICATION INDEXES
export const emailVerificationUserIdIdx = index(
  'email_verification_user_id_idx',
).on(emailVerificationTokens.userId);
export const emailVerificationTokenIdx = index(
  'email_verification_token_idx',
).on(emailVerificationTokens.token);

/** PASSWORD RESET TOKENS TABLE */
export const passwordResetTokens = mysqlTable('password_reset_tokens', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  isUsed: boolean('is_used').notNull().default(false),
  deleted: boolean('deleted').notNull().default(false),
  deletedAt: timestamp('deleted_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// PASSWORD RESET INDEXES
export const passwordResetUserIdIdx = index('password_reset_user_id_idx').on(
  passwordResetTokens.userId,
);
export const passwordResetTokenIdx = index('password_reset_token_idx').on(
  passwordResetTokens.token,
);

/** WALLETS TABLE */
export const wallets = mysqlTable('wallets', {
  id: varchar('id', { length: 36 }).primaryKey(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  balance: decimal('balance', { precision: 15, scale: 2 })
    .notNull()
    .default('0'),
  currency: varchar('currency', { length: 10 }).notNull().default(Currency.NGN),
  status: varchar('status', { length: 20 })
    .notNull()
    .default(WalletStatus.ACTIVE),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

// WALLET INDEXES
export const walletsUserIdIdx = index('wallet_user_id_idx').on(wallets.userId);

/** TRANSACTIONS TABLE */
export const transactions = mysqlTable('transactions', {
  id: varchar('id', { length: 36 }).primaryKey(),
  walletId: varchar('wallet_id', { length: 36 }).notNull(),
  userId: varchar('user_id', { length: 36 }).notNull(),
  type: varchar('type', { length: 20 }).notNull(), // e.g., deposit, withdrawal, transfer
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).notNull(), // pending, success, failed
  description: text('description'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});

// TRANSACTION INDEXES
export const transactionsWalletIdIdx = index('transaction_wallet_id_idx').on(
  transactions.walletId,
);
export const transactionsUserIdIdx = index('transaction_user_id_idx').on(
  transactions.userId,
);
