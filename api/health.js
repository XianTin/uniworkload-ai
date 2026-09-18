export default function handler(req, res) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  
  res.status(200).json({
    status: 'healthy',
    service: 'uniworkload-ai',
    version: '3.9.0',
    timestamp: new Date().toISOString()
  });
}
