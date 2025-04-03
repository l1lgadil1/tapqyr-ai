import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Config type definition
export interface Config {
  env: string;
  port: number;
  logLevel: string;
  openai: {
    apiKey: string;
    model: string;
    temperature: number;
    maxTokens: number;
    assistantId: string;
  };
  cors: {
    allowedOrigins: string[];
  };
  jwt: {
    accessTokenSecret: string;
    refreshTokenSecret: string;
    accessTokenExpiry: string;
    refreshTokenExpiry: string;
    emailVerificationExpiry: string;
    passwordResetExpiry: string;
  };
  email: {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
  };
  clientUrl: string;
}

const config: Config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  logLevel: process.env.LOG_LEVEL || 'info',
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
    temperature: parseFloat(process.env.OPENAI_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '2000', 10),
    assistantId: process.env.OPENAI_ASSISTANT_ID || '',
  },
  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(','),
  },
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET || 'access-token-secret',
    refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh-token-secret',
    accessTokenExpiry: process.env.JWT_ACCESS_TOKEN_EXPIRY || '15m',
    refreshTokenExpiry: process.env.JWT_REFRESH_TOKEN_EXPIRY || '7d',
    emailVerificationExpiry: process.env.JWT_EMAIL_VERIFICATION_EXPIRY || '24h',
    passwordResetExpiry: process.env.JWT_PASSWORD_RESET_EXPIRY || '1h'
  },
  email: {
    host: process.env.EMAIL_HOST || '',
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER || '',
    password: process.env.EMAIL_PASSWORD || '',
    from: process.env.EMAIL_FROM || 'noreply@tapqyr.ai'
  },
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000'
};

export default config; 