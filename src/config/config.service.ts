export class ConfigService {
  static get database() {
    return {
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'vaultpay_user',
      password: process.env.DB_PASSWORD || 'vaultpay_password',
      database: process.env.DB_NAME || 'vaultpay',
    };
  }

  static get jwt() {
    return {
      secret:
        process.env.JWT_SECRET ||
        'your-super-secret-jwt-key-change-this-in-production',
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    };
  }

  static get app() {
    return {
      port: parseInt(process.env.PORT || '3000'),
      nodeEnv: process.env.NODE_ENV || 'development',
    };
  }
}
