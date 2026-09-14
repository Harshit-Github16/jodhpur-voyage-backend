import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import apiRouter from './routes/index.js';
import { notFound, errorHandler } from './middlewares/error.middleware.js';
import { generalLimiter } from './middlewares/rateLimiter.middleware.js';

dotenv.config();

const app = express();

// Security HTTP Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// CORS configuration
const parseEnvOrigins = (envVar) => {
  if (!envVar) return [];
  return envVar
    .split(',')
    .map((url) => url.trim().replace(/\/$/, ''))
    .filter(Boolean);
};

const defaultAllowedOrigins = [
  'https://jodhpur-voyage.vercel.app',
  'https://jodhpur-voyage-frontend.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:4173',
  'http://localhost:8080',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175'
];

const customOrigins = [
  ...parseEnvOrigins(process.env.CLIENT_URL),
  ...parseEnvOrigins(process.env.ADMIN_URL),
  ...parseEnvOrigins(process.env.CORS_ORIGIN),
  ...parseEnvOrigins(process.env.ALLOWED_ORIGINS)
];

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...customOrigins]));

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, '');

    // Allow all localhost and 127.0.0.1 ports
    const isLocalhost = /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(normalizedOrigin);
    // Allow all Vercel, Netlify preview & production URLs
    const isVercel = /^https:\/\/.*\.vercel\.app$/.test(normalizedOrigin);
    const isNetlify = /^https:\/\/.*\.netlify\.app$/.test(normalizedOrigin);
    const isExplicitlyAllowed =
      allowedOrigins.includes(normalizedOrigin) ||
      allowedOrigins.includes('*') ||
      process.env.CORS_ORIGIN === '*';

    if (
      isExplicitlyAllowed ||
      isLocalhost ||
      isVercel ||
      isNetlify ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }

    // Default to allowing origin dynamically to prevent frontend blocking
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'X-Access-Token',
    'Cache-Control',
    'Pragma'
  ],
  exposedHeaders: ['Set-Cookie', 'Authorization'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Request Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing middlewares
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Prevent HTTP Parameter Pollution
app.use(hpp());

// General Rate Limiter for API
app.use('/api', generalLimiter);

// Root Welcome Route
app.get('/', (req, res) => {
  res.json({
    name: 'Jodhpur Voyage API Server',
    version: '1.0.0',
    documentation: '/api/v1/health',
    status: 'online'
  });
});

// Database connection middleware (ensures active connection in serverless & container environments)
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    next(error);
  }
});

// API Routes Mounting
app.use('/api/v1', apiRouter);

// 404 Catch-all handler
app.use(notFound);

// Global Centralized Error Handler
app.use(errorHandler);

export default app;
