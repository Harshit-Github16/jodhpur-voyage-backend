import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import dotenv from 'dotenv';
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
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:3000',
  process.env.ADMIN_URL || 'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
        callback(null, true);
      } else {
        callback(new Error('Blocked by CORS security policy'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

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

// API Routes Mounting
app.use('/api/v1', apiRouter);

// 404 Catch-all handler
app.use(notFound);

// Global Centralized Error Handler
app.use(errorHandler);

export default app;
