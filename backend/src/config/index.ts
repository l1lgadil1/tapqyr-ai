import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Config {
  port: number;
  nodeEnv: string;
  openai: {
    apiKey: string;
    model: string;
    assistantId: string;
  };
  cors: {
    allowedOrigins: string[];
  };
  logging: {
    level: string;
  };
  jwt: {
    accessTokenSecret: string;
    refreshTokenSecret: string;
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4-turbo',
    assistantId: process.env.OPENAI_ASSISTANT_ID || 'asst_DoVkem55zDuqITd4A6QdnfCA',
  },
  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(','),
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
  jwt: {
    accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET || 'access_token_secret',
    refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET || 'refresh_token_secret',
  },
};

// Validate required configuration
if (!config.openai.apiKey) {
  throw new Error('OPENAI_API_KEY is required');
}

// In production, ensure JWT secrets are set
if (config.nodeEnv === 'production') {
  if (config.jwt.accessTokenSecret === 'access_token_secret') {
    throw new Error('JWT_ACCESS_TOKEN_SECRET must be set in production');
  }
  if (config.jwt.refreshTokenSecret === 'refresh_token_secret') {
    throw new Error('JWT_REFRESH_TOKEN_SECRET must be set in production');
  }
}

export default config; 