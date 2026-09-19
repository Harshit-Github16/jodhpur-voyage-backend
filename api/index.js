module.exports = async (req, res) => {
  // Dynamically import the ES module app
  const { default: app } = await import('../src/app.js');

  // Normalize Vercel rewritten URLs to match Express routes correctly
  if (req.url === '/api/index.js' || req.url === '/api' || req.url.startsWith('/api/index')) {
    const targetUrl = req.headers['x-forwarded-uri'] || req.headers['x-matched-path'];
    req.url = targetUrl || '/';
  }

  return app(req, res);
};
