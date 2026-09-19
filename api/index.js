export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    message: 'Jodhpur Voyage API Backend serverless function is working!',
    timestamp: new Date().toISOString()
  });
}
