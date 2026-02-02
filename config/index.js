import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('FATAL: Missing required environment variables:', missingEnvVars.join(', '));
  process.exit(1);
}

export const config = {
  // Server configuration
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Security
  secret: process.env.SECRET,
  
  // Debug settings
  debugRequests: process.env.DEBUG_REQUESTS === '1' || process.env.DEBUG === 'true',
  
  // Security settings
  violationThreshold: parseInt(process.env.VIOLATION_THRESHOLD || '1', 10),
  
  // Database
  databasePath: process.env.DATABASE_PATH || './data.db',
  
  // CORS settings
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
  },
  
  // Session settings
  session: {
    maxDuration: 2 * 60 * 60 * 1000, // 2 hours in milliseconds
    questionDuration: 30 * 1000, // 30 seconds per question
    violationThreshold: 3 // Max violations before kick
  },
  
  // File upload settings
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif'],
    avatarSize: 128 // Avatar size in pixels
  },
  
  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // Max requests per window
  }
};

export default config;
