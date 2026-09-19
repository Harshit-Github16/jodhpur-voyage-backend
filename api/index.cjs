module.exports = async (req, res) => {
  // Use dynamic import() to load the ESM Express app safely inside CommonJS wrapper
  const { default: app } = await import('../src/app.js');

  // Normalize Vercel rewritten URLs to match Express routes correctly
  if (req.url === '/api/index.js' || req.url === '/api/index.cjs' || req.url.startsWith('/api/index')) {
    const targetUrl = req.headers['x-forwarded-uri'] || req.headers['x-matched-path'];
    if (targetUrl) {
      req.url = targetUrl;
    } else {
      req.url = '/';
    }
  }

  return app(req, res);
};
