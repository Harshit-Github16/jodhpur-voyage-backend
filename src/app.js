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

// Enable Response Compression (Gzip / Deflate) for blazing fast APIs
app.use(compression());

// Security HTTP Headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: false
  })
);

// Foolproof dynamic CORS configuration (supports credentials, all origins, all headers)
const corsOptions = {
  origin: (origin, callback) => {
    // Dynamically allow any origin that makes the request
    return callback(null, origin || true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));


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
