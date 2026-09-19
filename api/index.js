import app from '../src/app.js';

export default function handler(req, res) {
  // Normalize Vercel rewritten URLs to match Express routes correctly
  if (req.url === '/api/index.js' || req.url.startsWith('/api/index.js')) {
    const targetUrl = req.headers['x-forwarded-uri'] || req.headers['x-matched-path'];
    if (targetUrl) {
      req.url = targetUrl;
    } else {
      req.url = '/';
    }
  }
  return app(req, res);
}
