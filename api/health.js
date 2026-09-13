export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    environment: 'vercel-serverless',
    database: 'supabase-postgresql',
    storage: 'supabase-storage',
    timestamp: new Date().toISOString()
  });
}
