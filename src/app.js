import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import apiRouter from './routes/index.js';
import { notFound, errorHandler } from './middlewares/error.middleware.js';
import { generalLimiter } from './middlewares/rateLimiter.middleware.js';

dotenv.config();

const app = express();

// Trust reverse proxy (Vercel, Heroku, Cloudflare)
app.set('trust proxy', 1);

// Enable Response Compression (Gzip / Deflate) for blazing fast APIs
app.use(compression());

// Security HTTP Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: false
  })
);

// Dynamic CORS configuration that reflects the actual request origin
const corsOptions = {
  origin: (origin, callback) => {
    // If request has no origin header (server-to-server or curl), allow it
    if (!origin) return callback(null, true);
    // Reflect the origin back to the browser so credentials can be used
    return callback(null, origin);
  },
  credentials: true,
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  exposedHeaders: ['Authorization'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

// Explicit CORS fallback for environments where headers must be set manually.
// Important: when using credentials, Access-Control-Allow-Origin must NOT be '*'.
app.use((req, res, next) => {
  try {
    const envOrigin = process.env.FRONTEND_ORIGIN;
    const requestOrigin = req.headers.origin;
    // Prefer configured FRONTEND_ORIGIN; otherwise reflect the request origin if present.
    const allowOrigin = envOrigin ? envOrigin : (requestOrigin || '*');

    res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Expose-Headers', 'Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
    // Only set credentials when we are reflecting a concrete origin (not '*')
    if (allowOrigin !== '*') {
      res.setHeader('Access-Control-Allow-Credentials', 'true');
    }

    // Quickly respond to preflight with proper headers
    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      return res.end();
    }
  } catch (err) {
    // ignore header set errors
  }
  next();
});


// Request Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsing middlewares (high limit for large uploads and base64 strings)
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));
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

// Database connection middleware (fast check: only connect if readyState !== 1)
app.use(async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }
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
