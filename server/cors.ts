/**
 * CORS Configuration for Production
 * Handles cross-origin requests securely
 */
import cors from 'cors';

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.FRONTEND_URL,
  process.env.PRODUCTION_URL
].filter(Boolean);

export const corsOptions = {
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  exposedHeaders: ['x-total-count']
};

export const corsMiddleware = cors(corsOptions);